import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    // @ts-ignore - buildActivity is valid but missing in type definition
    buildActivity: false,
    // @ts-ignore - appIsrStatus is valid but missing in type definition
    appIsrStatus: false,
  },
  reactCompiler: true,
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
