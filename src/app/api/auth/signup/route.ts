import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { hashPassword, normalizePhone, signToken, TOKEN_COOKIE } from "@/lib/server/auth";
import { error, json } from "@/lib/server/http";
import { serializeUser } from "@/lib/server/serializers";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10),
  password: z.string().min(4).max(72),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return error("Name, phone, and password (min 4 chars) are required");
  }

  const phone = normalizePhone(parsed.data.phone);
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) return error("An account with this phone already exists", 409);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      phone,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  const token = signToken(user.id);
  const response = json({ token, user: serializeUser(user) }, 201);
  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
