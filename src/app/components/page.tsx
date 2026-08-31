import Navbar from "../../components/Navbar";
import ComponentsSection from "../../components/sections/Components";
import FloatingSocial from "../../components/FloatingSocial";
import Footer from "../../components/Footer";
import { buildMetadata } from "../../lib/pageMetadata";

export const metadata = buildMetadata({
  title: "HVAC Components | Climewave Engineers",
  description: "Chillers, AHUs, FCUs, VRF systems, cooling towers, and every supporting component that goes into a Climewave-engineered HVAC installation.",
  path: "/components",
});

export default function ComponentsPage() {
  return (
    <>
      <Navbar />
      <ComponentsSection />
      <FloatingSocial />
      <Footer />
    </>
  );
}
