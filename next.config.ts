import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // public/sitemap.xml and CITY_PAGES already declare every city URL
  // with a trailing slash (e.g. /hvac-services/haldwani/) — match that
  // convention so the served URL and the canonical tag always agree.
  trailingSlash: true,
};

export default nextConfig;
