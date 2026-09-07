import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import {
  normalizePhone,
  signToken,
  TOKEN_COOKIE,
  verifyPassword,
} from "@/lib/server/auth";
import { error, json } from "@/lib/server/http";
import { serializeUser } from "@/lib/server/serializers";

const schema = z.object({
  phone: z.string().trim().min(10),
  password: z.string().min(4),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error("Phone and password are required");

  const phone = normalizePhone(parsed.data.phone);
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return error("Invalid phone or password", 401);

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return error("Invalid phone or password", 401);

  const token = signToken(user.id);
  const response = json({ token, user: serializeUser(user) });
  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
