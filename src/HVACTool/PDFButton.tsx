import { useState, useRef, useEffect } from "react";
import type { CalcResult } from "./types";
import { ReportTemplate } from "./ReportTemplate";

declare global {
  interface Window {
    // Loaded at runtime from CDN <script> tags (see useLibs below) —
    // not npm packages, so left untyped.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    html2canvas: any;
    jspdf: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

// ════════════════════════════════════════════════════════
//  PDF LIB LOADER (jsPDF + html2canvas from CDN)
// ════════════════════════════════════════════════════════
function useLibs(){
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const load=(src: string)=>new Promise<void>((res,rej)=>{
      if(document.querySelector(`script[src="${src}"]`)){res();return;}
      const s=document.createElement("script");
      s.src=src; s.onload=()=>res(); s.onerror=rej;
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
//  PDF PREVIEW MODAL
// ════════════════════════════════════════════════════════
interface PdfModalProps {
  result: CalcResult;
  onClose: () => void;
  onDownload: () => void;
  generating: boolean;
}
function PdfModal({result,onClose,onDownload,generating}: PdfModalProps){
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
interface PDFButtonProps { result: CalcResult; ai: string | null; lang: string; }
export function PDFButton({result,ai,lang}: PDFButtonProps){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const pdfRef=useRef<HTMLDivElement>(null);
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
        if(!ctx) continue;
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
