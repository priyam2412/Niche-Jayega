import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

// Hardcoded super-admin check or phone check, e.g., your phone number or admin flag
const ADMIN_PHONES = ["+919999999999", "9999999999", "+918888888888"];

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cleanPhone = user.phone.replace(/\D/g, "");
    const isAdmin = ADMIN_PHONES.some((p) => cleanPhone.includes(p.replace(/\D/g, "")));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const [users, communities, requests, memberships] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          rating: true,
          totalDeliveries: true,
          totalPosted: true,
          totalEarned: true,
          createdAt: true,
        },
      }),
      prisma.community.findMany({
        include: {
          _count: { select: { memberships: true, requests: true } },
          createdBy: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.pickupRequest.findMany({
        include: {
          requester: { select: { name: true, phone: true } },
          runner: { select: { name: true, phone: true } },
          community: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.membership.findMany({
        include: {
          user: { select: { name: true, phone: true } },
          community: { select: { name: true } },
        },
      }),
    ]);

    const stats = {
      totalUsers: users.length,
      totalCommunities: communities.length,
      totalRequests: requests.length,
      totalVolumeEarned: users.reduce((acc, u) => acc + u.totalEarned, 0),
    };

    return NextResponse.json({
      stats,
      users,
      communities,
      requests,
      memberships,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cleanPhone = user.phone.replace(/\D/g, "");
    const isAdmin = ADMIN_PHONES.some((p) => cleanPhone.includes(p.replace(/\D/g, "")));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, targetId, data } = body;

    if (action === "delete_user") {
      await prisma.user.delete({ where: { id: targetId } });
      return NextResponse.json({ success: true, message: "User deleted" });
    }

    if (action === "delete_request") {
      await prisma.pickupRequest.delete({ where: { id: targetId } });
      return NextResponse.json({ success: true, message: "Request deleted" });
    }

    if (action === "delete_community") {
      await prisma.community.delete({ where: { id: targetId } });
      return NextResponse.json({ success: true, message: "Community deleted" });
    }

    if (action === "update_request_status") {
      await prisma.pickupRequest.update({
        where: { id: targetId },
        data: { status: data.status },
      });
      return NextResponse.json({ success: true, message: "Request status updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
