import { useMemo, useState } from "react";
import katex from "katex";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Atom,
  ChevronDown,
  Download,
  FlaskConical,
  Info,
  RotateCcw,
  Sigma,
  Thermometer,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  buildPresetInput,
  calculateCell,
  CELL_PRESETS,
  getCellPreset,
  validateCellInput,
  type CellInput,
} from "@/lib/nernst";

type CellState = CellInput & { presetId: string; custom: boolean };

function initialCell(): CellState {
  const preset = getCellPreset("daniell");
  const input = buildPresetInput(preset);
  return { ...input, presetId: preset.id, custom: false };
}

function formatNumber(value: number, significant = 4): string {
  if (!Number.isFinite(value)) return "Not finite";
  if (value !== 0 && (Math.abs(value) >= 1e5 || Math.abs(value) < 0.001)) {
    return value.toExponential(3);
  }
  return Number(value.toPrecision(significant)).toString();
}

function equation(tex: string): string {
  return katex.renderToString(tex, { throwOnError: false, displayMode: true, output: "html" });
}

function parseNumeric(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

const colorStops = [
  { stop: 0, color: "var(--color-chart-4)" },
  { stop: 0.5, color: "var(--color-chart-2)" },
  { stop: 1, color: "var(--color-primary)" },
];

function interpolateHeatColor(value: number, minimum: number, maximum: number): string {
  const ratio = maximum === minimum ? 0.5 : (value - minimum) / (maximum - minimum);
  const segment = ratio < 0.5 ? 0 : 1;
  const local = segment === 0 ? ratio * 2 : (ratio - 0.5) * 2;
  const left = colorStops[segment];
  const right = colorStops[segment + 1];
  if (!left || !right) return "var(--color-primary)";
  return `color-mix(in oklab, ${left.color} ${Math.round((1 - local) * 100)}%, ${right.color})`;
}

export function CalculatorDashboard() {
  const [cell, setCell] = useState<CellState>(initialCell);
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "K">("C");
  const [showWorking, setShowWorking] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);
  const preset = getCellPreset(cell.custom ? "daniell" : cell.presetId);
  const currentInput: CellInput = cell;
  const errors = validateCellInput(currentInput);
  const result = Object.keys(errors).length === 0 ? calculateCell(currentInput) : null;
  const anodeIon = preset.anode;
  const cathodeIon = preset.cathode;
  const temperatureShown = temperatureUnit === "C" ? cell.temperatureK - 273.15 : cell.temperatureK;

  const potentialFor = (concentration: number, temperatureK: number) => {
    const changed = { ...currentInput, anodeConcentration: concentration, temperatureK };
    return calculateCell(changed).potential;
  };

  const concentrationSeries = useMemo(() => {
    return Array.from({ length: 61 }, (_, index) => {
      const exponent = -3 + index * 0.05;
      const concentration = 10 ** exponent;
      return { concentration, potential: potentialFor(concentration, cell.temperatureK) };
    });
  }, [cell.anodeConcentration, cell.cathodeConcentration, cell.temperatureK, cell.electrons, cell.anodePotential, cell.cathodePotential, cell.anodeCharge, cell.cathodeCharge]);

  const temperatureSeries = useMemo(() => {
    return Array.from({ length: 51 }, (_, index) => {
      const temperatureK = 273 + index * 2;
      return { temperatureK, potential: potentialFor(cell.anodeConcentration, temperatureK) };
    });
  }, [cell.anodeConcentration, cell.cathodeConcentration, cell.temperatureK, cell.electrons, cell.anodePotential, cell.cathodePotential, cell.anodeCharge, cell.cathodeCharge]);

  const heatValues = useMemo(() => {
    const concentrations = Array.from({ length: 11 }, (_, i) => 10 ** (-3 + i * 0.5));
    const temperatures = Array.from({ length: 11 }, (_, i) => 273 + i * 10);
    return temperatures.flatMap((temperatureK) =>
      concentrations.map((concentration) => ({
        concentration,
        temperatureK,
        potential: potentialFor(concentration, temperatureK),
      })),
    );
  }, [cell.anodeConcentration, cell.cathodeConcentration, cell.temperatureK, cell.electrons, cell.anodePotential, cell.cathodePotential, cell.anodeCharge, cell.cathodeCharge]);

  const predictions = useMemo(() => {
    const temperatures = [273.15, 283.15, 298.15, 313.15, 333.15, 353.15, 373.15];
    const concentrations = [0.001, 0.01, 0.1, 1, 10];
    return {
      temperatures: temperatures.map((temperatureK) => ({ temperatureK, potential: potentialFor(cell.anodeConcentration, temperatureK) })),
      concentrations: concentrations.map((concentration) => ({ concentration, potential: potentialFor(concentration, cell.temperatureK) })),
    };
  }, [cell.anodeConcentration, cell.cathodeConcentration, cell.temperatureK, cell.electrons, cell.anodePotential, cell.cathodePotential, cell.anodeCharge, cell.cathodeCharge]);

  const minHeat = Math.min(...heatValues.map((point) => point.potential));
  const maxHeat = Math.max(...heatValues.map((point) => point.potential));
  const chartColor = "var(--color-chart-1)";
  const currentConcentration = cell.anodeConcentration;

  function update<K extends keyof CellState>(key: K, value: CellState[K]) {
    setCell((previous) => ({ ...previous, [key]: value }));
  }

  function applyPreset(id: string) {
    const selected = getCellPreset(id);
    setCell((previous) => ({
      ...buildPresetInput(selected, previous.anodeConcentration, previous.cathodeConcentration, previous.temperatureK),
      presetId: selected.id,
      custom: false,
    }));
  }

  function tryExample() {
    const selected = getCellPreset("daniell");
    setCell({ ...buildPresetInput(selected, 0.01, 1), presetId: selected.id, custom: false });
    setTemperatureUnit("K");
    setHasCalculated(true);
  }

  function reset() {
    setCell(initialCell());
    setTemperatureUnit("C");
    setHasCalculated(false);
  }

  function downloadCsv() {
    if (!result) return;
    const rows = [
      ["NernstLab cell potential report", ""],
      ["Cell", preset.name],
      ["Cell notation", preset.notation],
      ["Anode E° (V)", cell.anodePotential],
      ["Cathode E° (V)", cell.cathodePotential],
      ["Anode concentration (M)", cell.anodeConcentration],
      ["Cathode concentration (M)", cell.cathodeConcentration],
      ["Temperature (K)", cell.temperatureK],
      ["Electrons transferred (n)", cell.electrons],
      ["E°cell (V)", result.standardPotential],
      ["Q", result.quotient],
      ["E (V)", result.potential],
      ["ΔG (kJ/mol)", result.gibbsKJ],
      ["K", result.equilibriumConstant],
      ["Spontaneity", result.spontaneity],
      ["Temperature predictions", "T (K),E (V)"],
      ...predictions.temperatures.map((point) => [point.temperatureK, point.potential]),
      ["Concentration predictions", "[anode ion] (M),E (V)"],
      ...predictions.concentrations.map((point) => [point.concentration, point.potential]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nernstlab-cell-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadReport() {
    window.print();
  }

  function handleTemperature(value: number) {
    const kelvin = temperatureUnit === "C" ? value + 273.15 : value;
    update("temperatureK", kelvin);
  }

  function handleTemperatureUnit(nextUnit: "C" | "K") {
    setTemperatureUnit(nextUnit);
  }

  function chooseCustom() {
    setCell((previous) => ({ ...previous, presetId: "custom", custom: true, anodeCharge: 1, cathodeCharge: 1 }));
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <FlaskConical size={16} aria-hidden="true" /> ELECTROCHEMISTRY WORKSPACE
          </div>
          <h1 className="font-display text-3xl font-bold sm:text-[40px]">Cell potential calculator</h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
            Explore how temperature and ion concentration shape electrochemical cell voltage.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={downloadCsv} disabled={!result}>
            <Download aria-hidden="true" /> Export CSV
          </Button>
          <Button type="button" variant="outline" onClick={downloadReport}>
            <Download aria-hidden="true" /> Download report
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="space-y-6 print:hidden" aria-label="Cell inputs">
          <section className="border-b border-border pb-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold">Cell setup</h2>
              <Button variant="ghost" size="sm" type="button" onClick={reset} aria-label="Reset all inputs">
                <RotateCcw aria-hidden="true" /> Reset
              </Button>
            </div>
            <Label htmlFor="preset" className="text-sm font-medium">Preset cell</Label>
            <Select value={cell.custom ? "custom" : cell.presetId} onValueChange={(value) => value === "custom" ? chooseCustom() : applyPreset(value)}>
              <SelectTrigger id="preset" aria-label="Choose a standard electrochemical cell" className="mt-2">
                <SelectValue placeholder="Choose a cell" />
              </SelectTrigger>
              <SelectContent>
                {CELL_PRESETS.map((entry) => <SelectItem key={entry.id} value={entry.id}>{entry.name} · {entry.notation}</SelectItem>)}
                <SelectItem value="custom">Custom cell potentials</SelectItem>
              </SelectContent>
            </Select>
            {cell.custom ? <p className="mt-2 text-sm leading-5 text-muted-foreground">Custom cells use Q = anode concentration / cathode concentration, both to the first power.</p> : <p className="mt-2 font-mono text-sm text-muted-foreground">{preset.notation}</p>}
          </section>

          <section className="space-y-4 border-b border-border pb-6" aria-labelledby="potential-heading">
            <h3 id="potential-heading" className="text-base font-semibold">Standard potentials</h3>
            <NumberField label="Anode E°" unit="V" id="anode-potential" value={cell.anodePotential} error={errors["anodePotential"]} onChange={(value) => { chooseCustom(); update("anodePotential", parseNumeric(value)); }} />
            <NumberField label="Cathode E°" unit="V" id="cathode-potential" value={cell.cathodePotential} error={errors["cathodePotential"]} onChange={(value) => { chooseCustom(); update("cathodePotential", parseNumeric(value)); }} />
            {cell.cathodePotential < cell.anodePotential && <Alert className="border-voltage/50 text-foreground"><Info className="size-4" /><AlertTitle>Non-spontaneous setup</AlertTitle><AlertDescription>The cathode E° is lower than the anode E°. The standard cell potential is negative.</AlertDescription></Alert>}
          </section>

          <section className="space-y-4 border-b border-border pb-6" aria-labelledby="concentration-heading">
            <h3 id="concentration-heading" className="text-base font-semibold">Ion concentrations</h3>
            <NumberField label={`${anodeIon} at the anode`} unit="M" id="anode-concentration" value={cell.anodeConcentration} error={errors["anodeConcentration"]} onChange={(value) => update("anodeConcentration", parseNumeric(value))} />
            <NumberField label={`${cathodeIon} at the cathode`} unit="M" id="cathode-concentration" value={cell.cathodeConcentration} error={errors["cathodeConcentration"]} onChange={(value) => update("cathodeConcentration", parseNumeric(value))} />
            <SliderControl label="Adjust anode concentration" value={cell.anodeConcentration} display={formatNumber(cell.anodeConcentration, 3)} min={-3} max={1} step={0.01} minCaption="0.001 M" maxCaption="10 M" onValueChange={(value) => update("anodeConcentration", 10 ** value)} logarithmic />
          </section>

          <section className="space-y-4 border-b border-border pb-6" aria-labelledby="conditions-heading">
            <h3 id="conditions-heading" className="text-base font-semibold">Reaction conditions</h3>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Label htmlFor="temperature">Temperature</Label>
                <div className="flex items-center gap-2 text-sm"><span className={temperatureUnit === "C" ? "font-semibold text-foreground" : "text-muted-foreground"}>°C</span><Switch checked={temperatureUnit === "K"} onCheckedChange={(checked) => handleTemperatureUnit(checked ? "K" : "C")} aria-label="Temperature unit: Celsius or Kelvin" /><span className={temperatureUnit === "K" ? "font-semibold text-foreground" : "text-muted-foreground"}>K</span></div>
              </div>
              <div className="flex gap-2">
                <Input id="temperature" type="number" step="any" value={formatInput(temperatureShown)} aria-label={`Temperature in ${temperatureUnit === "C" ? "degrees Celsius" : "kelvin"}`} aria-invalid={Boolean(errors["temperature"])} onChange={(event) => handleTemperature(parseNumeric(event.target.value))} />
                <span className="flex h-9 min-w-12 items-center justify-center rounded-md border border-border bg-muted/40 px-3 font-mono text-sm text-muted-foreground">{temperatureUnit === "C" ? "°C" : "K"}</span>
              </div>
              {errors["temperature"] && <p className="mt-1 text-sm text-destructive" role="alert">{errors["temperature"]}</p>}
            </div>
            <SliderControl label="Adjust temperature" value={cell.temperatureK} display={`${formatNumber(cell.temperatureK, 4)} K`} min={273} max={373} step={0.1} minCaption="273 K" maxCaption="373 K" onValueChange={(value) => update("temperatureK", value)} />
            <NumberField label="Electrons transferred (n)" unit="e⁻" id="electrons" value={cell.electrons} error={errors["electrons"]} step="1" onChange={(value) => update("electrons", parseNumeric(value))} />
          </section>

          <Button className="h-11 w-full" onClick={() => setHasCalculated(true)} disabled={Object.keys(errors).length > 0} type="button">
            <Zap aria-hidden="true" /> Calculate cell potential
          </Button>
          <Button variant="outline" className="w-full" onClick={tryExample} type="button">Try example · Daniell cell</Button>
          {hasCalculated && result && <p className="text-center text-sm text-muted-foreground" role="status">Updated calculation for {preset.name}.</p>}
        </aside>

        <section className="min-w-0 space-y-8" aria-label="Calculation results and analysis">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ResultMetric icon={<Atom />} label="Standard potential" value={result ? `${formatNumber(result.standardPotential)} V` : "—"} detail="E°cell = E°cathode − E°anode" />
            <ResultMetric icon={<Sigma />} label="Reaction quotient" value={result ? formatNumber(result.quotient) : "—"} detail="Q = products / reactants" />
            <ResultMetric icon={<Zap />} label="Actual cell potential" value={result ? `${formatNumber(result.potential)} V` : "—"} detail="Nernst-adjusted E" prominent />
            <ResultMetric icon={<ArrowDownRight />} label="Gibbs free energy" value={result ? `${formatNumber(result.gibbsKJ)} kJ/mol` : "—"} detail="ΔG = −nFE" />
            <ResultMetric icon={<Sigma />} label="Equilibrium constant" value={result ? formatNumber(result.equilibriumConstant, 4) : "—"} detail="K at the selected temperature" />
            <StatusMetric status={result?.spontaneity ?? "equilibrium"} valid={Boolean(result)} />
          </div>

          {result && <div className="flex flex-col gap-2 border-l-2 border-voltage bg-voltage/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
            <div className="flex items-center gap-2"><ArrowRight size={18} className="text-voltage-foreground" aria-hidden="true" /><p className="text-sm font-medium">Standard vs actual potential</p></div>
            <p className="font-mono text-sm font-semibold tabular-nums">ΔE = {formatNumber(result.voltageShift)} V {result.voltageShift > 0 ? "↑" : result.voltageShift < 0 ? "↓" : "="}</p>
          </div>}

          <section className="border-y border-border py-6" aria-labelledby="working-heading">
            <Button variant="ghost" className="h-auto w-full justify-between px-0 py-1 text-left" onClick={() => setShowWorking(!showWorking)} aria-expanded={showWorking} aria-controls="working-panel">
              <span><span id="working-heading" className="font-display text-xl font-semibold">Show working</span><span className="ml-3 hidden text-sm font-normal text-muted-foreground sm:inline">Substitution using your current conditions</span></span>
              <ChevronDown className={`transition-transform ${showWorking ? "rotate-180" : ""}`} aria-hidden="true" />
            </Button>
            {showWorking && result && <div id="working-panel" className="mt-4 grid gap-4 lg:grid-cols-2">
              <WorkingStep title="1 · Standard cell potential" formula={equation(`E^\\circ_{\\mathrm{cell}} = E^\\circ_{\\mathrm{cathode}} - E^\\circ_{\\mathrm{anode}} = ${cell.cathodePotential} - (${cell.anodePotential}) = ${formatNumber(result.standardPotential)}\\,\\mathrm{V}`)} />
              <WorkingStep title="2 · Reaction quotient" formula={equation(`Q = \\frac{[${anodeIon}]^{${formatNumber(cell.electrons / (cell.anodeCharge ?? 1))}}}{[${cathodeIon}]^{${formatNumber(cell.electrons / (cell.cathodeCharge ?? 1))}}} = ${formatNumber(result.quotient)}`)} />
              <WorkingStep title="3 · Nernst equation" formula={equation(`E = E^\\circ_{\\mathrm{cell}} - \\frac{RT}{nF}\\ln(Q) = ${formatNumber(result.standardPotential)} - \\frac{8.314 \\cdot ${formatNumber(cell.temperatureK)} }{${cell.electrons} \\cdot 96485} \\ln(${formatNumber(result.quotient)}) = ${formatNumber(result.potential)}\\,\\mathrm{V}`)} />
              <WorkingStep title="4 · Gibbs energy & equilibrium" formula={equation(`\\Delta G = -nFE = -${cell.electrons} \\cdot 96485 \\cdot ${formatNumber(result.potential)} = ${formatNumber(result.gibbsKJ)}\\,\\mathrm{kJ\\,mol^{-1}}`)} />
            </div>}
            {showWorking && !result && <p className="mt-4 text-sm text-muted-foreground">Correct the highlighted input to see the substituted Nernst equation.</p>}
          </section>

          <section className="space-y-4" aria-labelledby="charts-heading">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 id="charts-heading" className="font-display text-2xl font-semibold">Potential analysis</h2><p className="mt-1 text-sm text-muted-foreground">Live response at {preset.name} operating conditions.</p></div>
              <div className="flex items-center gap-2 font-mono text-sm"><span className="size-2.5 rounded-full bg-primary" aria-hidden="true" />Current point · {formatNumber(currentConcentration, 3)} M · {formatNumber(cell.temperatureK, 5)} K</div>
            </div>
            <div className="grid gap-5 2xl:grid-cols-2">
              <ChartPanel title="Cell potential vs ion concentration" description={`Varies [${anodeIon}] at the anode; logarithmic concentration scale`}>
                {result ? <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={concentrationSeries} margin={{ top: 12, right: 24, left: 4, bottom: 8 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" dataKey="concentration" scale="log" domain={[0.001, 10]} tick={{ fontSize: 12 }} ticks={[0.001, 0.01, 0.1, 1, 10]} tickFormatter={(value) => formatNumber(value)} label={{ value: `Anode [${anodeIon}] (M)`, position: "insideBottom", offset: -2, fontSize: 12 }} />
                  <YAxis type="number" domain={['auto', 'auto']} tick={{ fontSize: 12 }} tickFormatter={(value) => Number(value).toFixed(2)} label={{ value: "E (V)", angle: -90, position: "insideLeft", fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip label="Concentration" unit="M" valueLabel="Cell potential" />} />
                  <Line type="monotone" dataKey="potential" stroke={chartColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <ReferenceDot x={currentConcentration} y={result.potential} r={5} fill="var(--color-primary)" stroke="var(--color-background)" strokeWidth={2} ifOverflow="extendDomain" />
                </LineChart></ResponsiveContainer></div> : <ChartPlaceholder />}
              </ChartPanel>

              <ChartPanel title="Cell potential vs temperature" description="Temperature response from 273 K to 373 K">
                {result ? <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={temperatureSeries} margin={{ top: 12, right: 20, left: 4, bottom: 8 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" dataKey="temperatureK" domain={[273, 373]} tick={{ fontSize: 12 }} ticks={[273, 298, 323, 348, 373]} label={{ value: "Temperature (K)", position: "insideBottom", offset: -2, fontSize: 12 }} />
                  <YAxis type="number" domain={['auto', 'auto']} tick={{ fontSize: 12 }} tickFormatter={(value) => Number(value).toFixed(2)} label={{ value: "E (V)", angle: -90, position: "insideLeft", fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip label="Temperature" unit="K" valueLabel="Cell potential" />} />
                  <Line type="monotone" dataKey="potential" stroke={chartColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <ReferenceDot x={cell.temperatureK} y={result.potential} r={5} fill="var(--color-primary)" stroke="var(--color-background)" strokeWidth={2} ifOverflow="extendDomain" />
                </LineChart></ResponsiveContainer></div> : <ChartPlaceholder />}
              </ChartPanel>

              <ChartPanel title="Potential heatmap" description="E across anode ion concentration × temperature">
                {result ? <div className="overflow-x-auto pb-1"><div className="min-w-[430px]" role="img" aria-label={`Heatmap of cell potential from ${formatNumber(minHeat)} to ${formatNumber(maxHeat)} volts by concentration and temperature`}>
                  <div className="ml-[72px] mb-2 grid grid-cols-11 text-center font-mono text-xs text-muted-foreground"><span className="col-span-11">Concentration (M) · log scale</span></div>
                  <div className="flex">
                    <div className="grid w-[72px] shrink-0 grid-rows-11 pr-2 text-right font-mono text-xs text-muted-foreground">{Array.from({ length: 11 }, (_, i) => 373 - i * 10).map((t) => <span key={t} className="flex items-center justify-end">{t}</span>)}</div>
                    <div className="grid flex-1 grid-cols-11 overflow-hidden rounded-sm border border-border" style={{ aspectRatio: "11 / 8.5" }}>
                      {heatValues.slice().reverse().map((point) => <div key={`${point.temperatureK}-${point.concentration}`} title={`${formatNumber(point.potential)} V · ${formatNumber(point.concentration, 3)} M · ${point.temperatureK} K`} className="flex items-center justify-center border-[0.5px] border-background/40 text-[10px] font-mono" style={{ background: interpolateHeatColor(point.potential, minHeat, maxHeat) }} aria-label={`${formatNumber(point.potential)} volts at ${point.concentration} molar and ${point.temperatureK} kelvin`} />)}
                    </div>
                  </div>
                  <div className="ml-[72px] grid grid-cols-11 pt-1 font-mono text-xs text-muted-foreground">{Array.from({ length: 11 }, (_, i) => 10 ** (-3 + i * 0.5)).map((c) => <span key={c} className="text-center">{formatNumber(c, 2)}</span>)}</div>
                  <p className="mt-2 text-xs text-muted-foreground">Rows: temperature (K) · each square reports E on focus or pointer hover.</p>
                </div></div> : <ChartPlaceholder />}
              </ChartPanel>

              <ChartPanel title="Standard vs actual" description="Voltage at the standard and current reaction quotient">
                {result ? <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={[{ name: "Standard", potential: result.standardPotential }, { name: "Actual", potential: result.potential }]} margin={{ top: 12, right: 18, left: 4, bottom: 12 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} tickFormatter={(value) => Number(value).toFixed(2)} label={{ value: "E (V)", angle: -90, position: "insideLeft", fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip label="Potential type" unit="V" valueLabel="Cell potential" />} />
                  <Line dataKey="potential" stroke="var(--color-voltage-foreground)" strokeWidth={3} dot={{ r: 6, fill: "var(--color-voltage-foreground)" }} isAnimationActive={false} />
                </ComposedChart></ResponsiveContainer></div> : <ChartPlaceholder />}
              </ChartPanel>
            </div>
          </section>

          <section className="grid gap-6 border-t border-border pt-7 lg:grid-cols-2" aria-labelledby="prediction-heading">
            <div>
              <h2 id="prediction-heading" className="font-display text-xl font-semibold">Prediction table</h2>
              <p className="mt-1 text-sm text-muted-foreground">Potential across temperature at the current concentration.</p>
              <PredictionTable headers={["Temperature", "E (V)"]} rows={predictions.temperatures.map(({ temperatureK, potential }) => [`${formatNumber(temperatureK, 5)} K`, `${formatNumber(potential)} V`])} currentIndex={predictions.temperatures.findIndex((point) => Math.abs(point.temperatureK - cell.temperatureK) < 1)} />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Concentration sweep</h2>
              <p className="mt-1 text-sm text-muted-foreground">Potential across anode ion concentration at the current temperature.</p>
              <PredictionTable headers={[`[${anodeIon}]`, "E (V)"]} rows={predictions.concentrations.map(({ concentration, potential }) => [`${formatNumber(concentration, 3)} M`, `${formatNumber(potential)} V`])} currentIndex={predictions.concentrations.findIndex((point) => Math.abs(point.concentration - cell.anodeConcentration) < 1e-10)} />
            </div>
          </section>
          <p className="border-t border-border pt-5 text-sm leading-6 text-muted-foreground">Model note: pure solids and liquids are excluded. For preset cells, Q uses reaction-balanced stoichiometric powers; a custom cell uses the two supplied ion concentrations as a 1:1 ratio.</p>
        </section>
      </div>
    </main>
  );
}

function formatInput(value: number): string {
  return Number.isFinite(value) ? String(Number(value.toPrecision(8))) : "";
}

function NumberField({ label, unit, id, value, error, step = "any", onChange }: { label: string; unit: string; id: string; value: number; error?: string | undefined; step?: string; onChange: (value: string) => void }) {
  return <div>
    <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
    <div className="mt-2 flex gap-2">
      <Input id={id} type="number" step={step} value={formatInput(value)} onChange={(event) => onChange(event.target.value)} aria-label={`${label}, ${unit}`} aria-invalid={Boolean(error)} />
      <span aria-hidden="true" className="flex h-9 min-w-12 items-center justify-center rounded-md border border-border bg-muted/40 px-3 font-mono text-sm text-muted-foreground">{unit}</span>
    </div>
    {error && <p className="mt-1 text-sm text-destructive" role="alert">{error}</p>}
  </div>;
}

function SliderControl({ label, value, display, min, max, step, minCaption, maxCaption, onValueChange, logarithmic = false }: { label: string; value: number; display: string; min: number; max: number; step: number; minCaption: string; maxCaption: string; onValueChange: (value: number) => void; logarithmic?: boolean }) {
  const rawSliderValue = logarithmic
    ? Number.isFinite(value) && value > 0 ? Math.log10(value) : min
    : Number.isFinite(value) ? value : min;
  const sliderValue = Math.min(max, Math.max(min, rawSliderValue));
  return <div className="rounded-md bg-muted/35 px-3 py-3">
    <div className="mb-3 flex items-center justify-between gap-3"><Label className="text-sm">{label}</Label><span className="font-mono text-sm font-semibold tabular-nums">{display}</span></div>
    <Slider aria-label={label} value={[sliderValue]} min={min} max={max} step={step} onValueChange={(values) => { const next = values[0]; if (next !== undefined) onValueChange(logarithmic ? 10 ** next : next); }} />
    <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{minCaption}</span><span>{maxCaption}</span></div>
  </div>;
}

function ResultMetric({ icon, label, value, detail, prominent = false }: { icon: React.ReactNode; label: string; value: string; detail: string; prominent?: boolean }) {
  return <Card className={`result-metric rounded-md border-border p-4 shadow-none ${prominent ? "border-primary/50 bg-primary/5" : ""}`}>
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">{icon}<span>{label}</span></div>
    <p className={`mt-3 break-words font-mono font-bold tabular-nums leading-tight ${prominent ? "text-3xl text-primary" : "text-2xl"}`} aria-live="polite">{value}</p>
    <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
  </Card>;
}

function StatusMetric({ status, valid }: { status: "spontaneous" | "non-spontaneous" | "equilibrium"; valid: boolean }) {
  const title = !valid ? "Check inputs" : status === "spontaneous" ? "Spontaneous" : status === "non-spontaneous" ? "Non-spontaneous" : "At equilibrium";
  const description = !valid ? "Resolve highlighted values" : status === "spontaneous" ? "E > 0 · favorable as written" : status === "non-spontaneous" ? "E < 0 · unfavorable as written" : "E = 0 · no net driving force";
  const Icon = status === "spontaneous" ? ArrowUpRight : status === "non-spontaneous" ? ArrowDownRight : Info;
  return <Card className={`result-metric rounded-md border-border p-4 shadow-none ${valid ? `status-${status}` : ""}`}>
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Zap aria-hidden="true" size={16} /><span>Reaction tendency</span></div>
    <div className="mt-3 flex items-center gap-2"><Icon aria-hidden="true" size={20} /><p className="break-words text-xl font-semibold leading-tight">{title}</p></div>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
  </Card>;
}

function WorkingStep({ title, formula }: { title: string; formula: string }) {
  return <div className="min-w-0 border-l-2 border-primary/40 pl-4 py-1">
    <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
    <div className="equation-scroll mt-3 overflow-x-auto text-foreground" dangerouslySetInnerHTML={{ __html: formula }} />
  </div>;
}

function ChartPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="min-w-0 border-t border-border pt-4" aria-label={title}>
    <div className="mb-3"><h3 className="font-display text-lg font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
    {children}
  </section>;
}

function ChartTooltip({ active, payload, label, unit, valueLabel }: { active?: boolean; payload?: Array<{ value?: number; name?: string }>; label?: string | number; unit: string; valueLabel: string }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
    <p className="font-medium">{label === undefined ? "" : `${label} ${unit}`}</p>
    <p className="mt-1 font-mono">{valueLabel}: {typeof value === "number" ? formatNumber(value) : "—"} V</p>
  </div>;
}

function ChartPlaceholder() {
  return <div className="flex h-[280px] items-center justify-center bg-muted/30 text-sm text-muted-foreground">Enter valid inputs to display the chart.</div>;
}

function PredictionTable({ headers, rows, currentIndex }: { headers: [string, string]; rows: string[][]; currentIndex: number }) {
  return <div className="mt-4 overflow-hidden rounded-md border border-border">
    <table className="w-full border-collapse text-left text-sm">
      <thead className="bg-muted/50"><tr>{headers.map((header) => <th key={header} scope="col" className="px-3 py-2.5 font-medium">{header}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={row[0]} className={`border-t border-border ${index === currentIndex ? "bg-primary/10 font-semibold" : ""}`} aria-current={index === currentIndex ? "true" : undefined}>{row.map((value, column) => <td key={column} className="px-3 py-2 font-mono tabular-nums">{value}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}