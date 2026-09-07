import React, { useEffect, useState } from 'react';
import { X, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderItem } from '../types';

interface QuickPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: OrderItem) => Promise<void>;
  defaultPickup: string;
  defaultRoom: string;
}

export const QuickPostModal: React.FC<QuickPostModalProps> = ({
  isOpen,
  onClose,
  onAddOrder,
  defaultPickup,
  defaultRoom,
}) => {
  const [platform, setPlatform] = useState<'zomato' | 'swiggy' | 'instamart'>('zomato');
  const [restaurant, setRestaurant] = useState('');
  const [dropPoint, setDropPoint] = useState(defaultPickup);
  const [roomNumber, setRoomNumber] = useState(defaultRoom);
  const [bounty, setBounty] = useState(30);
  const [instructions, setInstructions] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDropPoint(defaultPickup);
    setRoomNumber(defaultRoom);
    setError('');
  }, [isOpen, defaultPickup, defaultRoom]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const newOrder: OrderItem = {
      id: "temp",
      requesterId: "",
      orderNumber: "#NEW",
      platform,
      title: restaurant || "Late Night Canteen",
      description: itemsSummary || "Food & Refreshments",
      customerName: "",
      customerRating: "5",
      customerRuns: 0,
      pickupLocation: dropPoint || defaultPickup || "Main Gate",
      dropLocation: roomNumber,
      bounty: Number(bounty) || 30,
      timeAgo: "just now",
      status: "gate_drop",
      backendStatus: "open",
      itemsCount: 1,
      gatePassVerified: true,
      instructions,
    };

    try {
      await onAddOrder(newOrder);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post request");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      id="quick-post-modal-overlay"
      className="fixed inset-0 z-50 bg-[#33302c]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl flex flex-col gap-5 relative border border-[#e2bfb2]/50 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] uppercase text-[#a33900] font-bold tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a33900]" />
              30-Second Quick Request
            </span>
            <h2 className="font-['Outfit'] text-2xl font-bold text-[#1e1b18] mt-1">
              Need Food from Main Gate?
            </h2>
            <p className="text-xs text-[#5a4138] mt-1">
              A fellow hosteller walking downstairs will bring it to your door.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f4ece7] text-[#5a4138] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Platform selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase text-[#5a4138] font-bold">
              Delivery Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['zomato', 'swiggy', 'instamart'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                    platform === p
                      ? 'bg-[#ffdbce] text-[#370e00] border-[#a33900]/40 shadow-sm'
                      : 'bg-[#faf2ed] hover:bg-[#f4ece7] text-[#1e1b18] border-transparent'
                  }`}
                >
                  {p === 'instamart' ? 'Instamart / Blinkit' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Restaurant / Store & Drop Point */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] uppercase text-[#5a4138] font-bold">
                Restaurant / Store Name
              </label>
              <input
                type="text"
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                required
                placeholder="e.g. Bikanervala, Subway"
                className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-xs font-medium text-[#1e1b18] placeholder:text-[#8e7166] focus:outline-none focus:ring-2 focus:ring-[#a33900]/30 border border-[#e2bfb2]/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] uppercase text-[#5a4138] font-bold">
                Drop Point at Gate
              </label>
              <select
                value={dropPoint}
                onChange={(e) => setDropPoint(e.target.value)}
                className="h-11 px-3 rounded-xl bg-[#faf2ed] text-xs font-medium text-[#1e1b18] focus:outline-none focus:ring-2 focus:ring-[#a33900]/30 border border-[#e2bfb2]/30 cursor-pointer"
              >
                <option>{defaultPickup || "Main Gate"}</option>
                <option>Main Gate</option>
                <option>Side Gate</option>
                <option>North Parcel Table</option>
              </select>
            </div>
          </div>

          {/* Items brief */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase text-[#5a4138] font-bold">
              Ordered Items Summary
            </label>
            <input
              type="text"
              value={itemsSummary}
              onChange={(e) => setItemsSummary(e.target.value)}
              placeholder="e.g. 2x Masala Dosa, Cold Drink"
              className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-xs font-medium text-[#1e1b18] placeholder:text-[#8e7166] focus:outline-none focus:ring-2 focus:ring-[#a33900]/30 border border-[#e2bfb2]/30"
            />
          </div>

          {/* Room Target & Runner Bounty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] uppercase text-[#5a4138] font-bold">
                Your Room Number
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-xs font-bold text-[#1e1b18] focus:outline-none focus:ring-2 focus:ring-[#a33900]/30 border border-[#e2bfb2]/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] uppercase text-[#5a4138] font-bold">
                Runner Bounty (Tip)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-['Outfit'] text-sm text-[#855300] font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={10}
                  max={200}
                  step={5}
                  value={bounty}
                  onChange={(e) => setBounty(Number(e.target.value))}
                  required
                  className="w-full h-11 pl-8 pr-3.5 rounded-xl bg-[#faf2ed] text-xs font-bold text-[#1e1b18] focus:outline-none focus:ring-2 focus:ring-[#a33900]/30 border border-[#e2bfb2]/30"
                />
              </div>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase text-[#5a4138] font-bold">
              Doorstep Handover Instructions
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Leave outside door / Knock gently"
              className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-xs font-medium text-[#1e1b18] placeholder:text-[#8e7166] focus:outline-none focus:ring-2 focus:ring-[#a33900]/30 border border-[#e2bfb2]/30"
            />
          </div>

          {error && <p className="text-xs text-[#ba1a1a]">{error}</p>}

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-[#ffddb8]/40 border border-[#fea619]/40 text-[#2a1700] flex items-center gap-2.5 text-xs">
            <Lock className="w-4 h-4 text-[#855300] shrink-0" />
            <span>
              Reward is recorded on your community board. UPI escrow comes later — pay the runner in person for now.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl hover:bg-[#f4ece7] text-[#5a4138] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-6 py-2.5 rounded-xl bg-[#a33900] hover:bg-[#cc4900] text-white font-['Outfit'] text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{busy ? "Posting…" : `Post pickup (₹${bounty})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
