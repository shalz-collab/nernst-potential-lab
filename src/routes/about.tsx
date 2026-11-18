import { createFileRoute } from "@tanstack/react-router";
import { Atom, GraduationCap } from "lucide-react";
import { NernstShell } from "@/components/NernstShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NernstLab | Electrochemistry Project" },
      { name: "description", content: "About NernstLab, an Engineering Chemistry project for calculating and visualizing electrochemical cell potential." },
      { property: "og:title", content: "About NernstLab | Electrochemistry Project" },
      { property: "og:description", content: "An educational cell-potential calculator and visualization project for Engineering Chemistry." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <NernstShell>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <header className="border-b border-border pb-7">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><Atom size={16} aria-hidden="true" /> NERNSTLAB</div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">A clearer way to study cell potential</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">NernstLab turns electrochemical conditions into an inspectable calculation, with predictions that make the effects of temperature and ion concentration easier to compare.</p>
        </header>

        <section className="grid gap-8 border-b border-border py-8 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.75fr)]">
          <div>
            <h2 className="font-display text-xl font-semibold">Project purpose</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Manual cell-potential calculations must be repeated when reaction conditions change. This project applies the Nernst equation to calculate standard and non-standard cell potentials, predict changes across conditions, and display the results in graphs and tables.</p>
          </div>
          <div className="border-l-2 border-primary pl-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><GraduationCap size={19} aria-hidden="true" /> Academic project</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-muted-foreground">Institution</dt><dd className="mt-1 font-medium">SASTRA Institute of Medical and Technical Sciences</dd></div>
              <div><dt className="text-muted-foreground">Course</dt><dd className="mt-1 font-medium">Engineering Chemistry · UBA4911</dd></div>
              <div><dt className="text-muted-foreground">Guide</dt><dd className="mt-1 font-medium">Dr. Kalpana Kumar</dd></div>
            </dl>
          </div>
        </section>

        <section className="grid gap-8 py-8 sm:grid-cols-3" aria-label="Project modules">
          {[
            ["Input and validation", "Collect electrode potentials, concentrations, temperature, and electron transfer; flag values that cannot produce a meaningful calculation."],
            ["Calculation and prediction", "Determine standard potential, reaction quotient, Nernst-adjusted potential, spontaneity, and condition-dependent predictions."],
            ["Visualization and analysis", "Compare concentration and temperature trends with interactive charts, a heatmap, prediction tables, and downloadable results."],
          ].map(([title, text]) => (
            <article key={title} className="border-t border-border pt-4">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </section>
      </main>
    </NernstShell>
  );
}