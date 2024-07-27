import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../../components/Login/Login";
import Dashboard from "../../scenes/Dashboard/Dashboard";
import { useAuth } from "../../components/AuthContext/AuthContext";

// Mock useAuth
jest.mock("../../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockLogin = jest.fn();

describe("Login Flow Integration Test", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      login: mockLogin,
    });

    global.fetch = jest.fn((url, options) => {
      if (url.includes("/login")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              token: "test-token",
              username: "test-user",
              userId: "test-id",
            }),
        });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("directs user from login page to dashboard upon successful login", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Fill out login form
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    // Submit login form
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Assert that user is redirected to the dashboard page after successful login
    await waitFor(() => {
      expect(
        screen.getByText((content) => content === "DASHBOARD")
      ).toBeInTheDocument();
    });

    // Assert that login POST request is called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://stonks-bro-orbital24-server.vercel.app/login",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        })
      );
    });
  });
});
