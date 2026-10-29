import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    const { id } = params;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { report: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const isAuthorized =
      claim.claimantId === user.id ||
      claim.report.userId === user.id ||
      user.role === "ADMIN";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.claimMessage.findMany({
      where: { claimId: id },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load messages";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    const { id } = params;
    const body = await req.json();

    const parseResult = messageSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 });
    }

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { report: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const isClaimant = claim.claimantId === user.id;
    const isFinder = claim.report.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isClaimant && !isFinder && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recipientId = isClaimant ? claim.report.userId : claim.claimantId;

    const [createdMsg] = await prisma.$transaction([
      prisma.claimMessage.create({
        data: {
          claimId: id,
          senderId: user.id,
          message: parseResult.data.message.trim(),
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      }),
      prisma.notification.create({
        data: {
          userId: recipientId,
          type: "NEW_MESSAGE",
          title: `New message from ${user.name}`,
          message: parseResult.data.message.trim().slice(0, 100),
          linkUrl: `/dashboard/claims/${id}`,
        },
      }),
    ]);

    return NextResponse.json({ message: createdMsg }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
