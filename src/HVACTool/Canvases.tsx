import { useRef, useCallback, useEffect } from "react";

// ════════════════════════════════════════════════════════
//  ROOM CANVAS  (live animated airflow)
// ════════════════════════════════════════════════════════
interface RoomCanvasProps { l: number; w: number; placement: string; animated?: boolean; showComfort: boolean; }
export function RoomCanvas({l,w,placement,animated,showComfort}: RoomCanvasProps){
  const ref=useRef<HTMLCanvasElement>(null),fr=useRef(0),tm=useRef<ReturnType<typeof setTimeout> | null>(null);
  const draw=useCallback((step=14)=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d");if(!ctx)return;
    const W=c.width,H=c.height,pad=36,rw=W-pad*2,rh=H-pad*2;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#0d1520";ctx.fillRect(0,0,W,H);
    const wm: Record<string,string> = {"Top Wall":"T","Bottom Wall":"B","Left Wall":"L","Right Wall":"R"};
    const wall=wm[placement]||"T";
    let ax:number,ay:number,dx:number,dy:number;
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
    tick();return()=>{if(tm.current)clearTimeout(tm.current);};
  },[animated,draw]);
  return<canvas ref={ref} width={270} height={190} style={{borderRadius:10,width:"100%",maxWidth:270}}/>;
}

// ════════════════════════════════════════════════════════
//  MULTI-ROOM CANVAS  (CVS tab)
// ════════════════════════════════════════════════════════
interface MultiCanvasProps { rooms: number; type: string; animated?: boolean; }
export function MultiCanvas({rooms,type,animated}: MultiCanvasProps){
  const ref=useRef<HTMLCanvasElement>(null),fr=useRef(0),tm=useRef<ReturnType<typeof setTimeout> | null>(null);
  const draw=useCallback((step=20)=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d");if(!ctx)return;
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
    tick();return()=>{if(tm.current)clearTimeout(tm.current);};
  },[animated,draw]);
  return<canvas ref={ref} width={310} height={210} style={{borderRadius:12,width:"100%",maxWidth:310}}/>;
}
