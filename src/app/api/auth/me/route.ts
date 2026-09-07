import { json, requireUser } from "@/lib/server/http";
import { prisma } from "@/lib/server/db";
import { serializeMembership, serializeUser } from "@/lib/server/serializers";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { community: { include: { _count: { select: { memberships: true } } } } },
    orderBy: { joinedAt: "desc" },
  });

  return json({
    user: serializeUser(user),
    memberships: memberships.map(serializeMembership),
  });
}
