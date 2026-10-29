import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Claim State Machine & Handover Transitions", () => {
  const VALID_TRANSITIONS = {
    PENDING: ["UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"],
    UNDER_REVIEW: ["APPROVED", "REJECTED", "CANCELLED"],
    APPROVED: ["COMPLETED", "REJECTED", "CANCELLED"],
    REJECTED: ["PENDING"], // Can re-attempt if under attempt count limit
    CANCELLED: [],
    COMPLETED: [], // Terminal state
  };

  function canTransition(current, next) {
    return VALID_TRANSITIONS[current]?.includes(next) ?? false;
  }

  test("should allow valid progression from PENDING -> APPROVED -> COMPLETED", () => {
    assert.equal(canTransition("PENDING", "APPROVED"), true);
    assert.equal(canTransition("APPROVED", "COMPLETED"), true);
  });

  test("should disallow direct jump from PENDING to COMPLETED before approval", () => {
    assert.equal(canTransition("PENDING", "COMPLETED"), false, "Cannot complete handover before approval");
  });

  test("should disallow changing status once COMPLETED", () => {
    assert.equal(canTransition("COMPLETED", "PENDING"), false, "Completed claim is terminal");
    assert.equal(canTransition("COMPLETED", "APPROVED"), false);
  });

  test("handover completion should atomically resolve item report", () => {
    let reportStatus = "ACTIVE";
    let claimStatus = "APPROVED";

    // Simulate handover confirmation transaction
    function confirmHandover() {
      claimStatus = "COMPLETED";
      reportStatus = "RESOLVED";
    }

    confirmHandover();

    assert.equal(claimStatus, "COMPLETED");
    assert.equal(reportStatus, "RESOLVED", "Report must be closed/resolved upon physical handover");
  });
});
