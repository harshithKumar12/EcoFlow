import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthScreen from "../components/AuthScreen";

describe("AuthScreen Entry Screen", () => {
  it("renders with header text, logo image, and description", () => {
    const handleGuestSignIn = vi.fn();
    render(<AuthScreen onGuestSignIn={handleGuestSignIn} />);

    expect(screen.getByAltText("EcoFlow Logo")).toBeDefined();
    expect(screen.getByText("Welcome to EcoFlow")).toBeDefined();
    expect(screen.getByLabelText("Full Name / Username")).toBeDefined();
    expect(screen.getByLabelText("Email Address")).toBeDefined();
  });

  it("shows error if details are missing or formats are incorrect", () => {
    const handleGuestSignIn = vi.fn();
    const { container } = render(<AuthScreen onGuestSignIn={handleGuestSignIn} />);

    const nameInput = screen.getByPlaceholderText("Name (e.g., Alex Johnson)");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const form = container.querySelector("form");
    
    // 1. Submit empty
    if (form) fireEvent.submit(form);
    expect(screen.getByText("Please enter your display name.")).toBeDefined();

    // 2. Put name but keep email empty or invalid
    fireEvent.change(nameInput, { target: { value: "Eco Leader" } });
    if (form) fireEvent.submit(form);
    expect(screen.getByText("Please enter a valid email address.")).toBeDefined();

    // 3. Put invalid email format
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    if (form) fireEvent.submit(form);
    expect(screen.getByText("Please enter a valid email address.")).toBeDefined();
  });

  it("handles entry exceptions gracefully and displays error alert", () => {
    const errorSignIn = vi.fn().mockImplementation(() => {
      throw new Error("Crash entry");
    });
    render(<AuthScreen onGuestSignIn={errorSignIn} />);

    const nameInput = screen.getByPlaceholderText("Name (e.g., Alex Johnson)");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const enterBtn = screen.getByRole("button", { name: "Enter EcoFlow Portal" });

    fireEvent.change(nameInput, { target: { value: "Eco Leader" } });
    fireEvent.change(emailInput, { target: { value: "leader@eco.com" } });
    fireEvent.click(enterBtn);

    expect(screen.getByText("An error occurred during entry. Please try again.")).toBeDefined();
  });

  it("authenticates and triggers onGuestSignIn when forms are valid", () => {
    const handleGuestSignIn = vi.fn();
    render(<AuthScreen onGuestSignIn={handleGuestSignIn} />);

    const nameInput = screen.getByPlaceholderText("Name (e.g., Alex Johnson)");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const enterBtn = screen.getByRole("button", { name: "Enter EcoFlow Portal" });

    fireEvent.change(nameInput, { target: { value: "Eco Champion" } });
    fireEvent.change(emailInput, { target: { value: "champion@ecoflow.com" } });
    fireEvent.click(enterBtn);

    expect(handleGuestSignIn).toHaveBeenCalledWith("champion@ecoflow.com", "Eco Champion");
  });
});
