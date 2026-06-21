import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LogActivity from "../components/LogActivity";
import { ActivityType } from "../types";

describe("Log Footprint Activity Component Suite", () => {
  const mockOnAddLog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers transport route commute footprint successfully", async () => {
    render(<LogActivity onAddLog={mockOnAddLog} />);

    // Transport should be selected by default
    expect(screen.getByText("Commute Transportation Mode")).toBeDefined();

    // Verify change slider distance
    const distanceSlider = screen.getByLabelText("One-way commute Distance");
    fireEvent.change(distanceSlider, { target: { value: "35" } });

    // Select alternative transport e.g. "Tesla/EV"
    const evBtn = screen.getByRole("button", { name: "Tesla/EV" });
    fireEvent.click(evBtn);

    // Fill opt reflection note
    const notesInput = screen.getByPlaceholderText(/Swapped commuting route/i);
    fireEvent.change(notesInput, { target: { value: "Eco EV Drive" } });

    // Submit Log
    const submitBtn = screen.getByRole("button", { name: /Publish To Carbon Ledger/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddLog).toHaveBeenCalledWith(
        ActivityType.TRANSPORT,
        expect.objectContaining({ transport: { distance: 35, mode: "ev" } }),
        "Eco EV Drive"
      );
    });
  });

  it("can switch to Electricity source tab, update values, and submit", async () => {
    render(<LogActivity onAddLog={mockOnAddLog} />);

    // Click Category tab btn for Energy
    const electricityTabBtn = screen.getByRole("button", { name: /Energy/i });
    fireEvent.click(electricityTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Electricity Supplier Source")).toBeDefined();
    });

    // Select Wind source
    const windBtn = screen.getByRole("button", { name: /Wind Offset/i });
    fireEvent.click(windBtn);

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Publish To Carbon Ledger/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddLog).toHaveBeenCalledWith(
        ActivityType.ELECTRICITY,
        expect.objectContaining({ electricity: { amount: 12, source: "wind" } }),
        expect.stringContaining("wind")
      );
    });
  });

  it("can switch to Food Diet tab, select vegan option, and submit", async () => {
    render(<LogActivity onAddLog={mockOnAddLog} />);

    const foodTabBtn = screen.getByRole("button", { name: /Food Diet/i });
    fireEvent.click(foodTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Active Diet Protocol")).toBeDefined();
    });

    const veganBtn = screen.getByRole("button", { name: "Strict Vegan" });
    fireEvent.click(veganBtn);

    const submitBtn = screen.getByRole("button", { name: /Publish To Carbon Ledger/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddLog).toHaveBeenCalledWith(
        ActivityType.FOOD,
        expect.objectContaining({ food: { meals: 2, dietType: "vegan" } }),
        expect.stringContaining("vegan")
      );
    });
  });

  it("can switch to Shopping tab, change value, and submit", async () => {
    render(<LogActivity onAddLog={mockOnAddLog} />);

    const shoppingTabBtn = screen.getByRole("button", { name: "Shopping" });
    fireEvent.click(shoppingTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Shopping Category")).toBeDefined();
    });

    const secondHandBtn = screen.getByRole("button", { name: "Thrift & Second Hand" });
    fireEvent.click(secondHandBtn);

    const spendSlider = screen.getByLabelText("Money Spend Amount (USD)");
    fireEvent.change(spendSlider, { target: { value: "120" } });

    const submitBtn = screen.getByRole("button", { name: /Publish To Carbon Ledger/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddLog).toHaveBeenCalledWith(
        ActivityType.SHOPPING,
        expect.objectContaining({ shopping: { spent: 120, category: "second_hand" } }),
        expect.stringContaining("second hand")
      );
    });
  });

  it("can switch to Flights tab, toggle cabin class, and submit", async () => {
    render(<LogActivity onAddLog={mockOnAddLog} />);

    const flightsTabBtn = screen.getByRole("button", { name: "Flights" });
    fireEvent.click(flightsTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Cabin Class Allocation")).toBeDefined();
    });

    const businessBtn = screen.getByRole("button", { name: "Business Class seating" });
    fireEvent.click(businessBtn);

    const hoursSlider = screen.getByLabelText("Estimated Flight Duration");
    fireEvent.change(hoursSlider, { target: { value: "8" } });

    const submitBtn = screen.getByRole("button", { name: /Publish To Carbon Ledger/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddLog).toHaveBeenCalledWith(
        ActivityType.FLIGHTS,
        expect.objectContaining({ flights: { hours: 8, class: "business" } }),
        expect.stringContaining("business")
      );
    });
  });

  it("can switch to Water tab, update slider and submit", async () => {
    render(<LogActivity onAddLog={mockOnAddLog} />);

    const waterTabBtn = screen.getByRole("button", { name: "Water" });
    fireEvent.click(waterTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Daily Water Intake/Use (Liters)")).toBeDefined();
    });

    const waterSlider = screen.getByLabelText("Daily Water Intake/Use (Liters)");
    fireEvent.change(waterSlider, { target: { value: "240" } });

    const submitBtn = screen.getByRole("button", { name: /Publish To Carbon Ledger/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddLog).toHaveBeenCalledWith(
        ActivityType.WATER,
        expect.objectContaining({ water: { liters: 240 } }),
        expect.stringContaining("240 liters")
      );
    });
  });

  it("can switch to Waste tab, toggle recycling composting, and submit", async () => {
    render(<LogActivity onAddLog={mockOnAddLog} />);

    const wasteTabBtn = screen.getByRole("button", { name: /Waste/i });
    fireEvent.click(wasteTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Total Discarded Trash Weight")).toBeDefined();
    });

    const wasteSlider = screen.getByLabelText("Total Discarded Trash Weight");
    fireEvent.change(wasteSlider, { target: { value: "18" } });

    const recycledCheckbox = screen.getByLabelText(/Strict Recycle & Composting Separation/i);
    // Uncheck recycling to hit additional branches
    fireEvent.click(recycledCheckbox);

    const submitBtn = screen.getByRole("button", { name: /Publish To Carbon Ledger/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddLog).toHaveBeenCalledWith(
        ActivityType.WASTE,
        expect.objectContaining({ waste: { weight: 18, recycled: false } }),
        expect.stringContaining("No")
      );
    });
  });
});
