import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import UpdatePassword from "../components/UpdatePassword/UpdatePassword";

// Mock MessageBox component
jest.mock("../components/MessageBox/MessageBox", () => ({
  __esModule: true,
  default: ({ message, onClose }) => (
    <div data-testid="message-box">
      <span>{message}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe("UpdatePassword Component", () => {
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

  test("renders update password form", () => {
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/confirm password/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Update Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByText(/go back\?/i)).toBeInTheDocument();
  });

  test("shows error message when passwords are not provided", async () => {
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter and confirm your new password\./i)
      ).toBeInTheDocument();
    });
  });

  test("shows error message when password criteria are not met", async () => {
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/new password/i), {
      target: { value: "pass" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "pass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /please make sure all password requirements are met\./i
        )
      ).toBeInTheDocument();
    });
  });

  test("shows success message when password is updated", async () => {
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/new password/i), {
      target: { value: "password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/password updated successfully\./i)
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
        <UpdatePassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/new password/i), {
      target: { value: "password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  test("navigates to login page when 'Click Here!' is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/update-password"]}>
        <UpdatePassword />
      </MemoryRouter>
    );

    const loginLink = screen.getByText(/click here!/i);
    fireEvent.click(loginLink);

    expect(window.location.pathname).toBe("/");
  });
});
