import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RoutePlanner from "../components/RoutePlanner";
import { ActivityType } from "../types";

describe("Eco-Route Planner Component", () => {
  const mockAddCommuteLog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global window.fetch
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            routes: [
              {
                id: "route_1",
                mode: "driving",
                distance: 25.5,
                duration: "28 mins",
                emissions: 5.1,
                savings: 0,
                recommended: false,
                pathText: "US-101 S",
              },
              {
                id: "route_2",
                mode: "transit",
                distance: 24.0,
                duration: "45 mins",
                emissions: 0.8,
                savings: 4.3,
                recommended: true,
                pathText: "Caltrain Local Service",
              },
              {
                id: "route_3",
                mode: "bicycling",
                distance: 12.0,
                duration: "40 mins",
                emissions: 0,
                savings: 5.1,
                recommended: false,
                pathText: "Bayshore Parkway Bike Path",
              },
              {
                id: "route_4",
                mode: "walking",
                distance: 2.0,
                duration: "25 mins",
                emissions: 0,
                savings: 0.4,
                recommended: false,
                pathText: "Downtown Pedestrian Zone",
              }
            ],
          }),
      })
    );
  });

  it("renders with search inputs and default pre-calculated recommended route in view", async () => {
    render(<RoutePlanner onAddCommuteLog={mockAddCommuteLog} />);

    expect(screen.getByLabelText("Trip Starting Origin")).toBeDefined();
    expect(screen.getByLabelText("Destination Point")).toBeDefined();
    expect(screen.getByRole("button", { name: /Analyze Route Alternatives|Searching Green matrix/i })).toBeDefined();

    // The fetch should have been called on mount
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("allows selecting custom shortcuts to populate destinations and search routes", async () => {
    render(<RoutePlanner onAddCommuteLog={mockAddCommuteLog} />);

    const quickDemoBtns = screen.getAllByRole("button");
    const siliconCaltrainDemo = quickDemoBtns.find((b) =>
      b.textContent?.includes("San ➔ Palo")
    );

    if (siliconCaltrainDemo) {
      fireEvent.click(siliconCaltrainDemo);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // Mount + shortcut click
      });
    }
  });

  it("can toggle between interactive map and Co2 vector mode buttons", () => {
    render(<RoutePlanner onAddCommuteLog={mockAddCommuteLog} />);

    const vectorModeBtn = screen.getByRole("button", { name: /Co2 Vectors/i });
    expect(vectorModeBtn).toBeDefined();
    fireEvent.click(vectorModeBtn);

    const liveModeBtn = screen.getByRole("button", { name: /Live Map/i });
    expect(liveModeBtn).toBeDefined();
    fireEvent.click(liveModeBtn);
  });

  it("can trigger routing commute save to carbon ledger when clicking Register tab and selecting route alternatives", async () => {
    render(<RoutePlanner onAddCommuteLog={mockAddCommuteLog} />);

    await waitFor(() => {
      expect(screen.getByText("Available Route alternatives:")).toBeDefined();
    });

    let bicyclingRoute: HTMLElement;
    await waitFor(() => {
      bicyclingRoute = screen.getByText(/bicycling/i);
      expect(bicyclingRoute).toBeDefined();
    });
    fireEvent.click(bicyclingRoute!);

    const registerLogBtns = screen.getAllByRole("button", { name: /Log Trip Savings/i });
    if (registerLogBtns && registerLogBtns.length > 0) {
      fireEvent.click(registerLogBtns[0]);
      expect(mockAddCommuteLog).toHaveBeenCalledWith(
        ActivityType.TRANSPORT,
        expect.objectContaining({ transport: expect.objectContaining({ mode: "bicycle" }) }),
        expect.stringContaining("bicycling")
      );
    }
  });

  it("allows typing custom origin/destination and submitting the calculation form", async () => {
    const { container } = render(<RoutePlanner onAddCommuteLog={mockAddCommuteLog} />);

    const originInput = screen.getByLabelText("Trip Starting Origin");
    const destInput = screen.getByLabelText("Destination Point");

    fireEvent.change(originInput, { target: { value: "Oakland" } });
    fireEvent.change(destInput, { target: { value: "Berkeley" } });

    const form = container.querySelector("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
