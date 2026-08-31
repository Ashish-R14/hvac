// Server-side proxy for the HVAC calculator's "AI Insight" feature.
// The Gemini API key lives only in the server environment (GEMINI_API_KEY,
// no NEXT_PUBLIC_ prefix) so it is never bundled into client-side JS.
export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI service not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const prompt = body?.prompt;
  if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
    return Response.json({ error: "Invalid prompt" }, { status: 400 });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!geminiRes.ok) {
      return Response.json({ error: "AI service error" }, { status: 502 });
    }

    const json = await geminiRes.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to load insight.";
    return Response.json({ text });
  } catch {
    return Response.json({ error: "AI service error" }, { status: 500 });
  }
}
