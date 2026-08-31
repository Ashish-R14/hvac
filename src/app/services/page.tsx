import Navbar from "../../components/Navbar";
import Services from "../../components/sections/Services";
import FloatingSocial from "../../components/FloatingSocial";
import Footer from "../../components/Footer";
import { buildMetadata } from "../../lib/pageMetadata";

export const metadata = buildMetadata({
  title: "HVAC Services | Climewave Engineers",
  description: "Residential, commercial, industrial, and maintenance HVAC services from Climewave Engineers — one connected system from design to long-term upkeep.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <Services />
      <FloatingSocial />
      <Footer />
    </>
  );
}
