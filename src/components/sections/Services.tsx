'use client';
import "../../styles/page-header-offset.css";
import useIsMobile from "../../hooks/useIsMobile";
import { Container, Section, Badge as SectionLabel } from "../../design-system/primitives";
import ServiceCard from "../cards/ServiceCard";

export default function Services() {
  const isMobile = useIsMobile();
  return (
    <Section id="services" className="cw-below-navbar" style={{background:"#091613"}}>
      <Container>
        <div style={{marginBottom:isMobile?36:56}}>
          <SectionLabel>OUR SERVICES</SectionLabel>
          <h1 className="section-title">Four Modules.<br/>One Connected System.</h1>
          <p className="section-sub">Every service is part of a larger pipeline — from initial design to long-term performance maintenance.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr 1fr",gap:20}}>
          <ServiceCard icon="🏠" title="Residential" desc="Complete climate solutions for homes — single rooms to whole-home central systems." features={["BTU calculation per room","Placement optimisation","Split & Central AC","Smart thermostat integration"]} accent="#00d4ff"/>
          <ServiceCard icon="🏢" title="Commercial" desc="High-performance systems for offices, retail, and multi-floor commercial spaces." features={["Zone-by-zone planning","Energy efficiency audit","VRF system design","Compliance documentation"]} accent="#00e5a0"/>
          <ServiceCard icon="🏭" title="Industrial" desc="Heavy-load climate control for warehouses, factories, and process environments." features={["Process cooling analysis","Humidity & air quality","Redundancy planning","24/7 performance monitoring"]} accent="#ff6b35"/>
          <ServiceCard icon="🔧" title="Maintenance" desc="Scheduled servicing and performance optimisation to keep your system at rated COP." features={["6-month service plans","Filter & refrigerant checks","COP performance testing","Emergency response"]} accent="#ffb800"/>
        </div>
      </Container>
    </Section>
  );
}
