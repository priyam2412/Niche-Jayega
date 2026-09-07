import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  Building,
  TrendingUp,
  ShieldCheck,
  Search,
  ArrowUpDown,
  History,
  Copy,
  Check,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertTriangle,
  Flame,
  Zap,
  Repeat,
  RotateCcw,
  Film,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Campus3DScene } from './Campus3DScene';
import { CampusHero3D } from './CampusHero3D';
import { Card3DTilt } from './Card3DTilt';
import { CampusFlythroughModal } from './CampusFlythroughModal';
import { OrderItem } from '../types';

interface CampusMeshViewProps {
  orders: OrderItem[];
  currentUserId: string;
  onOpenPostModal: () => void;
  onOpenClusterModal: () => void;
  onAcceptPickup: (order: OrderItem) => Promise<void>;
  onConfirmHandover: (order: OrderItem) => Promise<void>;
  currentCluster: string;
  communityCode: string;
  memberCount: number;
  earnedAmount: number;
  deliveriesDone: number;
}

export const CampusMeshView: React.FC<CampusMeshViewProps> = ({
  orders,
  currentUserId,
  onOpenPostModal,
  onOpenClusterModal,
  onAcceptPickup,
  onConfirmHandover,
  currentCluster,
  communityCode,
  memberCount,
  earnedAmount,
  deliveriesDone,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'swiggy' | 'zomato' | 'quick' | 'high_bounty'>('all');
  const [activeTab, setActiveTab] = useState<'gate' | 'progress' | 'delivered'>('gate');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByTip, setSortByTip] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(orders[0] ?? null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [inspectorFlash, setInspectorFlash] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFlythroughOpen, setIsFlythroughOpen] = useState(false);

  useEffect(() => {
    setSelectedOrder((current) => {
      if (!current) return orders[0] ?? null;
      return orders.find((o) => o.id === current.id) ?? orders[0] ?? null;
    });
  }, [orders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(communityCode);
    setCopiedToken(true);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleInstantUpiPay = () => {
    showToast('UPI payout is not live yet. Reward is tracked on your profile.');
  };

  const handleSelectOrder = (order: OrderItem) => {
    setSelectedOrder(order);
    setInspectorFlash(true);
    setTimeout(() => setInspectorFlash(false), 600);
  };

  const handleClaim = async (order: OrderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onAcceptPickup(order);
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
      setSelectedOrder({ ...order, status: 'in_transit', backendStatus: 'accepted' });
      showToast(`Trip for ${order.title} claimed. Head to the gate.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not accept');
    }
  };

  const handleHandover = async () => {
    if (!selectedOrder) return;
    try {
      await onConfirmHandover(selectedOrder);
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
      showToast(`Delivered. ₹${selectedOrder.bounty} added to runner earnings.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not complete handover');
    }
  };

  // Filter and Sort Logic
  const filteredOrders = orders.filter((o) => {
    // Tab filter
    if (activeTab === 'gate' && o.status !== 'gate_drop') return false;
    if (activeTab === 'progress' && o.status !== 'in_transit') return false;
    if (activeTab === 'delivered' && o.status !== 'delivered') return false;

    // Sidebar filter
    if (selectedFilter === 'swiggy' && o.platform !== 'swiggy') return false;
    if (selectedFilter === 'zomato' && o.platform !== 'zomato') return false;
    if (selectedFilter === 'high_bounty' && o.bounty < 40) return false;
    if (selectedFilter === 'quick' && o.timeAgo.includes('10m')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = o.title.toLowerCase().includes(q);
      const matchDesc = o.description.toLowerCase().includes(q);
      const matchDrop = o.dropLocation.toLowerCase().includes(q);
      const matchCustomer = o.customerName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDrop && !matchCustomer) return false;
    }

    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortByTip) return b.bounty - a.bounty;
    return 0;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      {/* 3D Interactive Campus Spatial Mesh Hero Arena */}
      <CampusHero3D
        currentCluster={currentCluster}
        onOpenPostModal={onOpenPostModal}
      />

      <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
        {/* COLUMN 1: Quick Actions & Filtering (280px) */}
        <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-5">
        {/* Community Card */}
        <Card3DTilt intensity={7} className="rounded-2xl">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2bfb2]/30 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#855300] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#855300]" />
                Your Living Hub
              </span>
              <h2 className="font-['Outfit'] text-xl text-[#1e1b18] font-bold mt-0.5">
                {currentCluster}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[#5a4138]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006947] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006947]" />
                </span>
                <span>{memberCount} hostellers in this community</span>
              </div>
            </div>

            <button
              onClick={onOpenClusterModal}
              className="p-1.5 rounded-lg hover:bg-[#faf2ed] text-[#5a4138] transition-transform hover:rotate-180 duration-300 cursor-pointer"
              title="Switch Hostel"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Campus Room Token Box */}
          <div
            onClick={handleCopyToken}
            className="p-3 rounded-xl bg-[#faf2ed] hover:bg-[#f4ece7] border border-[#e2bfb2]/30 flex items-center justify-between group cursor-pointer transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#5a4138] font-bold">
                Campus Room Token
              </span>
              <span className="font-['Outfit'] text-sm text-[#a33900] font-bold">
                #{communityCode}
              </span>
            </div>
            <button className="text-[#a33900] hover:text-[#cc4900] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer">
              <span>{copiedToken ? 'Copied' : 'Copy'}</span>
              {copiedToken ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>

          <button
            onClick={onOpenPostModal}
            className="w-full h-11 rounded-xl bg-[#a33900] hover:bg-[#cc4900] text-white font-['Outfit'] text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Post Pickup Request</span>
          </button>
        </div>
        </Card3DTilt>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2bfb2]/30 flex flex-col gap-2 tilt-card">
          <div className="px-1 py-0.5 flex items-center justify-between">
            <span className="text-[11px] uppercase text-[#5a4138] font-bold">
              Filter By Source
            </span>
            <button
              onClick={() => setSelectedFilter('all')}
              className="text-xs text-[#855300] font-semibold cursor-pointer hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-[#f4ece7] text-[#1e1b18] translate-x-0.5'
                  : 'text-[#5a4138] hover:bg-[#faf2ed]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#a33900]" />
                <span>All Active Requests</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#a33900] text-white text-[10px] font-bold">
                {orders.filter((o) => o.status === 'gate_drop').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('swiggy')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                selectedFilter === 'swiggy'
                  ? 'bg-[#f4ece7] font-semibold text-[#1e1b18]'
                  : 'text-[#5a4138] hover:bg-[#faf2ed]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fea619]" />
                <span>Swiggy Orders</span>
              </div>
              <span className="text-xs text-[#8e7166] font-semibold">
                {orders.filter((o) => o.platform === 'swiggy').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('zomato')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                selectedFilter === 'zomato'
                  ? 'bg-[#f4ece7] font-semibold text-[#1e1b18]'
                  : 'text-[#5a4138] hover:bg-[#faf2ed]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#cc4900]" />
                <span>Zomato Food</span>
              </div>
              <span className="text-xs text-[#8e7166] font-semibold">
                {orders.filter((o) => o.platform === 'zomato').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('quick')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                selectedFilter === 'quick'
                  ? 'bg-[#f4ece7] font-semibold text-[#1e1b18]'
                  : 'text-[#5a4138] hover:bg-[#faf2ed]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#006947]" />
                <span>Quick Gate Drop (&lt;5m)</span>
              </div>
              <span className="text-xs text-[#8e7166] font-semibold">
                {orders.filter((o) => o.timeAgo.includes('m ago') || o.timeAgo === 'just now').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('high_bounty')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                selectedFilter === 'high_bounty'
                  ? 'bg-[#f4ece7] font-semibold text-[#1e1b18]'
                  : 'text-[#5a4138] hover:bg-[#faf2ed]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-[#855300]" />
                <span>High Bounty (₹40+)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ffddb8] text-[#2a1700] text-[10px] font-bold">
                {orders.filter((o) => o.bounty >= 40).length}
              </span>
            </button>
          </div>
        </div>

        {/* 3D Flow Cinematic Card (Exterior -> Entrance -> Corridor -> Youth Hub) */}
        <Card3DTilt intensity={7} className="rounded-2xl">
          <div
            onClick={() => setIsFlythroughOpen(true)}
            className="rounded-2xl p-4 bg-gradient-to-br from-[#1c1917] via-[#291811] to-[#3f190d] text-white shadow-md border border-amber-500/20 flex flex-col gap-2.5 relative overflow-hidden cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-[#fea619]/20 text-[#fea619] border border-[#fea619]/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fea619] animate-ping" />
                3D Flow Experience
              </span>
              <Film className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>

            <div className="flex flex-col">
              <h4 className="font-['Outfit'] text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Exterior ➔ Corridor ➔ Youth Hub
              </h4>
              <p className="text-[11px] text-stone-300 leading-tight mt-0.5">
                Cinematic flythrough: Gate 1 turnstiles, 3rd floor hallway, into the late-night hostel room with hot chai & code.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
              <span className="text-stone-400 font-mono text-[10px]">4 3D Stages</span>
              <span className="text-[#fea619] font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Launch 3D Journey ➔
              </span>
            </div>
          </div>
        </Card3DTilt>

        {/* Runner Earnings Widget with 3D Coin Floating Effect */}
        <Card3DTilt intensity={8} className="rounded-2xl">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2bfb2]/30 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase text-[#5a4138] font-bold">
              Night Runner Escrow
            </span>
            <div className="w-7 h-7 rounded-full bg-[#ffddb8]/60 flex items-center justify-center">
              <span className="font-['Outfit'] text-[#855300] font-bold text-xs animate-coin-spin">
                ₹
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-['Outfit'] text-3xl font-bold text-[#1e1b18] leading-none">
              ₹{earnedAmount}
            </span>
            <span className="text-xs text-[#006947] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +₹85/hr
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5a4138]">
            <span>{deliveriesDone} trips completed</span>
            <span>Avg ₹{deliveriesDone ? Math.round(earnedAmount / Math.max(deliveriesDone, 1)) : 0}/drop</span>
          </div>

          <div className="w-full bg-[#f4ece7] rounded-full h-2 overflow-hidden p-0.5">
            <div className="bg-gradient-to-r from-[#855300] to-[#fea619] h-full rounded-full w-[70%] transition-all shadow-sm" />
          </div>

          <span className="text-[11px] text-[#5a4138] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#855300]" />
            ₹60 more to unlock "Midnight Marathoner" bonus
          </span>

          <div className="pt-2 flex gap-2">
            <button
              onClick={handleInstantUpiPay}
              className="flex-1 py-2 px-3 rounded-xl bg-[#eee7e1] hover:bg-[#e9e1dc] text-xs font-bold text-[#1e1b18] transition-all active:scale-95 cursor-pointer"
            >
              Instant UPI Pay
            </button>
            <button
              onClick={() => showToast('Escrow ledger synchronized with campus node.')}
              className="py-2 px-3 rounded-xl bg-[#faf2ed] hover:bg-[#f4ece7] text-xs text-[#5a4138] transition-colors cursor-pointer"
              title="Earnings History"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
        </Card3DTilt>

        {/* Floor Safety Tips */}
        <div className="p-4 rounded-2xl bg-[#faf2ed] border border-[#e2bfb2]/40 text-[#5a4138] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#a33900] shrink-0 mt-0.5 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#1e1b18]">
              Double OTP Check
            </span>
            <p className="text-[11px] leading-relaxed mt-0.5 text-[#5a4138]">
              Never hand over hot orders without matching the last 2 digits of the customer's room code.
            </p>
          </div>
        </div>
      </aside>

      {/* COLUMN 2: Main Live Feed (Flex 1) */}
      <section className="flex-1 w-full min-w-0 flex flex-col gap-5">
        {/* Top Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2bfb2]/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Segmented Tab Bar */}
          <div className="flex items-center p-1 bg-[#faf2ed] rounded-xl border border-[#e2bfb2]/30">
            <button
              onClick={() => setActiveTab('gate')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'gate'
                  ? 'bg-white text-[#a33900] shadow-sm'
                  : 'text-[#5a4138] hover:text-[#1e1b18]'
              }`}
            >
              <span>Live Gate Drops</span>
              <span className="w-5 h-5 rounded-full bg-[#ffdbce] text-[#370e00] text-[10px] font-bold flex items-center justify-center animate-pulse">
                {orders.filter((o) => o.status === 'gate_drop').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'progress'
                  ? 'bg-white text-[#a33900] shadow-sm'
                  : 'text-[#5a4138] hover:text-[#1e1b18]'
              }`}
            >
              <span>In Progress</span>
              <span className="w-5 h-5 rounded-full bg-[#eee7e1] text-[#5a4138] text-[10px] font-semibold flex items-center justify-center">
                {orders.filter((o) => o.status === 'in_transit').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'delivered'
                  ? 'bg-white text-[#006947] shadow-sm'
                  : 'text-[#5a4138] hover:text-[#1e1b18]'
              }`}
            >
              <span>Delivered</span>
              <span className="text-xs text-[#006947] font-bold">
                {orders.filter((o) => o.status === 'delivered').length}
              </span>
            </button>
          </div>

          {/* Search & Sort Tools */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e7166]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search room, hostel, food..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#faf2ed] text-xs text-[#1e1b18] placeholder:text-[#8e7166] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#a33900]/20 border border-[#e2bfb2]/30"
              />
            </div>

            <button
              onClick={() => setSortByTip(!sortByTip)}
              className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border ${
                sortByTip
                  ? 'bg-[#a33900] text-white border-transparent'
                  : 'bg-[#faf2ed] hover:bg-[#f4ece7] text-[#1e1b18] border-[#e2bfb2]/30'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Highest Tip</span>
            </button>
          </div>
        </div>

        {/* Feed Cards Container */}
        <div className="flex flex-col gap-4">
          {sortedOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 border border-[#e2bfb2]/30">
              <ShoppingBag className="w-10 h-10 text-[#8e7166]" />
              <div className="font-['Outfit'] text-lg font-bold text-[#1e1b18]">
                No Active Requests in this Filter
              </div>
              <p className="text-xs text-[#5a4138]">
                Be the first to publish a late-night gate drop request!
              </p>
              <button
                onClick={onOpenPostModal}
                className="mt-2 px-5 py-2 rounded-xl bg-[#a33900] text-white text-xs font-semibold hover:bg-[#cc4900]"
              >
                Post Pickup Now
              </button>
            </div>
          ) : (
            sortedOrders.map((item) => {
              const isSelected = selectedOrder?.id === item.id;
              const isInTransit = item.status === 'in_transit';
              const isDelivered = item.status === 'delivered';

              if (isInTransit) {
                return (
                  <Card3DTilt key={item.id} intensity={7} onClick={() => handleSelectOrder(item)} className="rounded-2xl cursor-pointer">
                    <div
                      className={`bg-[#33302c] text-[#f7efea] rounded-2xl p-5 shadow-md flex flex-col gap-4 relative overflow-hidden border border-stone-800 ${
                        isSelected ? 'ring-2 ring-[#a33900]' : ''
                      }`}
                    >
                      {/* Running Stripe Bar */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 runner-stripe-bar" />
                      <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#a33900]/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-[#006947] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6ffbbe] animate-ping" />
                            In Transit • Stairs Level 2
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-semibold">
                            Swiggy Instamart
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#ffddb8] font-bold">
                          <Clock className="w-4 h-4 text-[#fea619] animate-spin" />
                          <span>ETA: {item.etaMinutes || 2} mins to door</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-6 flex items-start gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#ffb599] shrink-0 relative">
                            <ShoppingBag className="w-7 h-7" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00855b] border-2 border-[#33302c] animate-ping" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="font-['Outfit'] text-base text-white font-bold truncate animate-dorm-lamp">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#eee7e1] line-clamp-1">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#f4ece7]">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#00855b]" />
                                Runner:{' '}
                                <strong className="text-[#6ffbbe]">
                                  {item.runnerName || 'Kabir M.'} ({item.runnerRoom || 'Room 312'})
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-3 flex flex-col justify-center text-xs">
                          <span className="text-[10px] text-[#eee7e1] uppercase font-bold tracking-wider">
                            Drop Target
                          </span>
                          <span className="font-['Outfit'] text-base text-white font-bold">
                            {item.targetRoom || 'Room 304'}
                          </span>
                          <span className="text-[11px] text-[#e9e1dc]">
                            Handover code pending
                          </span>
                        </div>

                        <div className="md:col-span-3 flex flex-col items-end justify-center gap-1">
                          <div className="w-full p-2 rounded-xl bg-white/10 flex items-center justify-between border border-white/10">
                            <span className="text-[10px] uppercase text-[#eee7e1] font-bold">
                              Handover PIN
                            </span>
                            <span className="font-['Outfit'] text-sm text-[#6ffbbe] font-bold tracking-widest">
                              •• 84
                            </span>
                          </div>
                          <span className="text-[10px] text-[#e9e1dc] text-right">
                            Show only when runner rings bell
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card3DTilt>
                );
              }

              if (isDelivered) {
                return (
                  <Card3DTilt key={item.id} intensity={5} onClick={() => handleSelectOrder(item)} className="rounded-2xl cursor-pointer">
                    <div
                      className={`bg-[#faf2ed] rounded-2xl p-4 transition-all flex items-center justify-between gap-4 border border-[#e2bfb2]/30 ${
                        isSelected ? 'ring-2 ring-[#006947]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#6ffbbe] flex items-center justify-center text-[#002113] shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-['Outfit'] text-sm text-[#1e1b18] font-bold truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00855b] text-white font-bold uppercase">
                              Delivered
                            </span>
                          </div>
                          <span className="text-xs text-[#5a4138] truncate">
                            Delivered to {item.dropLocation}
                            {item.runnerName ? ` by ${item.runnerName}` : ''} · {item.timeAgo}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex flex-col text-right">
                          <span className="font-['Outfit'] text-base text-[#006947] font-bold">
                            +₹{item.bounty}
                          </span>
                          <span className="text-[10px] text-[#5a4138] uppercase font-semibold">
                            Credited
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast('Digital e-receipt verified by campus escrow.');
                          }}
                          className="p-2 rounded-lg hover:bg-[#eee7e1] text-[#8e7166] transition-colors cursor-pointer"
                          title="View Receipt"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card3DTilt>
                );
              }

              // Standard Open Gate Drop Card (e.g. Bikanervala or Burger King)
              return (
                <Card3DTilt key={item.id} intensity={7} onClick={() => handleSelectOrder(item)} className="rounded-2xl cursor-pointer">
                  <div
                    className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group relative overflow-hidden border border-[#e2bfb2]/30 ${
                      isSelected ? 'ring-2 ring-[#a33900]' : ''
                    }`}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#a33900]" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-[#ffdbce] text-[#370e00] text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#a33900] animate-ping" />
                          {item.pickupLocation.includes('Gate 1')
                            ? 'Gate 1 Active Drop'
                            : 'Gate 2 Turnstile'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-[#f4ece7] text-[#5a4138] text-[10px] font-semibold capitalize">
                          {item.platform} • Order {item.orderNumber}
                        </span>
                        {item.gatePassVerified && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#6ffbbe] text-[#002113] text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Gate Pass OK
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[#5a4138] text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Posted {item.timeAgo}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Item spec */}
                      <div className="md:col-span-6 flex items-start gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-[#eee7e1] flex items-center justify-center text-[#a33900] shrink-0 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                          <ShoppingBag className="w-7 h-7" />
                          <span className="absolute bottom-0 inset-x-0 bg-[#a33900]/90 text-white text-[9px] font-bold text-center py-0.5">
                            {item.itemsCount} items
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-['Outfit'] text-base text-[#1e1b18] font-bold truncate group-hover:text-[#a33900] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-[#5a4138] line-clamp-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#8e7166]">
                            <span>{item.customerName}</span>
                            <span>•</span>
                            <span className="text-[#006947] font-semibold">
                              ★ {item.customerRating} ({item.customerRuns} runs)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Route Specs */}
                      <div className="md:col-span-3 flex flex-col justify-center text-xs">
                        <div className="flex items-center gap-1.5 text-[#1e1b18]">
                          <MapPin className="w-3.5 h-3.5 text-[#8e7166]" />
                          <span className="font-semibold">{item.pickupLocation}</span>
                        </div>
                        <div className="h-3 w-0.5 bg-[#e2bfb2] ml-1.5 my-0.5" />
                        <div className="flex items-center gap-1.5 text-[#a33900] font-semibold">
                          <Building className="w-3.5 h-3.5" />
                          <span>{item.dropLocation}</span>
                        </div>
                      </div>

                      {/* Bounty and CTA */}
                      <div className="md:col-span-3 flex flex-row md:flex-col items-end justify-between md:justify-center gap-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] text-[#5a4138] font-bold uppercase">
                            Bounty
                          </span>
                          <span className="font-['Outfit'] text-xl text-[#855300] font-bold flex items-center gap-0.5">
                            <span className="animate-coin-spin text-sm">₹</span>
                            {item.bounty}
                          </span>
                        </div>

                        {item.requesterId === currentUserId ? (
                          <span className="w-full py-2.5 px-4 rounded-xl bg-[#f4ece7] text-[#5a4138] font-['Outfit'] text-xs font-semibold text-center">
                            Your request
                          </span>
                        ) : (
                        <button
                          onClick={(e) => handleClaim(item, e)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#a33900] hover:bg-[#cc4900] text-white font-['Outfit'] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.97] cursor-pointer"
                        >
                          <span>Accept Pickup</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card3DTilt>
              );
            })
          )}
        </div>

        {/* Campus Live Feed Ticker Strip */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2bfb2]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fea619] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#fea619]" />
            </span>
            <span className="text-[11px] uppercase text-[#855300] font-bold tracking-wider">
              Campus Mesh Radar
            </span>
          </div>

          <div className="w-full md:flex-1 md:mx-4 overflow-hidden relative">
            <div className="flex items-center gap-4 text-xs text-[#5a4138] truncate">
              <span className="inline-flex items-center gap-1 shrink-0">
                <strong className="text-[#1e1b18] font-semibold">Aditya (Room 102)</strong>{' '}
                just crossed Gate 1 with 2 orders
              </span>
              <span className="text-[#e2bfb2]">•</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <strong className="text-[#1e1b18] font-semibold">Priya S.</strong> earned{' '}
                <strong className="text-[#855300] font-bold">₹35</strong> at Block C connector
              </span>
              <span className="text-[#e2bfb2]">•</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                Main Gate security shift changed: Guard Deshraj on duty
              </span>
            </div>
          </div>

          <span className="text-[11px] text-[#8e7166] shrink-0">Updated 10s ago</span>
        </div>
      </section>

      {/* COLUMN 3: Right Inspector Drawer & Gate Verification (360px) */}
      <aside className="w-full lg:w-[360px] shrink-0 flex flex-col gap-5">
        <Card3DTilt intensity={4} className="rounded-2xl">
          <div
            id="inspector-card"
            className={`bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative border border-[#e2bfb2]/30 transition-all ${
              inspectorFlash ? 'ring-4 ring-[#a33900]/40' : ''
            }`}
          >
          <div className="flex items-center justify-between pb-1 border-b border-[#e2bfb2]/20">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#5a4138] font-bold">
                Inspection Panel
              </span>
              <h3 className="font-['Outfit'] text-base font-bold text-[#1e1b18]">
                Live Handover Radar
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#ffdbce] text-[#370e00] text-[10px] font-bold uppercase">
              ORDER {selectedOrder?.orderNumber || '—'}
            </span>
          </div>

          {/* Embedded 3D Late-Night Campus Spatial Mesh */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 p-2 border border-stone-800 shadow-inner group">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-stone-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  3D Campus Spatial Mesh
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Rotate 3D
              </span>
            </div>

            <Campus3DScene />

            {/* Badges on 3D viewport */}
            <div className="absolute bottom-4 left-4 pointer-events-none flex flex-col gap-1">
              <div className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-amber-300 font-semibold border border-amber-400/20 flex items-center gap-1">
                Curfew: Gate 1 Barrier
              </div>
              <div className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-stone-300 font-medium border border-white/10 flex items-center gap-1">
                Runner climbing to 4th Floor
              </div>
            </div>

            <div className="absolute bottom-4 right-4 pointer-events-none">
              <div className="px-2.5 py-1 rounded-full bg-[#a33900]/90 backdrop-blur-md text-white text-xs font-bold shadow animate-bounce">
                ₹{selectedOrder?.bounty || 0} Bounty
              </div>
            </div>
          </div>

          {/* 4-Stage Vertical Handover Timeline */}
          <div className="p-3.5 rounded-xl bg-[#faf2ed] border border-[#e2bfb2]/30 flex flex-col gap-3.5">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#006947] text-white flex items-center justify-center font-bold text-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="w-0.5 h-6 bg-[#006947]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#1e1b18]">
                  1. Dropped by Delivery Driver
                </span>
                <span className="text-[11px] text-[#5a4138]">
                  Gate 1 parcel table • 10:48 PM
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#a33900] text-white flex items-center justify-center font-bold text-xs animate-pulse">
                  2
                </div>
                <div className="w-0.5 h-6 bg-[#e2bfb2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#a33900]">
                  2. Peer Runner Assigned
                </span>
                <span className="text-[11px] text-[#5a4138]">
                  {selectedOrder?.runnerName || selectedOrder?.customerName || 'Waiting'} at the gate
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#eee7e1] text-[#5a4138] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div className="w-0.5 h-6 bg-[#e2bfb2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#5a4138]">
                  3. Heading Up Stairs
                </span>
                <span className="text-[11px] text-[#8e7166]">
                  Ascending to 4th Floor Wing B
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#eee7e1] text-[#5a4138] flex items-center justify-center font-bold text-xs">
                  4
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#5a4138]">
                  4. Doorstep Knock & Escrow Release
                </span>
                <span className="text-[11px] text-[#8e7166]">
                  Final OTP verification
                </span>
              </div>
            </div>
          </div>

          {/* Direct Hosteller Contact Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4ece7]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#fea619] text-[#684000] flex items-center justify-center font-['Outfit'] font-bold text-xs">
                RS
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1e1b18]">
                  {selectedOrder?.customerName || 'Hosteller'} (Peer Buyer)
                </span>
                <span className="text-[11px] text-[#5a4138]">
                  {selectedOrder?.dropLocation || 'Room'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => showToast('Calling hosteller room intercom...')}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#a33900] hover:bg-[#a33900] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Direct Intercom Call"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => showToast('Opening corridor secure peer chat...')}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#a33900] hover:bg-[#a33900] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Corridor Chat"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Specific Delivery Instructions */}
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#faf2ed] border border-[#e2bfb2]/30">
            <span className="text-[10px] uppercase font-bold text-[#8e7166]">
              Buyer Delivery Instructions
            </span>
            <p className="text-xs text-[#1e1b18] italic leading-relaxed">
              "{selectedOrder?.instructions || 'No extra instructions.'}"
            </p>
          </div>

          {/* Handover Action Trigger */}
          <div className="pt-1 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5a4138]">Escrow Security Deposit:</span>
              <span className="font-['Outfit'] text-[#1e1b18] font-bold">
                ₹{selectedOrder?.bounty || 0}.00 reward
              </span>
            </div>
            <button
              onClick={handleHandover}
              disabled={
                !selectedOrder ||
                selectedOrder.runnerId !== currentUserId ||
                selectedOrder.status !== 'in_transit'
              }
              className="w-full py-3 rounded-xl bg-[#006947] hover:bg-[#00855b] text-white font-['Outfit'] text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm doorstep handover</span>
            </button>
          </div>
        </div>
        </Card3DTilt>

        {/* Campus Gate Protocols Policy Notice */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2bfb2]/30 flex flex-col gap-2.5 tilt-card">
          <div className="flex items-center gap-2 text-[#855300]">
            <ShieldCheck className="w-5 h-5 text-[#855300]" />
            <span className="font-['Outfit'] text-sm font-bold">
              Campus Gate Protocol
            </span>
          </div>
          <p className="text-xs text-[#5a4138] leading-relaxed">
            Outside commercial delivery executives (Swiggy, Zomato, Blinkit) are strictly barred at Gate 1 and Gate 2 after 10:00 PM by Proctor directive.
          </p>
          <ul className="flex flex-col gap-2 text-xs text-[#5a4138] pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#006947] mt-0.5 shrink-0" />
              <span>Always check student ID tags at main turnstiles.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#006947] mt-0.5 shrink-0" />
              <span>Baggage must be carried in sanitized corridor pouches.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#a33900] mt-0.5 shrink-0" />
              <span>Gate 1 closes completely at 11:30 PM sharp.</span>
            </li>
          </ul>
        </div>
      </aside>
      </div>

      {/* 3D Continuous Cinematic Flythrough Modal */}
      <CampusFlythroughModal
        isOpen={isFlythroughOpen}
        onClose={() => setIsFlythroughOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#33302c] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 text-xs border border-stone-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#6ffbbe]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
