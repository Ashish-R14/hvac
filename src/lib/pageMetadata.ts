import type { Metadata } from "next";
import { CLOUDINARY_IMAGES } from "../cloudinaryImages";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
}

/**
 * Every route's metadata needs the same three things done consistently:
 * a canonical URL that matches the trailing-slash convention next.config
 * actually serves (not the one that 308-redirects), and an Open Graph /
 * Twitter object — Next.js does not deep-merge those between a layout
 * and its pages, so a page without its own openGraph silently inherits
 * the root layout's (i.e. the homepage's title/description/image).
 */
export function buildMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const canonical = path.endsWith("/") ? path : `${path}/`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images: [CLOUDINARY_IMAGES.logo] },
    twitter: { card: "summary_large_image", title, description, images: [CLOUDINARY_IMAGES.logo] },
  };
}
