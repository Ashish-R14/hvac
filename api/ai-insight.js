// Server-side proxy for the HVAC calculator's "AI Insight" feature.
// The Gemini API key lives only in the Vercel environment (GEMINI_API_KEY,
// no VITE_ prefix) so it is never bundled into client-side JS.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
    return res.status(400).json({ error: "Invalid prompt" });
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
      return res.status(502).json({ error: "AI service error" });
    }

    const json = await geminiRes.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to load insight.";
    return res.status(200).json({ text });
  } catch {
    return res.status(500).json({ error: "AI service error" });
  }
}
