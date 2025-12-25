import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  basePath: "",
  output: 'export',
  /* config options here */
  devIndicators: {
    // @ts-ignore - buildActivity is valid but missing in type definition
    buildActivity: false,
    // @ts-ignore - appIsrStatus is valid but missing in type definition
    appIsrStatus: false,
  },
  reactCompiler: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
