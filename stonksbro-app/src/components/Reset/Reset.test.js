import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Reset from "../Reset/Reset";

// Mock MessageBox component
jest.mock("../MessageBox/MessageBox", () => ({
  __esModule: true,
  default: ({ message, onClose }) => (
    <div data-testid="message-box">
      <span>{message}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe("Reset Component", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  test("renders reset form", () => {
    render(
      <MemoryRouter>
        <Reset />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/go back\?/i)).toBeInTheDocument();
  });

  test("shows error message when email is not provided", async () => {
    render(
      <MemoryRouter>
        <Reset />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter your email address\./i)
      ).toBeInTheDocument();
    });
  });

  test("shows success message when password reset email is sent", async () => {
    render(
      <MemoryRouter>
        <Reset />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/password reset email sent\./i)
      ).toBeInTheDocument();
    });
  });

  test("shows error message when server returns an error", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve("Server error"),
      })
    );

    render(
      <MemoryRouter>
        <Reset />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  test("navigates to login page when 'Click Here!' is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/reset"]}>
        <Reset />
      </MemoryRouter>
    );

    const loginLink = screen.getByText(/click here!/i);
    fireEvent.click(loginLink);

    expect(window.location.pathname).toBe("/");
  });
});
