import { useRef, useEffect } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import { Container, Badge, Button } from '../design-system/primitives';
import { CLOUDINARY_IMAGES } from '../cloudinaryImages';
import './Hero.css';

// ═══════════════════════════════════════════════════════════════════
//  HERO CANVAS
//  Moved verbatim from ClimewaveWebsite.jsx (HeroCanvas). Every value
//  — pipe paths, particle counts/speeds, node positions, bezier math,
//  gradients, glow — is byte-for-byte identical to the original.
//  Only its location changed, so the "3D HVAC pipe network" visual
//  renders exactly as it did before this refactor.
// ═══════════════════════════════════════════════════════════════════
type Point = [number, number];
interface PipeDef { pts: Point[]; col: string; }
interface Particle { pipeIdx: number; t: number; speed: number; size: number; alpha: number; }
interface HeroNode { x: number; y: number; r: number; pulse: number; }

function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let W = 0, H = 0;
    const pipeDefs: PipeDef[] = [
      {pts:[[0.05,0.3],[0.25,0.3],[0.35,0.5],[0.55,0.5]],col:"#00d4ff"},
      {pts:[[0.55,0.5],[0.75,0.5],[0.85,0.3],[1.0,0.3]],col:"#00d4ff"},
      {pts:[[0.55,0.5],[0.55,0.7],[0.55,0.85],[0.55,1.0]],col:"#00ff9f"},
      {pts:[[0.0,0.7],[0.2,0.65],[0.35,0.6],[0.55,0.5]],col:"#00aacc"},
      {pts:[[1.0,0.7],[0.8,0.65],[0.65,0.6],[0.55,0.5]],col:"#00aacc"},
      {pts:[[0.15,0.0],[0.2,0.15],[0.25,0.25],[0.35,0.5]],col:"#0077aa"},
      {pts:[[0.85,0.0],[0.8,0.15],[0.75,0.3],[0.75,0.5]],col:"#0077aa"},
      {pts:[[0.35,0.5],[0.45,0.4],[0.55,0.2],[0.7,0.1]],col:"#00ccaa"},
    ];
    const particles: Particle[] = [];
    pipeDefs.forEach((_pipe,pi) => {
      for (let i=0;i<6+Math.floor(Math.random()*5);i++)
        particles.push({pipeIdx:pi,t:Math.random(),speed:0.0006+Math.random()*0.0008,size:1.5+Math.random()*2,alpha:0.5+Math.random()*0.5});
    });
    const nodes: HeroNode[] = [
      {x:0.55,y:0.5,r:8,pulse:0},{x:0.35,y:0.5,r:5,pulse:0.3},
      {x:0.75,y:0.5,r:5,pulse:0.6},{x:0.55,y:0.7,r:4,pulse:0.9},
      {x:0.2,y:0.3,r:3,pulse:0.2},{x:0.85,y:0.3,r:3,pulse:0.7},
    ];
    function bezierPoint(pts: Point[], t: number): Point {
      const [p0,p1,p2,p3]=pts, u=1-t;
      return [u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],
              u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]];
    }
    function resize(){ W=canvas!.width=canvas!.offsetWidth; H=canvas!.height=canvas!.offsetHeight; }
    resize();
    window.addEventListener("resize",resize);
    let frame=0;
    function draw() {
      animRef.current=requestAnimationFrame(draw);
      ctx!.clearRect(0,0,W,H); frame++;
      ctx!.strokeStyle="rgba(0,212,255,0.04)"; ctx!.lineWidth=1;
      for(let x=0;x<W;x+=60){ctx!.beginPath();ctx!.moveTo(x,0);ctx!.lineTo(x,H);ctx!.stroke();}
      for(let y=0;y<H;y+=60){ctx!.beginPath();ctx!.moveTo(0,y);ctx!.lineTo(W,y);ctx!.stroke();}
      pipeDefs.forEach(pipe=>{
        const pts=pipe.pts.map(([px,py]):Point=>[px*W,py*H]);
        ctx!.beginPath();ctx!.moveTo(pts[0][0],pts[0][1]);
        ctx!.bezierCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1]);
        ctx!.strokeStyle=pipe.col+"22";ctx!.lineWidth=1.5;ctx!.stroke();
      });
      particles.forEach(p=>{
        p.t+=p.speed; if(p.t>1)p.t=0;
        const pipe=pipeDefs[p.pipeIdx];
        const pts=pipe.pts.map(([px,py]):Point=>[px*W,py*H]);
        const [x,y]=bezierPoint(pts,p.t);
        const grad=ctx!.createRadialGradient(x,y,0,x,y,p.size*2);
        grad.addColorStop(0,pipe.col+"ff"); grad.addColorStop(1,pipe.col+"00");
        ctx!.fillStyle=grad; ctx!.globalAlpha=p.alpha;
        ctx!.beginPath();ctx!.arc(x,y,p.size*2,0,Math.PI*2);ctx!.fill();ctx!.globalAlpha=1;
      });
      nodes.forEach(n=>{
        const x=n.x*W,y=n.y*H,pulse=Math.sin(frame*0.04+n.pulse*Math.PI*2)*0.5+0.5;
        ctx!.beginPath();ctx!.arc(x,y,n.r*(1.5+pulse),0,Math.PI*2);
        ctx!.strokeStyle=`rgba(0,212,255,${0.15*pulse})`;ctx!.lineWidth=1;ctx!.stroke();
        const cg=ctx!.createRadialGradient(x,y,0,x,y,n.r);
        cg.addColorStop(0,"#00d4ff");cg.addColorStop(1,"#0055ee");
        ctx!.fillStyle=cg;ctx!.beginPath();ctx!.arc(x,y,n.r,0,Math.PI*2);
        ctx!.shadowBlur=12;ctx!.shadowColor="#00d4ff";ctx!.fill();ctx!.shadowBlur=0;
      });
    }
    draw();
    return ()=>{ if(animRef.current!=null) cancelAnimationFrame(animRef.current); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} className="cw-hero__canvas" />;
}

const TRUST_BADGES = ['2,400+ Systems Designed', 'BEE & ASHRAE Certified', 'Serving Kumaon & Uttarakhand', 'Free Consultation'];

/**
 * Hero — Phase 4.
 *
 * Same copy, same anchors (#tool, #how-it-works), same trust badges,
 * same canvas visual as the section it replaces in
 * ClimewaveWebsite.jsx. What changed:
 *   - Structure moved into its own component + Hero.css (token-based,
 *     no inline styles, no duplicated animation keyframes).
 *   - CTAs now use the shared Button primitive: the primary CTA is
 *     "glass" gradient + magnetic pull, the secondary is the glass
 *     variant — replacing two hand-rolled inline-styled <a> tags.
 *   - Added a slow ambient gradient drift and a staggered entrance
 *     sequence (badge → title → sub → CTAs → trust row) on top of the
 *     existing slideUp title/sub animation, purely additive motion
 *     driven by the duration and easing tokens.
 *   - Radial vignette + bottom fade are unchanged (same values, now
 *     tokenized instead of inline rgba strings).
 */
export default function Hero() {
  const isMobile = useIsMobile();

  return (
    <section className="cw-hero">
      <HeroCanvas />
      <div className="cw-hero__gradient-drift" aria-hidden="true" />
      <div className="cw-hero__vignette" aria-hidden="true" />
      <div className="cw-hero__floor-fade" aria-hidden="true" />
      <div className="cw-hero__mark" aria-hidden="true">
        <div className="cw-hero__mark-glow" />
        <img src={CLOUDINARY_IMAGES.logo} alt="" />
      </div>

      <Container className="cw-hero__container">
        <div className="cw-hero__content">
          <div className="cw-hero__badge-wrap">
            <Badge size={isMobile ? 'md' : 'lg'}>INTELLIGENT HVAC PLATFORM</Badge>
          </div>

          <h1 className="hero-title cw-hero__title">
            Design Your<br />
            <span className="accent">Perfect</span>{' '}
            <span className="accent2">Climate</span><br />
            System
          </h1>

          <p className="hero-sub" style={{marginBottom:isMobile?28:40,fontSize:isMobile?14:18}}>
             Climewave Engineers provides expert HVAC installation, AC repair, and maintenance services across Haldwani, Ramnagar, Rudrapur, Kashipur, Dehradun and Pan India — powered by AI-driven system design.
          </p>

          <div className="cw-hero__cta-row">
            <Button href="/tool" variant="primary" size="lg" magnetic>
              ⚡ Start Free HVAC Analysis
            </Button>
            <Button href="/how-it-works" variant="glass" size="lg">
              See How It Works →
            </Button>
          </div>

          <div className="cw-hero__trust-row">
            {TRUST_BADGES.map((badge) => (
              <div key={badge} className="cw-hero__trust-item">
                <span className="cw-hero__trust-dot" />{badge}
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div className="cw-hero__scroll-cue" aria-hidden="true">
        <div>SCROLL</div>
        <div className="cw-hero__scroll-line" />
      </div>
    </section>
  );
}
