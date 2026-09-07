import React, { useState } from "react";
import {
  ShieldCheck,
  Star,
  Building2,
  Wallet,
  Sparkles,
  Bell,
  Clock,
  Copy,
  Check,
  LogOut,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { ApiCommunity, ApiUser } from "../lib/api";

interface HostelerProfileViewProps {
  user: ApiUser;
  community: ApiCommunity;
  room: string;
  onOpenClusterModal: () => void;
  onSignOut: () => void;
}

export const HostelerProfileView: React.FC<HostelerProfileViewProps> = ({
  user,
  community,
  room,
  onOpenClusterModal,
  onSignOut,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(community.code);
    setCopiedCode(true);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e2bfb2]/30">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#a33900] font-bold">
            Hosteler profile
          </span>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-[#1e1b18] tracking-tight">
            Your room, runs, and rewards
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#e2bfb2]/30">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-2xl bg-[#a33900] text-white flex items-center justify-center font-['Outfit'] text-3xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="font-['Outfit'] text-2xl font-bold">{user.name}</h2>
                <p className="text-sm text-[#5a4138]">{user.phone}</p>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#fea619] text-[#fea619]" />
                    {user.rating}
                  </span>
                  <span className="text-[#5a4138]">{room || "Room not set"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#e2bfb2]/30">
            <span className="text-[10px] uppercase text-[#855300] font-bold tracking-wider">
              Runner earnings
            </span>
            <h3 className="font-['Outfit'] text-lg font-bold">Tracked on this community board</h3>
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-xl bg-[#faf2ed]">
                <span className="text-xs text-[#5a4138]">Total earned</span>
                <div className="font-['Outfit'] text-3xl text-[#a33900] font-bold">₹{user.totalEarned}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#eee7e1]">
                <span className="text-xs text-[#5a4138]">Deliveries</span>
                <div className="font-['Outfit'] text-3xl font-bold">{user.totalDeliveries}</div>
              </div>
            </div>
            <p className="text-xs text-[#5a4138] flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              UPI payout is not wired yet. Pay the runner in person for now.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-[#e2bfb2]/30">
              <Sparkles className="w-4 h-4 text-[#a33900]" />
              <div className="font-['Outfit'] text-3xl font-bold mt-3">{user.totalDeliveries}</div>
              <div className="text-xs text-[#5a4138] font-semibold">Deliveries done</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e2bfb2]/30">
              <Bell className="w-4 h-4 text-[#855300]" />
              <div className="font-['Outfit'] text-3xl font-bold mt-3">{user.totalPosted}</div>
              <div className="text-xs text-[#5a4138] font-semibold">Requests posted</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e2bfb2]/30">
              <Clock className="w-4 h-4 text-[#006947]" />
              <div className="font-['Outfit'] text-3xl font-bold mt-3">★{user.rating}</div>
              <div className="text-xs text-[#5a4138] font-semibold">Peer rating</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e2bfb2]/30">
              <ShieldCheck className="w-4 h-4 text-[#a33900]" />
              <div className="font-['Outfit'] text-3xl font-bold mt-3">Live</div>
              <div className="text-xs text-[#5a4138] font-semibold">Community node</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e2bfb2]/30 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#a33900] text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#a33900] font-bold">Community</span>
                  <h3 className="font-['Outfit'] text-base font-bold">{community.name}</h3>
                  <p className="text-xs text-[#5a4138]">{community.gateLocation}</p>
                </div>
              </div>
              <button
                onClick={onOpenClusterModal}
                className="px-3 py-1.5 rounded-lg bg-[#eee7e1] text-xs font-semibold"
              >
                Switch
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#eee7e1]">
              <div>
                <span className="text-[10px] uppercase text-[#5a4138] font-bold">Invite code</span>
                <div className="font-['Outfit'] text-base font-bold text-[#a33900]">{community.code}</div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-white text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-[#5a4138]">{community.memberCount} members</p>
            <button
              onClick={onSignOut}
              className="px-3 py-2 rounded-xl bg-[#eee7e1] text-[#ba1a1a] text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
