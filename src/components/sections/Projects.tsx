'use client';
import "../../styles/page-header-offset.css";
import useIsMobile from "../../hooks/useIsMobile";
import { Container, Section, Badge as SectionLabel } from "../../design-system/primitives";
import ProjectCard from "../cards/ProjectCard";

export default function Projects() {
  const isMobile = useIsMobile();
  return (
    <Section id="projects" className="cw-below-navbar" style={{background:"#091613"}}>
      <Container>
        <div style={{display:"flex",flexDirection:isMobile?"column":"row",justifyContent:"space-between",alignItems:isMobile?"flex-start":"flex-end",marginBottom:isMobile?32:48,gap:16}}>
          <div>
            <SectionLabel>COMPLETED PIPELINES</SectionLabel>
            <h1 className="section-title">Projects That<br/>Performed.</h1>
          </div>
          <div style={{fontSize:13,color:"#c0cfe0"}}>All figures independently verified post-installation.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:20}}>
          <ProjectCard tag="RESIDENTIAL · HALDWANI" title="4BHK Central AC — Haldwani" area="2,400 sq ft" system="3 Ton Central" saving="₹3,200/mo" desc="Replaced 4 split units with a central ducted system. Energy saving exceeded projection by 12% in first summer."/>
          <ProjectCard tag="COMMERCIAL · RAMNAGAR" title="Resorts & Restaurant — Choi" area="8,000 sq ft" system="VRF 18 Ton" saving="₹24,000/mo" desc="Multi-zone VRF system for variable occupancy across 3 floors. LEED-compliant installation."/>
          <ProjectCard tag="INDUSTRIAL · RUDRAPUR" title="Factory" area="22,000 sq ft" system="Precision Cooling" saving="₹85,000/mo" desc="Temperature-critical environment at 18±1°C. Dual-redundant system with real-time monitoring."/>
        </div>
      </Container>
    </Section>
  );
}
