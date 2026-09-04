import type { CSSProperties, RefObject } from "react";
import type { CalcResult } from "./types";
import { SCOP, CCOP } from "./calculator";

// ════════════════════════════════════════════════════════
//  PDF TEMPLATE COMPONENTS
// ════════════════════════════════════════════════════════

interface AirflowSVGProps { l: number; w: number; placement: string; }
// Pure-SVG airflow map — renders cleanly in html2canvas
function AirflowSVG({l,w,placement}: AirflowSVGProps){
  const wm: Record<string,string> = {"Top Wall":"T","Bottom Wall":"B","Left Wall":"L","Right Wall":"R"};
  const wall=wm[placement]||"T";
  const W=240,H=155,pad=22;
  const rw=W-pad*2,rh=H-pad*2;
  let ax:number,ay:number,dirX:number,dirY:number;
  if(wall==="T"){ax=pad+rw/2;ay=pad;dirX=0;dirY=1;}
  else if(wall==="B"){ax=pad+rw/2;ay=pad+rh;dirX=0;dirY=-1;}
  else if(wall==="L"){ax=pad;ay=pad+rh/2;dirX=1;dirY=0;}
  else{ax=pad+rw;ay=pad+rh/2;dirX=-1;dirY=0;}
  const res=22,cw=rw/res,ch=rh/res;
  const spread=Math.max(rw,rh)*1.15;
  const cells: {x:number;y:number;w:number;h:number;op:string;g:number;b:number}[] = [];
  for(let ix=0;ix<res;ix++) for(let iy=0;iy<res;iy++){
    const cx=pad+ix*cw+cw/2,cy=pad+iy*ch+ch/2;
    const ddx=cx-ax,ddy=cy-ay,dist=Math.sqrt(ddx*ddx+ddy*ddy);
    const norm=dist+0.001;
    const align=Math.max(0,(ddx/norm)*dirX+(ddy/norm)*dirY);
    const intensity=Math.min(1,align*Math.exp(-dist/(spread*0.55))*2.2);
    if(intensity>0.04){
      const g=Math.round(30+intensity*120),b=Math.round(60+intensity*180);
      cells.push({x:pad+ix*cw,y:pad+iy*ch,w:cw+0.5,h:ch+0.5,
        op:(0.18+intensity*0.68).toFixed(2),g,b});
    }
  }
  return(
    <svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      <rect width={W} height={H} fill="#0d1520" rx="5"/>
      {cells.map((c,i)=>(
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h}
          fill={`rgb(10,${c.g},${c.b})`} opacity={c.op}/>
      ))}
      <rect x={pad} y={pad} width={rw} height={rh}
        fill="none" stroke="#00d4ff" strokeWidth="1.5" rx="2" opacity="0.8"/>
      <circle cx={ax} cy={ay} r="7" fill="#00d4ff"/>
      <text x={ax} y={ay-12} textAnchor="middle" fontSize="8"
        fill="#ffffff" fontFamily="monospace" fontWeight="bold">AC</text>
      <text x={pad+rw/2} y={H-5} textAnchor="middle" fontSize="9"
        fill="#c0cfe0" fontFamily="monospace">{l}×{w} ft · {placement}</text>
    </svg>
  );
}

function PdfScoreBar({score,max=3}: {score:number; max?:number}){
  const pct=Math.round((score/max)*100);
  const col=score>=2.5?"#00e5a0":score>=2?"#00d4ff":score>=1?"#ffb800":"#ff6b35";
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:5,background:"#1a2a40",borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3}}/>
      </div>
      <span style={{fontSize:10,color:col,fontFamily:"monospace",fontWeight:700,width:28,flexShrink:0}}>{score}/{max}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  PDF REPORT TEMPLATE  (off-screen, captured by html2canvas)
// ════════════════════════════════════════════════════════
interface ReportTemplateProps {
  result: CalcResult;
  ai: string | null;
  lang: string;
  pdfRef: RefObject<HTMLDivElement | null>;
}
export function ReportTemplate({result,ai,lang,pdfRef}: ReportTemplateProps){
  const{btu,ac,time,cost,best,c1,c2,f}=result;
  const area=f.l*f.w;
  const vCol=(v: string)=>(({optimal:"#00e5a0",good:"#00d4ff",moderate:"#ffb800",poor:"#ff6b35"} as Record<string,string>)[v]||"#ffb800");
  const vLbl=(v: string)=>(({optimal:"Optimal",good:"Good",moderate:"Moderate",poor:"Poor"} as Record<string,string>)[v]||v);
  const dateStr=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
  const refId="TAN-"+Math.random().toString(36).slice(2,8).toUpperCase();

  const gridBg: CSSProperties = {
    position:"absolute",inset:0,pointerEvents:"none",
    backgroundImage:"linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)",
    backgroundSize:"40px 40px",
  };
  const secTitle=(_color="#00d4ff"): CSSProperties=>({
    fontSize:9,color:"#9ab8d8",letterSpacing:"0.14em",fontFamily:"monospace",
    marginBottom:14,display:"flex",alignItems:"center",gap:8,
  });
  const accentLine=(color="#00d4ff"): CSSProperties=>({
    width:16,height:2,background:color,flexShrink:0,
  });

  return(
    <div ref={pdfRef} style={{
      width:794,background:"#080e1a",fontFamily:"'Syne',sans-serif",
      color:"#dce8f8",position:"absolute",left:-9999,top:0,
    }}>

      {/* ══ PAGE 1 ══ */}
      <div style={{width:794,minHeight:1122,padding:"46px 50px",background:"#080e1a",position:"relative",overflow:"hidden"}}>
        <div style={gridBg}/>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#00d4ff,#0055ee)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#080e1a"}}>T</div>
            <div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.22em",color:"#00d4ff",textTransform:"uppercase"}}>CLIMEWAVE ENGINEERS</div>
              <div style={{fontSize:9,color:"#9ab8d8",letterSpacing:"0.12em",fontFamily:"monospace"}}>COOLING * HEATING * VENTILATION * SOLUTIONS</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:"#9ab8d8",fontFamily:"monospace",marginBottom:2}}>COOLING ANALYSIS REPORT</div>
            <div style={{fontSize:10,color:"#c0cfe0",fontFamily:"monospace"}}>{dateStr}</div>
            <div style={{fontSize:10,color:"#c0cfe0",fontFamily:"monospace",marginTop:1}}>REF: {refId}</div>
          </div>
        </div>

        {/* Accent bar */}
        <div style={{height:2,background:"linear-gradient(90deg,#00d4ff,#0055ee,transparent)",borderRadius:1,marginBottom:28}}/>

        {/* Title */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:9,color:"#00d4ff",letterSpacing:"0.18em",fontFamily:"monospace",marginBottom:6}}>◆ PERSONALISED COOLING REPORT</div>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1.1,marginBottom:8}}>
            {f.rt} · {f.l}×{f.w} ft
          </div>
          <div style={{fontSize:12,color:"#9ab8d8",lineHeight:1.6,maxWidth:560}}>
            {lang==="hi"
              ?`यह रिपोर्ट आपके ${f.rt} (${f.l}×${f.w} फ़ीट) के लिए तैयार की गई है।`
              :`Generated specifically for your ${f.l}×${f.w} ft ${f.rt.toLowerCase()}. All figures are calculated from your actual room inputs.`}
          </div>
        </div>

        {/* 4 metric cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:11,marginBottom:24}}>
          {[
            {label:"Cooling Load",  value:btu.toLocaleString(), unit:"BTU/hr",     color:"#00d4ff"},
            {label:"Recommended AC",value:ac,                   unit:f.rt,         color:"#ff6b35"},
            {label:"Cooling Time",  value:`${time} min`,        unit:"35°C → 24°C",color:"#00e5a0"},
            {label:"Monthly Bill",  value:`₹${cost.toLocaleString()}`,unit:"8h/day",color:"#ffb800"},
          ].map(m=>(
            <div key={m.label} style={{background:"#0e1828",border:"1px solid #1a2a40",borderRadius:10,padding:"13px 15px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:m.color}}/>
              <div style={{fontSize:8,color:"#9ab8d8",letterSpacing:"0.1em",fontFamily:"monospace",marginBottom:5}}>{m.label.toUpperCase()}</div>
              <div style={{fontSize:17,fontWeight:800,color:m.color,fontFamily:"monospace",marginBottom:2}}>{m.value}</div>
              <div style={{fontSize:10,color:"#c0cfe0"}}>{m.unit}</div>
            </div>
          ))}
        </div>

        {/* Room profile */}
        <div style={{background:"#0e1828",border:"1px solid #1a2a40",borderRadius:11,padding:"18px 22px",marginBottom:20}}>
          <div style={{...secTitle(),marginBottom:12}}><div style={accentLine()}/> ROOM PROFILE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {[
              ["Dimensions",`${f.l} × ${f.w} × ${f.h} ft`],
              ["Floor Area",`${area} sq ft`],
              ["Room Type",f.rt],
              ["Occupants",`${f.p} person${f.p!==1?"s":""}`],
              ["Windows",`${f.win} window${f.win!==1?"s":""}`],
              ["Sunlight",f.sun],
              ["Furniture",f.furn],
              ["Door Position",f.door],
              ["Size Category",area<120?"Small":area<200?"Medium":area<300?"Large":"Very Large"],
            ].map(([k,v])=>(
              <div key={k}>
                <div style={{fontSize:8,color:"#9ab8d8",fontFamily:"monospace",marginBottom:2}}>{k.toUpperCase()}</div>
                <div style={{fontSize:12,color:"#dce8f8",fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        {ai&&(
          <div style={{background:"linear-gradient(135deg,rgba(0,212,255,0.05),rgba(0,85,238,0.05))",border:"1px solid rgba(0,212,255,0.2)",borderRadius:11,padding:"16px 20px",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#00d4ff",flexShrink:0}}/>
              <div style={{fontSize:9,fontWeight:700,color:"#00d4ff",letterSpacing:"0.14em",fontFamily:"monospace"}}>AI EXPERT INSIGHT</div>
            </div>
            <div style={{fontSize:12,color:"#9ab8d8",lineHeight:1.75}}>{ai}</div>
          </div>
        )}

        {/* Energy breakdown */}
        <div style={{background:"#0e1828",border:"1px solid #1a2a40",borderRadius:11,padding:"18px 22px",marginBottom:20}}>
          <div style={{...secTitle(),marginBottom:14}}><div style={accentLine()}/> ENERGY COST PROJECTION</div>
          {[
            {label:"Daily (8 hours)",cost:Math.round(cost/30)},
            {label:"Monthly",       cost:cost},
            {label:"Annual",        cost:cost*12},
          ].map(({label,cost:c})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:12,marginBottom:9}}>
              <div style={{width:110,fontSize:11,color:"#9ab8d8",flexShrink:0}}>{label}</div>
              <div style={{flex:1,height:5,background:"#131e2e",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${Math.min(100,(c/(cost*12))*100)}%`,height:"100%",background:"linear-gradient(90deg,#00d4ff,#ff6b35)",borderRadius:3}}/>
              </div>
              <div style={{width:68,textAlign:"right",fontSize:12,fontWeight:700,color:"#ffb800",fontFamily:"monospace",flexShrink:0}}>₹{c.toLocaleString()}</div>
            </div>
          ))}
          <div style={{marginTop:10,fontSize:9,color:"#9ab8d8",fontFamily:"monospace"}}>
            Based on ₹7/unit · {(btu/3412).toFixed(2)} kW load · BEE standard
          </div>
        </div>

        {/* Footer P1 */}
        <div style={{position:"absolute",bottom:26,left:50,right:50,display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #1a2a40",paddingTop:10}}>
          <div style={{fontSize:8,color:"#9ab8d8",fontFamily:"monospace"}}>CLIMEWAVE ENGINEERS · COOLING * HEATING * VENTILATION * SOLUTIONS · climewave.com</div>
          <div style={{fontSize:8,color:"#9ab8d8",fontFamily:"monospace"}}>PAGE 1 OF 2</div>
        </div>
      </div>

      {/* ══ PAGE 2 ══ */}
      <div style={{width:794,minHeight:1122,padding:"46px 50px",background:"#080e1a",position:"relative",overflow:"hidden"}}>
        <div style={gridBg}/>

        {/* P2 header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,position:"relative"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.22em",color:"#00d4ff",textTransform:"uppercase"}}>CLIMEWAVE ENGINEERS</div>
          <div style={{fontSize:9,color:"#9ab8d8",fontFamily:"monospace",letterSpacing:"0.1em"}}>PLACEMENT ANALYSIS · PAGE 2</div>
        </div>
        <div style={{height:2,background:"linear-gradient(90deg,#00d4ff,#0055ee,transparent)",borderRadius:1,marginBottom:28}}/>

        {/* Best placement */}
        <div style={{marginBottom:24}}>
          <div style={{...secTitle(),marginBottom:14}}><div style={accentLine("#00e5a0")}/> RECOMMENDED PLACEMENT</div>
          <div style={{display:"flex",alignItems:"flex-start",gap:22}}>
            <div style={{flexShrink:0}}>
              <AirflowSVG l={f.l} w={f.w} placement={best.name}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.22)",borderRadius:8,padding:"9px 14px",marginBottom:12}}>
                <span style={{fontSize:16}}>🏆</span>
                <div>
                  <div style={{fontSize:8,color:"#9ab8d8",fontFamily:"monospace"}}>BEST PLACEMENT</div>
                  <div style={{fontSize:15,fontWeight:800,color:"#00e5a0"}}>{best.name}</div>
                </div>
                <div style={{marginLeft:14}}>
                  <div style={{fontSize:8,color:"#9ab8d8",fontFamily:"monospace"}}>CONFIDENCE</div>
                  <div style={{fontSize:15,fontWeight:800,color:"#00e5a0"}}>{Math.round((best.score/3)*100)}%</div>
                </div>
              </div>
              <PdfScoreBar score={best.score}/>
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:5}}>
                {best.tips.map((tip,i)=>(
                  <div key={i} style={{display:"flex",gap:7,fontSize:11,color:"#9ab0cc",alignItems:"flex-start",lineHeight:1.5}}>
                    <span style={{color:"#9ab8d8",flexShrink:0}}>·</span>{tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Placement comparison */}
        <div style={{marginBottom:22}}>
          <div style={{...secTitle(),marginBottom:12}}><div style={accentLine()}/> PLACEMENT COMPARISON</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[{d:c1,name:f.p1},{d:c2,name:f.p2}].map(({d,name},i)=>{
              const isW=c1.score!==c2.score?(i===0?c1.score>c2.score:c2.score>c1.score):false;
              const col=vCol(d.verdict);
              return(
                <div key={i} style={{background:isW?"rgba(0,229,160,0.04)":"rgba(255,107,53,0.03)",border:`1px solid ${isW?"rgba(0,229,160,0.28)":"rgba(255,107,53,0.18)"}`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:12,fontWeight:700}}>{name}</div>
                    <div style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:100,background:`${col}22`,color:col,fontFamily:"monospace"}}>{vLbl(d.verdict)}</div>
                  </div>
                  <PdfScoreBar score={d.score}/>
                  <div style={{marginTop:10,marginBottom:10}}>
                    <AirflowSVG l={f.l} w={f.w} placement={name}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {d.tips.map((tip,j)=>(
                      <div key={j} style={{fontSize:10,color:"#c0cfe0",display:"flex",gap:5,alignItems:"flex-start",lineHeight:1.4}}>
                        <span style={{color:"#9ab8d8",flexShrink:0}}>·</span>{tip}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central vs Split nudge */}
        <div style={{background:"rgba(0,229,160,0.04)",border:"1px solid rgba(0,229,160,0.16)",borderRadius:11,padding:"16px 20px",marginBottom:20}}>
          <div style={{...secTitle(),marginBottom:10}}><div style={accentLine("#00e5a0")}/> UPGRADE OPPORTUNITY</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#00e5a0",marginBottom:5}}>Central AC for whole-home cooling</div>
              <div style={{fontSize:11,color:"#9ab8d8",lineHeight:1.6}}>
                If you have 2+ rooms, a central AC saves 25–35% on electricity vs separate split units — higher COP (3.8 vs 2.8) and one shared compressor.
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {[
                ["Split AC (this room)","₹"+Math.round((btu/3412/SCOP)*8*30*7).toLocaleString()+"/mo","#ff6b35"],
                ["Central AC (equiv)","₹"+Math.round((btu/3412/CCOP)*8*30*7*1.08).toLocaleString()+"/mo","#00e5a0"],
              ].map(([label,val,color])=>(
                <div key={label} style={{background:"#0e1828",borderRadius:7,padding:"9px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#9ab8d8"}}>{label}</span>
                  <span style={{fontSize:12,fontWeight:800,color,fontFamily:"monospace"}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Installation checklist */}
        <div style={{background:"#0e1828",border:"1px solid #1a2a40",borderRadius:11,padding:"16px 20px",marginBottom:20}}>
          <div style={{...secTitle(),marginBottom:12}}><div style={accentLine()}/> INSTALLATION CHECKLIST</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {[
              `Install on ${best.name} for best airflow coverage`,
              `Buy a ${ac} unit — avoid oversizing by more than 20%`,
              `Mount at 7–8 ft height, not flush against ceiling`,
              `Keep 30 cm clearance from ceiling and side walls`,
              `Direct airflow away from main door opening`,
              `Seal all gaps around wall/window penetrations`,
              `Service every 6 months to maintain rated COP`,
              `Set thermostat to 24°C — saves ~6% per extra degree`,
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:10,color:"#9ab0cc",lineHeight:1.5}}>
                <div style={{width:13,height:13,borderRadius:2,background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.18)",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#00d4ff"}}>✓</div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{background:"linear-gradient(135deg,rgba(0,229,160,0.06),rgba(0,212,255,0.04))",border:"1px solid rgba(0,229,160,0.18)",borderRadius:11,padding:"16px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,marginBottom:4}}>Get a free Central AC consultation</div>
              <div style={{fontSize:10,color:"#c0cfe0",lineHeight:1.6}}>CLIMEWAVE ENGINEERS designs and installs central HVAC for Indian homes. We assess your space and give exact cost savings before you spend a rupee.</div>
            </div>
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:800,color:"#00e5a0"}}>climewave.com</div>
              <div style={{fontSize:9,color:"#c0cfe0",marginTop:2}}>Free consultation · No obligation</div>
            </div>
          </div>
        </div>

        {/* Footer P2 */}
        <div style={{position:"absolute",bottom:26,left:50,right:50,display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #1a2a40",paddingTop:10}}>
          <div style={{fontSize:8,color:"#9ab8d8",fontFamily:"monospace"}}>Based on BEE & ASHRAE standards · Generated by CLIMEWAVE ENGINEERS HVAC AI</div>
          <div style={{fontSize:8,color:"#9ab8d8",fontFamily:"monospace"}}>PAGE 2 OF 2</div>
        </div>
      </div>
    </div>
  );
}
