import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; // Import waitFor
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../../components/Login/Login";
import { useAuth } from "../../components/AuthContext/AuthContext";

// Mock useAuth
jest.mock("../../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockLogin = jest.fn();

describe("Login Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      login: mockLogin,
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "test-token",
            username: "test-user",
            userId: "test-id",
          }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  test("shows error message when email and password are not provided", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      screen.getByText(/email and password are required\./i)
    ).toBeInTheDocument();
  });

  test("calls login function when form is submitted with valid data", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "test-token",
        "test-user",
        "test-id"
      );
    });
  });

  test('navigates to register page when "Click Here to Register" is clicked', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Login />
        <Routes>
          <Route path="/register" element={<div>Register Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const registerLink = screen.getByText(/click here to register!/i);
    fireEvent.click(registerLink);

    expect(screen.getByText(/register page/i)).toBeInTheDocument();
  });

  test('navigates to reset password page when "Lost Password? Click Here!" is clicked', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Login />
        <Routes>
          <Route
            path="/reset-password"
            element={<div>Reset Password Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const resetLink = screen.getByText(
      (content, element) =>
        content.startsWith("Lost Password?") &&
        element.textContent.includes("Click Here!")
    );
    fireEvent.click(resetLink);

    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
  });

  test("shows error message when email or password is invalid", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve("Invalid email or password"),
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "invalid@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password/i)
      ).toBeInTheDocument();
    });
  });
});
