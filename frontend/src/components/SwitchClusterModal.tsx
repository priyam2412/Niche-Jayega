import React, { FormEvent, useState } from "react";
import { Building2, CheckCircle, ChevronRight, X } from "lucide-react";
import type { ApiMembership } from "../lib/api";

interface SwitchClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberships: ApiMembership[];
  currentCommunityId: string;
  onSelectCommunity: (id: string) => void;
  onJoin: (code: string, room: string) => Promise<void>;
}

export const SwitchClusterModal: React.FC<SwitchClusterModalProps> = ({
  isOpen,
  onClose,
  memberships,
  currentCommunityId,
  onSelectCommunity,
  onJoin,
}) => {
  const [code, setCode] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  async function join(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onJoin(code, room);
      setCode("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#33302c]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border border-[#e2bfb2]/40">
        <div className="flex items-center justify-between">
          <h3 className="font-['Outfit'] text-xl font-bold text-[#1e1b18]">Switch hostel</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4ece7] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {memberships.map((m) => {
            const isActive = m.community.id === currentCommunityId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelectCommunity(m.community.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl flex items-center justify-between text-left ${
                  isActive
                    ? "bg-[#a33900]/10 border border-[#a33900]/30"
                    : "bg-[#faf2ed] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-[#a33900] text-white" : "bg-[#eee7e1] text-[#5a4138]"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{m.community.name}</div>
                    <div className="text-xs text-[#5a4138]">
                      {m.community.code} · {m.community.memberCount} members
                      {m.room ? ` · ${m.room}` : ""}
                    </div>
                  </div>
                </div>
                {isActive ? (
                  <CheckCircle className="w-5 h-5 text-[#a33900]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#8e7166]" />
                )}
              </button>
            );
          })}
        </div>

        <form onSubmit={join} className="flex flex-col gap-2 pt-2 border-t border-[#e2bfb2]/40">
          <p className="text-xs font-bold uppercase text-[#5a4138]">Join another with code</p>
          {error && <p className="text-xs text-[#ba1a1a]">{error}</p>}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="BLOCKB2024"
            required
            className="h-10 px-3 rounded-xl bg-[#faf2ed] text-sm font-bold"
          />
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Your room"
            className="h-10 px-3 rounded-xl bg-[#faf2ed] text-sm"
          />
          <button
            disabled={busy}
            className="h-10 rounded-xl bg-[#a33900] text-white text-sm font-semibold disabled:opacity-50"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};
