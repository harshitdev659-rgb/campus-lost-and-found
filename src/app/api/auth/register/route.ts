import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { isAllowedCampusDomain } from "@/lib/campus-config";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  studentId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, studentId } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check campus domain
    if (!isAllowedCampusDomain(normalizedEmail)) {
      return NextResponse.json(
        {
          error:
            "Registration restricted to recognized university/college email domains. Please use your campus email or contact administration.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this campus email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const domain = normalizedEmail.split("@")[1];

    // Determine initial role: if first user or email matches admin pattern, set role
    const totalUsers = await prisma.user.count();
    const role = totalUsers === 0 || normalizedEmail.startsWith("admin@") ? "ADMIN" : "STUDENT";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        studentId: studentId?.trim() || null,
        collegeDomain: domain,
        passwordHash,
        role,
        isVerified: true, // Configured institutional verification
      },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        collegeDomain: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await logAuditEvent({
      actorId: user.id,
      action: "USER_REGISTER",
      targetType: "USER",
      targetId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    const response = NextResponse.json({
      message: "Registration successful",
      user,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("campus_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
