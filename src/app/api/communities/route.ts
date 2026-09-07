import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { error, json, requireUser } from "@/lib/server/http";
import { serializeCommunity, serializeMembership } from "@/lib/server/serializers";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z.string().trim().min(4).max(24).optional(),
  gateLocation: z.string().trim().min(2).max(120).optional(),
  room: z.string().trim().max(80).optional(),
});

function makeCode(name: string) {
  const slug = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug || "HOSTEL"}${suffix}`;
}

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { community: { include: { _count: { select: { memberships: true } } } } },
    orderBy: { joinedAt: "desc" },
  });

  return json({ memberships: memberships.map(serializeMembership) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error("Community name is required");

  const code = (parsed.data.code || makeCode(parsed.data.name)).toUpperCase();
  const existing = await prisma.community.findUnique({ where: { code } });
  if (existing) return error("That community code is already taken", 409);

  const community = await prisma.community.create({
    data: {
      name: parsed.data.name,
      code,
      gateLocation: parsed.data.gateLocation || "Main Gate",
      createdById: user.id,
      memberships: {
        create: { userId: user.id, room: parsed.data.room || "" },
      },
    },
    include: { _count: { select: { memberships: true } } },
  });

  return json({ community: serializeCommunity(community) }, 201);
}
