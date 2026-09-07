import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { error, json, requireUser } from "@/lib/server/http";
import { requestInclude, serializeRequest } from "@/lib/server/serializers";

const createSchema = z.object({
  communityId: z.string().min(1),
  foodApp: z.enum(["swiggy", "zomato", "instamart", "other"]),
  restaurantName: z.string().trim().min(2).max(120),
  orderDetails: z.string().trim().max(500).optional(),
  pickupLocation: z.string().trim().min(2).max(120),
  dropLocation: z.string().trim().min(2).max(120),
  rewardAmount: z.number().int().min(10).max(500),
});

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId");
  const scope = searchParams.get("scope") || "feed";

  if (!communityId) return error("communityId is required");

  const member = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });
  if (!member) return error("Join this community first", 403);

  const where =
    scope === "jobs"
      ? { communityId, runnerId: user.id }
      : scope === "posted"
        ? { communityId, requesterId: user.id }
        : scope === "all"
          ? { communityId, NOT: { status: "cancelled" } }
          : { communityId, status: { in: ["open", "accepted", "picked_up"] } };

  const requests = await prisma.pickupRequest.findMany({
    where,
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });

  return json({ requests: requests.map(serializeRequest) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return error("Fill restaurant, pickup, drop, food app, and a reward of ₹10–500");
  }

  const member = await prisma.membership.findUnique({
    where: {
      userId_communityId: { userId: user.id, communityId: parsed.data.communityId },
    },
  });
  if (!member) return error("Join this community first", 403);

  const created = await prisma.$transaction(async (tx) => {
    const pickup = await tx.pickupRequest.create({
      data: {
        requesterId: user.id,
        communityId: parsed.data.communityId,
        foodApp: parsed.data.foodApp,
        restaurantName: parsed.data.restaurantName,
        orderDetails: parsed.data.orderDetails || null,
        pickupLocation: parsed.data.pickupLocation,
        dropLocation: parsed.data.dropLocation,
        rewardAmount: parsed.data.rewardAmount,
      },
      include: requestInclude,
    });

    await tx.user.update({
      where: { id: user.id },
      data: { totalPosted: { increment: 1 } },
    });

    return pickup;
  });

  return json({ request: serializeRequest(created) }, 201);
}
