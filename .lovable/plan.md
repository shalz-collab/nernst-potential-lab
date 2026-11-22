# NernstLab AI explanations and no-sign-in history

## Build
- Add an AI explanation action that uses the current cell inputs and computed outputs to explain predicted potential and how concentration and temperature affect it.
- Save calculations in this browser without sign-in; compare cell identity, conditions, and potentials side by side.
- Keep electrochemical calculations client-side and AI requests on the Lovable AI Gateway with bounded, validated input.
- Add restrained motion to reveal results and comparison states, honoring reduced-motion preferences.

## Technical details
- Use the installed Lovable AI Gateway SDK in a TanStack server function; return a clear recoverable message for model errors.
- Store a bounded list of saved calculations in browser storage, with no profile or account data.
- Preserve current formulas and professional styling; test any new pure history mapping or explanation input validation.
- Verify the calculator, AI response/error states, save/read/compare, responsive layout, tests, typecheck, and preview diagnostics.