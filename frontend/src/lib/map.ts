import type { ApiRequest } from "./api";
import type { OrderItem, OrderStatus } from "../types";

export function relativeTime(dateString: string) {
  const diffMins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const hours = Math.floor(diffMins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function toUiStatus(status: string): OrderStatus {
  if (status === "open") return "gate_drop";
  if (status === "accepted" || status === "picked_up") return "in_transit";
  if (status === "delivered") return "delivered";
  return "cancelled";
}

export function mapRequest(req: ApiRequest): OrderItem {
  return {
    id: req.id,
    requesterId: req.requesterId,
    orderNumber: `#${req.id.slice(-4).toUpperCase()}`,
    platform: req.foodApp === "other" ? "instamart" : req.foodApp,
    title: req.restaurantName,
    description: req.orderDetails || "Food pickup",
    customerName: req.requesterName,
    customerRating: String(req.requesterRating ?? 5),
    customerRuns: req.requesterRuns ?? 0,
    pickupLocation: req.pickupLocation,
    dropLocation: req.dropLocation,
    bounty: req.rewardAmount,
    timeAgo: relativeTime(req.createdAt),
    status: toUiStatus(req.status),
    backendStatus: req.status,
    itemsCount: 1,
    gatePassVerified: true,
    etaMinutes: req.status === "picked_up" ? 2 : req.status === "accepted" ? 6 : undefined,
    runnerName: req.runnerName,
    runnerId: req.runnerId,
    targetRoom: req.dropLocation,
    instructions: req.orderDetails,
  };
}

export function toFoodApp(platform: OrderItem["platform"]): ApiRequest["foodApp"] {
  if (platform === "instamart") return "instamart";
  return platform;
}
