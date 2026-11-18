# Nernst Potential Lab

Build a web app called "NernstLab: Smart Electrochemical Cell Potential Prediction & Visualization System".

PURPOSE
A tool for chemistry students and researchers that automates cell potential calculation with the Nernst equation, predicts how the potential changes with temperature and ion concentration, and shows the results in interactive graphs. It replaces repeated manual calculation, which is slow and error-prone, and helps users understand how electrochemical parameters affect cell voltage.

CORE SCIENCE (use exactly)
- E°cell = E°cathode − E°anode
- Nernst: E = E°cell − (R·T / n·F) · ln(Q)
- R = 8.314 J/mol·K, F = 96485 C/mol, T in Kelvin (K = °C + 273.15)
- At 298.15 K: E = E°cell − (0.0592 / n) · log10(Q)
- Q = [products] / [reactants] (pure solids and liquids excluded)
- ΔG = −n·F·E (kJ/mol), K = exp(n·F·E°cell / R·T)
- Spontaneity: E > 0 spontaneous, E < 0 non-spontaneous, E = 0 equilibrium

MODULE 1: INPUT & DATA PROCESSING
- Clean input form with these fields: anode E° (V), cathode E° (V), anode ion concentration (M), cathode ion concentration (M), temperature (°C or K toggle), electrons transferred (n).
- Preset library: Daniell cell (Zn|Zn²⁺ || Cu²⁺|Cu), Cu–Ag, Zn–Ag, Fe–Cu, Mg–Cu, Ni–Cu, Al–Cu, each with correct standard potentials and n. Selecting a preset auto-fills the form.
- Validation with inline error messages: concentrations > 0, n a positive integer, temperature above absolute zero, and a warning if the cathode E° is lower than the anode E° (non-spontaneous setup).
- Reset button and a "Calculate" button.

MODULE 2: CALCULATION & PREDICTION
- Result cards: E°cell, Q, actual cell potential E, ΔG, equilibrium constant K, and a spontaneity badge (green "Spontaneous" / red "Non-spontaneous" / amber "At equilibrium").
- "Standard vs Actual" comparison showing the voltage shift (E − E°cell) with an up/down indicator.
- A "Show working" panel that displays the substituted equation step by step with the user's numbers (formulas rendered with KaTeX).
- Prediction table: E at 5 or more temperatures and 5 or more concentrations.

MODULE 3: VISUALIZATION & RESULT ANALYSIS (use Recharts)
- Chart 1: Cell potential vs ion concentration (log-scale x-axis), line chart.
- Chart 2: Cell potential vs temperature (273 to 373 K), line chart.
- Chart 3: 2D heatmap of E over concentration × temperature, with a color scale.
- Chart 4: Bar chart comparing E°cell with the actual E.
- Interactive sliders for concentration and temperature that update the charts and results live.
- Tooltips, axis labels with units, and a marker showing the user's current operating point on each curve.
- Export results as CSV and a "Download report" (PDF/print) button.

PAGES / LAYOUT
1. Hero/Home: title, one-line purpose, "Start Calculating" button, and a short flow diagram (Input → Nernst Processing → Prediction → Visualization → Result).
2. Calculator + Dashboard: the input panel on the left and results and charts on the right (stacked on mobile).
3. Learn: a short explanation of the Nernst equation, the meaning of each variable, and a standard electrode potential table.
4. About: the project title, "Engineering Chemistry – UBA4911", "Guided by Dr. Kalpana Kumar", and placeholders for Name and Reg No.

DESIGN & TYPOGRAPHY (every font choice has a purpose)
- Headings: "Space Grotesk" (600-700). It looks modern and scientific, and works well at large sizes.
- Body and UI text: "Inter" (400/500). It is highly readable at small sizes for labels, buttons and paragraphs.
- Equations, numeric results and table values: "JetBrains Mono". Monospace aligns digits so values are easy to compare.
- Type scale: H1 40px, H2 28px, H3 20px, body 16px, labels 14px. Line-height 1.5 for body. Never go below 14px.
- Contrast: WCAG AA minimum. Dark text (#0F172A) on light surfaces, no light grey on white.
- Colors: deep teal/electric blue primary (#0EA5E9 to #0369A1), amber accent for "voltage" highlights, green/red/amber strictly for spontaneity status. Light theme by default with a dark mode toggle.
- Style: clean card layout, 12px rounded corners, soft shadows, generous spacing, subtle animation on result updates only (no decorative motion).
- Fully responsive and keyboard accessible, with visible focus states and aria-labels on inputs and charts.

TECH
React + TypeScript + Tailwind + shadcn/ui + Recharts + KaTeX. All calculation runs client-side in a separate, well-commented utility file (nernst.ts) so the formulas are easy to inspect and test. No backend is required.

ACCEPTANCE CHECK
Daniell cell with [Zn²⁺] = 1 M, [Cu²⁺] = 1 M, T = 298.15 K, n = 2 must give E°cell = 1.10 V, Q = 1, E = 1.10 V. Changing [Zn²⁺] to 0.01 M must raise E to about 1.159 V. Show these as a "Try example" button.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/45a9b46f-fdd5-4e55-8f16-1e0de8c376b7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
