import React, { FormEvent, useState } from "react";
import { Bike } from "lucide-react";

interface AuthScreenProps {
  onLogin: (phone: string, password: string) => Promise<void>;
  onSignup: (name: string, phone: string, password: string) => Promise<void>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("9876543210");
  const [password, setPassword] = useState("test1234");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") await onSignup(name, phone, password);
      else await onLogin(phone, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-[#e2bfb2]/50 shadow-xl p-7 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#a33900] text-white flex items-center justify-center">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-['Outfit'] text-2xl font-bold text-[#a33900]">Niche Jayega</h1>
            <p className="text-xs text-[#5a4138]">Someone nearby picks up your gate drop.</p>
          </div>
        </div>

        <div className="flex p-1 rounded-full bg-[#faf2ed]">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize ${
                mode === m ? "bg-[#a33900] text-white" : "text-[#5a4138]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-sm border border-[#e2bfb2]/30"
            />
          )}
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-sm border border-[#e2bfb2]/30"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            minLength={4}
            className="h-11 px-3.5 rounded-xl bg-[#faf2ed] text-sm border border-[#e2bfb2]/30"
          />
          {error && <p className="text-xs text-[#ba1a1a]">{error}</p>}
          <button
            disabled={busy}
            className="h-11 rounded-xl bg-[#a33900] text-white font-['Outfit'] font-semibold disabled:opacity-50"
          >
            {busy ? "Working…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="text-[11px] text-[#8e7166] leading-relaxed">
          Demo: Rahul 9876543210 · Priya 9876543211 · Amit 9876543212 · password{" "}
          <strong>test1234</strong>
        </p>
      </div>
    </div>
  );
};
