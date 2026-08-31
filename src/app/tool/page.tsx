import HVACTool from "../../HVACTool";
import { buildMetadata } from "../../lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Free HVAC Calculator — BTU, AC Size & Cost Estimator | Climewave Engineers",
  description: "Calculate the exact AC size, cooling cost, and best placement for your room in under a minute — free AI-powered HVAC analysis from Climewave Engineers.",
  path: "/tool",
});

export default function ToolPage() {
  return <HVACTool />;
}
