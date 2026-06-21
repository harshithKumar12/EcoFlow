import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AICoach from "../components/AICoach";
import { ActivityType } from "../types";

describe("AI Sustainability Coach Component", () => {
  const mockAddLogFromCoach = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global window.fetch
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            reply: {
              id: "coach_reply_1",
              role: "model",
              text: "Here is your customized carbon recommendations list! You should try to buy second hand garments.",
              timestamp: new Date().toISOString(),
              suggestions: [
                {
                  id: "sug_garments",
                  title: "Thrift Store Clothing",
                  description: "Avoid virgin fast fashion production styles.",
                  category: "shopping",
                  impact: "Medium",
                  co2SavedValue: 25.0,
                },
                {
                  id: "sug_diet",
                  title: "Organic Vegan Tacos",
                  description: "Ditch processed meat feeds.",
                  category: "food",
                  impact: "High",
                  co2SavedValue: 4.5,
                },
                {
                  id: "sug_garbage",
                  title: "Separate Litter Bags",
                  description: "Throw waste in compost bin.",
                  category: "waste",
                  impact: "Low",
                  co2SavedValue: 1.0,
                },
                {
                  id: "sug_electricity",
                  title: "Green Power Tariff",
                  description: "Check sustainable electricity plans.",
                  category: "energy",
                  impact: "High",
                  co2SavedValue: 15.0,
                },
                {
                  id: "sug_transit",
                  title: "Hop on the Bus",
                  description: "Commute via low-impact vehicle option.",
                  category: "transport",
                  impact: "High",
                  co2SavedValue: 8.5,
                }
              ]
            },
          }),
      })
    );
  });

  it("renders with greeting and list of default quick questions in view", () => {
    render(
      <AICoach
        onAddLogFromCoach={mockAddLogFromCoach}
        userName="Carbon Champion"
        logs={[]}
        completedChallengesCount={2}
      />
    );

    expect(screen.getByText("AI Sustainability Coach")).toBeDefined();
    expect(screen.getByText(/Greetings, Carbon Champion!/i)).toBeDefined();
    
    // Test clicking a quick-question bullet
    const quickBtn = screen.getByText("How can I lower my food footprint?");
    fireEvent.click(quickBtn);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("sends user message and displays advisor model response along with action suggestions", async () => {
    render(
      <AICoach
        onAddLogFromCoach={mockAddLogFromCoach}
        userName="Carbon Champion"
        logs={[]}
        completedChallengesCount={2}
      />
    );

    const input = screen.getByLabelText("Ask your AI Coach a question");
    const sendBtn = screen.getByLabelText("Send message to Coach");

    fireEvent.change(input, { target: { value: "Tell me how to save water" } });
    fireEvent.click(sendBtn);

    // Wait for mock fetch to execute and resolve
    await waitFor(() => {
      expect(screen.getByText(/Thrift Store Clothing/i)).toBeDefined();
      expect(screen.getByText(/Organic Vegan Tacos/i)).toBeDefined();
    });
  });

  it("allows adopting a recommended action and logs it into parent carbon ledger", async () => {
    render(
      <AICoach
        onAddLogFromCoach={mockAddLogFromCoach}
        userName="Carbon Champion"
        logs={[]}
        completedChallengesCount={2}
      />
    );

    // Prompt chat response first so suggestions are displayed
    const input = screen.getByLabelText("Ask your AI Coach a question");
    const sendBtn = screen.getByLabelText("Send message to Coach");
    fireEvent.change(input, { target: { value: "Quick Tips" } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText("Separate Litter Bags")).toBeDefined();
    });

    const adoptBtns = screen.getAllByRole("button", { name: /Adopt This Action Today/i });
    expect(adoptBtns.length).toBeGreaterThan(4);

    // 1. Click waste category suggestion (Separate Litter Bags) at index 2
    fireEvent.click(adoptBtns[2]);
    expect(mockAddLogFromCoach).toHaveBeenNthCalledWith(
      1,
      ActivityType.WASTE,
      expect.objectContaining({ waste: { weight: 2, recycled: true } }),
      expect.stringContaining("Separate Litter Bags")
    );

    // 2. Click shopping category suggestion (Thrift Store Clothing) at index 0
    fireEvent.click(adoptBtns[0]);
    expect(mockAddLogFromCoach).toHaveBeenNthCalledWith(
      2,
      ActivityType.SHOPPING,
      expect.objectContaining({ shopping: { spent: 20, category: "second_hand" } }),
      expect.stringContaining("Thrift Store Clothing")
    );

    // 3. Click food category suggestion (Organic Vegan Tacos) at index 1
    fireEvent.click(adoptBtns[1]);
    expect(mockAddLogFromCoach).toHaveBeenNthCalledWith(
      3,
      ActivityType.FOOD,
      expect.objectContaining({ food: { meals: 1, dietType: "vegetarian" } }),
      expect.stringContaining("Organic Vegan Tacos")
    );

    // 4. Click energy category suggestion (Green Power Tariff) at index 3
    fireEvent.click(adoptBtns[3]);
    expect(mockAddLogFromCoach).toHaveBeenNthCalledWith(
      4,
      ActivityType.ELECTRICITY,
      expect.objectContaining({ electricity: { amount: 5, source: "green_tariff" } }),
      expect.stringContaining("Green Power Tariff")
    );

    // 5. Click transport category suggestion (Hop on the Bus) at index 4
    fireEvent.click(adoptBtns[4]);
    expect(mockAddLogFromCoach).toHaveBeenNthCalledWith(
      5,
      ActivityType.TRANSPORT,
      expect.objectContaining({ transport: { distance: 10, mode: "bus" } }),
      expect.stringContaining("Hop on the Bus")
    );
  });
});
