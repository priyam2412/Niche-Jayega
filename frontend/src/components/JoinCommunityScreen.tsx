import React, { FormEvent, useState } from "react";
import { Building2 } from "lucide-react";

interface JoinCommunityScreenProps {
  onJoin: (code: string, room: string) => Promise<void>;
  onCreate: (name: string, room: string) => Promise<void>;
  onLogout: () => void;
}

export const JoinCommunityScreen: React.FC<JoinCommunityScreenProps> = ({
  onJoin,
  onCreate,
  onLogout,
}) => {
  const [code, setCode] = useState("BLOCKB2024");
  const [room, setRoom] = useState("Room 101");
  const [hostelName, setHostelName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join");
    } finally {
      setBusy(false);
    }
  }

  function join(e: FormEvent) {
    e.preventDefault();
    run(() => onJoin(code, room));
  }

  function create(e: FormEvent) {
    e.preventDefault();
    run(() => onCreate(hostelName, room));
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-lg bg-white/95 rounded-3xl border border-[#e2bfb2]/50 shadow-xl p-7 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#a33900] text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-['Outfit'] text-2xl font-bold">Join your hostel</h1>
            <p className="text-xs text-[#5a4138]">Use the code from your wing / PG admin.</p>
          </div>
        </div>

        {error && <p className="text-xs text-[#ba1a1a]">{error}</p>}

        <form onSubmit={join} className="flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Community code"
            className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-sm font-bold tracking-wide"
            required
          />
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Your room"
            className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-sm"
          />
          <button
            disabled={busy}
            className="h-11 rounded-xl bg-[#a33900] text-white font-semibold disabled:opacity-50"
          >
            Join community
          </button>
        </form>

        <form onSubmit={create} className="flex flex-col gap-3 pt-2 border-t border-[#e2bfb2]/40">
          <p className="text-xs font-bold uppercase text-[#5a4138]">Or create one</p>
          <input
            value={hostelName}
            onChange={(e) => setHostelName(e.target.value)}
            placeholder="Hostel / PG name"
            required
            className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-sm"
          />
          <button
            disabled={busy}
            className="h-11 rounded-xl bg-[#1e1b18] text-white font-semibold disabled:opacity-50"
          >
            Create community
          </button>
        </form>

        <button onClick={onLogout} className="text-xs text-[#ba1a1a] font-semibold">
          Sign out
        </button>
      </div>
    </div>
  );
};
