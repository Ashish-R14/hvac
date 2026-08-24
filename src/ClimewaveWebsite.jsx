import './ClimewaveWebsite.css';
import { useState, useEffect } from "react";
import useIsMobile from "./hooks/useIsMobile.js";
import { Container, Section, Badge as SectionLabel } from "./design-system/primitives";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import FloatingSocial from "./components/FloatingSocial.jsx";
import Footer from "./components/Footer.jsx";
import ServiceCard from "./components/cards/ServiceCard.jsx";
import ProjectCard from "./components/cards/ProjectCard.jsx";
import ComponentCard from "./components/cards/ComponentCard.jsx";
import SmallComponentCard from "./components/cards/SmallComponentCard.jsx";
import StatCard from "./components/cards/StatCard.jsx";

// ═══════════════════════════════════════════════════════════════════
//  QUICK HVAC ENGINE
// ═══════════════════════════════════════════════════════════════════
const qBTU  = (l,w,sun,rt) => {
  const sf = {Low:0.9,Medium:1.0,High:1.2}[sun]||1.0;
  const rf = {Bedroom:0.9,"Living Room":1.1,Office:1.2,Commercial:1.4,Industrial:1.6}[rt]||1.0;
  return Math.round(l*w*20*sf*rf);
};
const qAC   = btu => { const t=btu/12000; return t<=1?"1 Ton":t<=1.5?"1.5 Ton":t<=2?"2 Ton":t<=3?"3 Ton":"Central AC"; };
const qCost = btu => Math.round((btu/3412)*8*30*7);
const qTime = (btu,area) => Math.round((area*25)/(btu/60));

// ═══════════════════════════════════════════════════════════════════
//  PIPE STEP
// ═══════════════════════════════════════════════════════════════════
function PipeStep({icon,title,desc,index}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,position:"relative"}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#00d4ff18,#0055ee22)",border:"2px solid #00d4ff55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:16,position:"relative",zIndex:1,boxShadow:"0 0 24px #00d4ff22"}}>
        {icon}
      </div>
      <div style={{fontSize:13,fontWeight:700,color:"#00d4ff",letterSpacing:"0.1em",marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}}>{String(index+1).padStart(2,"0")}</div>
      <div style={{fontSize:15,fontWeight:700,color:"#dce8f8",marginBottom:8}}>{title}</div>
      <div style={{fontSize:12,color:"#c0cfe0",lineHeight:1.6,textAlign:"center"}}>{desc}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  QUICK TOOL
// ═══════════════════════════════════════════════════════════════════
function QuickTool() {
  const isMobile = useIsMobile();
  const [f,setF]=useState({l:1,w:1,sun:"Medium",rt:"Bedroom"});
  const [result,setResult]=useState(null);
  const [busy,setBusy]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const compute=async()=>{
    setBusy(true);
    await new Promise(r=>setTimeout(r,800));
    const btu=qBTU(f.l,f.w,f.sun,f.rt);
    setResult({btu,ac:qAC(btu),cost:qCost(btu),time:qTime(btu,f.l*f.w)});
    setBusy(false);
  };
  const selStyle={background:"#163630",border:"1px solid #286256",borderRadius:9,padding:"11px 14px",color:"#dce8f8",fontSize:14,width:"100%",outline:"none",appearance:"none",WebkitAppearance:"none",fontFamily:"'Syne',sans-serif",cursor:"pointer",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%235a6a8a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 13px center",paddingRight:34};
  const inputStyle={background:"#163630",border:"1px solid #286256",borderRadius:9,padding:"11px 14px",color:"#dce8f8",fontSize:14,width:"100%",outline:"none",fontFamily:"'Syne',sans-serif"};
  return (
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:14,marginBottom:20}}>
        <div>
          <div style={{fontSize:11,color:"#c0cfe0",marginBottom:7,letterSpacing:"0.06em"}}>LENGTH (ft)</div>
          <input type="number" min={1} value={f.l} onChange={e=>set("l",parseFloat(e.target.value)||1)} style={inputStyle}/>
        </div>
        <div>
          <div style={{fontSize:11,color:"#c0cfe0",marginBottom:7,letterSpacing:"0.06em"}}>WIDTH (ft)</div>
          <input type="number" min={1} value={f.w} onChange={e=>set("w",parseFloat(e.target.value)||1)} style={inputStyle}/>
        </div>
        <div>
          <div style={{fontSize:11,color:"#c0cfe0",marginBottom:7,letterSpacing:"0.06em"}}>SUNLIGHT</div>
          <select value={f.sun} onChange={e=>set("sun",e.target.value)} style={selStyle}>
            {["Low","Medium","High"].map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:11,color:"#c0cfe0",marginBottom:7,letterSpacing:"0.06em"}}>ROOM TYPE</div>
          <select value={f.rt} onChange={e=>set("rt",e.target.value)} style={selStyle}>
            {["Bedroom","Living Room","Office","Commercial","Industrial"].map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:isMobile?"column":"row",gap:12,alignItems:isMobile?"stretch":"center",marginBottom:24}}>
        <button onClick={compute} disabled={busy} style={{background:busy?"#286256":"linear-gradient(135deg,#00d4ff,#0055ee)",color:busy?"#c0cfe0":"#0f2420",border:"none",borderRadius:11,padding:"13px 32px",fontSize:15,fontWeight:700,cursor:busy?"not-allowed":"pointer",fontFamily:"'Syne',sans-serif",transition:"all 0.2s",boxShadow:busy?"none":"0 4px 22px rgba(0,212,255,0.3)"}}>
          {busy?"Analysing…":"Quick Analysis →"}
        </button>
        <div style={{fontSize:12,color:"#9ab8d8",fontFamily:"'JetBrains Mono',monospace"}}>
          {f.l*f.w} sq ft · {qBTU(f.l,f.w,f.sun,f.rt).toLocaleString()} BTU
        </div>
      </div>
      {result&&(
        <div style={{animation:"fadeSlide 0.4s ease"}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:20}}>
            {[{label:"COOLING LOAD",val:result.btu.toLocaleString(),sub:"BTU/hr",col:"#00d4ff"},{label:"RECOMMENDED",val:result.ac,sub:"AC unit",col:"#ff6b35"},{label:"COOLING TIME",val:result.time+" min",sub:"35°C → 24°C",col:"#00e5a0"},{label:"MONTHLY COST",val:"₹"+result.cost,sub:"at 8h/day",col:"#ffb800"}].map(m=>(
              <div key={m.label} style={{background:"#163630",border:`1px solid ${m.col}33`,borderRadius:12,padding:"12px 14px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:m.col}}/>
                <div style={{fontSize:9,color:"#9ab8d8",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em",marginBottom:4}}>{m.label}</div>
                <div style={{fontSize:isMobile?15:18,fontWeight:800,color:m.col,fontFamily:"'JetBrains Mono',monospace",marginBottom:2}}>{m.val}</div>
                <div style={{fontSize:10,color:"#9ab8d8"}}>{m.sub}</div>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(0,229,160,0.05)",border:"1px solid rgba(0,229,160,0.2)",borderRadius:12,padding:"14px 18px",display:"flex",flexDirection:isMobile?"column":"row",alignItems:isMobile?"flex-start":"center",justifyContent:"space-between",gap:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#00e5a0",marginBottom:2}}>Want placement analysis + PDF report?</div>
              <div style={{fontSize:11,color:"#c0cfe0"}}>Full analysis includes airflow simulation and downloadable report.</div>
            </div>
            <a href="#full-tool" style={{background:"linear-gradient(135deg,#00e5a0,#00d4ff)",color:"#0f2420",border:"none",borderRadius:10,padding:"11px 22px",fontSize:13,fontWeight:700,textDecoration:"none",fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap",textAlign:"center"}}>
              Full Analysis →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN WEBSITE
// ═══════════════════════════════════════════════════════════════════
export default function ClimewaveWebsite({setView}) {
  const isMobile = useIsMobile();

  return (
    <>
      <Navbar/>
      <Hero/>

      {/* ── HOW IT WORKS ── */}
      <Section id="how-it-works" style={{background:"#091613"}}>
        <Container>
          <div style={{textAlign:"center",marginBottom:isMobile?40:64}}>
            <SectionLabel>THE SYSTEM</SectionLabel>
            <h2 className="section-title">Input → Process<br/>→ Output → Install</h2>
            <p className="section-sub" style={{margin:"0 auto"}}>Every project flows through our four-stage pipeline — from your first measurement to the final commissioned system.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:isMobile?40:0,position:"relative"}}>
            {!isMobile&&(
              <div style={{position:"absolute",top:28,left:"12.5%",right:"12.5%",height:2,background:"linear-gradient(90deg,transparent,#00d4ff33,#00d4ff55,#00d4ff33,transparent)",overflow:"hidden"}}>
                <div style={{height:"100%",width:"30%",background:"linear-gradient(90deg,transparent,#00d4ff,transparent)",animation:"pipeLine 3s linear infinite"}}/>
              </div>
            )}
            {[{icon:"📏",title:"Measure & Input",desc:"Room dimensions, usage patterns, sunlight exposure."},{icon:"⚙️",title:"AI Processing",desc:"Our engine calculates BTU loads, airflow requirements, and placement scores."},{icon:"📊",title:"System Output",desc:"Recommended tonnage, best placement, monthly cost, and airflow map."},{icon:"🔧",title:"Install & Commission",desc:"Our engineers install and verify performance against the spec."}].map((step,i)=>(
              <PipeStep key={i} {...step} index={i} isLast={i===3}/>
            ))}
          </div>
          {/* System diagram — hidden on small mobile */}
          {!isMobile&&(
            <div style={{marginTop:80,background:"#0f2420",border:"1px solid #286256",borderRadius:20,padding:"40px 48px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
              <div style={{position:"relative",zIndex:1}}>
                <div style={{fontSize:11,color:"#9ab8d8",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em",marginBottom:20}}>◆ LIVE SYSTEM DIAGRAM</div>
                <svg width="100%" viewBox="0 0 900 120" style={{overflow:"visible"}}>
                  <line x1="60" y1="60" x2="840" y2="60" stroke="#00d4ff" strokeWidth="2" strokeOpacity="0.2"/>
                  <line x1="60" y1="60" x2="840" y2="60" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="12 8" strokeOpacity="0.6" className="pipe-anim"/>
                  <line x1="450" y1="60" x2="450" y2="10" stroke="#00ff9f" strokeWidth="1.5" strokeDasharray="6 4" className="pipe-anim" style={{animationDelay:"0.5s"}}/>
                  <line x1="650" y1="60" x2="650" y2="110" stroke="#00aacc" strokeWidth="1.5" strokeDasharray="6 4" className="pipe-anim" style={{animationDelay:"1s"}}/>
                  {[{x:60,y:60,lbl:"Room Input",col:"#00d4ff",sub:"Dimensions"},{x:230,y:60,lbl:"BTU Engine",col:"#00d4ff",sub:"Load calc"},{x:450,y:60,lbl:"AI Core",col:"#00ff9f",sub:"Optimization"},{x:650,y:60,lbl:"Placement",col:"#00aacc",sub:"Airflow map"},{x:840,y:60,lbl:"Report",col:"#ffb800",sub:"PDF + data"},{x:450,y:10,lbl:"Central AC",col:"#00ff9f",sub:"Multi-room"},{x:650,y:110,lbl:"Install",col:"#00aacc",sub:"Site commission"}].map(n=>(
                    <g key={n.lbl}>
                      <circle cx={n.x} cy={n.y} r={n.x===450&&n.y===60?10:7} fill={n.col} opacity="0.15"/>
                      <circle cx={n.x} cy={n.y} r={n.x===450&&n.y===60?6:4} fill={n.col} opacity="0.9"/>
                      <text x={n.x} y={n.y-16} textAnchor="middle" fontSize="10" fill={n.col} fontFamily="'JetBrains Mono',monospace" fontWeight="500">{n.lbl}</text>
                      <text x={n.x} y={n.y+22} textAnchor="middle" fontSize="9" fill="#9ab8d8" fontFamily="'JetBrains Mono',monospace">{n.sub}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* ── STATS ── */}
      <Section style={{padding:isMobile?"40px 0":"60px 0",background:"linear-gradient(180deg,#091613,#0d1f1b)"}}>
        <Container>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:isMobile?12:20}}>
            {[{val:2400,suffix:"+",label:"Systems Designed",col:"#00d4ff"},{val:35,suffix:"%",label:"Average Energy Saving",col:"#00e5a0"},{val:48,suffix:"hr",label:"Fastest Installation",col:"#ff6b35"},{val:12,suffix:" yr",label:"Engineering Experience",col:"#ffb800"}].map(s=>(
              <StatCard key={s.label} {...s}/>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── HVAC TOOL ── */}
      <Section id="tool" style={{background:"#0d1f1b"}}>
        <Container>
          <div style={{textAlign:"center",marginBottom:isMobile?32:48}}>
            <SectionLabel>FREE ANALYSIS TOOL</SectionLabel>
            <h2 className="section-title">Know Before You Buy</h2>
            <p className="section-sub" style={{margin:"0 auto"}}>Enter your room details and get instant cooling requirements, AC recommendation, and monthly cost estimate.</p>
          </div>
          <div style={{background:"#0f2420",border:"1px solid #286256",borderRadius:20,padding:isMobile?"20px 16px":"40px 44px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,width:80,height:80,background:"radial-gradient(circle at 0 0,rgba(0,212,255,0.12),transparent)"}}/>
            <div style={{position:"absolute",bottom:0,right:0,width:120,height:120,background:"radial-gradient(circle at 100% 100%,rgba(0,229,160,0.08),transparent)"}}/>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#00e5a0"}}/>
                <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"#00d4ff",letterSpacing:"0.12em"}}>HVAC QUICK CALCULATOR</div>
              </div>
              <QuickTool/>
            </div>
          </div>
          <div id="full-tool" style={{marginTop:24,textAlign:"center"}}>
            <div style={{fontSize:12,color:"#9ab8d8",marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>Need full analysis with airflow simulation, placement comparison & PDF report?</div>
            <button onClick={()=>setView("tool")} style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,107,53,0.1)",border:"1px solid rgba(255,107,53,0.25)",color:"#ff6b35",borderRadius:11,padding:"13px 24px",fontSize:14,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:"pointer"}}>
              📄 Open Full HVAC Platform →
            </button>
          </div>
        </Container>
      </Section>

      {/* ── SERVICES ── */}
      <Section id="services" style={{background:"#091613"}}>
        <Container>
          <div style={{marginBottom:isMobile?36:56}}>
            <SectionLabel>OUR SERVICES</SectionLabel>
            <h2 className="section-title">Four Modules.<br/>One Connected System.</h2>
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

      {/* ── HVAC COMPONENTS ── */}
      <Section id="components" style={{background:"#0d1f1b"}}>
        <Container>
          <div style={{textAlign:"center",marginBottom:isMobile?36:56}}>
            <SectionLabel>HVAC COMPONENTS</SectionLabel>
            <h2 className="section-title">The Building Blocks<br/>of Every System</h2>
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

      {/* ── PROJECTS ── */}
      <Section id="projects" style={{background:"#091613"}}>
        <Container>
          <div style={{display:"flex",flexDirection:isMobile?"column":"row",justifyContent:"space-between",alignItems:isMobile?"flex-start":"flex-end",marginBottom:isMobile?32:48,gap:16}}>
            <div>
              <SectionLabel>COMPLETED PIPELINES</SectionLabel>
              <h2 className="section-title">Projects That<br/>Performed.</h2>
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

      {/* ── ABOUT ── */}
      <About/>

      {/* ── WHY CENTRAL AC ── */}
      <Section style={{background:"#091613"}}>
        <Container>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:60,alignItems:"center"}}>
            <div>
              <SectionLabel>OUR RECOMMENDATION</SectionLabel>
              <h2 className="section-title">Central AC is<br/>Almost Always<br/><span style={{color:"#00e5a0"}}>Better.</span></h2>
              <p className="section-sub" style={{marginBottom:28}}>Most homes run 3–4 separate split ACs, each with its own compressor. Central AC replaces all of them with one efficient unit.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
                {[["COP 3.8 vs 2.8","35% more cooling per rupee"],["One compressor","No redundant motors"],["Uniform airflow","No warm corners"],["Silent rooms","Compressor stays outside"]].map(([title,sub])=>(
                  <div key={title} style={{background:"#0f2420",border:"1px solid #286256",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#00e5a0",marginBottom:4}}>{title}</div>
                    <div style={{fontSize:11,color:"#c0cfe0",lineHeight:1.5}}>{sub}</div>
                  </div>
                ))}
              </div>
              <a href="#tool" style={{display:"inline-flex",alignItems:"center",gap:10,background:"linear-gradient(135deg,#00e5a0,#00d4ff)",color:"#0f2420",borderRadius:11,padding:"14px 28px",fontSize:14,fontWeight:700,textDecoration:"none",fontFamily:"'Syne',sans-serif"}}>
                Calculate My Savings →
              </a>
            </div>
            <div>
              <div style={{background:"#0f2420",border:"1px solid #286256",borderRadius:20,padding:isMobile?20:32,marginBottom:16}}>
                <div style={{fontSize:11,color:"#9ab8d8",fontFamily:"'JetBrains Mono',monospace",marginBottom:16}}>MONTHLY BILL · 3-ROOM HOME</div>
                {[{label:"Split AC (3 units)",val:9800,pct:100,col:"#ff6b35"},{label:"Central AC (1 unit)",val:6200,pct:63,col:"#00e5a0"}].map(row=>(
                  <div key={row.label} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:12,color:"#9ab8d8"}}>{row.label}</span>
                      <span style={{fontSize:14,fontWeight:800,color:row.col,fontFamily:"'JetBrains Mono',monospace"}}>₹{row.val.toLocaleString()}</span>
                    </div>
                    <div style={{height:10,background:"#122b26",borderRadius:5,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${row.pct}%`,background:row.col,borderRadius:5}}/>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:20,background:"rgba(0,229,160,0.07)",border:"1px solid rgba(0,229,160,0.2)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:"#9ab8d8"}}>Monthly saving</span>
                  <span style={{fontSize:16,fontWeight:800,color:"#00e5a0",fontFamily:"'JetBrains Mono',monospace"}}>₹3,600</span>
                </div>
              </div>
              <div style={{fontSize:11,color:"#9ab8d8",textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>Based on ₹7/unit · COP 3.8 vs 2.8 · 8h/day</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── CTA ── */}
      <Section id="contact" style={{background:"#0d1f1b"}}>
        <Container>
          <div style={{background:"linear-gradient(135deg,#0f2420,#0a1628)",border:"1px solid #286256",borderRadius:24,padding:isMobile?"32px 20px":"60px 56px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:300,background:"radial-gradient(ellipse,rgba(0,212,255,0.05),transparent)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:1}}>
              <SectionLabel>START YOUR PROJECT</SectionLabel>
              <h2 style={{fontSize:isMobile?"clamp(22px,6vw,36px)":"clamp(28px,4vw,48px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:14}}>Ready to Build the<br/>Right Climate System?</h2>
              <p style={{fontSize:isMobile?13:16,color:"#c0cfe0",lineHeight:1.65,maxWidth:520,margin:"0 auto 32px"}}>Our engineers will visit your site, run a full HVAC analysis, and give you exact specifications and cost savings before you commit to anything.</p>
              <div style={{display:"flex",flexDirection:isMobile?"column":"row",gap:12,justifyContent:"center",marginBottom:28,alignItems:isMobile?"stretch":"center"}}>
                <a href="tel:+919911992271" style={{background:"linear-gradient(135deg,#00d4ff,#0055ee)",color:"#0f2420",borderRadius:12,padding:"15px 28px",fontSize:15,fontWeight:700,textDecoration:"none",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 6px 24px rgba(0,212,255,0.3)"}}>📞 Call Now</a>
                <a href="https://wa.me/9911992271" target="_blank" rel="noreferrer" style={{background:"linear-gradient(135deg,#00e5a0,#00b86e)",color:"#0f2420",borderRadius:12,padding:"15px 28px",fontSize:15,fontWeight:700,textDecoration:"none",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>💬 WhatsApp</a>
                <a href="#tool" style={{background:"rgba(255,107,53,0.1)",border:"1px solid rgba(255,107,53,0.3)",color:"#ff6b35",borderRadius:12,padding:"15px 24px",fontSize:15,fontWeight:700,textDecoration:"none",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>⚡ Free Analysis</a>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:isMobile?12:24,flexWrap:"wrap"}}>
                {["Free site visit","No obligation quote","Installation in 48h","5-year warranty"].map(f=>(
                  <div key={f} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#9ab8d8"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#00d4ff"}}/>{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── FLOATING SOCIAL ── */}
      <FloatingSocial/>

      <Footer/>
    </>
  );
}