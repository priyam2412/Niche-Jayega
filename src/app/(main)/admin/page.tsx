"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Users,
  Building2,
  Package,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowLeft,
  DollarSign,
  Activity,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "communities" | "requests">("overview");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("nj_token");
      const res = await fetch("/api/admin", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load admin dashboard");
      }
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function handleAction(action: string, targetId: string, extraData?: any) {
    if (!confirm(`Are you sure you want to perform ${action} on ${targetId}?`)) return;
    try {
      setActionLoading(targetId);
      const token = localStorage.getItem("nj_token");
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, targetId, data: extraData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed");
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#fff8f4] flex items-center justify-center font-['Outfit'] text-[#a33900]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-sm font-semibold">Authenticating Super Admin & Loading Control Center...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fff8f4] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#ba1a1a]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-['Outfit'] text-[#1e1b18] mb-2">Restricted Access</h1>
          <p className="text-sm text-[#5a4138] mb-6">
            {error}. Make sure you are logged into your registered admin account (+919999999999).
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#a33900] text-white font-['Outfit'] font-semibold text-sm hover:bg-[#cc4900] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Campus Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#1e1b18] font-['Manrope'] pb-16">
      {/* Top Banner */}
      <div className="bg-[#1e1b18] text-white pt-6 pb-8 px-4 sm:px-8 border-b border-[#3a3532]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#a33900] flex items-center justify-center text-white shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-['Outfit'] tracking-tight">Niche Jayega Admin Control</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-[#a39893]">
                Full database & platform management vault. All campus clusters, users & active bounties.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Vault</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#a33900] hover:bg-[#cc4900] text-white text-xs font-semibold transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to App</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#e9e1dc] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7a645b] mb-1">Total Users</p>
              <p className="text-3xl font-bold font-['Outfit'] text-[#1e1b18]">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#faf2ed] text-[#a33900] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e9e1dc] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7a645b] mb-1">Clusters</p>
              <p className="text-3xl font-bold font-['Outfit'] text-[#1e1b18]">{stats.totalCommunities}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#faf2ed] text-[#006947] flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e9e1dc] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7a645b] mb-1">Pickup Requests</p>
              <p className="text-3xl font-bold font-['Outfit'] text-[#1e1b18]">{stats.totalRequests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#faf2ed] text-[#fea619] flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e9e1dc] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7a645b] mb-1">Total Vault Earned</p>
              <p className="text-3xl font-bold font-['Outfit'] text-[#855300]">₹{stats.totalVolumeEarned}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#faf2ed] text-[#855300] flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e9e1dc] pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-[#a33900] text-white shadow-sm"
                : "bg-white text-[#5a4138] hover:bg-[#faf2ed] border border-[#e9e1dc]"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Platform Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-[#a33900] text-white shadow-sm"
                : "bg-white text-[#5a4138] hover:bg-[#faf2ed] border border-[#e9e1dc]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Users ({data?.users?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "communities"
                ? "bg-[#a33900] text-white shadow-sm"
                : "bg-white text-[#5a4138] hover:bg-[#faf2ed] border border-[#e9e1dc]"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Campus Clusters ({data?.communities?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "requests"
                ? "bg-[#a33900] text-white shadow-sm"
                : "bg-white text-[#5a4138] hover:bg-[#faf2ed] border border-[#e9e1dc]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>All Orders / Pickups ({data?.requests?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[#e9e1dc] shadow-sm">
              <h3 className="text-lg font-bold font-['Outfit'] mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#a33900]" />
                <span>Recent Platform Activity</span>
              </h3>
              <div className="space-y-3">
                {data?.requests?.slice(0, 5).map((req: any) => (
                  <div key={req.id} className="p-3 rounded-2xl bg-[#faf2ed]/60 border border-[#e9e1dc]/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#1e1b18]">{req.restaurantName} (₹{req.rewardAmount})</p>
                      <p className="text-[#7a645b]">By {req.requester?.name} · {req.community?.name}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white font-semibold text-[#855300] border border-[#e2bfb2]/30">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#e9e1dc] shadow-sm">
              <h3 className="text-lg font-bold font-['Outfit'] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#006947]" />
                <span>Recent Hosteler Signups</span>
              </h3>
              <div className="space-y-3">
                {data?.users?.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="p-3 rounded-2xl bg-[#faf2ed]/60 border border-[#e9e1dc]/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#1e1b18]">{u.name}</p>
                      <p className="text-[#7a645b]">{u.phone} · {u.totalDeliveries} deliveries</p>
                    </div>
                    <span className="font-bold text-[#855300]">₹{u.totalEarned} earned</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-3xl border border-[#e9e1dc] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e9e1dc]">
              <h3 className="text-lg font-bold font-['Outfit']">All Registered Hosteler Users</h3>
              <p className="text-xs text-[#7a645b]">View and manage all registered accounts across campus.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf2ed] text-[#5a4138] border-b border-[#e9e1dc]">
                    <th className="p-4 font-bold">Name & Phone</th>
                    <th className="p-4 font-bold">Rating</th>
                    <th className="p-4 font-bold">Deliveries</th>
                    <th className="p-4 font-bold">Posted</th>
                    <th className="p-4 font-bold">Earned</th>
                    <th className="p-4 font-bold">Joined</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9e1dc]/60">
                  {data?.users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-[#fff8f4]/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-[#1e1b18]">{u.name}</p>
                        <p className="text-[#7a645b]">{u.phone}</p>
                      </td>
                      <td className="p-4 font-semibold text-[#855300]">★ {u.rating}</td>
                      <td className="p-4 font-semibold">{u.totalDeliveries}</td>
                      <td className="p-4 font-semibold">{u.totalPosted}</td>
                      <td className="p-4 font-bold text-emerald-700">₹{u.totalEarned}</td>
                      <td className="p-4 text-[#7a645b]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button
                          disabled={actionLoading === u.id}
                          onClick={() => handleAction("delete_user", u.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#ba1a1a] transition-all cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "communities" && (
          <div className="bg-white rounded-3xl border border-[#e9e1dc] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e9e1dc]">
              <h3 className="text-lg font-bold font-['Outfit']">Campus Clusters & Hostels</h3>
              <p className="text-xs text-[#7a645b]">Manage living clusters and invite codes.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf2ed] text-[#5a4138] border-b border-[#e9e1dc]">
                    <th className="p-4 font-bold">Cluster Name</th>
                    <th className="p-4 font-bold">Invite Code</th>
                    <th className="p-4 font-bold">Gate Location</th>
                    <th className="p-4 font-bold">Members</th>
                    <th className="p-4 font-bold">Requests</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9e1dc]/60">
                  {data?.communities?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-[#fff8f4]/50 transition-colors">
                      <td className="p-4 font-bold text-[#1e1b18]">{c.name}</td>
                      <td className="p-4 font-mono font-bold text-[#a33900]">#{c.code}</td>
                      <td className="p-4 text-[#7a645b]">{c.gateLocation}</td>
                      <td className="p-4 font-semibold">{c._count?.memberships || 0}</td>
                      <td className="p-4 font-semibold">{c._count?.requests || 0}</td>
                      <td className="p-4 text-right">
                        <button
                          disabled={actionLoading === c.id}
                          onClick={() => handleAction("delete_community", c.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#ba1a1a] transition-all cursor-pointer"
                          title="Delete Cluster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-3xl border border-[#e9e1dc] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e9e1dc]">
              <h3 className="text-lg font-bold font-['Outfit']">All Pickup Requests & Orders</h3>
              <p className="text-xs text-[#7a645b]">Monitor and moderate campus food runs.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf2ed] text-[#5a4138] border-b border-[#e9e1dc]">
                    <th className="p-4 font-bold">Restaurant & App</th>
                    <th className="p-4 font-bold">Requester</th>
                    <th className="p-4 font-bold">Runner</th>
                    <th className="p-4 font-bold">Bounty</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9e1dc]/60">
                  {data?.requests?.map((r: any) => (
                    <tr key={r.id} className="hover:bg-[#fff8f4]/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-[#1e1b18]">{r.restaurantName}</p>
                        <p className="text-[#7a645b] uppercase font-semibold text-[10px]">{r.foodApp}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#1e1b18]">{r.requester?.name}</p>
                        <p className="text-[#7a645b]">{r.requester?.phone}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#1e1b18]">{r.runner?.name || "Unassigned"}</p>
                      </td>
                      <td className="p-4 font-bold text-[#855300]">₹{r.rewardAmount}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#faf2ed] font-semibold text-[#855300] border border-[#e2bfb2]/30">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        {r.status !== "delivered" && (
                          <button
                            onClick={() => handleAction("update_request_status", r.id, { status: "delivered" })}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-all cursor-pointer"
                            title="Mark Delivered"
                          >
                            <CheckCircle2 className="w-4 h-4 inline mr-1" />
                            Finish
                          </button>
                        )}
                        <button
                          disabled={actionLoading === r.id}
                          onClick={() => handleAction("delete_request", r.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#ba1a1a] transition-all cursor-pointer"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
