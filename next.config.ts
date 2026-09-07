import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
