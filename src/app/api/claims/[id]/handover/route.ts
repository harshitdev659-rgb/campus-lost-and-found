import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const handoverScheduleSchema = z.object({
  action: z.enum(["SCHEDULE", "CONFIRM_COMPLETION"]),
  handoverLocation: z.string().optional(),
  handoverTime: z.string().optional(),
  handoverNotes: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    const { id } = params;
    const body = await req.json();

    const parseResult = handoverScheduleSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 });
    }

    const { action, handoverLocation, handoverTime, handoverNotes } = parseResult.data;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        report: true,
        claimant: { select: { id: true, name: true } },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const isClaimant = claim.claimantId === user.id;
    const isFinder = claim.report.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isClaimant && !isFinder && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Not a participant in this claim" }, { status: 403 });
    }

    if (action === "SCHEDULE") {
      if (!handoverLocation) {
        return NextResponse.json({ error: "Please suggest a secure campus meeting location" }, { status: 400 });
      }

      const updated = await prisma.claim.update({
        where: { id },
        data: {
          handoverLocation,
          handoverTime: handoverTime ? new Date(handoverTime) : null,
          handoverNotes: handoverNotes || null,
        },
      });

      const otherUserId = isClaimant ? claim.report.userId : claim.claimantId;
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          type: "HANDOVER_SCHEDULED",
          title: "Handover Proposed",
          message: `${user.name} proposed meeting at ${handoverLocation} for item handover.`,
          linkUrl: `/dashboard/claims/${id}`,
        },
      });

      return NextResponse.json({
        message: "Handover proposal saved.",
        claim: updated,
      });
    }

    if (action === "CONFIRM_COMPLETION") {
      // Must be approved before it can be completed
      if (claim.status !== "APPROVED") {
        return NextResponse.json(
          { error: "Claim must be approved before confirming handover completion." },
          { status: 400 }
        );
      }

      // Finder or Admin can confirm physical return of the item
      if (!isFinder && !isAdmin) {
        return NextResponse.json(
          { error: "Only the finder or administrator can record physical handover completion." },
          { status: 403 }
        );
      }

      const now = new Date();

      // Transaction: mark claim COMPLETED and report RESOLVED
      const [updatedClaim, updatedReport] = await prisma.$transaction([
        prisma.claim.update({
          where: { id },
          data: {
            status: "COMPLETED",
            handoverCompletedAt: now,
            handoverNotes: handoverNotes || claim.handoverNotes,
          },
        }),
        prisma.report.update({
          where: { id: claim.reportId },
          data: {
            status: "RESOLVED",
          },
        }),
        prisma.notification.create({
          data: {
            userId: claim.claimantId,
            type: "HANDOVER_COMPLETED",
            title: "Item Successfully Recovered! 🎓",
            message: `Handover of "${claim.report.title}" confirmed. Thank you for using CampusFind!`,
            linkUrl: `/dashboard/claims/${id}`,
          },
        }),
      ]);

      await logAuditEvent({
        actorId: user.id,
        action: "CONFIRM_HANDOVER_COMPLETION",
        targetType: "CLAIM",
        targetId: id,
        metadata: {
          reportId: claim.reportId,
          completedAt: now.toISOString(),
          claimantId: claim.claimantId,
        },
      });

      return NextResponse.json({
        message: "Handover confirmed and item successfully marked as resolved!",
        claim: updatedClaim,
        report: updatedReport,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to process handover";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
