import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

const TOKEN_COOKIE = "nj_token";
const TOKEN_TTL = "7d";

function jwtSecret() {
  return process.env.JWT_SECRET || "niche-jayega-dev-secret-change-me";
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, jwtSecret()) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (phone.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return phone.trim();
}

export async function getAuthUser() {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const bearer = headerStore.get("authorization");
  const token =
    bearer?.startsWith("Bearer ") ? bearer.slice(7) : cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) return null;
  const userId = verifyToken(token);
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      phone: true,
      avatarUrl: true,
      rating: true,
      totalDeliveries: true,
      totalPosted: true,
      totalEarned: true,
    },
  });
}

export { TOKEN_COOKIE };
