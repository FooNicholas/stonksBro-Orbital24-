import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../../components/Login/Login";
import Register from "../../components/Register/Register";
import { useAuth } from "../../components/AuthContext/AuthContext";

// Mock useAuth
jest.mock("../../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockRegister = jest.fn();
const mockLogin = jest.fn();

describe("Register Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      register: mockRegister,
      login: mockLogin,
    });

    global.fetch = jest.fn((url, options) => {
      if (url.includes("/register")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              token: "test-token",
              username: "testuser",
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

  test("Registration flow from landing page", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    // Navigate to Register page
    fireEvent.click(screen.getByText(/Click Here to Register!/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Confirm Password")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/already have an account\?/i)
      ).toBeInTheDocument();
    });

    // Fill out registration form
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123!" },
    });

    // Submit registration form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    // Assert that user is redirected to login page after successful registration
    await waitFor(() => {
      expect(screen.getByText(/Login/i)).toBeInTheDocument();
    });

    // Assert that login POST request is called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://stonks-bro-orbital24-server.vercel.app/register",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "testuser",
            email: "test@example.com",
            password: "password123!",
            passwordConfirm: "password123!",
          }),
        })
      );
    });
  });
});
