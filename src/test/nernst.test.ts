import { describe, expect, it } from "vitest";
import { buildPresetInput, calculateCell, getCellPreset, validateCellInput } from "@/lib/nernst";

describe("Nernst cell calculations", () => {
  it("calculates the Daniell cell standard acceptance case", () => {
    const input = buildPresetInput(getCellPreset("daniell"));
    const result = calculateCell(input);
    expect(result.standardPotential).toBeCloseTo(1.10, 12);
    expect(result.quotient).toBeCloseTo(1, 12);
    expect(result.potential).toBeCloseTo(1.10, 12);
  });

  it("raises Daniell potential to about 1.159 V at 0.01 M zinc ion", () => {
    const preset = getCellPreset("daniell");
    const result = calculateCell(buildPresetInput(preset, 0.01, 1));
    expect(result.potential).toBeCloseTo(1.159, 3);
  });

  it("uses the balanced two-electron stoichiometry for the copper–silver cell", () => {
    const preset = getCellPreset("cu-ag");
    expect(preset.electrons).toBe(2);
    const result = calculateCell(buildPresetInput(preset, 0.1, 0.01));
    expect(result.quotient).toBeCloseTo(1000, 12);
    expect(result.potential).toBeCloseTo(0.371, 3);
  });

  it("rejects non-positive concentrations, non-integer electrons, and absolute-zero temperatures", () => {
    const errors = validateCellInput({
      anodePotential: -0.76,
      cathodePotential: 0.34,
      anodeConcentration: 0,
      cathodeConcentration: -1,
      temperatureK: 0,
      electrons: 1.5,
    });
    expect(errors["anodeConcentration"]).toBe("Concentration must be greater than 0 M.");
    expect(errors["cathodeConcentration"]).toBe("Concentration must be greater than 0 M.");
    expect(errors["electrons"]).toBe("n must be a positive integer.");
    expect(errors["temperature"]).toBe("Temperature must be above absolute zero.");
  });

  it("rejects infinite concentrations and temperatures", () => {
    const errors = validateCellInput({
      anodePotential: -0.76,
      cathodePotential: 0.34,
      anodeConcentration: Number.POSITIVE_INFINITY,
      cathodeConcentration: 1,
      temperatureK: Number.POSITIVE_INFINITY,
      electrons: 2,
    });
    expect(errors["anodeConcentration"]).toBe("Concentration must be a finite value greater than 0 M.");
    expect(errors["temperature"]).toBe("Temperature must be a finite value above absolute zero.");
  });
});