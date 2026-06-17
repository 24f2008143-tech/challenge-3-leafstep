// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import fs from "fs";
import { app, STATE_FILE_PATH } from "../../server";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.VITE_SUPABASE_URL = "https://example.supabase.co";
  process.env.VITE_SUPABASE_ANON_KEY = "example_key";
});

beforeEach(() => {
  if (fs.existsSync(STATE_FILE_PATH)) {
    try {
      fs.unlinkSync(STATE_FILE_PATH);
    } catch (e) {}
  }
});

describe("POST /api/logs/manual", () => {
  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/logs/manual")
      .send({ category: "transport" }); // missing activity_name and quantity
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("returns 400 for invalid category", async () => {
    const res = await request(app)
      .post("/api/logs/manual")
      .send({
        category: "invalid_category",
        activity_name: "Test",
        quantity: 10
      });
    expect(res.status).toBe(400);
  });

  it("successfully logs a valid manual entry", async () => {
    const res = await request(app)
      .post("/api/logs/manual")
      .send({
        category: "transport",
        activity_name: "Car commute to office",
        quantity: 12,
        unit: "km",
        kg_co2: 2.88
      });
    expect(res.status).toBe(200);
    expect(res.body.logs).toBeDefined();
    expect(res.body.logs[0].activity_name).toBe("Car commute to office");
    expect(res.body.logs[0].kg_co2).toBe(2.88);
  });
});

describe("GET /api/state", () => {
  it("returns state object with required fields", async () => {
    const res = await request(app).get("/api/state");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("logs");
    expect(res.body).toHaveProperty("streaks");
    expect(res.body).toHaveProperty("leaf_points");
    expect(res.body).toHaveProperty("badges");
    expect(Array.isArray(res.body.logs)).toBe(true);
  });
});

describe("POST /api/state/reset", () => {
  it("resets state to defaults", async () => {
    const res = await request(app).post("/api/state/reset");
    expect(res.status).toBe(200);
    expect(res.body.onboarded).toBe(false);
    expect(res.body.leaf_points).toBe(350);
  });
});

describe("POST /api/gamification/award", () => {
  it("awards points correctly", async () => {
    const stateBefore = (await request(app).get("/api/state")).body;
    const initialPoints = stateBefore.leaf_points;

    const res = await request(app)
      .post("/api/gamification/award")
      .send({ points: 100, reason: "test" });

    expect(res.status).toBe(200);
    expect(res.body.state.leaf_points).toBe(initialPoints + 100);
  });

  it("unlocks a new badge", async () => {
    const res = await request(app)
      .post("/api/gamification/award")
      .send({ badge: "test_badge_unique_xyz" });

    expect(res.status).toBe(200);
    expect(res.body.state.badges).toContain("test_badge_unique_xyz");
  });
});
