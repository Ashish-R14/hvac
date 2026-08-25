// Server-side signed upload to Cloudinary. The API secret lives only in the
// Vercel environment (CLOUDINARY_API_SECRET) so it's never bundled into
// client-side JS — same pattern as ai-insight.js.
import crypto from "node:crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary not configured" });
  }

  const { image } = req.body || {};
  if (!image || typeof image !== "string" || !image.startsWith("data:")) {
    return res.status(400).json({ error: "Invalid image" });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const form = new URLSearchParams();
  form.set("file", image);
  form.set("api_key", apiKey);
  form.set("timestamp", String(timestamp));
  form.set("signature", signature);

  try {
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );
    const json = await cloudRes.json();
    if (!cloudRes.ok) {
      return res.status(502).json({ error: json.error?.message || "Upload failed" });
    }
    return res.status(200).json({ url: json.secure_url });
  } catch {
    return res.status(500).json({ error: "Upload failed" });
  }
}
