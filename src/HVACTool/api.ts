import type { RoomForm, UserInfo, BestPlacement } from "./types";

// ════════════════════════════════════════════════════════
//  AI INSIGHT
// ════════════════════════════════════════════════════════

export interface SubmissionData {
  f: RoomForm; btu: number; ac: string; best: BestPlacement; cost: number; time: number;
  lang: string; userInfo?: UserInfo;
}
export async function saveSubmission(data: SubmissionData) {
  try {
    await fetch("/api/save-submission/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn("Storage error:", err);
  }
}

export interface AIQuery { l: number; w: number; rt: string; btu: number; bp: string; cost: number; }
export async function getAI(data: AIQuery, lang: string): Promise<string> {
  try {
    const prompt = lang === "hi"
      ? `HVAC विशेषज्ञ के रूप में 3 वाक्यों में सलाह दें: कमरा ${data.l}×${data.w} फ़ीट, ${data.rt}, BTU: ${data.btu}, प्लेसमेंट: ${data.bp}, मासिक खर्च: ₹${data.cost}`
      : `As HVAC expert give 3 sentence practical advice: Room ${data.l}x${data.w}ft, ${data.rt}, BTU: ${data.btu}, Best placement: ${data.bp}, Monthly cost: Rs.${data.cost}`;

    const res = await fetch("/api/ai-insight/", {
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
