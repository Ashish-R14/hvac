import Navbar from "../../components/Navbar";
import HowItWorks from "../../components/sections/HowItWorks";
import FloatingSocial from "../../components/FloatingSocial";
import Footer from "../../components/Footer";
import { buildMetadata } from "../../lib/pageMetadata";

export const metadata = buildMetadata({
  title: "How It Works | Climewave Engineers",
  description: "From room measurement to a commissioned system — see the four-stage pipeline Climewave Engineers uses to design and install every HVAC system.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <HowItWorks />
      <FloatingSocial />
      <Footer />
    </>
  );
}
