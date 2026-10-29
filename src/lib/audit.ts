import { prisma } from "./prisma";

export interface LogAuditParams {
  actorId?: string | null;
  action: string;
  targetType: "USER" | "REPORT" | "CLAIM" | "AUTH" | "SYSTEM";
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function logAuditEvent({
  actorId,
  action,
  targetType,
  targetId,
  metadata,
  ipAddress,
}: LogAuditParams) {
  try {
    // Sanitize metadata to remove any passwords, tokens, or raw verification answers
    let sanitizedJson: string | null = null;
    if (metadata) {
      const sanitized = { ...metadata };
      const bannedKeys = [
        "password",
        "passwordHash",
        "token",
        "jwt",
        "secret",
        "expectedAnswer",
        "submittedAnswer",
        "answerHash",
      ];
      
      for (const key of Object.keys(sanitized)) {
        if (bannedKeys.some((banned) => key.toLowerCase().includes(banned.toLowerCase()))) {
          sanitized[key] = "[REDACTED]";
        }
      }
      sanitizedJson = JSON.stringify(sanitized);
    }

    await prisma.auditEvent.create({
      data: {
        actorId: actorId || null,
        action,
        targetType,
        targetId: targetId || null,
        metadata: sanitizedJson,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit event:", error);
  }
}
