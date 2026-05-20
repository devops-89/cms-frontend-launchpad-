import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["mui-tel-input"],
  allowedDevOrigins: [
    "192.168.150.1",
  ],
};

export default nextConfig;