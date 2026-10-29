import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        action: "FAILED_LOGIN_ATTEMPT",
        targetType: "AUTH",
        targetId: user.id,
        metadata: { email: user.email },
      });

      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await logAuditEvent({
      actorId: user.id,
      action: "USER_LOGIN",
      targetType: "USER",
      targetId: user.id,
      metadata: { email: user.email },
    });

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      collegeDomain: user.collegeDomain,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      message: "Sign in successful",
      user: sanitizedUser,
      token,
    });

    response.cookies.set("campus_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign in." },
      { status: 500 }
    );
  }
}
