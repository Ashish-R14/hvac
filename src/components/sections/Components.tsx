'use client';
import "../../styles/page-header-offset.css";
import useIsMobile from "../../hooks/useIsMobile";
import { Container, Section, Badge as SectionLabel } from "../../design-system/primitives";
import ComponentCard from "../cards/ComponentCard";
import SmallComponentCard from "../cards/SmallComponentCard";

export default function ComponentsSection() {
  const isMobile = useIsMobile();
  return (
    <Section id="components" className="cw-below-navbar" style={{background:"#0d1f1b"}}>
      <Container>
        <div style={{textAlign:"center",marginBottom:isMobile?36:56}}>
          <SectionLabel>HVAC COMPONENTS</SectionLabel>
          <h1 className="section-title">The Building Blocks<br/>of Every System</h1>
          <p className="section-sub" style={{margin:"0 auto"}}>Every Climewave installation is built from precision-engineered components — selected, sized, and connected based on your specific load analysis.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:20,marginBottom:20}}>
          {[{code:"CHILLER",icon:"❄️",title:"Chiller Unit",full:"Centrifugal / Screw / Scroll Chiller",desc:"The heart of large-scale cooling systems. Removes heat from liquid via refrigeration cycle.",specs:["Capacity: 10 TR – 2,000 TR","COP: 4.5 – 6.5","Refrigerant: R-134a / R-410A","Types: Air-cooled, Water-cooled"],col:"#00d4ff",tags:["Commercial","Industrial","Central Plant"]},{code:"AHU",icon:"💨",title:"Air Handling Unit",full:"Air Handling Unit",desc:"Conditions and circulates air. Contains cooling coils, heating elements, filters, and fans.",specs:["Airflow: 500 – 50,000 CFM","MERV 8–14 filtration","EC fan motors","Modular construction"],col:"#00e5a0",tags:["Commercial","Healthcare","Cleanroom"]},{code:"FCU",icon:"🌀",title:"Fan Coil Unit",full:"Fan Coil Unit",desc:"Room-level terminal unit connected to chilled water pipes. Provides zonal temperature control.",specs:["Capacity: 0.5 TR – 5 TR","2-pipe / 4-pipe options","Concealed or exposed","Low noise: 25–38 dB"],col:"#ff6b35",tags:["Hotels","Offices","Residential"]},{code:"VRF/VRV",icon:"⚡",title:"VRF / VRV System",full:"Variable Refrigerant Flow",desc:"One outdoor unit serving multiple indoor units. Inverter-driven compressor adjusts precisely.",specs:["1 outdoor → up to 64 indoor","Inverter compressor","Heat recovery option","COP: 3.8 – 5.2"],col:"#ffb800",tags:["Offices","Retail","Multi-zone"]},{code:"CT",icon:"🏗️",title:"Cooling Tower",full:"Induced / Forced Draft Cooling Tower",desc:"Rejects heat from condenser water to atmosphere. Essential in water-cooled chiller plants.",specs:["Range: 5°C – 10°C","Fill media: PVC structured","Anti-Legionella design","Chemical dosing ready"],col:"#aa88ff",tags:["Chiller Plants","Industrial","Data Centers"]},{code:"VHU",icon:"🌡️",title:"Ventilation / HRU",full:"VHU / MVHR / ERV",desc:"Provides fresh air while recovering 70–85% of energy from exhaust air.",specs:["Efficiency: 70–85% heat recovery","CO₂ demand-controlled","HEPA filter option","Bypass damper"],col:"#00ccaa",tags:["Green Buildings","Residences","Offices"]}].map(comp=><ComponentCard key={comp.code} {...comp}/>)}
        </div>
        <div style={{marginBottom:32}}>
          <div style={{fontSize:11,color:"#9ab8d8",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em",marginBottom:16}}>SUPPORTING COMPONENTS</div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:14}}>
            {[{code:"PUMP",icon:"🔄",title:"Chilled Water Pump",desc:"Circulates chilled water between chiller and AHU/FCU.",col:"#00d4ff"},{code:"EXP",icon:"🔁",title:"Expansion Valve",desc:"Controls refrigerant flow into evaporator. Electronic EEV for precision.",col:"#00e5a0"},{code:"COND",icon:"☀️",title:"Condenser Unit",desc:"Outdoor unit that rejects heat. Air-cooled condensers for split and VRF.",col:"#ff6b35"},{code:"BMS",icon:"🖥️",title:"BMS / Controls",desc:"Building Management System integrates all HVAC components.",col:"#ffb800"},{code:"DUCT",icon:"📐",title:"Ductwork & Diffusers",desc:"Sheet metal or fiberglass ducts distribute conditioned air.",col:"#aa88ff"},{code:"PIPE",icon:"🔧",title:"Piping & Insulation",desc:"Chilled water, condenser water, and refrigerant pipework.",col:"#00ccaa"},{code:"FILTER",icon:"🌿",title:"Air Filters",desc:"Panel, bag, HEPA, and carbon filters for air quality.",col:"#00d4ff"},{code:"VFD",icon:"⚙️",title:"VFD / Inverter",desc:"Variable Frequency Drive controls fan and pump motor speed.",col:"#00e5a0"}].map(c=><SmallComponentCard key={c.code} {...c}/>)}
          </div>
        </div>
      </Container>
    </Section>
  );
}
