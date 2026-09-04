import { useState, useEffect } from "react";
import type { Lang } from "./types";
import { T } from "./translations";
import { MultiCanvas } from "./Canvases";
import { cvsCalc, CCOP, SCOP, type CvsResult } from "./calculator";

// ════════════════════════════════════════════════════════
//  CVS SECTION
// ════════════════════════════════════════════════════════
export function CVS({lang}: {lang: Lang}){
  const t=T[lang];
  const [rooms,setRooms]=useState(3);
  const [hrs,setHrs]=useState(8);
  const [data,setData]=useState<CvsResult|null>(null);
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
