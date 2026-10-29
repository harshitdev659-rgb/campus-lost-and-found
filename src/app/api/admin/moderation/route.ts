import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const moderationReports = await prisma.moderationReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        report: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        reporter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ moderationReports });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load moderation requests";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

const modActionSchema = z.object({
  reportId: z.string().uuid(),
  moderationId: z.string().uuid(),
  action: z.enum(["HIDE_REPORT", "RESTORE_REPORT", "DISMISS_FLAG"]),
  adminNotes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();

    const parseResult = modActionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 });
    }

    const { reportId, moderationId, action, adminNotes } = parseResult.data;

    if (action === "HIDE_REPORT") {
      await prisma.$transaction([
        prisma.report.update({
          where: { id: reportId },
          data: { status: "HIDDEN" },
        }),
        prisma.moderationReport.update({
          where: { id: moderationId },
          data: { status: "REVIEWED" },
        }),
      ]);

      await logAuditEvent({
        actorId: admin.id,
        action: "MODERATION_HIDE_REPORT",
        targetType: "REPORT",
        targetId: reportId,
        metadata: { adminNotes },
      });

      return NextResponse.json({ message: "Listing hidden from campus public view." });
    }

    if (action === "RESTORE_REPORT") {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "ACTIVE" },
      });

      await logAuditEvent({
        actorId: admin.id,
        action: "MODERATION_RESTORE_REPORT",
        targetType: "REPORT",
        targetId: reportId,
      });

      return NextResponse.json({ message: "Listing restored to active status." });
    }

    if (action === "DISMISS_FLAG") {
      await prisma.moderationReport.update({
        where: { id: moderationId },
        data: { status: "DISMISSED" },
      });

      await logAuditEvent({
        actorId: admin.id,
        action: "MODERATION_DISMISS_FLAG",
        targetType: "REPORT",
        targetId: reportId,
      });

      return NextResponse.json({ message: "Flag dismissed." });
    }

    return NextResponse.json({ error: "Invalid moderation action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Moderation action failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
