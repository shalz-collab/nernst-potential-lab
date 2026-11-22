# NernstLab AI explanations and calculation history

## Build
- Add an AI explanation action that uses the current cell inputs and computed outputs to explain the predicted potential and how concentration and temperature affect it.
- Add a saved-calculation history with side-by-side comparison of cell identity, conditions, and potential.
- Keep the calculation itself client-side and use Lovable Cloud for account-scoped saved records; keep the gateway key server-side.
- Add restrained motion to reveal results and comparison states, honoring reduced-motion preferences.

## Technical details
- Use the Lovable AI Gateway SDK from an authenticated TanStack server function, grounded only in validated values from the existing Nernst utility.
- Store saved calculations in Cloud with owner-scoped access; add the required sign-in/save interaction without blocking calculator use.
- Preserve current calculation formulas and professional styling; add tests for history mapping and any new scientific explanation inputs.
- Verify calculator, save/read/compare, AI response/error states, responsive layout, tests, typecheck, and preview diagnostics.