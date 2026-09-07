import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScreenType, OrderItem } from "./types";
import { Header } from "./components/Header";
import { UrgencyStrip } from "./components/UrgencyStrip";
import { CampusMeshView } from "./components/CampusMeshView";
import { HostelerProfileView } from "./components/HostelerProfileView";
import { QuickPostModal } from "./components/QuickPostModal";
import { SwitchClusterModal } from "./components/SwitchClusterModal";
import { Footer } from "./components/Footer";
import { CollegeDynamicBackground } from "./components/CollegeDynamicBackground";
import { BackgroundVideoLayer } from "./components/BackgroundVideoLayer";
import { AuthScreen } from "./components/AuthScreen";
import { JoinCommunityScreen } from "./components/JoinCommunityScreen";
import {
  ApiMembership,
  ApiUser,
  authApi,
  clearToken,
  communityApi,
  getToken,
  requestApi,
  setToken,
} from "./lib/api";
import { mapRequest, toFoodApp } from "./lib/map";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("hub");
  const [user, setUser] = useState<ApiUser | null>(null);
  const [memberships, setMemberships] = useState<ApiMembership[]>([]);
  const [communityId, setCommunityId] = useState("");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [error, setError] = useState("");

  const membership = useMemo(
    () => memberships.find((m) => m.community.id === communityId) || memberships[0],
    [memberships, communityId]
  );
  const community = membership?.community;
  const earnedAmount = user?.totalEarned ?? 0;

  const refreshMe = useCallback(async () => {
    const data = await authApi.me();
    setUser(data.user);
    setMemberships(data.memberships);
    setCommunityId((current) => {
      if (current && data.memberships.some((m) => m.community.id === current)) return current;
      return data.memberships[0]?.community.id || "";
    });
    return data;
  }, []);

  const refreshOrders = useCallback(async (cid = communityId) => {
    if (!cid) {
      setOrders([]);
      return;
    }
    const data = await requestApi.list(cid, "all");
    setOrders(data.requests.map(mapRequest));
  }, [communityId]);

  useEffect(() => {
    (async () => {
      if (!getToken()) {
        setBootstrapped(true);
        return;
      }
      try {
        const data = await refreshMe();
        const cid = data.memberships[0]?.community.id;
        if (cid) {
          const feed = await requestApi.list(cid, "all");
          setOrders(feed.requests.map(mapRequest));
        }
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setBootstrapped(true);
      }
    })();
  }, [refreshMe]);

  useEffect(() => {
    if (!communityId || !user) return;
    refreshOrders(communityId).catch((err) => setError(err.message));
    const timer = window.setInterval(() => {
      refreshOrders(communityId).catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [communityId, user, refreshOrders]);

  async function handleLogin(phone: string, password: string) {
    const data = await authApi.login({ phone, password });
    setToken(data.token);
    await refreshMe();
  }

  async function handleSignup(name: string, phone: string, password: string) {
    const data = await authApi.signup({ name, phone, password });
    setToken(data.token);
    await refreshMe();
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clearToken();
    setUser(null);
    setMemberships([]);
    setOrders([]);
    setCommunityId("");
    setCurrentScreen("hub");
  }

  async function handleAddOrder(order: OrderItem) {
    if (!community) throw new Error("Join a community first");
    setError("");
    await requestApi.create({
      communityId: community.id,
      foodApp: toFoodApp(order.platform),
      restaurantName: order.title,
      orderDetails: [order.description, order.instructions].filter(Boolean).join(" · "),
      pickupLocation: order.pickupLocation,
      dropLocation: order.dropLocation,
      rewardAmount: order.bounty,
    });
    await refreshMe();
    await refreshOrders();
  }

  async function handleAcceptPickup(order: OrderItem) {
    setError("");
    await requestApi.act(order.id, "accept");
    await refreshOrders();
  }

  async function handleConfirmHandover(order: OrderItem) {
    setError("");
    if (order.backendStatus === "accepted") {
      await requestApi.act(order.id, "picked_up");
    }
    await requestApi.act(order.id, "deliver");
    await refreshMe();
    await refreshOrders();
  }

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#5a4138] font-['Outfit']">
        Loading Niche Jayega…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between text-[#1e1b18] font-['Manrope'] antialiased selection:bg-[#ffdbce] selection:text-[#370e00] relative bg-[#fff8f4]/30">
      <BackgroundVideoLayer />
      <CollegeDynamicBackground />

      {!user ? (
        <AuthScreen onLogin={handleLogin} onSignup={handleSignup} />
      ) : !community ? (
        <JoinCommunityScreen
          onJoin={async (code, room) => {
            await communityApi.join({ code, room });
            await refreshMe();
          }}
          onCreate={async (name, room) => {
            await communityApi.create({ name, room, gateLocation: "Main Gate" });
            await refreshMe();
          }}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <Header
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            onOpenPostModal={() => setIsPostModalOpen(true)}
            onOpenClusterModal={() => setIsClusterModalOpen(true)}
            earnedAmount={earnedAmount}
            clusterName={community.name}
            clusterCode={community.code}
          />

          <main className="w-full pt-20 flex-1 relative z-10">
            {error && (
              <div className="max-w-7xl mx-auto px-4 pt-3">
                <p className="text-xs text-[#ba1a1a] bg-white/80 rounded-xl px-3 py-2 border border-red-200">
                  {error}
                </p>
              </div>
            )}
            {currentScreen === "hub" ? (
              <div className="flex flex-col w-full animate-in fade-in duration-200">
                <UrgencyStrip openCount={orders.filter((o) => o.status === "gate_drop").length} />
                <CampusMeshView
                  orders={orders}
                  currentUserId={user.id}
                  onOpenPostModal={() => setIsPostModalOpen(true)}
                  onOpenClusterModal={() => setIsClusterModalOpen(true)}
                  onAcceptPickup={handleAcceptPickup}
                  onConfirmHandover={handleConfirmHandover}
                  currentCluster={community.name}
                  communityCode={community.code}
                  memberCount={community.memberCount}
                  earnedAmount={earnedAmount}
                  deliveriesDone={user.totalDeliveries}
                />
              </div>
            ) : (
              <div className="flex flex-col w-full animate-in fade-in duration-200">
                <HostelerProfileView
                  user={user}
                  community={community}
                  room={membership?.room || ""}
                  onOpenClusterModal={() => setIsClusterModalOpen(true)}
                  onSignOut={handleLogout}
                />
              </div>
            )}
          </main>

          <Footer />

          <QuickPostModal
            isOpen={isPostModalOpen}
            onClose={() => setIsPostModalOpen(false)}
            onAddOrder={handleAddOrder}
            defaultPickup={community.gateLocation}
            defaultRoom={membership?.room || "Room"}
          />

          <SwitchClusterModal
            isOpen={isClusterModalOpen}
            onClose={() => setIsClusterModalOpen(false)}
            memberships={memberships}
            currentCommunityId={community.id}
            onSelectCommunity={setCommunityId}
            onJoin={async (code, room) => {
              await communityApi.join({ code, room });
              await refreshMe();
            }}
          />
        </>
      )}
    </div>
  );
}
