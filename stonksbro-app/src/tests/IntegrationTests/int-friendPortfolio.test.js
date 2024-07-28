import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Friends from "../../components/FriendsList/FriendsList";
import { useAuth } from "../../components/AuthContext/AuthContext";

// Mock useAuth
jest.mock("../../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockFriends = [
  {
    id: "1",
    username: "friend1",
    avatar: "avatar1.png",
    ticker: ["AAPL", "TSLA"],
    watchlist: ["GOOG", "AMZN"],
    trades: [
      { symbol: "AAPL", date: "2024-07-27", price: 150 },
      { symbol: "TSLA", date: "2024-07-28", price: 650 },
    ],
  },
];

describe("Friends Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      userId: "test-user-id",
    });

    global.fetch = jest.fn((url, options) => {
      if (url.includes("/friends/test-user-id")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFriends),
        });
      } else if (url.includes("/friend-profile")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockFriends[0]]),
        });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("allows the user to view a friend's portfolio and watchlist", async () => {
    render(
      <MemoryRouter initialEntries={["/friends"]}>
        <Routes>
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the friends to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/friend1/i)).toBeInTheDocument();
    });

    // Click friend card to view profile
    fireEvent.click(screen.getByAltText(/friend/i));

    // Wait for friend's profile dialog to open
    await waitFor(() => {
      expect(screen.getByText(/FRIEND PROFILE/i)).toBeInTheDocument();
    });

    // Check for the presence of tickers, watchlist, and portfolio headers
    expect(screen.getByText(/Tickers:/i)).toBeInTheDocument();
    expect(screen.getByText(/Watchlist:/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio:/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /close profile/i })
    ).toBeInTheDocument();
  });
});
