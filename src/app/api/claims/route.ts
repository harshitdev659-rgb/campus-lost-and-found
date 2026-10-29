import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { verifySubmittedAnswer, MAX_CLAIM_ATTEMPTS } from "@/lib/verification";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const submitClaimSchema = z.object({
  reportId: z.string().uuid("Invalid report ID"),
  claimantNotes: z.string().min(5, "Please explain why this item belongs to you").max(1000),
  proofImageUrl: z.string().optional(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.string().min(1, "Answer cannot be blank"),
    })
  ).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const parseResult = submitClaimSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { reportId, claimantNotes, proofImageUrl, answers = [] } = parseResult.data;

    // Fetch report with verification questions
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        verificationQuestions: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot submit an ownership claim on your own report." },
        { status: 400 }
      );
    }

    if (report.status === "RESOLVED" || report.status === "CLOSED" || report.status === "HIDDEN") {
      return NextResponse.json(
        { error: `This item is ${report.status.toLowerCase()} and cannot be claimed.` },
        { status: 400 }
      );
    }

    // Check existing claims by this user on this report
    const existingClaim = await prisma.claim.findFirst({
      where: {
        reportId,
        claimantId: user.id,
      },
      include: { responses: true },
    });

    if (existingClaim) {
      if (existingClaim.status === "PENDING" || existingClaim.status === "UNDER_REVIEW") {
        return NextResponse.json(
          {
            error: "You already have an active claim under review for this item.",
            claimId: existingClaim.id,
          },
          { status: 409 }
        );
      }

      if (existingClaim.status === "APPROVED" || existingClaim.status === "COMPLETED") {
        return NextResponse.json(
          {
            error: "Your claim has already been approved for this item.",
            claimId: existingClaim.id,
          },
          { status: 409 }
        );
      }

      // Check max attempt rate limit on rejected claims
      if (existingClaim.attemptCount >= MAX_CLAIM_ATTEMPTS) {
        return NextResponse.json(
          {
            error: `You have reached the maximum allowed verification attempts (${MAX_CLAIM_ATTEMPTS}) for this item. Please contact campus security or administration directly.`,
          },
          { status: 429 }
        );
      }
    }

    // Process submitted answers against verification questions
    const questionMap = new Map(report.verificationQuestions.map((q) => [q.id, q]));
    const processedResponses: { questionId: string; submittedAnswer: string; isVerifiedMatch: boolean }[] = [];

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      let isMatch = false;
      if (q.expectedAnswerHash) {
        // Compare with stored bcrypt hash
        isMatch = await verifySubmittedAnswer(ans.answer, q.expectedAnswerHash);
      }

      processedResponses.push({
        questionId: q.id,
        submittedAnswer: ans.answer.trim(),
        isVerifiedMatch: isMatch,
      });
    }

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      let claim;
      if (existingClaim && existingClaim.status === "REJECTED") {
        // Clean old responses
        await tx.claimResponse.deleteMany({ where: { claimId: existingClaim.id } });

        claim = await tx.claim.update({
          where: { id: existingClaim.id },
          data: {
            status: "PENDING",
            claimantNotes: claimantNotes.trim(),
            proofImageUrl: proofImageUrl || null,
            attemptCount: existingClaim.attemptCount + 1,
            reviewerNotes: null,
            responses: {
              create: processedResponses,
            },
          },
        });
      } else {
        claim = await tx.claim.create({
          data: {
            reportId,
            claimantId: user.id,
            status: "PENDING",
            claimantNotes: claimantNotes.trim(),
            proofImageUrl: proofImageUrl || null,
            attemptCount: 1,
            responses: {
              create: processedResponses,
            },
          },
        });
      }

      // Create notification for finder (item reporter)
      await tx.notification.create({
        data: {
          userId: report.userId,
          type: "CLAIM_SUBMITTED",
          title: "New Claim Received",
          message: `${user.name} has submitted an ownership claim for your found listing: "${report.title}".`,
          linkUrl: `/dashboard/claims/${claim.id}`,
        },
      });

      return claim;
    });

    await logAuditEvent({
      actorId: user.id,
      action: "SUBMIT_CLAIM",
      targetType: "CLAIM",
      targetId: result.id,
      metadata: { reportId, attempt: result.attemptCount },
    });

    return NextResponse.json(
      {
        message: "Claim submitted successfully. The finder or campus administrator will review your verification answers.",
        claimId: result.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Submit claim error:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit claim.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
