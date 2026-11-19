import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds the hosted demo for GitHub Pages (served from /bearing-iq/).
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStatic
  ? { output: "export", basePath: "/bearing-iq", trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
