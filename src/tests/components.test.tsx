import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Challenges from "../components/Challenges";
import LogActivity from "../components/LogActivity";
import { ActivityType, EcoChallenge, ActivityLog } from "../types";

const mockChallenges: EcoChallenge[] = [
  {
    id: "chal_1",
    title: "Eco Commuter Challenge",
    description: "Bike or walk today",
    type: "daily",
    co2Value: 3.2,
    points: 100,
    completed: false,
    category: ActivityType.TRANSPORT,
  },
  {
    id: "chal_2",
    title: "Green Gourmet FEAST",
    description: "Eat vegan today",
    type: "weekly",
    co2Value: 4.5,
    points: 150,
    completed: true,
    category: ActivityType.FOOD,
  }
];

const mockLogs: ActivityLog[] = [
  {
    id: "log_1",
    userId: "user_test",
    timestamp: new Date().toISOString(),
    type: ActivityType.TRANSPORT,
    carbonFootprint: 0,
    co2Saved: 3.2,
    details: {
      transport: { distance: 10, mode: "bicycle" }
    },
    notes: "Biked to the store"
  }
];

describe("Challenges Panel Component", () => {
  it("renders points, streaks, and lists all available challenges", () => {
    const handleToggle = vi.fn();
    render(
      <Challenges
        logs={mockLogs}
        uid="user_test"
        challenges={mockChallenges}
        loading={false}
        points={350}
        activeStreak={5}
        onToggleChallenge={handleToggle}
      />
    );

    // Verify stats render correctly
    expect(screen.getByText("350")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();

    // Verify challenges text renders
    expect(screen.getByText("Eco Commuter Challenge")).toBeDefined();
    expect(screen.getByText("Green Gourmet FEAST")).toBeDefined();
  });

  it("filters challenges properly when hitting the category filter tabs", async () => {
    const handleToggle = vi.fn();
    render(
      <Challenges
        logs={mockLogs}
        uid="user_test"
        challenges={mockChallenges}
        loading={false}
        points={350}
        activeStreak={5}
        onToggleChallenge={handleToggle}
      />
    );

    // Trigger daily filter
    const dailyBtn = screen.getByText("Daily Missions");
    fireEvent.click(dailyBtn);
    expect(screen.getByText("Eco Commuter Challenge")).toBeDefined();
    expect(screen.queryByText("Green Gourmet FEAST")).toBeNull();

    // Trigger weekly filter
    const weeklyBtn = screen.getByText("Weekly Marathons");
    fireEvent.click(weeklyBtn);
    expect(screen.getByText("Green Gourmet FEAST")).toBeDefined();
    expect(screen.queryByText("Eco Commuter Challenge")).toBeNull();

    // Trigger transport filter
    const transportBtn = screen.getByText("Mobility");
    fireEvent.click(transportBtn);
    expect(screen.getByText("Eco Commuter Challenge")).toBeDefined();

    // Trigger food filter
    const foodBtn = screen.getByText("Food & Diet");
    fireEvent.click(foodBtn);
    expect(screen.getByText("Green Gourmet FEAST")).toBeDefined();
  });

  it("triggers completion callbacks when completing a challenge", () => {
    const handleToggle = vi.fn();
    render(
      <Challenges
        logs={mockLogs}
        uid="user_test"
        challenges={mockChallenges}
        loading={false}
        points={350}
        activeStreak={5}
        onToggleChallenge={handleToggle}
      />
    );

    // Click completion checkbox/button using the label for incomplete daily challenge
    const toggleBtn = screen.getByLabelText("Toggle completion of challenge: Eco Commuter Challenge");
    expect(toggleBtn).toBeDefined();
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledWith("chal_1", 100, false);

    // Click toggle button using label for already completed weekly challenge to uncheck it
    const completedToggleBtn = screen.getByLabelText("Toggle completion of challenge: Green Gourmet FEAST");
    expect(completedToggleBtn).toBeDefined();
    fireEvent.click(completedToggleBtn);
    expect(handleToggle).toHaveBeenCalledWith("chal_2", 150, true);
  });
});

describe("LogActivity Logging Form Component", () => {
  it("renders tabs and accurately updates estimation calculator in real-time", async () => {
    const handleAddLog = vi.fn();
    render(<LogActivity onAddLog={handleAddLog} />);

    // Check we have the Instant Calculation Value section in view
    expect(screen.getByText("Instant Calculation Value")).toBeDefined();
    
    // Change distance parameter
    const input = screen.getByLabelText("One-way commute Distance");
    expect(input).toBeDefined();
    
    fireEvent.change(input, { target: { value: "50" } });
    
    // Emissions estimate should calculate: 50 * 0.20 (gas_car standard rate) = 10
    // The component reflects the number 10 in preview
    expect(screen.getByText("10")).toBeDefined();
  });
});
