import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, CircleHelp, FlaskConical } from "lucide-react";
import { NernstShell } from "@/components/NernstShell";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn the Nernst Equation | NernstLab" },
      { name: "description", content: "Review cell potential, reaction quotient, and spontaneity with a concise electrochemistry reference." },
      { property: "og:title", content: "Learn the Nernst Equation | NernstLab" },
      { property: "og:description", content: "A concise guide to the Nernst equation and electrochemical cell potential." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <NernstShell>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <header className="border-b border-border pb-7">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><BookOpenText size={16} aria-hidden="true" /> ELECTROCHEMISTRY REFERENCE</div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Understanding cell potential</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">A cell’s voltage depends on its standard electrode potentials and the conditions of the reaction.</p>
        </header>

        <section className="grid gap-8 border-b border-border py-8 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.75fr)]">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><FlaskConical size={19} aria-hidden="true" /> Nernst equation</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Use the Nernst equation to adjust a cell’s standard potential for its reaction quotient and absolute temperature.</p>
          </div>
          <div className="flex min-h-24 items-center overflow-x-auto border-l-2 border-primary pl-5 font-mono text-lg" aria-label="Nernst equation: E equals E standard minus RT over nF times natural logarithm of Q">
            E = E° − (RT / nF) ln(Q)
          </div>
        </section>

        <section className="grid gap-8 border-b border-border py-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-semibold">Terms in the equation</h2>
            <dl className="mt-4 divide-y divide-border">
              <div className="grid grid-cols-[4rem_1fr] gap-3 py-3"><dt className="font-mono font-semibold">E°</dt><dd className="text-sm leading-6 text-muted-foreground">Standard cell potential: E°cathode − E°anode.</dd></div>
              <div className="grid grid-cols-[4rem_1fr] gap-3 py-3"><dt className="font-mono font-semibold">R</dt><dd className="text-sm leading-6 text-muted-foreground">Gas constant, 8.314 J mol⁻¹ K⁻¹.</dd></div>
              <div className="grid grid-cols-[4rem_1fr] gap-3 py-3"><dt className="font-mono font-semibold">T</dt><dd className="text-sm leading-6 text-muted-foreground">Absolute temperature in kelvin.</dd></div>
              <div className="grid grid-cols-[4rem_1fr] gap-3 py-3"><dt className="font-mono font-semibold">n, F</dt><dd className="text-sm leading-6 text-muted-foreground">Electrons transferred and Faraday constant, 96,485 C mol⁻¹.</dd></div>
              <div className="grid grid-cols-[4rem_1fr] gap-3 py-3"><dt className="font-mono font-semibold">Q</dt><dd className="text-sm leading-6 text-muted-foreground">Reaction quotient from product and reactant activities; pure solids and liquids are omitted.</dd></div>
            </dl>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">How to interpret the result</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
              <p><strong className="text-foreground">E &gt; 0:</strong> the reaction is spontaneous as written under the selected conditions.</p>
              <p><strong className="text-foreground">E &lt; 0:</strong> the reaction is non-spontaneous as written; the reverse direction is favored.</p>
              <p><strong className="text-foreground">E = 0:</strong> the cell is at equilibrium, with no net driving force.</p>
              <p>Gibbs energy is related by ΔG = −nFE. A negative ΔG corresponds to a positive cell potential.</p>
            </div>
          </div>
        </section>

        <section className="py-8" aria-labelledby="workflow-heading">
          <h2 id="workflow-heading" className="flex items-center gap-2 font-display text-xl font-semibold"><CircleHelp size={19} aria-hidden="true" /> Calculation sequence</h2>
          <ol className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Enter the cell", "Choose a preset or provide electrode potentials and ion concentrations."],
              ["02", "Set conditions", "Enter temperature in °C or K and the number of transferred electrons."],
              ["03", "Check the result", "Compare E°, Q, E, Gibbs energy, equilibrium constant, and reaction tendency."],
              ["04", "Explore trends", "Use the charts and tables to compare concentration and temperature predictions."],
            ].map(([number, title, text]) => (
              <li key={number} className="border-t-2 border-primary/50 pt-3">
                <span className="font-mono text-xs text-muted-foreground">{number}</span>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </NernstShell>
  );
}