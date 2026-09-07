import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { error, json, requireUser } from "@/lib/server/http";
import { requestInclude, serializeRequest } from "@/lib/server/serializers";

const actionSchema = z.object({
  action: z.enum(["accept", "picked_up", "deliver", "cancel"]),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { id } = await context.params;
  const pickup = await prisma.pickupRequest.findUnique({
    where: { id },
    include: requestInclude,
  });
  if (!pickup) return error("Request not found", 404);

  const member = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: user.id, communityId: pickup.communityId } },
  });
  if (!member) return error("Join this community first", 403);

  return json({ request: serializeRequest(pickup) });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { id } = await context.params;
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error("Valid action is required");

  const pickup = await prisma.pickupRequest.findUnique({
    where: { id },
    include: requestInclude,
  });
  if (!pickup) return error("Request not found", 404);

  const member = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: user.id, communityId: pickup.communityId } },
  });
  if (!member) return error("Join this community first", 403);

  const now = new Date();
  let updated;

  if (parsed.data.action === "accept") {
    if (pickup.status !== "open") return error("This request is no longer open");
    if (pickup.requesterId === user.id) return error("You cannot accept your own request");
    updated = await prisma.pickupRequest.update({
      where: { id },
      data: { status: "accepted", runnerId: user.id, acceptedAt: now },
      include: requestInclude,
    });
  } else if (parsed.data.action === "picked_up") {
    if (pickup.runnerId !== user.id) return error("Only the runner can mark this picked up", 403);
    if (pickup.status !== "accepted") return error("Request must be accepted first");
    updated = await prisma.pickupRequest.update({
      where: { id },
      data: { status: "picked_up", pickedUpAt: now },
      include: requestInclude,
    });
  } else if (parsed.data.action === "deliver") {
    if (pickup.runnerId !== user.id) return error("Only the runner can mark this delivered", 403);
    if (pickup.status !== "picked_up" && pickup.status !== "accepted") {
      return error("Request must be in progress");
    }
    updated = await prisma.$transaction(async (tx) => {
      const done = await tx.pickupRequest.update({
        where: { id },
        data: { status: "delivered", deliveredAt: now },
        include: requestInclude,
      });
      await tx.user.update({
        where: { id: user.id },
        data: {
          totalDeliveries: { increment: 1 },
          totalEarned: { increment: pickup.rewardAmount },
        },
      });
      return done;
    });
  } else {
    const canCancel = pickup.requesterId === user.id || pickup.runnerId === user.id;
    if (!canCancel) return error("Only requester or runner can cancel", 403);
    if (pickup.status === "delivered") return error("Already delivered");
    if (pickup.status === "cancelled") return error("Already cancelled");
    updated = await prisma.pickupRequest.update({
      where: { id },
      data: { status: "cancelled", cancelledAt: now },
      include: requestInclude,
    });
  }

  return json({ request: serializeRequest(updated) });
}
