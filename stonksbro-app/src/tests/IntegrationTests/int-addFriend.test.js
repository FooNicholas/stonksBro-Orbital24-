import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AddFriends from "../../components/AddFriends/AddFriends";
import { useAuth } from "../../components/AuthContext/AuthContext";

// Mock useAuth
jest.mock("../../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockFriendRequests = [
  {
    id: 1,
    sender_id: "user1",
    sender_username: "friendUser",
    created_at: "2024-07-17T12:34:56Z",
  },
];

describe("AddFriends Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      userId: "test-user-id",
      username: "testuser",
    });

    global.fetch = jest.fn((url, options) => {
      if (url.includes("/friend-requests/test-user-id")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFriendRequests),
        });
      } else if (url.includes("/send-friend-request")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("Friend request sent successfully"),
        });
      } else if (url.includes("/accept")) {
        return Promise.resolve({
          ok: true,
        });
      } else if (url.includes("/reject")) {
        return Promise.resolve({
          ok: true,
        });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders AddFriends component and fetches friend requests", async () => {
    render(
      <MemoryRouter initialEntries={["/add-friends"]}>
        <Routes>
          <Route path="/add-friends" element={<AddFriends />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the friend requests to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Username: friendUser/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Created at: 2024-07-17T12:34:56Z/i)
      ).toBeInTheDocument();
    });
  });

  test("sends a friend request", async () => {
    render(
      <MemoryRouter initialEntries={["/add-friends"]}>
        <Routes>
          <Route path="/add-friends" element={<AddFriends />} />
        </Routes>
      </MemoryRouter>
    );

    // Enter friend's username in the search input
    fireEvent.change(screen.getByPlaceholderText(/search for friends/i), {
      target: { value: "newFriend" },
    });

    // Click Send Request button
    fireEvent.click(screen.getByRole("button", { name: /send request/i }));

    // Wait for the message indicating the friend request was sent
    await waitFor(() => {
      expect(
        screen.getByText(/friend request sent successfully/i)
      ).toBeInTheDocument();
    });
  });

  test("accepts a friend request", async () => {
    render(
      <MemoryRouter initialEntries={["/add-friends"]}>
        <Routes>
          <Route path="/add-friends" element={<AddFriends />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the friend requests to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Username: friendUser/i)).toBeInTheDocument();
    });

    // Click the Accept button for the friend request
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));

    // Wait for the friend request to be removed from the list
    await waitFor(() => {
      expect(
        screen.queryByText(/Username: friendUser/i)
      ).not.toBeInTheDocument();
    });
  });

  test("rejects a friend request", async () => {
    render(
      <MemoryRouter initialEntries={["/add-friends"]}>
        <Routes>
          <Route path="/add-friends" element={<AddFriends />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the friend requests to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Username: friendUser/i)).toBeInTheDocument();
    });

    // Click the Reject button for the friend request
    fireEvent.click(screen.getByRole("button", { name: /reject/i }));

    // Wait for the friend request to be removed from the list
    await waitFor(() => {
      expect(
        screen.queryByText(/Username: friendUser/i)
      ).not.toBeInTheDocument();
    });
  });
});
