import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
