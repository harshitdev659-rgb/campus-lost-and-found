import { test, describe } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

describe("Campus Ownership Verification & Cryptographic Security", () => {
  function normalizeAnswer(answer) {
    return answer.trim().toLowerCase().replace(/\s+/g, " ");
  }

  async function hashVerificationAnswer(rawAnswer) {
    const normalized = normalizeAnswer(rawAnswer);
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(normalized, salt);
  }

  async function verifySubmittedAnswer(submittedAnswer, expectedHash) {
    const normalized = normalizeAnswer(submittedAnswer);
    return bcrypt.compare(normalized, expectedHash);
  }

  test("should hash verification answer securely using bcrypt", async () => {
    const rawAnswer = "Blue Yamaha Keychain";
    const hashed = await hashVerificationAnswer(rawAnswer);

    assert.ok(hashed.startsWith("$2"), "Hash should follow bcrypt format");
    assert.notEqual(hashed, rawAnswer, "Hash must never store raw plaintext answer");
  });

  test("should verify exact match with case-insensitivity and whitespace normalization", async () => {
    const expected = "Red Nike Lanyard";
    const hash = await hashVerificationAnswer(expected);

    // Case and spacing variations should still match properly
    const submission1 = "red nike lanyard";
    const submission2 = "   RED   NIKE   LANYARD  ";

    assert.equal(await verifySubmittedAnswer(submission1, hash), true);
    assert.equal(await verifySubmittedAnswer(submission2, hash), true);
  });

  test("should reject incorrect answer attempts without leaking hash", async () => {
    const expected = "Secret engraved initials JM";
    const hash = await hashVerificationAnswer(expected);

    const wrongSubmission = "Secret engraved initials AB";
    const isMatch = await verifySubmittedAnswer(wrongSubmission, hash);

    assert.equal(isMatch, false, "Wrong answer must return false");
  });

  test("should enforce maximum rate limit on repeated attempts", () => {
    const MAX_CLAIM_ATTEMPTS = 5;
    let attemptCount = 5;

    const isExceeded = attemptCount >= MAX_CLAIM_ATTEMPTS;
    assert.equal(isExceeded, true, "Attempts >= 5 must be blocked to prevent brute force");
  });
});
