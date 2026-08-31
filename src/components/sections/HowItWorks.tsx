'use client';
import "../../styles/page-header-offset.css";
import useIsMobile from "../../hooks/useIsMobile";
import { Container, Section, Badge as SectionLabel } from "../../design-system/primitives";

interface PipeStepProps { icon: string; title: string; desc: string; index: number; isLast?: boolean; }
function PipeStep({icon,title,desc,index}: PipeStepProps) {
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

export default function HowItWorks() {
  const isMobile = useIsMobile();
  return (
    <Section id="how-it-works" className="cw-below-navbar" style={{background:"#091613"}}>
      <Container>
        <div style={{textAlign:"center",marginBottom:isMobile?40:64}}>
          <SectionLabel>THE SYSTEM</SectionLabel>
          <h1 className="section-title">Input → Process<br/>→ Output → Install</h1>
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
  );
}
