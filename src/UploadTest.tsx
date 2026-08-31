'use client';
import { useState, type ChangeEvent } from "react";

export default function UploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setUrl(null);
    setError(null);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const upload = async () => {
    if (!preview) return;
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/upload-image/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: 24, fontFamily: "sans-serif", color: "#222" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Cloudinary Upload Test</h1>
      <input type="file" accept="image/*" onChange={onChange} />
      {preview && (
        <img src={preview} alt="preview" style={{ maxWidth: "100%", marginTop: 16, borderRadius: 8 }} />
      )}
      <button
        onClick={upload}
        disabled={!file || uploading}
        style={{ marginTop: 16, padding: "10px 20px", cursor: !file || uploading ? "not-allowed" : "pointer" }}
      >
        {uploading ? "Uploading…" : "Upload to Cloudinary"}
      </button>
      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
      {url && (
        <div style={{ marginTop: 16 }}>
          <p>Uploaded! URL:</p>
          <a href={url} target="_blank" rel="noreferrer">{url}</a>
        </div>
      )}
    </div>
  );
}
