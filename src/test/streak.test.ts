import { describe, it, expect } from "vitest";
import { updateStreak } from "../utils/streakUtils";

function makeState(daysAgo: number, current = 5, best = 10) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    streaks: {
      current,
      best,
      last_active_date: d.toISOString().split("T")[0]
    }
  };
}

describe("updateStreak", () => {
  it("increments streak on consecutive day", () => {
    const state = makeState(1, 3, 10);
    updateStreak(state);
    expect(state.streaks.current).toBe(4);
  });

  it("resets streak to 1 after a missed day", () => {
    const state = makeState(2, 5, 10);
    updateStreak(state);
    expect(state.streaks.current).toBe(1);
  });

  it("does not change streak when already active today", () => {
    const state = makeState(0, 7, 10);
    updateStreak(state);
    expect(state.streaks.current).toBe(7);
  });

  it("updates best streak when current exceeds it", () => {
    const state = makeState(1, 9, 9); // current = best = 9
    updateStreak(state);
    expect(state.streaks.current).toBe(10);
    expect(state.streaks.best).toBe(10);
  });

  it("does not lower best streak when current is lower", () => {
    const state = makeState(1, 3, 15); // best is much higher
    updateStreak(state);
    expect(state.streaks.best).toBe(15);
  });

  it("handles first-ever log (no previous date)", () => {
    const state = { streaks: { current: 0, best: 0, last_active_date: "" } };
    updateStreak(state);
    expect(state.streaks.current).toBe(1);
  });
});
