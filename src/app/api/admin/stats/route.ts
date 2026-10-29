import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const [
      totalUsers,
      totalReports,
      activeReports,
      resolvedReports,
      totalClaims,
      pendingClaims,
      pendingModeration,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: "ACTIVE" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.claim.count(),
      prisma.claim.count({ where: { status: "PENDING" } }),
      prisma.moderationReport.count({ where: { status: "PENDING" } }),
      prisma.auditEvent.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalReports,
        activeReports,
        resolvedReports,
        totalClaims,
        pendingClaims,
        pendingModeration,
      },
      recentAuditLogs,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load admin stats";
    return NextResponse.json({ error: msg }, { status: error instanceof Error && error.message.includes("Forbidden") ? 403 : 401 });
  }
}
