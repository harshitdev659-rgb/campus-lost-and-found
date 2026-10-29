import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-campus-must-be-min32chars";

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(req?: Request) {
  let token: string | undefined;

  // 1. Try Authorization header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  // 2. Try cookie
  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get("campus_auth_token")?.value;
    } catch {
      // In route handlers or non-cookie contexts
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        collegeDomain: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(req?: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }
  return user;
}

export async function requireAdmin(req?: Request) {
  const user = await requireAuth(req);
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Administrator privileges required.");
  }
  return user;
}
