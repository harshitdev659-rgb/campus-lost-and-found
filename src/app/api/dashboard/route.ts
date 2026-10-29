import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);

    const [
      myLostReports,
      myFoundReports,
      incomingClaims,
      mySubmittedClaims,
      savedListings,
      recentActivity,
    ] = await Promise.all([
      // 1. My Lost Reports
      prisma.report.findMany({
        where: { userId: user.id, type: "LOST" },
        include: {
          _count: { select: { claims: true, savedBy: true } },
        },
        orderBy: { createdAt: "desc" },
      }),

      // 2. My Found Reports
      prisma.report.findMany({
        where: { userId: user.id, type: "FOUND" },
        include: {
          _count: { select: { claims: true, savedBy: true } },
          claims: {
            select: { id: true, status: true, claimant: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // 3. Incoming claims on my found items
      prisma.claim.findMany({
        where: {
          report: { userId: user.id },
        },
        include: {
          report: { select: { id: true, title: true, category: true, imageUrl: true } },
          claimant: { select: { id: true, name: true, collegeDomain: true } },
        },
        orderBy: { createdAt: "desc" },
      }),

      // 4. Claims I submitted
      prisma.claim.findMany({
        where: { claimantId: user.id },
        include: {
          report: {
            select: {
              id: true,
              title: true,
              category: true,
              campusLocation: true,
              imageUrl: true,
              status: true,
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // 5. Saved listings
      prisma.savedListing.findMany({
        where: { userId: user.id },
        include: {
          report: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // 6. Recent notifications
      prisma.notification.findMany({
        where: { userId: user.id },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      myLostReports,
      myFoundReports,
      incomingClaims,
      mySubmittedClaims,
      savedListings: savedListings.map((s) => s.report),
      recentActivity,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load dashboard data";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
