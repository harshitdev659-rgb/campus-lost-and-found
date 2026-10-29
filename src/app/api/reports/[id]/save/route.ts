import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    const { id } = params;

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_reportId: {
          userId: user.id,
          reportId: id,
        },
      },
    });

    if (existing) {
      await prisma.savedListing.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false, message: "Removed from saved listings" });
    } else {
      await prisma.savedListing.create({
        data: {
          userId: user.id,
          reportId: id,
        },
      });
      return NextResponse.json({ saved: true, message: "Saved to your listings" });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to toggle saved status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
