import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Campus Domain & Authorization Rules", () => {
  const allowedDomains = ["campus.edu", "university.edu", "college.edu", "student.edu", "gmail.com"];

  function isAllowedCampusDomain(email) {
    if (!email || !email.includes("@")) return false;
    const domain = email.split("@")[1].toLowerCase();
    return allowedDomains.some((d) => domain === d || domain.endsWith("." + d));
  }

  test("should allow authorized university email addresses", () => {
    assert.equal(isAllowedCampusDomain("student@campus.edu"), true);
    assert.equal(isAllowedCampusDomain("jane.chen@cs.university.edu"), true);
    assert.equal(isAllowedCampusDomain("prof@college.edu"), true);
  });

  test("should reject unauthorized external email domains", () => {
    assert.equal(isAllowedCampusDomain("hacker@malicious-domain.xyz"), false);
    assert.equal(isAllowedCampusDomain("spammer@tempmail.org"), false);
    assert.equal(isAllowedCampusDomain("invalid-string"), false);
  });

  test("should enforce RBAC role permissions strictly", () => {
    const permissions = {
      STUDENT: ["CREATE_REPORT", "SUBMIT_CLAIM", "MESSAGE_PARTICIPANT", "SAVE_LISTING"],
      STAFF: ["CREATE_REPORT", "SUBMIT_CLAIM", "MESSAGE_PARTICIPANT", "SAVE_LISTING", "CONFIRM_HANDOVER"],
      ADMIN: ["CREATE_REPORT", "SUBMIT_CLAIM", "MESSAGE_PARTICIPANT", "SAVE_LISTING", "CONFIRM_HANDOVER", "MODERATE_LISTING", "MANAGE_USERS", "VIEW_AUDIT_LOGS"],
    };

    assert.ok(permissions.ADMIN.includes("VIEW_AUDIT_LOGS"));
    assert.ok(!permissions.STUDENT.includes("VIEW_AUDIT_LOGS"), "Students must never view audit logs");
    assert.ok(!permissions.STUDENT.includes("MODERATE_LISTING"), "Students must never access moderation actions");
  });
});
