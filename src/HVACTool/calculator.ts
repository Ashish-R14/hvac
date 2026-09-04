import type { PlacementResult, BestPlacement } from "./types";

// ════════════════════════════════════════════════════════
//  HVAC ENGINE
// ════════════════════════════════════════════════════════
export function calcBTU(l: number, w: number, _h: number, p: number, win: number, sun: string, rt: string) {
  const sf = ({ Low:0.9, Medium:1.0, High:1.2 } as Record<string, number>)[sun] || 1.0;
  const rf = ({ Bedroom:0.9,"Living Room":1.1,Office:1.2,Kitchen:1.3,Hall:1.0 } as Record<string, number>)[rt] || 1.0;
  return Math.round(((l*w*20)+p*600+win*1000)*sf*rf);
}
export function acLabel(btu: number) {
  const t=btu/12000;
  if(t<=1) return "1 Ton"; if(t<=1.5) return "1.5 Ton";
  if(t<=2) return "2 Ton"; return "2+ Ton / Central";
}
export function coolTime(btu: number, area: number){ return Math.round((area*25)/(btu/60)); }
export function monthlyCost(btu: number, hrs=8){ return Math.round((btu/3412)*hrs*30*7); }
export function evalPlacement(l: number, w: number, pl: string, door: string | null, furn: string): PlacementResult {
  const wm: Record<string, string> = {"Top Wall":"T","Bottom Wall":"B","Left Wall":"L","Right Wall":"R"};
  const p=wm[pl]||pl, d=door ? (wm[door]||door) : door;
  let score=0; const tips: string[]=[];
  const horiz=l>=w;
  if((horiz&&(p==="T"||p==="B"))||(!horiz&&(p==="L"||p==="R"))){
    score+=2; tips.push("Airflow covers the longer dimension");
  } else tips.push("Airflow may not reach all corners");
  if(p==="T"||p==="B"){ score+=1; tips.push("Central distribution — more even cooling"); }
  else tips.push("Side placement — corners may feel warmer");
  if(d&&p===d){ score-=1; tips.push("Near door: some cool air escapes"); }
  const fd=({Low:0,Medium:-0.2,High:-0.5} as Record<string, number>)[furn]||0;
  score+=fd;
  if(fd<0) tips.push(furn==="High"?"Heavy furniture blocks airflow":"Some furniture reduces coverage");
  score=Math.max(0,Math.min(score,3));
  const verdict=score>=2.5?"optimal":score>=2?"good":score>=1?"moderate":"poor";
  return {score:Math.round(score*100)/100,verdict,tips};
}
export function bestPlacement(l: number, w: number): BestPlacement {
  let best: BestPlacement={score:-1,verdict:"",tips:[],name:""};
  for(const p of ["Top Wall","Bottom Wall","Left Wall","Right Wall"]){
    const r=evalPlacement(l,w,p,null,"Low");
    if(r.score>best.score) best={...r,name:p};
  }
  return best;
}
export function roomSizeLabel(area: number) {
  if(area<120) return "small room"; if(area<200) return "medium room";
  if(area<300) return "large room"; return "very large space";
}
export function comfortNote(btu: number, area: number){
  const ideal=area*20;
  if(btu>ideal*1.3) return "Well-sized for fast cooling";
  if(btu>ideal*0.9) return "Perfectly matched to your room";
  return "May struggle on very hot days";
}

// Central vs Split
export interface CvsResult {
  splitCost: number; centralCost: number; saving: number; annualSaving: number;
  splitInstall: number; centralInstall: number; breakEven: number | null;
  splitCoverage: number; centralCoverage: number; splitNoise: number; centralNoise: number;
}
export const CCOP=3.8,SCOP=2.8;
export function cvsCalc(rooms: number, hrs: number): CvsResult {
  const totalBTU=rooms*18000;
  const splitCost=Math.round((rooms*(18000/3412/SCOP))*hrs*30*7);
  const centralCost=Math.round(((totalBTU/3412/CCOP)*hrs*30*7)*1.08);
  const saving=splitCost-centralCost;
  const splitInstall=rooms*42000, centralInstall=180000+rooms*8000;
  const breakEven=saving>0?Math.round((centralInstall-splitInstall)/saving):null;
  return{splitCost,centralCost,saving,annualSaving:saving*12,splitInstall,centralInstall,breakEven,
    splitCoverage:Math.max(60,100-(rooms-1)*8),centralCoverage:97,splitNoise:46,centralNoise:29};
}
