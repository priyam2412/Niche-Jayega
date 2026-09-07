export type ScreenType = "hub" | "profile";

export type FoodApp = "zomato" | "swiggy" | "instamart" | "other";

export type OrderStatus = "gate_drop" | "in_transit" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  requesterId: string;
  orderNumber: string;
  platform: FoodApp;
  title: string;
  description: string;
  customerName: string;
  customerRating: string;
  customerRuns: number;
  pickupLocation: string;
  dropLocation: string;
  bounty: number;
  timeAgo: string;
  status: OrderStatus;
  backendStatus: string;
  itemsCount: number;
  gatePassVerified?: boolean;
  etaMinutes?: number;
  runnerName?: string;
  runnerId?: string;
  runnerRoom?: string;
  targetRoom?: string;
  handoverPin?: string;
  instructions?: string;
}
