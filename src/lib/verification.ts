import bcrypt from "bcryptjs";

export const MAX_CLAIM_ATTEMPTS = 5;

/**
 * Normalizes an answer string for consistent matching
 * (e.g., lowercase, removes extra whitespace/punctuation if desired)
 */
export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Hashes an expected verification answer using bcrypt so raw answer is never exposed
 */
export async function hashVerificationAnswer(rawAnswer: string): Promise<string> {
  const normalized = normalizeAnswer(rawAnswer);
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(normalized, salt);
}

/**
 * Compares a claimant's submitted answer against the hashed answer
 */
export async function verifySubmittedAnswer(
  submittedAnswer: string,
  expectedHash: string
): Promise<boolean> {
  const normalized = normalizeAnswer(submittedAnswer);
  return bcrypt.compare(normalized, expectedHash);
}
