import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { error, json, requireUser } from "@/lib/server/http";
import { serializeMembership } from "@/lib/server/serializers";

const schema = z.object({
  code: z.string().trim().min(4),
  room: z.string().trim().max(80).optional(),
});

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error("Community code is required");

  const community = await prisma.community.findUnique({
    where: { code: parsed.data.code.toUpperCase() },
  });
  if (!community) return error("Community not found", 404);

  const membership = await prisma.membership.upsert({
    where: {
      userId_communityId: { userId: user.id, communityId: community.id },
    },
    update: { room: parsed.data.room ?? undefined },
    create: {
      userId: user.id,
      communityId: community.id,
      room: parsed.data.room || "",
    },
    include: { community: { include: { _count: { select: { memberships: true } } } } },
  });

  return json({ membership: serializeMembership(membership) });
}
