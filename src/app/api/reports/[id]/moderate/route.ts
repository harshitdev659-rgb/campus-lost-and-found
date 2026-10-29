import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const moderateSchema = z.object({
  reason: z.string().min(3, "Please provide a reason"),
  details: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    const { id } = params;
    const body = await req.json();

    const parseResult = moderateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 });
    }

    const { reason, details } = parseResult.data;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const modRecord = await prisma.moderationReport.create({
      data: {
        reportId: id,
        reporterId: user.id,
        reason,
        details: details?.trim() || null,
        status: "PENDING",
      },
    });

    await logAuditEvent({
      actorId: user.id,
      action: "FLAG_REPORT_MODERATION",
      targetType: "REPORT",
      targetId: id,
      metadata: { reason },
    });

    return NextResponse.json({
      message: "Listing reported to campus moderators for review.",
      moderationId: modRecord.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to flag report";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
