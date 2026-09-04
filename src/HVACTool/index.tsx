'use client';
import './HVACTool.css';
import { useState } from "react";
import { CLOUDINARY_IMAGES } from "../cloudinaryImages";
import type { RoomForm, UserInfo, UiErrors, CalcResult, Lang } from "./types";
import { calcBTU, acLabel, coolTime, monthlyCost, evalPlacement, bestPlacement, roomSizeLabel, comfortNote } from "./calculator";
import { saveSubmission, getAI } from "./api";
import { T } from "./translations";
import { RoomCanvas } from "./Canvases";
import { CVS } from "./CVS";
import { PDFButton } from "./PDFButton";

// ════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════
export default function HVAC(){
  const [lang,setLang]=useState<Lang>("en");
  const [tab,setTab]=useState<"calc"|"cvs">("calc");
  const t=T[lang];
  const [step,setStep]=useState(-1);
  const [userInfo,setUserInfo]=useState<UserInfo>({name:"",email:"",phone:"",city:""});
  const [uiErrors,setUiErrors]=useState<UiErrors>({});
  const [busy,setBusy]=useState(false);
  const [res,setRes]=useState<CalcResult|null>(null);
  const [ai,setAI]=useState<string|null>(null);
  const [aiL,setAIL]=useState(false);
  const [showComfort,setShowComfort]=useState(false);
  const [f,setF]=useState<RoomForm>({l:1,w:1,h:1,p:1,win:1,sun:"Medium",rt:"Bedroom",door:"Top Wall",furn:"Low",p1:"Top Wall",p2:"Left Wall"});
  const set=<K extends keyof RoomForm>(k:K,v:RoomForm[K])=>setF(prev=>({...prev,[k]:v}));
  const setU=<K extends keyof UserInfo>(k:K,v:UserInfo[K])=>setUserInfo(prev=>({...prev,[k]:v}));
  const validateUserInfo=()=>{
  const errs: UiErrors={};
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
    setBusy(false);setStep(3);
    setAIL(true);
    try{const ins=await getAI({l:f.l,w:f.w,rt:f.rt,btu,bp:best.name,cost},lang);setAI(ins);}
    catch{setAI("Unable to load insight.");}
    setAIL(false);
  };

  const vk=(v:string)=>(({optimal:"b-opt",good:"b-gd",moderate:"b-mod",poor:"b-poor"} as Record<string,string>)[v]||"b-mod");
  const vl=(v:string)=>(({optimal:"✦ Optimal",good:"✓ Good",moderate:"⚠ Moderate",poor:"✗ Poor"} as Record<string,string>)[v]||v);
  const bc=(v:string)=>(({optimal:"var(--color-accent-green)",good:"var(--color-accent-blue)",moderate:"var(--color-accent-amber)",poor:"var(--color-accent-orange)"} as Record<string,string>)[v]||"var(--color-accent-amber)");
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
              <img src={CLOUDINARY_IMAGES.logo} alt="Climewave" style={{width:34,height:34,borderRadius:9,objectFit:"contain"}}/>
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
          {([
            {k:"name",  label:lang==="en"?"Full Name":"पूरा नाम",     ph:"Name",        type:"text"},
            {k:"email", label:lang==="en"?"Email":"ईमेल",              ph:"you@email.com",        type:"email"},
            {k:"phone", label:lang==="en"?"Phone Number":"फ़ोन नंबर",  ph:"+91 98765 43210",      type:"tel"},
            {k:"city",  label:lang==="en"?"City":"शहर",                ph:"Delhi / Mumbai...",    type:"text"},
          ] as {k: keyof UserInfo; label:string; ph:string; type:string}[]).map(({k,label,ph,type})=>(
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
                    {([["l",t.length],["w",t.width],["h",t.height]] as [keyof RoomForm & ("l"|"w"|"h"), string][]).map(([k,lbl])=>(
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
                    {[["📱","AR room scanning"],["🏠","Multi-room planner"],["👷","Contractor quotes"],["🌡","Temperature mapping"]].map(([icon,_text],i)=>(
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
