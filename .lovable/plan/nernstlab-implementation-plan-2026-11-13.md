# NernstLab implementation plan

## Build
- Replace the placeholder home screen with a polished NernstLab entry page and add dedicated Calculator, Learn, and About pages.
- Create a tested, client-side Nernst calculation utility covering the supplied constants, spontaneity, thermodynamics, preset reaction quotients, and input validation.
- Build a responsive calculator with the seven presets, editable inputs, live sliders, inline validation, results, expandable worked equations, prediction tables, four Recharts visualizations, CSV export, and print-to-PDF reporting.
- Add a compact electrochemistry reference page and the supplied course/project details.

## Design
- Use Space Grotesk for headings, Inter for interface copy, and JetBrains Mono for values and equations; apply the supplied light scientific palette, accessible focus states, responsive navigation, and optional dark theme.
- Keep colors and typography in semantic design tokens, with status colors reserved for spontaneity states.

## Technical details
- Keep chemistry formulas in `src/lib/nernst.ts`, with unit tests for the Daniell standard case and the 0.01 M zinc acceptance result.
- Use TanStack Start file routes, existing shadcn controls, Recharts, and KaTeX; calculations stay entirely in the browser with no backend.
- Use balanced reaction quotient exponents for known presets; for custom cells use the available concentration inputs as a 1:1 product/reactant ratio.
