import Navbar from "../../components/Navbar";
import Projects from "../../components/sections/Projects";
import FloatingSocial from "../../components/FloatingSocial";
import Footer from "../../components/Footer";
import { buildMetadata } from "../../lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Completed HVAC Projects | Climewave Engineers",
  description: "Residential, commercial, and industrial HVAC installations completed by Climewave Engineers, with independently verified energy savings.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <Projects />
      <FloatingSocial />
      <Footer />
    </>
  );
}
