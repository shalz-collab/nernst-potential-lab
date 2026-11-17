import { createFileRoute } from "@tanstack/react-router";
import { NernstShell } from "@/components/NernstShell";
import { CalculatorDashboard } from "@/components/CalculatorDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NernstLab | Cell Potential Calculator" },
      { name: "description", content: "Calculate electrochemical cell potential with the Nernst equation and explore temperature and ion concentration effects." },
      { property: "og:title", content: "NernstLab | Cell Potential Calculator" },
      { property: "og:description", content: "Explore cell voltage, spontaneity, and predictions with a practical Nernst equation calculator." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <NernstShell><CalculatorDashboard /></NernstShell>;
}
