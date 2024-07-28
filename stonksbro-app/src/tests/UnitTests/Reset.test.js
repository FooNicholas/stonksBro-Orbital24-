import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Reset from "../../components/Reset/Reset";

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Mock MessageBox component
jest.mock("../../components/MessageBox/MessageBox", () => ({
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
    useNavigate.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Reset />
      </MemoryRouter>
    );

  test("renders reset form", () => {
    renderComponent();

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/go back\?/i)).toBeInTheDocument();
  });

  test("shows error message when email is not provided", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter your email address\./i)
      ).toBeInTheDocument();
    });
  });

  test("shows success message when password reset email is sent", async () => {
    renderComponent();

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

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  test("navigates to login page when 'Click Here!' is clicked", () => {
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);

    render(
      <MemoryRouter initialEntries={["/reset"]}>
        <Reset />
      </MemoryRouter>
    );

    const loginLink = screen.getByText(/click here!/i);
    fireEvent.click(loginLink);

    expect(navigate).toHaveBeenCalledWith("/");
  });
});
