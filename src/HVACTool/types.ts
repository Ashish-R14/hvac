// ════════════════════════════════════════════════════════
//  SHARED TYPES
// ════════════════════════════════════════════════════════
export interface RoomForm {
  l: number; w: number; h: number; p: number; win: number;
  sun: string; rt: string; door: string; furn: string; p1: string; p2: string;
}
export interface UserInfo { name: string; email: string; phone: string; city: string; }
export type UiErrors = Partial<Record<keyof UserInfo, string>>;
export interface PlacementResult { score: number; verdict: string; tips: string[]; }
export interface BestPlacement extends PlacementResult { name: string; }
export interface CalcResult {
  btu: number; ac: string; time: number; cost: number;
  c1: PlacementResult; c2: PlacementResult; best: BestPlacement;
  area: number; f: RoomForm; userInfo: UserInfo;
}
export type Lang = "en" | "hi";
