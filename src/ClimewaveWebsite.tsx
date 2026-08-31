'use client';
import './ClimewaveWebsite.css';
import Link from "next/link";
import useIsMobile from "./hooks/useIsMobile";
import { Container, Section, Badge as SectionLabel } from "./design-system/primitives";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FloatingSocial from "./components/FloatingSocial";
import Footer from "./components/Footer";
import StatCard from "./components/cards/StatCard";

// ═══════════════════════════════════════════════════════════════════
//  MAIN WEBSITE
// ═══════════════════════════════════════════════════════════════════
export default function ClimewaveWebsite() {
  const isMobile = useIsMobile();

  return (
    <>
      <Navbar/>
      <Hero/>

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
              <Link href="/tool" style={{display:"inline-flex",alignItems:"center",gap:10,background:"linear-gradient(135deg,#00e5a0,#00d4ff)",color:"#0f2420",borderRadius:11,padding:"14px 28px",fontSize:14,fontWeight:700,textDecoration:"none",fontFamily:"'Syne',sans-serif"}}>
                Calculate My Savings →
              </Link>
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
                <Link href="/tool" style={{background:"rgba(255,107,53,0.1)",border:"1px solid rgba(255,107,53,0.3)",color:"#ff6b35",borderRadius:12,padding:"15px 24px",fontSize:15,fontWeight:700,textDecoration:"none",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>⚡ Free Analysis</Link>
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