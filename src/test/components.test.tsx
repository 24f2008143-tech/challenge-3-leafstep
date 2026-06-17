import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DailyGoalWidget from "../components/DailyGoalWidget";
import MilestoneProgressBar from "../components/MilestoneProgressBar";
import { AppState } from "../types";

// Mock count-up hook to avoid animation delays in tests
vi.mock("../hooks/useCountUp", () => ({
  useCountUp: (endValue: number) => endValue,
}));

const mockAppState: AppState = {
  user_id: "test_user",
  onboarded: true,
  profile: {
    name: "Test User",
    archetype: "Eco Apprentice",
    baseline_kg_co2_monthly: 600,
    answers: {
      transport: "car_petrol",
      diet: "diet_flexitarian_day",
      energy: "electricity",
      shopping: "general_item",
      travel: "medium",
    },
    top_categories: ["transport"],
  },
  leaf_points: 350,
  rank: "Sprouting",
  badges: [],
  carbon_iq: 80,
  logs: [],
  streaks: {
    current: 2,
    best: 5,
    last_active_date: new Date().toISOString().split("T")[0],
  },
  recommended_actions: [],
  chat_messages: [],
};

describe("DailyGoalWidget Component", () => {
  it("renders the active goal details", () => {
    const handleStateUpdate = vi.fn();
    const triggerToast = vi.fn();

    render(
      <DailyGoalWidget
        appState={mockAppState}
        onStateUpdate={handleStateUpdate}
        triggerToast={triggerToast}
      />
    );

    expect(screen.getByText(/Daily Sustainability Goal/i)).toBeInTheDocument();
    expect(screen.getByText(/Meatless Lunch/i)).toBeInTheDocument();
  });
});

describe("MilestoneProgressBar Component", () => {
  it("renders the current Leaf Points and progress percentage", () => {
    render(<MilestoneProgressBar leafPoints={350} currentRank="Sprouting" />);
    
    // Check that display points render
    expect(screen.getByText("350")).toBeInTheDocument();
    expect(screen.getByText(/Total LP/i)).toBeInTheDocument();
  });
});
