import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        collegeDomain: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: { reports: true, claims: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load users";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

const updateUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["STUDENT", "STAFF", "ADMIN"]).optional(),
  isVerified: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();

    const parseResult = updateUserSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 });
    }

    const { userId, role, isVerified } = parseResult.data;

    // Prevent removing your own admin access
    if (userId === admin.id && role && role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot revoke your own administrator role." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role !== undefined ? role : undefined,
        isVerified: isVerified !== undefined ? isVerified : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    await logAuditEvent({
      actorId: admin.id,
      action: "UPDATE_USER_PERMISSIONS",
      targetType: "USER",
      targetId: userId,
      metadata: { newRole: role, isVerified },
    });

    return NextResponse.json({ user: updated, message: "User status updated" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
