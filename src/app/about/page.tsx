import Navbar from "../../components/Navbar";
import About from "../../components/About";
import FloatingSocial from "../../components/FloatingSocial";
import Footer from "../../components/Footer";
import { buildMetadata } from "../../lib/pageMetadata";

export const metadata = buildMetadata({
  title: "About Us | Climewave Engineers",
  description: "Meet the team behind Climewave Engineers and our mission to make professional-grade HVAC analysis accessible to every homeowner, architect, and contractor in India.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <About />
      <FloatingSocial />
      <Footer />
    </>
  );
}
