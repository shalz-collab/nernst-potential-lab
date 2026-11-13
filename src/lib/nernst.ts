/** Constants and pure calculation helpers for NernstLab. All concentrations are molar. */
export const GAS_CONSTANT = 8.314;
export const FARADAY_CONSTANT = 96485;
export const STANDARD_TEMPERATURE_K = 298.15;

export type CellPreset = {
  id: string;
  name: string;
  notation: string;
  anode: string;
  cathode: string;
  anodePotential: number;
  cathodePotential: number;
  anodeCharge: number;
  cathodeCharge: number;
  electrons: number;
};

export const CELL_PRESETS: CellPreset[] = [
  { id: "daniell", name: "Daniell cell", notation: "Zn | Zn²⁺ || Cu²⁺ | Cu", anode: "Zn²⁺", cathode: "Cu²⁺", anodePotential: -0.76, cathodePotential: 0.34, anodeCharge: 2, cathodeCharge: 2, electrons: 2 },
  { id: "cu-ag", name: "Copper–silver", notation: "Cu | Cu²⁺ || Ag⁺ | Ag", anode: "Cu²⁺", cathode: "Ag⁺", anodePotential: 0.34, cathodePotential: 0.80, anodeCharge: 2, cathodeCharge: 1, electrons: 1 },
  { id: "zn-ag", name: "Zinc–silver", notation: "Zn | Zn²⁺ || Ag⁺ | Ag", anode: "Zn²⁺", cathode: "Ag⁺", anodePotential: -0.76, cathodePotential: 0.80, anodeCharge: 2, cathodeCharge: 1, electrons: 2 },
  { id: "fe-cu", name: "Iron–copper", notation: "Fe | Fe²⁺ || Cu²⁺ | Cu", anode: "Fe²⁺", cathode: "Cu²⁺", anodePotential: -0.44, cathodePotential: 0.34, anodeCharge: 2, cathodeCharge: 2, electrons: 2 },
  { id: "mg-cu", name: "Magnesium–copper", notation: "Mg | Mg²⁺ || Cu²⁺ | Cu", anode: "Mg²⁺", cathode: "Cu²⁺", anodePotential: -2.37, cathodePotential: 0.34, anodeCharge: 2, cathodeCharge: 2, electrons: 2 },
  { id: "ni-cu", name: "Nickel–copper", notation: "Ni | Ni²⁺ || Cu²⁺ | Cu", anode: "Ni²⁺", cathode: "Cu²⁺", anodePotential: -0.25, cathodePotential: 0.34, anodeCharge: 2, cathodeCharge: 2, electrons: 2 },
  { id: "al-cu", name: "Aluminum–copper", notation: "Al | Al³⁺ || Cu²⁺ | Cu", anode: "Al³⁺", cathode: "Cu²⁺", anodePotential: -1.66, cathodePotential: 0.34, anodeCharge: 3, cathodeCharge: 2, electrons: 6 },
];

export function getCellPreset(id: string): CellPreset {
  const preset = CELL_PRESETS.find((entry) => entry.id === id);
  if (!preset) throw new Error(`Unknown electrochemical cell preset: ${id}`);
  return preset;
}

export type CellInput = {
  anodePotential: number;
  cathodePotential: number;
  anodeConcentration: number;
  cathodeConcentration: number;
  temperatureK: number;
  electrons: number;
  anodeCharge?: number;
  cathodeCharge?: number;
};

export type CellResult = {
  standardPotential: number;
  quotient: number;
  potential: number;
  gibbsKJ: number;
  equilibriumConstant: number;
  voltageShift: number;
  spontaneity: "spontaneous" | "non-spontaneous" | "equilibrium";
};

export function calculateCell(input: CellInput): CellResult {
  const standardPotential = input.cathodePotential - input.anodePotential;
  const anodeExponent = input.electrons / (input.anodeCharge ?? 1);
  const cathodeExponent = input.electrons / (input.cathodeCharge ?? 1);
  const quotient =
    input.anodeConcentration ** anodeExponent / input.cathodeConcentration ** cathodeExponent;
  const potential = standardPotential -
    ((GAS_CONSTANT * input.temperatureK) / (input.electrons * FARADAY_CONSTANT)) * Math.log(quotient);
  const equilibriumConstant = Math.exp(
    (input.electrons * FARADAY_CONSTANT * standardPotential) /
      (GAS_CONSTANT * input.temperatureK),
  );
  const gibbsKJ = -(input.electrons * FARADAY_CONSTANT * potential) / 1000;
  const spontaneity =
    Math.abs(potential) < 1e-12
      ? "equilibrium"
      : potential > 0
        ? "spontaneous"
        : "non-spontaneous";

  return {
    standardPotential,
    quotient,
    potential,
    gibbsKJ,
    equilibriumConstant,
    voltageShift: potential - standardPotential,
    spontaneity,
  };
}

export function validateCellInput(input: CellInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!Number.isFinite(input.anodePotential)) errors["anodePotential"] = "Enter a valid anode potential.";
  if (!Number.isFinite(input.cathodePotential)) errors["cathodePotential"] = "Enter a valid cathode potential.";
  if (!(input.anodeConcentration > 0)) errors["anodeConcentration"] = "Concentration must be greater than 0 M.";
  if (!(input.cathodeConcentration > 0)) errors["cathodeConcentration"] = "Concentration must be greater than 0 M.";
  if (!(Number.isInteger(input.electrons) && input.electrons > 0)) errors["electrons"] = "n must be a positive integer.";
  if (!(input.temperatureK > 0)) errors["temperature"] = "Temperature must be above absolute zero.";
  return errors;
}

export function buildPresetInput(
  preset: CellPreset,
  anodeConcentration = 1,
  cathodeConcentration = 1,
  temperatureK = STANDARD_TEMPERATURE_K,
): CellInput {
  return {
    anodePotential: preset.anodePotential,
    cathodePotential: preset.cathodePotential,
    anodeConcentration,
    cathodeConcentration,
    temperatureK,
    electrons: preset.electrons,
    anodeCharge: preset.anodeCharge,
    cathodeCharge: preset.cathodeCharge,
  };
}