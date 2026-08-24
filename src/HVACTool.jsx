import './HVACTool.css';
import { useState, useRef, useCallback, useEffect } from "react";
 
// ════════════════════════════════════════════════════════
//  HVAC ENGINE
// ════════════════════════════════════════════════════════
function calcBTU(l, w, h, p, win, sun, rt) {
  const sf = { Low:0.9, Medium:1.0, High:1.2 }[sun] || 1.0;
  const rf = { Bedroom:0.9,"Living Room":1.1,Office:1.2,Kitchen:1.3,Hall:1.0 }[rt] || 1.0;
  return Math.round(((l*w*20)+p*600+win*1000)*sf*rf);
}
function acLabel(btu) {
  const t=btu/12000;
  if(t<=1) return "1 Ton"; if(t<=1.5) return "1.5 Ton";
  if(t<=2) return "2 Ton"; return "2+ Ton / Central";
}
function coolTime(btu,area){ return Math.round((area*25)/(btu/60)); }
function monthlyCost(btu,hrs=8){ return Math.round((btu/3412)*hrs*30*7); }
function evalPlacement(l,w,pl,door,furn){
  const wm={"Top Wall":"T","Bottom Wall":"B","Left Wall":"L","Right Wall":"R"};
  const p=wm[pl]||pl, d=wm[door]||door;
  let score=0; const tips=[];
  const horiz=l>=w;
  if((horiz&&(p==="T"||p==="B"))||(!horiz&&(p==="L"||p==="R"))){
    score+=2; tips.push("Airflow covers the longer dimension");
  } else tips.push("Airflow may not reach all corners");
  if(p==="T"||p==="B"){ score+=1; tips.push("Central distribution — more even cooling"); }
  else tips.push("Side placement — corners may feel warmer");
  if(d&&p===d){ score-=1; tips.push("Near door: some cool air escapes"); }
  const fd={Low:0,Medium:-0.2,High:-0.5}[furn]||0;
  score+=fd;
  if(fd<0) tips.push(furn==="High"?"Heavy furniture blocks airflow":"Some furniture reduces coverage");
  score=Math.max(0,Math.min(score,3));
  const verdict=score>=2.5?"optimal":score>=2?"good":score>=1?"moderate":"poor";
  return {score:Math.round(score*100)/100,verdict,tips};
}
function bestPlacement(l,w){
  let best={score:-1};
  for(const p of ["Top Wall","Bottom Wall","Left Wall","Right Wall"]){
    const r=evalPlacement(l,w,p,null,"Low");
    if(r.score>best.score) best={...r,name:p};
  }
  return best;
}
function roomSizeLabel(area){
  if(area<120) return "small room"; if(area<200) return "medium room";
  if(area<300) return "large room"; return "very large space";
}
function comfortNote(btu,area){
  const ideal=area*20;
  if(btu>ideal*1.3) return "Well-sized for fast cooling";
  if(btu>ideal*0.9) return "Perfectly matched to your room";
  return "May struggle on very hot days";
}
 
// Central vs Split
const CCOP=3.8,SCOP=2.8;
function cvsCalc(rooms,hrs){
  const totalBTU=rooms*18000;
  const splitCost=Math.round((rooms*(18000/3412/SCOP))*hrs*30*7);
  const centralCost=Math.round(((totalBTU/3412/CCOP)*hrs*30*7)*1.08);
  const saving=splitCost-centralCost;
  const splitInstall=rooms*42000, centralInstall=180000+rooms*8000;
  const breakEven=saving>0?Math.round((centralInstall-splitInstall)/saving):null;
  return{splitCost,centralCost,saving,annualSaving:saving*12,splitInstall,centralInstall,breakEven,
    splitCoverage:Math.max(60,100-(rooms-1)*8),centralCoverage:97,splitNoise:46,centralNoise:29};
}
 
// ════════════════════════════════════════════════════════
//  PDF LIB LOADER (jsPDF + html2canvas from CDN)
// ════════════════════════════════════════════════════════
function useLibs(){
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const load=(src)=>new Promise((res,rej)=>{
      if(document.querySelector(`script[src="${src}"]`)){res();return;}
      const s=document.createElement("script");
      s.src=src; s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
    Promise.all([
      load("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
      load("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
    ]).then(()=>setReady(true)).catch(console.error);
  },[]);
  return ready;
}
 
// ════════════════════════════════════════════════════════
//  PDF TEMPLATE COMPONENTS
// ════════════════════════════════════════════════════════
 
// Pure-SVG airflow map — renders cleanly in html2canvas
function AirflowSVG({l,w,placement}){
  const wm={"Top Wall":"T","Bottom Wall":"B","Left Wall":"L","Right Wall":"R"};
  const wall=wm[placement]||"T";
  const W=240,H=155,pad=22;
  const rw=W-pad*2,rh=H-pad*2;
  let ax,ay,dirX,dirY;
  if(wall==="T"){ax=pad+rw/2;ay=pad;dirX=0;dirY=1;}
  else if(wall==="B"){ax=pad+rw/2;ay=pad+rh;dirX=0;dirY=-1;}
  else if(wall==="L"){ax=pad;ay=pad+rh/2;dirX=1;dirY=0;}
  else{ax=pad+rw;ay=pad+rh/2;dirX=-1;dirY=0;}
  const res=22,cw=rw/res,ch=rh/res;
  const spread=Math.max(rw,rh)*1.15;
  const cells=[];
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
 
function PdfScoreBar({score,max=3}){
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
function ReportTemplate({result,ai,lang,pdfRef}){
  const{btu,ac,time,cost,best,c1,c2,f}=result;
  const area=f.l*f.w;
  const vCol=v=>({optimal:"#00e5a0",good:"#00d4ff",moderate:"#ffb800",poor:"#ff6b35"}[v]||"#ffb800");
  const vLbl=v=>({optimal:"Optimal",good:"Good",moderate:"Moderate",poor:"Poor"}[v]||v);
  const dateStr=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
  const refId="TAN-"+Math.random().toString(36).slice(2,8).toUpperCase();
 
  const gridBg={
    position:"absolute",inset:0,pointerEvents:"none",
    backgroundImage:"linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)",
    backgroundSize:"40px 40px",
  };
  const secTitle=(color="#00d4ff")=>({
    fontSize:9,color:"#9ab8d8",letterSpacing:"0.14em",fontFamily:"monospace",
    marginBottom:14,display:"flex",alignItems:"center",gap:8,
  });
  const accentLine=(color="#00d4ff")=>({
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
 
// ════════════════════════════════════════════════════════
//  PDF PREVIEW MODAL
// ════════════════════════════════════════════════════════
function PdfModal({result,onClose,onDownload,generating}){
  return(
    <div
      onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(8,14,26,0.93)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(8px)"}}
    >
      <div style={{background:"#0e1828",border:"1px solid #1a2a40",borderRadius:20,width:"100%",maxWidth:520,maxHeight:"88vh",overflow:"auto",padding:28}}>
 
        {/* Modal header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div>
            <div style={{fontSize:9,color:"#9ab8d8",fontFamily:"monospace",letterSpacing:"0.14em",marginBottom:5}}>◆ YOUR REPORT IS READY</div>
            <div style={{fontSize:19,fontWeight:800,letterSpacing:"-0.02em",marginBottom:3}}>
              {result.f.rt} · {result.f.l}×{result.f.w} ft
            </div>
            <div style={{fontSize:11,color:"#c0cfe0"}}>2-page PDF · Branded · Instant download</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #1a2a40",borderRadius:7,padding:"5px 10px",color:"#c0cfe0",cursor:"pointer",fontSize:13,fontFamily:"'Syne',sans-serif",flexShrink:0}}>✕</button>
        </div>
 
        {/* What's inside */}
        <div style={{background:"#131e2e",borderRadius:11,padding:"14px 16px",marginBottom:18}}>
          <div style={{fontSize:9,color:"#9ab8d8",fontFamily:"monospace",letterSpacing:"0.12em",marginBottom:11}}>WHAT'S INSIDE</div>
          {[
            ["📐","Room profile & BTU calculation","Exact cooling requirements with every variable factored in"],
            ["⚡","Energy cost projection","Daily · Monthly · Annual at your tariff rate"],
            ["🗺","Airflow simulation maps","Visual proof of which placement wins and why"],
            ["✅","Installation checklist","8-point guide for your installer"],
            ["🏗","Central vs Split comparison","Your specific savings if you upgrade systems"],
          ].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:11}}>
              <div style={{fontSize:17,flexShrink:0}}>{icon}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#dce8f8",marginBottom:2}}>{title}</div>
                <div style={{fontSize:11,color:"#c0cfe0",lineHeight:1.4}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
 
        {/* Numbers preview */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
          {[
            {label:"BTU Load",    val:result.btu.toLocaleString(),                          sub:"BTU/hr",       col:"#00d4ff"},
            {label:"Best AC",     val:result.ac,                                            sub:result.f.rt,    col:"#ff6b35"},
            {label:"Best Wall",   val:result.best.name.replace(" Wall",""),                 sub:`${Math.round((result.best.score/3)*100)}% confidence`,col:"#00e5a0"},
            {label:"Monthly Bill",val:`₹${result.cost.toLocaleString()}`,                  sub:"at 8h/day",    col:"#ffb800"},
          ].map(m=>(
            <div key={m.label} style={{background:"#0e1828",border:`1px solid ${m.col}33`,borderRadius:9,padding:"11px 13px"}}>
              <div style={{fontSize:8,color:"#9ab8d8",fontFamily:"monospace",marginBottom:3}}>{m.label.toUpperCase()}</div>
              <div style={{fontSize:15,fontWeight:800,color:m.col,fontFamily:"monospace",marginBottom:1}}>{m.val}</div>
              <div style={{fontSize:9,color:"#9ab8d8"}}>{m.sub}</div>
            </div>
          ))}
        </div>
 
        {/* Download CTA */}
        <button
          onClick={onDownload}
          disabled={generating}
          style={{
            width:"100%",background:generating?"#1a2a40":"linear-gradient(135deg,#ff6b35,#ffb800)",
            color:generating?"#c0cfe0":"#080e1a",border:"none",borderRadius:11,padding:"15px",
            fontSize:15,fontWeight:800,cursor:generating?"not-allowed":"pointer",
            fontFamily:"'Syne',sans-serif",letterSpacing:"0.04em",transition:"all 0.2s",
            boxShadow:generating?"none":"0 4px 22px rgba(255,107,53,0.3)",
          }}
        >
          {generating?"⏳  Building your PDF…":"⬇  Download Free Report"}
        </button>
        <div style={{marginTop:9,fontSize:9,color:"#9ab8d8",textAlign:"center",fontFamily:"monospace"}}>
          No email · No signup · Instant download · BEE & ASHRAE standards
        </div>
      </div>
    </div>
  );
}
 
// ════════════════════════════════════════════════════════
//  PDF BUTTON  (drop-in, used in results section)
// ════════════════════════════════════════════════════════
function PDFButton({result,ai,lang}){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const pdfRef=useRef(null);
  const libsReady=useLibs();
 
  const generate=async()=>{
    if(!libsReady||!pdfRef.current){
      alert("PDF libraries still loading — please wait a moment and try again.");
      return;
    }
    setBusy(true);
    try{
      // Wait one frame so React has fully painted the hidden template
      await new Promise(r=>setTimeout(r,120));
 
      const canvas=await window.html2canvas(pdfRef.current,{
        scale:2, useCORS:true, allowTaint:true,
        backgroundColor:"#080e1a", logging:false,
        windowWidth:794, windowHeight:pdfRef.current.scrollHeight,
      });
 
      const{jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
      const pdfW=pdf.internal.pageSize.getWidth();
      const pdfH=pdf.internal.pageSize.getHeight();
 
      // Each page is 1122px at 1x scale (A4 height when width=794px)
      const pageHeightPx=1122*2; // scale=2
 
      for(let pg=0;pg<2;pg++){
        if(pg>0) pdf.addPage();
        const srcY=pg*pageHeightPx;
        const srcH=Math.min(pageHeightPx, canvas.height-srcY);
        const pgCanvas=document.createElement("canvas");
        pgCanvas.width=canvas.width; pgCanvas.height=pageHeightPx;
        const ctx=pgCanvas.getContext("2d");
        ctx.fillStyle="#080e1a"; ctx.fillRect(0,0,pgCanvas.width,pgCanvas.height);
        ctx.drawImage(canvas,0,srcY,canvas.width,srcH,0,0,canvas.width,srcH);
        const imgData=pgCanvas.toDataURL("image/jpeg",0.93);
        pdf.addImage(imgData,"JPEG",0,0,pdfW,pdfH);
      }
 
      pdf.save(`TAN_HVAC_${result.f.rt.replace(/\s+/g,"_")}_${result.f.l}x${result.f.w}ft.pdf`);
      setOpen(false);
    }catch(e){
      console.error("PDF error:",e);
      alert("PDF generation failed. Please try again.");
    }
    setBusy(false);
  };
 
  return(
    <>
      {/* Off-screen report template — always mounted once libs load */}
      {libsReady&&(
        <ReportTemplate result={result} ai={ai} lang={lang} pdfRef={pdfRef}/>
      )}
 
      {/* Trigger button */}
      <button
        onClick={()=>setOpen(true)}
        style={{
          display:"flex",alignItems:"center",gap:10,
          background:"linear-gradient(135deg,rgba(255,107,53,0.1),rgba(255,184,0,0.07))",
          border:"1px solid rgba(255,107,53,0.28)",color:"#ff6b35",
          borderRadius:11,padding:"12px 20px",fontSize:14,fontWeight:700,
          cursor:"pointer",fontFamily:"'Syne',sans-serif",transition:"all 0.2s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,107,53,0.17)";e.currentTarget.style.transform="translateY(-1px)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(255,107,53,0.1),rgba(255,184,0,0.07))";e.currentTarget.style.transform="translateY(0)";}}
      >
        <span style={{fontSize:17}}>📄</span>
        <div style={{textAlign:"left"}}>
          <div>Download Report</div>
          <div style={{fontSize:9,color:"#ffb800",fontWeight:600,letterSpacing:"0.06em"}}>2-PAGE PDF · FREE</div>
        </div>
      </button>
 
      {open&&(
        <PdfModal
          result={result}
          onClose={()=>!busy&&setOpen(false)}
          onDownload={generate}
          generating={busy}
        />
      )}
    </>
  );
}
 
// ════════════════════════════════════════════════════════
//  ROOM CANVAS  (live animated airflow)
// ════════════════════════════════════════════════════════
function RoomCanvas({l,w,placement,animated,showComfort}){
  const ref=useRef(null),fr=useRef(0),tm=useRef(null);
  const draw=useCallback((step=14)=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d");
    const W=c.width,H=c.height,pad=36,rw=W-pad*2,rh=H-pad*2;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#0d1520";ctx.fillRect(0,0,W,H);
    const wm={"Top Wall":"T","Bottom Wall":"B","Left Wall":"L","Right Wall":"R"};
    const wall=wm[placement]||"T";
    let ax,ay,dx,dy;
    if(wall==="T"){ax=pad+rw/2;ay=pad;dx=0;dy=1;}
    else if(wall==="B"){ax=pad+rw/2;ay=pad+rh;dx=0;dy=-1;}
    else if(wall==="L"){ax=pad;ay=pad+rh/2;dx=1;dy=0;}
    else{ax=pad+rw;ay=pad+rh/2;dx=-1;dy=0;}
    const spread=(step/14)*Math.max(rw,rh)*1.3;
    const res=42,cw=rw/res,ch=rh/res;
    for(let ix=0;ix<res;ix++) for(let iy=0;iy<res;iy++){
      const cx=pad+ix*cw+cw/2,cy=pad+iy*ch+ch/2;
      const ddx=cx-ax,ddy=cy-ay,dist=Math.sqrt(ddx*ddx+ddy*ddy);
      const norm=dist+0.001;
      const align=Math.max(0,(ddx/norm)*dx+(ddy/norm)*dy);
      const intensity=Math.min(1,align*Math.exp(-dist/(spread*0.6))*2.5);
      if(showComfort){
        if(intensity>0.6) ctx.fillStyle=`rgba(0,200,120,${0.15+intensity*0.4})`;
        else if(intensity>0.2) ctx.fillStyle=`rgba(80,160,220,${0.1+intensity*0.5})`;
        else ctx.fillStyle=`rgba(220,80,60,${0.12+0.2*(1-intensity*5)})`;
      } else {
        ctx.fillStyle=`rgba(10,${Math.round(20+intensity*90)},${Math.round(50+intensity*185)},${0.25+intensity*0.6})`;
      }
      ctx.fillRect(pad+ix*cw,pad+iy*ch,cw+1,ch+1);
    }
    ctx.strokeStyle="#00d4ff88";ctx.lineWidth=1.5;ctx.strokeRect(pad,pad,rw,rh);
    if(showComfort&&step>=14){
      [{c:"rgba(0,200,120,0.7)",l:"Comfortable (21–24°C)"},{c:"rgba(80,160,220,0.7)",l:"Cool (18–21°C)"},{c:"rgba(220,80,60,0.7)",l:"Warm (25°C+)"}].forEach(({c,l:label},i)=>{
        ctx.fillStyle=c;ctx.fillRect(pad+4,pad+4+i*18,12,10);
        ctx.fillStyle="#9ab";ctx.font="9px monospace";ctx.fillText(label,pad+20,pad+13+i*18);
      });
    }
    ctx.fillStyle="#00d4ff";ctx.shadowBlur=14;ctx.shadowColor="#00d4ff";
    ctx.beginPath();ctx.arc(ax,ay,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle="rgba(255,255,255,0.5)";ctx.lineWidth=1.5;
    for(let i=1;i<=3;i++){
      const prog=step/14;
      const ex=ax+dx*(rw/5.5)*i*prog,ey=ay+dy*(rh/5.5)*i*prog;
      if(ex>=pad&&ex<=pad+rw&&ey>=pad&&ey<=pad+rh){
        ctx.beginPath();ctx.moveTo(ax+dx*(rw/5.5)*(i-0.6)*prog,ay+dy*(rh/5.5)*(i-0.6)*prog);
        ctx.lineTo(ex,ey);ctx.stroke();
      }
    }
    ctx.fillStyle="#6b7fa3";ctx.font="10px monospace";ctx.textAlign="center";
    ctx.fillText(`${l}×${w} ft`,pad+rw/2,H-5);ctx.textAlign="left";
  },[l,w,placement,showComfort]);
  useEffect(()=>{
    if(!animated){draw(14);return;}
    fr.current=0;
    const tick=()=>{fr.current=(fr.current+1)%15;draw(fr.current+1);tm.current=setTimeout(tick,75);};
    tick();return()=>clearTimeout(tm.current);
  },[animated,draw]);
  return<canvas ref={ref} width={270} height={190} style={{borderRadius:10,width:"100%",maxWidth:270}}/>;
}
 
// ════════════════════════════════════════════════════════
//  MULTI-ROOM CANVAS  (CVS tab)
// ════════════════════════════════════════════════════════
function MultiCanvas({rooms,type,animated}){
  const ref=useRef(null),fr=useRef(0),tm=useRef(null);
  const draw=useCallback((step=20)=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d");
    const W=c.width,H=c.height;
    ctx.clearRect(0,0,W,H);ctx.fillStyle="#0d1520";ctx.fillRect(0,0,W,H);
    const cols=Math.min(rooms,3),rows=Math.ceil(rooms/cols);
    const pad=10,gap=7;
    const cw=(W-pad*2-gap*(cols-1))/cols,ch=(H-pad*2-gap*(rows-1)-22)/rows;
    const prog=step/20;
    for(let i=0;i<rooms;i++){
      const col=i%cols,row=Math.floor(i/cols);
      const x0=pad+col*(cw+gap),y0=pad+row*(ch+gap);
      const res=18,dw=cw/res,dh=ch/res;
      if(type==="split"){
        const acX=x0+cw/2,acY=y0+5;
        const sp=prog*Math.max(cw,ch)*0.85;
        for(let ix=0;ix<res;ix++) for(let iy=0;iy<res;iy++){
          const cx=x0+ix*dw+dw/2,cy=y0+iy*dh+dh/2;
          const ddx=cx-acX,ddy=cy-acY,dist=Math.sqrt(ddx*ddx+ddy*ddy);
          const align=Math.max(0,ddy/(dist+0.001));
          const intensity=Math.min(1,align*Math.exp(-dist/(sp*0.5))*2);
          ctx.fillStyle=`rgba(20,${Math.round(50+intensity*110)},${Math.round(100+intensity*130)},${0.2+intensity*0.65})`;
          ctx.fillRect(x0+ix*dw,y0+iy*dh,dw+1,dh+1);
        }
        if(prog>0.65){
          ctx.fillStyle="rgba(255,90,40,0.42)";
          ctx.beginPath();ctx.arc(x0+7,y0+ch-7,5,0,Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.arc(x0+cw-7,y0+ch-7,5,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle="#00b4dc";ctx.fillRect(x0+cw/2-12,y0+2,24,6);
      } else {
        const vx=x0+cw/2,vy=y0+ch/2;
        const sp=prog*Math.max(cw,ch)*1.05;
        for(let ix=0;ix<res;ix++) for(let iy=0;iy<res;iy++){
          const cx=x0+ix*dw+dw/2,cy=y0+iy*dh+dh/2;
          const dist=Math.sqrt((cx-vx)**2+(cy-vy)**2);
          const intensity=Math.min(1,Math.exp(-dist/(sp*0.48))*1.7);
          ctx.fillStyle=`rgba(0,${Math.round(100+intensity*155)},${Math.round(80+intensity*160)},${0.2+intensity*0.65})`;
          ctx.fillRect(x0+ix*dw,y0+iy*dh,dw+1,dh+1);
        }
        ctx.fillStyle="#00e5a0";ctx.shadowBlur=10;ctx.shadowColor="#00e5a0";
        ctx.beginPath();ctx.arc(vx,vy,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        if(prog>0.35){
          ctx.strokeStyle="rgba(0,229,160,0.4)";ctx.lineWidth=1;
          [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{
            const len=Math.min(cw,ch)*0.28*prog;
            ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(vx+Math.cos(a)*len,vy+Math.sin(a)*len);ctx.stroke();
          });
        }
      }
      ctx.strokeStyle=type==="split"?"rgba(0,190,230,0.4)":"rgba(0,229,160,0.5)";
      ctx.lineWidth=1.5;ctx.strokeRect(x0,y0,cw,ch);
      ctx.fillStyle="#c0cfe0";ctx.font=`bold ${Math.max(8,cw*0.11)}px monospace`;
      ctx.textAlign="center";ctx.fillText(`R${i+1}`,x0+cw/2,y0+ch-5);
    }
    ctx.textAlign="left";ctx.font="bold 10px monospace";
    ctx.fillStyle=type==="split"?"#00b4dc":"#00e5a0";
    ctx.fillText(type==="split"?"▲ SPLIT — hot corners visible":"● CENTRAL — uniform coverage",pad,H-4);
  },[rooms,type]);
  useEffect(()=>{
    if(!animated){draw(20);return;}
    fr.current=0;
    const tick=()=>{fr.current=(fr.current+1)%21;draw(fr.current);tm.current=setTimeout(tick,65);};
    tick();return()=>clearTimeout(tm.current);
  },[animated,draw]);
  return<canvas ref={ref} width={310} height={210} style={{borderRadius:12,width:"100%",maxWidth:310}}/>;
}
 
// ════════════════════════════════════════════════════════
//  AI INSIGHT
// ════════════════════════════════════════════════════════

async function saveSubmission(data) {
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
    await fetch(`${SUPABASE_URL}/rest/v1/hvac_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        room_length:    data.f.l,
        room_width:     data.f.w,
        room_height:    data.f.h,
        room_type:      data.f.rt,
        people:         data.f.p,
        windows:        data.f.win,
        sunlight:       data.f.sun,
        furniture:      data.f.furn,
        door_pos:       data.f.door,
        placement_1:    data.f.p1,
        placement_2:    data.f.p2,
        btu_result:     data.btu,
        ac_size:        data.ac,
        best_placement: data.best.name,
        monthly_cost:   data.cost,
        cooling_time:   data.time,
        language:       data.lang,
        user_name:      data.userInfo?.name,
        user_email:     data.userInfo?.email,
        user_phone:     data.userInfo?.phone,
        user_city:      data.userInfo?.city,
        source:         "hvac-tool",
      }),
    });
  } catch (err) {
    console.warn("Storage error:", err);
  }
}

async function getAI(data, lang) {
  try {
    const prompt = lang === "hi"
      ? `HVAC विशेषज्ञ के रूप में 3 वाक्यों में सलाह दें: कमरा ${data.l}×${data.w} फ़ीट, ${data.rt}, BTU: ${data.btu}, प्लेसमेंट: ${data.bp}, मासिक खर्च: ₹${data.cost}`
      : `As HVAC expert give 3 sentence practical advice: Room ${data.l}x${data.w}ft, ${data.rt}, BTU: ${data.btu}, Best placement: ${data.bp}, Monthly cost: Rs.${data.cost}`;

    const res = await fetch("/api/ai-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) return "Unable to load insight.";
    const json = await res.json();
    return json.text || "Unable to load insight.";
  } catch (err) {
    console.error("AI Error:", err);
    return "Unable to load insight.";
  }
}
 
// ════════════════════════════════════════════════════════
//  LANGUAGE STRINGS
// ════════════════════════════════════════════════════════
const T={
  en:{
    brand:"CLIMEWAVE ENGINEERS",
    steps:["Your Room","Environment","Placement","Results"],
    hints:["Tell us about your space","Who uses it & how sunny?","Where should the AC go?","Your personalised report"],
    length:"Room Length (ft)",width:"Room Width (ft)",height:"Ceiling Height (ft)",
    people:"People who sleep / work here",windows:"Number of windows",sun:"Sunlight",rt:"Room type",
    door:"Where is the door?",furn:"Furniture amount",p1:"Option A",p2:"Option B",
    calc:"Get My Results →",calcing:"Working out your room…",next:"Continue →",back:"← Back",
    rtOpts:["Bedroom","Living Room","Office","Kitchen","Hall"],
    sunOpts:["Low – north-facing / shaded","Medium – indirect light","High – direct afternoon sun"],
    wallOpts:["Top Wall","Bottom Wall","Left Wall","Right Wall"],
    furnOpts:["Light – mostly empty","Medium – typical furniture","Heavy – packed with furniture"],
    btuCard:"Your cooling need",acCard:"AC to buy",timeCard:"Time to cool down",costCard:"Monthly electricity",
    aiTitle:"What this means for you",placementTitle:"Placement analysis",bestTitle:"Best placement",
    confidence:"Confidence",simTitle:"How air flows in your room",comfortToggle:"Show comfort zones",
    energyTitle:"Your electricity cost",score:"Score",
    premTitle:"Coming next: Pro features",premSub:"AR scanning · Multi-room planner · Contractor network",
    premBtn:"Join waitlist →",
    premTeaser:["AR room scanning via phone","Multi-room whole-home planner","Contractor quotes & booking","Detailed temperature mapping"],
    cvsTag:"System comparison",cvsTitle:"Why Central AC beats Split",cvsSub:"See the real numbers for your home",
    cvsRooms:"Rooms in your home",cvsHours:"Hours of AC use per day",cvsBtn:"Run comparison →",
    splitLbl:"Split AC",centralLbl:"Central AC",
    saving:"Monthly saving",annSaving:"Annual saving",breakeven:"Break-even",months:"months",perMonth:"/month",
    splitBetterTitle:"When Split AC makes sense",
    splitBetterPoints:["Single room — ceiling ducts not possible","Very low usage (< 4 hours/day)","Renting — can't modify structure","Budget under ₹60,000 all-in"],
    centralWins:"Why Central wins for most homes",
    centralPoints:["One compressor powers all rooms — no redundant motors","35% more efficient (COP 3.8 vs 2.8) — less electricity per degree","Ceiling vents spread air evenly — no warm corners","Silent inside — compressor sits outdoors","One maintenance contract, not one per unit","Adds measurable resale value to your property"],
    splitLimits:"What Split AC can't do",
    splitPoints:["Each room multiplies your electricity bill independently","Wall-mounted units leave corners 3–5°C warmer than centre","Visible units and copper pipes compromise your interior design","40–50 dB indoor noise — audible enough to disrupt sleep"],
    cta:"Get a free Central AC consultation",ctaSub:"CLIMEWAVE ENGINEERS designs and installs central HVAC systems for Indian homes.",ctaBtn:"Book free consultation →",
    nudgeTitle:"Have more than one room?",nudgeSub:"Central AC could save you 25–35% vs separate split units.",nudgeBtn:"See how much →",
    trustBadge:"Based on BEE & ASHRAE standards · Used by 2,400+ homeowners",
  },
  hi:{
    brand:"CLIMEWAVE ENGINEERS",
    steps:["आपका कमरा","वातावरण","प्लेसमेंट","परिणाम"],
    hints:["अपने कमरे की जानकारी दें","कितने लोग, कितनी धूप?","AC कहाँ लगाएं?","आपकी व्यक्तिगत रिपोर्ट"],
    length:"लंबाई (फ़ीट)",width:"चौड़ाई (फ़ीट)",height:"छत की ऊंचाई (फ़ीट)",
    people:"यहाँ सोने/काम करने वाले लोग",windows:"खिड़कियों की संख्या",sun:"धूप",rt:"कमरे का प्रकार",
    door:"दरवाज़ा कहाँ है?",furn:"फर्नीचर कितना है",p1:"विकल्प A",p2:"विकल्प B",
    calc:"मेरे परिणाम देखें →",calcing:"आपका कमरा विश्लेषण हो रहा है…",next:"आगे →",back:"← वापस",
    rtOpts:["बेडरूम","लिविंग रूम","ऑफिस","किचन","हॉल"],
    sunOpts:["कम – उत्तर दिशा/छाया","मध्यम – अप्रत्यक्ष धूप","अधिक – सीधी दोपहर की धूप"],
    wallOpts:["ऊपरी दीवार","निचली दीवार","बाईं दीवार","दाईं दीवार"],
    furnOpts:["हल्का – ज़्यादातर खाली","मध्यम – सामान्य फर्नीचर","भारी – बहुत फर्नीचर"],
    btuCard:"आपकी कूलिंग ज़रूरत",acCard:"खरीदने वाला AC",timeCard:"ठंडा होने में समय",costCard:"मासिक बिजली खर्च",
    aiTitle:"आपके लिए इसका मतलब",placementTitle:"प्लेसमेंट विश्लेषण",bestTitle:"सर्वश्रेष्ठ प्लेसमेंट",
    confidence:"विश्वास स्तर",simTitle:"आपके कमरे में हवा का प्रवाह",comfortToggle:"कम्फर्ट ज़ोन दिखाएं",
    energyTitle:"आपका बिजली खर्च",score:"स्कोर",
    premTitle:"आगे आ रहा है: Pro फ़ीचर्स",premSub:"AR स्कैनिंग · Multi-room प्लानर · Contractor नेटवर्क",
    premBtn:"Waitlist में जुड़ें →",
    premTeaser:["फ़ोन से AR रूम स्कैनिंग","Multi-room होम प्लानर","Contractor कोट्स और बुकिंग","विस्तृत तापमान मानचित्र"],
    cvsTag:"सिस्टम तुलना",cvsTitle:"Central AC क्यों बेहतर है",cvsSub:"अपने घर के असली नंबर देखें",
    cvsRooms:"घर में कमरों की संख्या",cvsHours:"प्रतिदिन AC उपयोग के घंटे",cvsBtn:"तुलना करें →",
    splitLbl:"Split AC",centralLbl:"Central AC",
    saving:"मासिक बचत",annSaving:"वार्षिक बचत",breakeven:"Break-even",months:"महीने",perMonth:"/माह",
    splitBetterTitle:"Split AC कब सही है",
    splitBetterPoints:["सिर्फ एक कमरा — duct संभव नहीं","बहुत कम उपयोग (4 घंटे/दिन से कम)","किराए का घर — बदलाव संभव नहीं","₹60,000 से कम बजट"],
    centralWins:"Central क्यों जीतता है",
    centralPoints:["एक Compressor सभी कमरे ठंडा करता है","35% अधिक कुशल (COP 3.8 vs 2.8)","Ceiling Vents से हर कोने में समान ठंडक","Compressor बाहर — कमरे में बिल्कुल शांति","एक AMC, कई Units की झंझट नहीं","घर की कीमत बढ़ाता है"],
    splitLimits:"Split AC की सीमाएं",
    splitPoints:["हर कमरा अलग बिजली बिल बढ़ाता है","दीवार की Unit से कोनों में 3–5°C ज़्यादा गर्मी","दिखने वाली Unit और Pipe से interior खराब","40–50 dB शोर — नींद में खलल"],
    cta:"मुफ़्त Central AC परामर्श लें",ctaSub:"CLIMEWAVE ENGINEERS भारतीय घरों के लिए Central HVAC डिज़ाइन और install करती है।",ctaBtn:"मुफ़्त परामर्श बुक करें →",
    nudgeTitle:"एक से ज़्यादा कमरे हैं?",nudgeSub:"Central AC से 25–35% बिजली बचत संभव है।",nudgeBtn:"देखें कितना बचेगा →",
    trustBadge:"BEE और ASHRAE मानकों पर आधारित · 2,400+ घरों में उपयोग",
  },
};
 
// ════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════

 
// ════════════════════════════════════════════════════════
//  CVS SECTION
// ════════════════════════════════════════════════════════
function CVS({lang}){
  const t=T[lang];
  const [rooms,setRooms]=useState(3);
  const [hrs,setHrs]=useState(8);
  const [data,setData]=useState(null);
  const [anim,setAnim]=useState(false);
  const run=()=>{setData(cvsCalc(rooms,hrs));setAnim(true);setTimeout(()=>setAnim(false),3200);};
  useEffect(()=>{run();},[]);
  return(
    <div className="fade">
      <div className="cvs-hero">
        <div className="cvs-tag">◆ {t.cvsTag}</div>
        <h2 className="cvs-title"><span className="sw">Split</span> vs <span className="cw">Central AC</span></h2>
        <p className="cvs-sub">{t.cvsSub}</p>
      </div>
      <div className="card">
        <div className="ctit">CONFIGURE YOUR HOME</div>
        <div className="cinp">
          <div className="field">
            <label>{t.cvsRooms}</label>
            <select value={rooms} onChange={e=>setRooms(parseInt(e.target.value))} className="select-solid">
              {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {lang==="hi"?"कमरे":"Rooms"}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t.cvsHours}</label>
            <select value={hrs} onChange={e=>setHrs(parseInt(e.target.value))} className="select-solid">
              {[4,6,8,10,12,16].map(h=><option key={h} value={h}>{h}h</option>)}
            </select>
          </div>
          <button className="btn-p" style={{whiteSpace:"nowrap"}} onClick={run}>{t.cvsBtn}</button>
        </div>
        <div className="dcvs">
          <div className="cw-wrap sp">
            <div className="cwlbl splbl">▲ {t.splitLbl}</div>
            <MultiCanvas rooms={rooms} type="split" animated={anim}/>
            <div className="cwsub">{lang==="en"?`${rooms} compressors · Red = hot corners`:`${rooms} Compressor · लाल = गर्म कोने`}</div>
          </div>
          <div className="cw-wrap ce">
            <div className="cwlbl celbl">● {t.centralLbl}</div>
            <MultiCanvas rooms={rooms} type="central" animated={anim}/>
            <div className="cwsub">{lang==="en"?"1 unit · Uniform green coverage":"1 Unit · हर कमरे में समान हरी ठंडक"}</div>
          </div>
        </div>
      </div>
      {data&&(<>
        <div className="wbanner">
          <div style={{fontSize:22}}>⚡</div>
          <div>
            <div className="wbtxt">{lang==="en"?`Central AC saves ₹${data.saving.toLocaleString()}/month — ₹${data.annualSaving.toLocaleString()} per year`:`Central AC से ₹${data.saving.toLocaleString()}/माह — हर साल ₹${data.annualSaving.toLocaleString()}`}</div>
            <div className="wbsub">{lang==="en"?`${rooms} rooms · ${hrs}h/day · ₹7/unit`:`${rooms} कमरे · ${hrs}h/दिन · ₹7/यूनिट`}</div>
          </div>
        </div>
        <div className="scall">
          <div className="scrd gc"><div className="sclbl">{t.saving}</div><div className="scval">₹{data.saving.toLocaleString()}</div><div className="scsub">{t.perMonth}</div></div>
          <div className="scrd ac"><div className="sclbl">{t.annSaving}</div><div className="scval">₹{data.annualSaving.toLocaleString()}</div><div className="scsub">{lang==="en"?"/ year":"/ वर्ष"}</div></div>
          <div className="scrd bc"><div className="sclbl">{t.breakeven}</div><div className="scval">{data.breakEven&&data.breakEven>0?data.breakEven:"—"}</div><div className="scsub">{t.months}</div></div>
        </div>
        <div className="card">
          <div className="ctit">MONTHLY BILL COMPARISON</div>
          <div className="bbar"><div className="bhdr"><span style={{fontSize:12,color:"#ff6b35",fontWeight:700}}>{t.splitLbl}</span><span style={{fontSize:15,fontWeight:800,color:"#ff6b35",fontFamily:"'JetBrains Mono',monospace"}}>₹{data.splitCost.toLocaleString()}</span></div><div className="btrk"><div className="bfil sp" style={{width:"100%"}}/></div></div>
          <div className="bbar"><div className="bhdr"><span style={{fontSize:12,color:"#00e5a0",fontWeight:700}}>{t.centralLbl}</span><span style={{fontSize:15,fontWeight:800,color:"#00e5a0",fontFamily:"'JetBrains Mono',monospace"}}>₹{data.centralCost.toLocaleString()}</span></div><div className="btrk"><div className="bfil ce" style={{width:`${(data.centralCost/data.splitCost)*100}%`}}/></div></div>
          <table className="cvstbl" style={{marginTop:18}}>
            <thead><tr><th style={{color:"var(--text-dim)"}}>METRIC</th><th style={{color:"#00b4dc"}}>Split AC</th><th style={{color:"#00e5a0"}}>Central AC</th></tr></thead>
            <tbody>
              {[[lang==="en"?"Monthly bill":"मासिक बिल",`₹${data.splitCost.toLocaleString()}`,`₹${data.centralCost.toLocaleString()}`,"gd","✦ SAVE"],[lang==="en"?"Air coverage":"वायु कवरेज",`${data.splitCoverage}%`,`${data.centralCoverage}%`,"gd","✦ BETTER"],[lang==="en"?"Indoor noise":"अंदर शोर",`${data.splitNoise} dB`,`${data.centralNoise} dB`,"gd","✦ QUIETER"],[lang==="en"?"Efficiency":"दक्षता",`COP ${SCOP}`,`COP ${CCOP}`,"gd","✦ 35% MORE"],[lang==="en"?"Install cost":"स्थापना खर्च",`₹${data.splitInstall.toLocaleString()}`,`₹${data.centralInstall.toLocaleString()}`,"bd",""],[lang==="en"?"Annual cost":"वार्षिक खर्च",`₹${(data.splitCost*12).toLocaleString()}`,`₹${(data.centralCost*12).toLocaleString()}`,"gd",`✦ ₹${data.annualSaving.toLocaleString()} SAVED`]].map(([lbl,sv,cv,cls,wm],i)=>(
                <tr key={i}><td className="mn">{lbl}</td><td className="vs">{sv}</td><td><span className={`vc ${cls}`}>{cv}</span>{wm&&<span className="wm">{wm}</span>}</td></tr>
              ))}
            </tbody>
          </table>
          <div style={{fontSize:10,color:"var(--text-dim)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.7}}>⚡ Avg room 12×14ft · COP Central {CCOP} vs Split {SCOP} · ₹7/kWh · {hrs}h/day</div>
        </div>
        <div className="tc"><div className="tc-title">{t.splitBetterTitle}</div><div className="tc-items">{t.splitBetterPoints.map((p,i)=><div key={i} className="tc-item">{p}</div>)}</div></div>
        <div className="pcg">
          <div className="pcc cp"><div className="pchead"><span style={{fontSize:16}}>✦</span><div className="pctit">{t.centralWins}</div></div><div className="pclist">{t.centralPoints.map((p,i)=><div key={i} className="pcitem"><div className="pcdot" style={{background:"#00e5a0"}}/><div className="pctext">{p}</div></div>)}</div></div>
          <div className="pcc sc"><div className="pchead"><span style={{fontSize:16}}>⚠</span><div className="pctit">{t.splitLimits}</div></div><div className="pclist">{t.splitPoints.map((p,i)=><div key={i} className="pcitem"><div className="pcdot" style={{background:"#ff6b35"}}/><div className="pctext">{p}</div></div>)}</div></div>
        </div>
        <div className="cta-block">
          <div className="cta-title">{t.cta}</div>
          <div className="cta-sub">{t.ctaSub}</div>
          <button className="cta-btn" onClick={()=>alert("CLIMEWAVE ENGINEERS — free Central AC consultation!\n\nVisit: climewave.com")}>{t.ctaBtn}</button>
          <div className="trust" style={{justifyContent:"center",marginTop:14}}>{t.trustBadge}</div>
        </div>
      </>)}
    </div>
  );
}
 
// ════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════
export default function HVAC(){
  const [lang,setLang]=useState("en");
  const [tab,setTab]=useState("calc");
  const t=T[lang];
  const [step,setStep]=useState(-1);
  const [userInfo,setUserInfo]=useState({name:"",email:"",phone:"",city:""});
  const [uiErrors,setUiErrors]=useState({});
  const [busy,setBusy]=useState(false);
  const [res,setRes]=useState(null);
  const [ai,setAI]=useState(null);
  const [aiL,setAIL]=useState(false);
  const [showComfort,setShowComfort]=useState(false);
  const [f,setF]=useState({l:1,w:1,h:1,p:1,win:1,sun:"Medium",rt:"Bedroom",door:"Top Wall",furn:"Low",p1:"Top Wall",p2:"Left Wall"});
  const set=(k,v)=>setF(prev=>({...prev,[k]:v}));
  const setU=(k,v)=>setUserInfo(prev=>({...prev,[k]:v}));
  const validateUserInfo=()=>{
  const errs={};
  if(!userInfo.name.trim()) errs.name="Name is required";
  if(!userInfo.email.trim()||!/\S+@\S+\.\S+/.test(userInfo.email)) errs.email="Valid email required";
  if(!userInfo.phone.trim()||userInfo.phone.replace(/\D/g,"").length<10) errs.phone="Valid 10-digit number required";
  if(!userInfo.city.trim()) errs.city="City is required";
  setUiErrors(errs);
  return Object.keys(errs).length===0;
  };
  const liveBTU=calcBTU(f.l,f.w,f.h,f.p,f.win,f.sun,f.rt);
 
  const compute=async()=>{
    setBusy(true);
    await new Promise(r=>setTimeout(r,1000));
    const btu=calcBTU(f.l,f.w,f.h,f.p,f.win,f.sun,f.rt);
    const area=f.l*f.w;
    const cost=monthlyCost(btu);
    const c1=evalPlacement(f.l,f.w,f.p1,f.door,f.furn);
    const c2=evalPlacement(f.l,f.w,f.p2,f.door,f.furn);
    const best=bestPlacement(f.l,f.w);
    setRes({btu,ac:acLabel(btu),time:coolTime(btu,area),cost,c1,c2,best,area,f:{...f},userInfo:{...userInfo}});
    saveSubmission({f:{...f},btu,ac:acLabel(btu),best,cost,time:coolTime(btu,area),lang,userInfo});
    saveSubmission({ f:{...f}, btu, ac:acLabel(btu), best, cost, time:coolTime(btu,f.l*f.w), lang });
    setBusy(false);setStep(3);
    setAIL(true);
    try{const ins=await getAI({l:f.l,w:f.w,rt:f.rt,btu,bp:best.name,cost},lang);setAI(ins);}
    catch{setAI("Unable to load insight.");}
    setAIL(false);
  };
 
  const vk=v=>({optimal:"b-opt",good:"b-gd",moderate:"b-mod",poor:"b-poor"}[v]||"b-mod");
  const vl=v=>({optimal:"✦ Optimal",good:"✓ Good",moderate:"⚠ Moderate",poor:"✗ Poor"}[v]||v);
  const bc=v=>({optimal:"var(--color-accent-green)",good:"var(--color-accent-blue)",moderate:"var(--color-accent-amber)",poor:"var(--color-accent-orange)"}[v]||"var(--color-accent-amber)");
  const rtKeys=["Bedroom","Living Room","Office","Kitchen","Hall"];
  const wallKeys=["Top Wall","Bottom Wall","Left Wall","Right Wall"];
  const sunKeys=["Low","Medium","High"];
  const furnKeys=["Low","Medium","High"];
  return(
    <>
      
      <div className="R">
        <div className="noise"/><div className="grid-bg"/>
        <div className="orb" style={{width:600,height:600,top:-200,left:-200,background:"radial-gradient(circle,rgba(0,212,255,0.055) 0%,transparent 70%)"}}/>
        <div className="orb" style={{width:380,height:380,bottom:0,right:-100,background:"radial-gradient(circle,rgba(0,229,160,0.045) 0%,transparent 70%)"}}/>
        <div className="W">
          {/* Header */}
          <header className="hdr">
            <div className="brand">
              <img src="/logo.png" alt="Climewave" style={{width:34,height:34,borderRadius:9,objectFit:"contain"}}/>
              <div><div className="bname">{t.brand}</div><div className="bsub">COOLING * HEATING * VENTILATION * SOLUTIONS</div></div>
            </div>
            <div className="ltog">
              <button className={`lbtn ${lang==="en"?"on":""}`} onClick={()=>setLang("en")}>EN</button>
              <button className={`lbtn ${lang==="hi"?"on":""}`} onClick={()=>setLang("hi")}>हि</button>
            </div>
          </header>
 
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${tab==="calc"?"on":""}`} onClick={()=>setTab("calc")}>{lang==="en"?"🧮  Room Calculator":"🧮  कमरा कैलकुलेटर"}</button>
            <button className={`tab ${tab==="cvs"?"on":""}`} onClick={()=>setTab("cvs")}>{lang==="en"?"⚡  Central vs Split":"⚡  Central vs Split"}</button>
          </div>
 
          {/* CVS TAB */}
          {tab==="cvs"&&<CVS lang={lang}/>}
 
          {/* CALC TAB */}
{tab==="calc"&&(<>

  {/* STEP -1 — Collect user info */}
  {step===-1&&(
    <div className="fade">
      <div className="hero">
        <div className="htag">◆ ROOM CALCULATOR</div>
        <h1 className="htitle">
          {lang==="en"?<>Avoid a <span>₹30,000 mistake</span></>:<>गलत AC से<br/><span>बचें</span></>}
        </h1>
        <p className="hsub">
          {lang==="en"?"Tell us a little about yourself — takes 20 seconds.":"पहले अपनी जानकारी दें — केवल 20 सेकंड।"}
        </p>
      </div>
      <div className="card">
        <div className="ctit">{lang==="en"?"YOUR DETAILS":"आपकी जानकारी"}</div>
        <div className="fg" style={{gridTemplateColumns:"1fr 1fr"}}>
          {[
            {k:"name",  label:lang==="en"?"Full Name":"पूरा नाम",     ph:"Name",        type:"text"},
            {k:"email", label:lang==="en"?"Email":"ईमेल",              ph:"you@email.com",        type:"email"},
            {k:"phone", label:lang==="en"?"Phone Number":"फ़ोन नंबर",  ph:"+91 98765 43210",      type:"tel"},
            {k:"city",  label:lang==="en"?"City":"शहर",                ph:"Delhi / Mumbai...",    type:"text"},
          ].map(({k,label,ph,type})=>(
            <div className="field" key={k}>
              <label>{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={userInfo[k]}
                onChange={e=>setU(k,e.target.value)}
                className={`input-solid${uiErrors[k]?" err":""}`}
              />
              {uiErrors[k]&&(
                <div className="input-solid-error">
                  {uiErrors[k]}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:16,padding:"10px 14px",background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.1)",borderRadius:9}}>
          <span style={{fontSize:14}}>🔒</span>
          <span style={{fontSize:11,color:"var(--text-dim)",fontFamily:"'JetBrains Mono',monospace"}}>
            {lang==="en"
              ?"Your info is private. Used only to share your report."
              :"आपकी जानकारी सुरक्षित है।"}
          </span>
        </div>

        <div className="bact">
          <a href="/" className="btn-s" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
            ← {lang==="en"?"Home":"होम"}
          </a>
          <button className="btn-p" onClick={()=>{ if(validateUserInfo()) setStep(0); }}>
            {lang==="en"?"Start Analysis →":"विश्लेषण शुरू करें →"}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Hero — steps 0, 1, 2 only */}
  {step>=0&&step<3&&(
    <div className="hero fade">
      <div className="htag">◆ ROOM CALCULATOR</div>
      <h1 className="htitle">
        {lang==="en"?<>Avoid a <span>₹30,000 mistake</span></>:<>गलत AC से<br/><span>बचें</span></>}
      </h1>
      <p className="hsub">
        {lang==="en"?"Wrong AC size or placement wastes money every month. Takes 60 seconds.":"गलत AC हर महीने पैसा बर्बाद करता है।"}
      </p>
    </div>
  )}

  {/* Stepper — only after user info */}
  {step>=0&&(
    <div className="sbar">
      {t.steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",flex:1,maxWidth:140}}>
          <div className="si">
            <div className={`snum ${i<step?"done":i===step?"act":"pend"}`}>{i<step?"✓":i+1}</div>
            <div className={`slbl ${i===step?"act":""}`}>{s}</div>
          </div>
          {i<3&&<div className={`scon ${i<step?"done":""}`}/>}
        </div>
      ))}
    </div>
  )}

            {/* Step 0 */}
            {step===0&&(
              <div className="fade">
                <div className="live"><div><div className="live-lbl">LIVE ESTIMATE AS YOU TYPE</div><div style={{display:"flex",alignItems:"baseline",gap:6}}><div className="live-val">{liveBTU.toLocaleString()}</div><div className="live-unit">BTU · {acLabel(liveBTU)} · {roomSizeLabel(f.l*f.w)}</div></div></div></div>
                <div className="card">
                  <div className="ctit">{t.hints[0]}</div>
                  <div className="fg">
                    {[["l",t.length],["w",t.width],["h",t.height]].map(([k,lbl])=>(
                      <div className="field" key={k}><label>{lbl}</label><input type="number" min={1} value={f[k]} onChange={e=>set(k,parseFloat(e.target.value)||1)}/></div>
                    ))}
                    <div className="field"><label>{t.rt}</label>
                      <select value={f.rt} onChange={e=>set("rt",e.target.value)} className="select-solid">
                        {rtKeys.map((v,i)=><option key={v} value={v}>{t.rtOpts[i]}</option>)}
                      </select></div>
                  </div>
                  <div className="bact"><button className="btn-p" onClick={()=>setStep(1)}>{t.next}</button></div>
                </div>
              </div>
            )}
 
            {/* Step 1 */}
            {step===1&&(
              <div className="fade">
                <div className="live"><div><div className="live-lbl">LIVE ESTIMATE</div><div style={{display:"flex",alignItems:"baseline",gap:6}}><div className="live-val">{liveBTU.toLocaleString()}</div><div className="live-unit">BTU · {acLabel(liveBTU)}</div></div></div></div>
                <div className="card">
                  <div className="ctit">{t.hints[1]}</div>
                  <div className="fg">
                    <div className="field"><label>{t.people}</label><input type="number" min={0} value={f.p} onChange={e=>set("p",parseInt(e.target.value)||0)}/></div>
                    <div className="field"><label>{t.windows}</label><input type="number" min={0} value={f.win} onChange={e=>set("win",parseInt(e.target.value)||0)}/></div>
                    <div className="field"><label>{t.sun}</label>
                      <select value={f.sun} onChange={e=>set("sun",e.target.value)} className="select-solid">
                        {sunKeys.map((v,i)=><option key={v} value={v}>{t.sunOpts[i]}</option>)}
                      </select></div>
                    <div className="field"><label>{t.furn}</label>
                      <select value={f.furn} onChange={e=>set("furn",e.target.value)} className="select-solid">
                        {furnKeys.map((v,i)=><option key={v} value={v}>{t.furnOpts[i]}</option>)}
                      </select></div>
                  </div>
                  <div className="bact">
                    <button className="btn-s" onClick={()=>setStep(0)}>{t.back}</button>
                    <button className="btn-p" onClick={()=>setStep(2)}>{t.next}</button>
                  </div>
                </div>
              </div>
            )}
 
            {/* Step 2 */}
            {step===2&&(
              <div className="fade">
                <div className="card">
                  <div className="ctit">{t.hints[2]}</div>
                  <div className="fg">
                    <div className="field"><label>{t.door}</label>
                      <select value={f.door} onChange={e=>set("door",e.target.value)} className="select-solid">
                        {wallKeys.map(v=><option key={v} value={v}>{v}</option>)}
                      </select></div>
                    <div className="field field-divider">
                      <div className="micro-label" style={{marginBottom:12}}>COMPARE TWO OPTIONS</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                        <div className="field"><label>{t.p1}</label>
                          <select value={f.p1} onChange={e=>set("p1",e.target.value)} className="select-solid">
                            {wallKeys.map(v=><option key={v} value={v}>{v}</option>)}
                          </select></div>
                        <div className="field"><label>{t.p2}</label>
                          <select value={f.p2} onChange={e=>set("p2",e.target.value)} className="select-solid">
                            {wallKeys.map(v=><option key={v} value={v}>{v}</option>)}
                          </select></div>
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:18}}>
                    <div className="sim-toggle">
                      <div className="micro-label">PLACEMENT PREVIEW</div>
                      <div className="toggle-pill">
                        <button className={`tpill-btn ${!showComfort?"on":""}`} onClick={()=>setShowComfort(false)}>Airflow</button>
                        <button className={`tpill-btn ${showComfort?"on":""}`} onClick={()=>setShowComfort(true)}>{t.comfortToggle}</button>
                      </div>
                    </div>
                    <div className="vgrid">
                      <div><div className="micro-label" style={{marginBottom:7}}>{f.p1}</div><RoomCanvas l={f.l} w={f.w} placement={f.p1} showComfort={showComfort}/></div>
                      <div><div className="micro-label" style={{marginBottom:7}}>{f.p2}</div><RoomCanvas l={f.l} w={f.w} placement={f.p2} showComfort={showComfort}/></div>
                    </div>
                  </div>
                  <div className="bact">
                    <button className="btn-s" onClick={()=>setStep(1)}>{t.back}</button>
                    <button className="btn-p" onClick={compute} disabled={busy}>{busy?t.calcing:t.calc}</button>
                  </div>
                </div>
              </div>
            )}
 
            {busy&&<div className="card fade"><div className="colay"><div className="spin"/><div className="clbl">{t.calcing}</div></div></div>}
 
            {/* RESULTS */}
            {step===3&&res&&!busy&&(
              <div className="fade">
                {/* Metric cards */}
                <div className="hcards">
                  <div className="hcard bl"><div className="hcard-lbl">{t.btuCard}</div><div className="hcard-val bl">{res.btu.toLocaleString()}</div><div className="hcard-human">BTU/hr · {comfortNote(res.btu,res.area)}</div></div>
                  <div className="hcard or"><div className="hcard-lbl">{t.acCard}</div><div className="hcard-val or">{res.ac}</div><div className="hcard-human">For a {roomSizeLabel(res.area)}</div></div>
                  <div className="hcard gr"><div className="hcard-lbl">{t.timeCard}</div><div className="hcard-val gr">{res.time}</div><div className="hcard-human">minutes from 35°C to 24°C</div></div>
                  <div className="hcard am"><div className="hcard-lbl">{t.costCard}</div><div className="hcard-val am">₹{res.cost}</div><div className="hcard-human">at 8h/day · ₹7/unit</div></div>
                </div>
 
                {/* AI */}
                <div className="aibox">
                  <div className="aihead"><div className="aipulse"/><div className="aitit">◆ {t.aiTitle}</div></div>
                  {aiL?<div className="aidots"><div className="aidot"/><div className="aidot"/><div className="aidot"/></div>:<div className="aitext">{ai}</div>}
                </div>
 
                {/* Placement compare */}
                <div className="card">
                  <div className="ctit">{t.placementTitle}</div>
                  <div className="pg">
                    {[{d:res.c1,n:res.f.p1},{d:res.c2,n:res.f.p2}].map(({d,n},i)=>{
                      const iW=res.c1.score!==res.c2.score?(i===0?res.c1.score>res.c2.score:res.c2.score>res.c1.score):false;
                      return(
                        <div key={i} className={`pc ${iW?"win":res.c1.score!==res.c2.score?"los":""}`}>
                          <div className="ph"><div className="pname">{n}</div><div className={`pbadge ${vk(d.verdict)}`}>{vl(d.verdict)}</div></div>
                          <div style={{fontSize:10,color:"var(--text-lighter)",fontFamily:"'JetBrains Mono',monospace"}}>{t.score}: {d.score}/3</div>
                          <div className="strack"><div className="sfill" style={{width:`${(d.score/3)*100}%`,background:bc(d.verdict)}}/></div>
                          <div style={{marginBottom:10}}/>
                          <RoomCanvas l={res.f.l} w={res.f.w} placement={n} showComfort={showComfort}/>
                          <div className="ftips" style={{marginTop:10}}>{d.tips.map((tip,j)=><div key={j} className="ftip">{tip}</div>)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
 
                {/* Best placement */}
                <div className="card">
                  <div className="ctit">{t.bestTitle}</div>
                  <div className="bbadge">
                    <div style={{fontSize:20}}>🏆</div>
                    <div><div className="bblbl">{t.bestTitle}</div><div className="bbval">{res.best.name}</div></div>
                    <div style={{marginLeft:"auto"}}><div className="bblbl">{t.confidence}</div><div className="bbval">{Math.round((res.best.score/3)*100)}%</div></div>
                  </div>
                  <div className="sim-toggle">
                    <div style={{fontSize:11,color:"var(--text-lighter)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em"}}>{t.simTitle}</div>
                    <div className="toggle-pill">
                      <button className={`tpill-btn ${!showComfort?"on":""}`} onClick={()=>setShowComfort(false)}>Airflow</button>
                      <button className={`tpill-btn ${showComfort?"on":""}`} onClick={()=>setShowComfort(true)}>{t.comfortToggle}</button>
                    </div>
                  </div>
                  <RoomCanvas l={res.f.l} w={res.f.w} placement={res.best.name} animated showComfort={showComfort}/>
                  {showComfort&&(
                    <div style={{marginTop:10,fontSize:12,color:"var(--text-dim)",lineHeight:1.6,background:"rgba(0,200,120,0.05)",border:"1px solid rgba(0,200,120,0.12)",borderRadius:8,padding:"10px 13px"}}>
                      {lang==="en"?"🟢 Green = comfortable (21–24°C)  🔵 Blue = well-cooled  🔴 Red = still warm — consider fan assist":"🟢 हरा = आरामदायक (21–24°C)  🔵 नीला = अच्छी ठंडक  🔴 लाल = अभी भी गर्म"}
                    </div>
                  )}
                  <div className="ftips" style={{marginTop:12}}>{res.best.tips.map((tip,i)=><div key={i} className="ftip">{tip}</div>)}</div>
                </div>
 
                {/* Energy */}
                <div className="card">
                  <div className="ctit">{t.energyTitle}</div>
                  <div className="ebars">
                    {[{l:lang==="en"?"Daily (8h)":"दैनिक",c:Math.round(res.cost/30)},{l:lang==="en"?"Monthly":"मासिक",c:res.cost},{l:lang==="en"?"Annual":"वार्षिक",c:res.cost*12}].map(({l,c})=>(
                      <div className="erow" key={l}><div className="elbl">{l}</div><div className="etrk"><div className="efil" style={{width:`${Math.min(100,(c/(res.cost*12))*100)}%`}}/></div><div className="eamt">₹{c.toLocaleString()}</div></div>
                    ))}
                  </div>
                  <div style={{marginTop:12,fontSize:11,color:"var(--text-dim)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.7}}>⚡ ₹7/unit · 8h/day · {(res.btu/3412).toFixed(2)} kW load</div>
                  <div className="nudge">
                    <div style={{fontSize:18}}>💡</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#00e5a0",marginBottom:2}}>{t.nudgeTitle}</div>
                      <div style={{fontSize:11,color:"var(--text-lighter)",lineHeight:1.4}}>{t.nudgeSub}</div>
                    </div>
                    <button className="btn-p" style={{padding:"9px 14px",fontSize:12}} onClick={()=>setTab("cvs")}>{t.nudgeBtn}</button>
                  </div>
                </div>
 
                {/* Premium teaser */}
                <div className="prem">
                  <div className="prem-head">
                    <div>
                      <div className="prem-title">{t.premTitle}</div>
                      <div className="prem-sub">{t.premSub}</div>
                    </div>
                    <button className="prem-btn" onClick={()=>alert("Join the Pro waitlist at climewave.com/pro")}>{t.premBtn}</button>
                  </div>
                  <div className="prem-items">
                    {[["📱","AR room scanning"],["🏠","Multi-room planner"],["👷","Contractor quotes"],["🌡","Temperature mapping"]].map(([icon,text],i)=>(
                      <div key={i} className="prem-item"><div className="prem-item-icon">{icon}</div><div className="prem-item-text">{t.premTeaser[i]}</div></div>
                    ))}
                  </div>
                  <div className="trust">{t.trustBadge}</div>
                </div>
 
                {/* ── PDF BUTTON + Recalculate ── */}
                <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                  <PDFButton result={res} ai={ai} lang={lang}/>
                  <button className="btn-s" onClick={()=>{setStep(-1);setRes(null);setAI(null);setShowComfort(false);setUserInfo({name:"",email:"",phone:"",city:""});setUiErrors({});}}>← Recalculate</button>
                </div>
              </div>
            )}
          </>)}
        </div>
      </div>
    </>
  );
}
