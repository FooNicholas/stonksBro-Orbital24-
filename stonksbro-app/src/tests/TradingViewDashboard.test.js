import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TradingViewDashboard from "../components/TradingViewWidget/TradingViewDashboard";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ColorModeContext } from "../theme";
import { useAuth } from "../components/AuthContext/AuthContext";
import { MemoryRouter } from "react-router-dom";

// Mock useAuth
jest.mock("../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

const renderWithProviders = (ui, { providerProps, ...renderOptions } = {}) => {
  const theme = createTheme({
    palette: {
      mode: "light",
    },
  });

  return render(
    <MemoryRouter>
      <ColorModeContext.Provider value={providerProps.colorMode}>
        <ThemeProvider theme={theme}>{ui}</ThemeProvider>
      </ColorModeContext.Provider>
    </MemoryRouter>,
    renderOptions
  );
};

describe("TradingViewDashboard Component", () => {
  const mockUserId = "test-user-id";
  const mockWatchlist = ["AAPL", "GOOG"];

  beforeEach(() => {
    useAuth.mockReturnValue({
      userId: mockUserId,
    });

    global.fetch.mockImplementation((url) => {
      if (url.includes(`/watchlist/${mockUserId}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWatchlist),
        });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders TradingViewDashboard component and fetches watchlist", async () => {
    renderWithProviders(<TradingViewDashboard symbols={mockWatchlist} />, {
      providerProps: { colorMode: {} },
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://stonks-bro-orbital24-server.vercel.app/watchlist/${mockUserId}`
      );
    });

    // Check if the component rendered correctly
    expect(
      screen.getByRole("button", { name: /edit watchlist/i })
    ).toBeInTheDocument();
  });

  test("opens and closes the edit watchlist dialog", async () => {
    renderWithProviders(<TradingViewDashboard symbols={mockWatchlist} />, {
      providerProps: { colorMode: {} },
    });

    // Open the dialog
    fireEvent.click(screen.getByRole("button", { name: /edit watchlist/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /edit watchlist/i })
      ).toBeInTheDocument();
    });

    // Close the dialog
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /edit watchlist/i })
      ).not.toBeInTheDocument();
    });
  });
});
