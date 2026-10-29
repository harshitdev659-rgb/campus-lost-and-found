import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth(req);
    const { id } = params;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        report: {
          include: {
            user: {
              select: { id: true, name: true, collegeDomain: true },
            },
          },
        },
        claimant: {
          select: { id: true, name: true, collegeDomain: true, studentId: true },
        },
        responses: {
          include: {
            question: {
              select: { id: true, questionText: true, answerType: true, hint: true },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const isClaimant = claim.claimantId === user.id;
    const isFinder = claim.report.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    // Strict authorization: claimant, finder, or admin only
    if (!isClaimant && !isFinder && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view this private claim." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      claim,
      roleInClaim: isClaimant ? "CLAIMANT" : isFinder ? "FINDER" : "ADMIN",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load claim";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

const updateClaimSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"]),
  reviewerNotes: z.string().optional(),
});

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth(req);
    const { id } = params;
    const body = await req.json();

    const parseResult = updateClaimSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status: newStatus, reviewerNotes } = parseResult.data;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        report: true,
        claimant: { select: { id: true, name: true, email: true } },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const isClaimant = claim.claimantId === user.id;
    const isFinder = claim.report.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    // If claimant wants to CANCEL their own claim
    if (newStatus === "CANCELLED") {
      if (!isClaimant && !isAdmin) {
        return NextResponse.json(
          { error: "Only the claimant or administrator can cancel this claim." },
          { status: 403 }
        );
      }
    } else {
      // For REVIEW, APPROVE, REJECT: finder or admin only
      if (!isFinder && !isAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Only the item finder or campus admin can review or approve this claim." },
          { status: 403 }
        );
      }
    }

    // Atomic state update using transaction
    const updated = await prisma.$transaction(async (tx) => {
      const claimUpdate = await tx.claim.update({
        where: { id },
        data: {
          status: newStatus,
          reviewerNotes: reviewerNotes !== undefined ? reviewerNotes : claim.reviewerNotes,
        },
      });

      // If approved, update report status to PENDING_VERIFICATION / CLAIMED
      if (newStatus === "APPROVED") {
        await tx.report.update({
          where: { id: claim.reportId },
          data: { status: "CLAIMED" },
        });

        // Notify claimant
        await tx.notification.create({
          data: {
            userId: claim.claimantId,
            type: "CLAIM_STATUS_UPDATED",
            title: "Claim Approved! 🎉",
            message: `Your ownership claim for "${claim.report.title}" was approved! You can now arrange a secure campus handover.`,
            linkUrl: `/dashboard/claims/${claim.id}`,
          },
        });
      } else if (newStatus === "REJECTED") {
        // If rejected, ensure report remains active if no other claims approved
        await tx.notification.create({
          data: {
            userId: claim.claimantId,
            type: "CLAIM_STATUS_UPDATED",
            title: "Claim Decision: Not Verified",
            message: `Your claim for "${claim.report.title}" was rejected by the reviewer. Reason: ${
              reviewerNotes || "Verification details did not match."
            }`,
            linkUrl: `/dashboard/claims/${claim.id}`,
          },
        });
      } else if (newStatus === "UNDER_REVIEW") {
        await tx.notification.create({
          data: {
            userId: claim.claimantId,
            type: "CLAIM_STATUS_UPDATED",
            title: "Claim Under Review",
            message: `Your claim for "${claim.report.title}" is currently being examined by the reviewer.`,
            linkUrl: `/dashboard/claims/${claim.id}`,
          },
        });
      }

      return claimUpdate;
    });

    await logAuditEvent({
      actorId: user.id,
      action: `CLAIM_${newStatus}`,
      targetType: "CLAIM",
      targetId: id,
      metadata: { reportId: claim.reportId, newStatus, reviewerNotes },
    });

    return NextResponse.json({
      claim: updated,
      message: `Claim status successfully updated to ${newStatus}.`,
    });
  } catch (error: unknown) {
    console.error("Update claim status error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update claim";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
