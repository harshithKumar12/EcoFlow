import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "../components/Dashboard";
import { ActivityLog, ActivityType } from "../types";

const mockLogs: ActivityLog[] = [
  {
    id: "log_1",
    userId: "user_test",
    timestamp: new Date().toISOString(), // Today
    type: ActivityType.TRANSPORT,
    carbonFootprint: 10.5,
    co2Saved: 3.2,
    details: { transport: { distance: 50, mode: "gas_car" } },
    notes: "Commuted to work today",
    co2Emoji: "🚗",
  },
  {
    id: "log_2",
    userId: "user_test",
    timestamp: new Date().toISOString(), // Today
    type: ActivityType.ELECTRICITY,
    carbonFootprint: 12.0,
    co2Saved: 0,
    details: { electricity: { amount: 20, source: "grid" } },
    notes: "Regular grid electricity",
    co2Emoji: "⚡",
  }
];

const mockPredictions = [
  { title: "Reduce meat eating", tip: "Switch to vegetarian style" }
];

describe("Dashboard Statistics Component", () => {
  it("renders empty state correctly if there are no logs", () => {
    const handleDelete = vi.fn();
    render(
      <Dashboard
        logs={[]}
        onDeleteLog={handleDelete}
        insightsBrief="No concerns found"
        insightsPredictions={[]}
      />
    );

    expect(screen.getByText("7-Day Emissions")).toBeDefined();
    expect(screen.getByText("7-Day Saved Offsets")).toBeDefined();
    expect(screen.getByText("No activity logs recorded yet. Start tracking above!")).toBeDefined();
  });

  it("renders correctly with multiple carbon footprint logs and computes average", () => {
    const handleDelete = vi.fn();
    render(
      <Dashboard
        logs={mockLogs}
        onDeleteLog={handleDelete}
        insightsBrief="Good job so far"
        insightsPredictions={mockPredictions}
      />
    );

    // Sum should be 10.5 + 12 = 22.5
    expect(screen.getByText("22.5")).toBeDefined();

    // Saved should be 3.2
    expect(screen.getByText("3.2")).toBeDefined();

    // Verify recent logged item and text notes render
    expect(screen.getByText("Commuted to work today")).toBeDefined();
    expect(screen.getByText("Regular grid electricity")).toBeDefined();
  });

  it("allows deleting logs and triggers delete callback with correct id", () => {
    const handleDelete = vi.fn();
    render(
      <Dashboard
        logs={mockLogs}
        onDeleteLog={handleDelete}
        insightsBrief="Good job so far"
        insightsPredictions={mockPredictions}
      />
    );

    // Delete first logs
    const deleteBtns = screen.getAllByRole("button", { name: "Delete activity log" });
    expect(deleteBtns.length).toBe(2);
    fireEvent.click(deleteBtns[0]);

    expect(handleDelete).toHaveBeenCalledWith("log_1");
  });
});
