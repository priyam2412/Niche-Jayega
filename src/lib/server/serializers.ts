import type { Community, Membership, PickupRequest, User } from "@prisma/client";

type RequestWithPeople = PickupRequest & {
  requester: Pick<User, "id" | "name" | "phone" | "rating" | "totalDeliveries">;
  runner: Pick<User, "id" | "name" | "phone" | "rating"> | null;
};

export function serializeUser(
  user: Pick<
    User,
    | "id"
    | "name"
    | "phone"
    | "avatarUrl"
    | "rating"
    | "totalDeliveries"
    | "totalPosted"
    | "totalEarned"
  >
) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    rating: user.rating,
    totalDeliveries: user.totalDeliveries,
    totalPosted: user.totalPosted,
    totalEarned: user.totalEarned,
  };
}

export function serializeCommunity(
  community: Community & { _count?: { memberships: number } }
) {
  return {
    id: community.id,
    name: community.name,
    code: community.code,
    gateLocation: community.gateLocation,
    memberCount: community._count?.memberships ?? 0,
    createdAt: community.createdAt.toISOString(),
  };
}

export function serializeMembership(
  membership: Membership & {
    community: Community & { _count?: { memberships: number } };
  }
) {
  return {
    id: membership.id,
    room: membership.room,
    joinedAt: membership.joinedAt.toISOString(),
    community: serializeCommunity(membership.community),
  };
}

export function serializeRequest(request: RequestWithPeople) {
  return {
    id: request.id,
    requesterId: request.requesterId,
    requesterName: request.requester.name,
    requesterPhone: request.requester.phone,
    requesterRating: request.requester.rating,
    requesterRuns: request.requester.totalDeliveries,
    requesterRoom: request.dropLocation,
    runnerId: request.runnerId ?? undefined,
    runnerName: request.runner?.name,
    communityId: request.communityId,
    foodApp: request.foodApp,
    restaurantName: request.restaurantName,
    orderDetails: request.orderDetails ?? undefined,
    pickupLocation: request.pickupLocation,
    dropLocation: request.dropLocation,
    rewardAmount: request.rewardAmount,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    acceptedAt: request.acceptedAt?.toISOString(),
    pickedUpAt: request.pickedUpAt?.toISOString(),
    deliveredAt: request.deliveredAt?.toISOString(),
  };
}

export const requestInclude = {
  requester: {
    select: { id: true, name: true, phone: true, rating: true, totalDeliveries: true },
  },
  runner: { select: { id: true, name: true, phone: true, rating: true } },
} as const;
