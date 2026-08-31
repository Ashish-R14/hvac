// Server-side signed upload to Cloudinary. The API secret lives only in the
// server environment (CLOUDINARY_API_SECRET) so it's never bundled into
// client-side JS — same pattern as ai-insight's route.
import crypto from "node:crypto";

export async function POST(req: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const image = body?.image;
  if (!image || typeof image !== "string" || !image.startsWith("data:")) {
    return Response.json({ error: "Invalid image" }, { status: 400 });
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
      return Response.json({ error: json.error?.message || "Upload failed" }, { status: 502 });
    }
    return Response.json({ url: json.secure_url });
  } catch {
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
