// AddFriends.test.js

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import AddFriends from "../../components/AddFriends/AddFriends";
import { useAuth } from "../../components/AuthContext/AuthContext";

// Mocking useAuth
jest.mock("../../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mocking fetch
global.fetch = jest.fn();

describe("AddFriends Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ userId: "123", username: "testuser" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <AddFriends />
      </MemoryRouter>
    );

  test("renders the AddFriends component", () => {
    renderComponent();

    expect(screen.getByText(/add friends/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search for friends/i)
    ).toBeInTheDocument();
  });

  test("displays message when attempting to send a friend request to oneself", async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/search for friends/i);
    const sendButton = screen.getByRole("button", { name: /send request/i });

    fireEvent.change(searchInput, { target: { value: "testuser" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(
        screen.getByText(/you cannot send a friend request to yourself/i)
      ).toBeInTheDocument();
    });
  });

  test("displays no friend requests message when there are no friend requests", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/no incoming friend requests/i)
      ).toBeInTheDocument();
    });
  });
});
