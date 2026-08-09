import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Fixture photography is served from `public/fixtures/` — local, so nothing
  // here is needed for it, and the app renders identically offline.
  //
  // When real portal syncing lands, synced listings will carry remote CDN URLs
  // and those hosts must be allow-listed below. next/image rejects an
  // unconfigured host at REQUEST time, not build time — so it passes locally and
  // fails in production. Add hosts here the same day the sync starts returning
  // them, not after.
  images: {
    remotePatterns: [
      // { protocol: "https", hostname: "images.bayut.com" },
      // { protocol: "https", hostname: "www.propertyfinder.ae" },
    ],
  },
};

export default nextConfig;
