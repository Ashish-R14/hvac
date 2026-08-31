// Server-side save of a completed HVAC calculator submission — the
// user's contact info (email, phone, name, city) plus every detail
// they filled in (room dimensions, sunlight, furniture, door/placement
// choices) and the computed result. MONGODB_URI is server-only (no
// NEXT_PUBLIC_ prefix) so it's never bundled into client-side JS.
import { getMongoClient } from "../../../lib/mongodb";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid submission" }, { status: 400 });
  }

  const { userInfo, f, btu, ac, best, cost, time, lang } = body;
  if (!userInfo?.email || !userInfo?.phone) {
    return Response.json({ error: "Missing email or phone" }, { status: 400 });
  }

  try {
    const client = await getMongoClient();
    const db = client.db("hvac_platform");
    await db.collection("submissions").insertOne({
      user_name: userInfo?.name,
      user_email: userInfo?.email,
      user_phone: userInfo?.phone,
      user_city: userInfo?.city,
      room_length: f?.l,
      room_width: f?.w,
      room_height: f?.h,
      room_type: f?.rt,
      people: f?.p,
      windows: f?.win,
      sunlight: f?.sun,
      furniture: f?.furn,
      door_pos: f?.door,
      placement_1: f?.p1,
      placement_2: f?.p2,
      btu_result: btu,
      ac_size: ac,
      best_placement: best?.name,
      monthly_cost: cost,
      cooling_time: time,
      language: lang,
      source: "hvac-tool",
      created_at: new Date(),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.warn("Storage error:", err);
    return Response.json({ error: "Storage error" }, { status: 500 });
  }
}
