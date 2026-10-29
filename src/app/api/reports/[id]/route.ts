import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const currentUser = await getAuthUser(req);

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            collegeDomain: true,
            role: true,
          },
        },
        verificationQuestions: {
          select: {
            id: true,
            questionText: true,
            answerType: true,
            hint: true,
            isRequired: true,
            orderIndex: true,
            // SECURITY: Never include expectedAnswerHash in response
          },
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            claims: true,
            savedBy: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const isOwner = currentUser?.id === report.userId;
    const isAdmin = currentUser?.role === "ADMIN";

    // Privacy & safety checks:
    // 1. If report is HIDDEN and user is not admin, deny
    if (report.status === "HIDDEN" && !isAdmin) {
      return NextResponse.json({ error: "This report has been hidden by moderators." }, { status: 403 });
    }

    // 2. Only owner or admin can see distinguishingFeatures
    const sanitizedReport = {
      ...report,
      distinguishingFeatures: isOwner || isAdmin ? report.distinguishingFeatures : undefined,
      hasDistinguishingFeatures: !!report.distinguishingFeatures,
    };

    // Check if current user has saved this listing or already submitted a claim
    let isSaved = false;
    let userClaimId: string | null = null;
    let userClaimStatus: string | null = null;

    if (currentUser) {
      const [saved, claim] = await Promise.all([
        prisma.savedListing.findUnique({
          where: {
            userId_reportId: {
              userId: currentUser.id,
              reportId: id,
            },
          },
        }),
        prisma.claim.findFirst({
          where: {
            reportId: id,
            claimantId: currentUser.id,
          },
          select: { id: true, status: true },
        }),
      ]);
      isSaved = !!saved;
      if (claim) {
        userClaimId = claim.id;
        userClaimStatus = claim.status;
      }
    }

    return NextResponse.json({
      report: sanitizedReport,
      isOwner,
      isSaved,
      userClaimId,
      userClaimStatus,
    });
  } catch (error) {
    console.error("Get report detail error:", error);
    return NextResponse.json({ error: "Failed to fetch report details" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth(req);
    const { id } = params;
    const body = await req.json();

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const isOwner = report.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to update this report." },
        { status: 403 }
      );
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        category: body.category !== undefined ? body.category : undefined,
        campusLocation: body.campusLocation !== undefined ? body.campusLocation : undefined,
        building: body.building !== undefined ? body.building : undefined,
        room: body.room !== undefined ? body.room : undefined,
        status: body.status !== undefined ? body.status : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
      },
    });

    await logAuditEvent({
      actorId: user.id,
      action: "UPDATE_REPORT",
      targetType: "REPORT",
      targetId: id,
      metadata: { fieldsUpdated: Object.keys(body) },
    });

    return NextResponse.json({ report: updated, message: "Report updated successfully" });
  } catch (error: unknown) {
    console.error("Update report error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update report";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth(req);
    const { id } = params;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const isOwner = report.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to delete this report." },
        { status: 403 }
      );
    }

    await prisma.report.delete({ where: { id } });

    await logAuditEvent({
      actorId: user.id,
      action: "DELETE_REPORT",
      targetType: "REPORT",
      targetId: id,
    });

    return NextResponse.json({ message: "Report removed successfully" });
  } catch (error: unknown) {
    console.error("Delete report error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete report";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
