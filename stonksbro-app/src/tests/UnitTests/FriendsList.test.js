import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Friends from "../../components/FriendsList/FriendsList";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../components/AuthContext/AuthContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../theme";

// Mock useAuth
jest.mock("../../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const renderWithProviders = (ui, { providerProps, ...renderOptions }) => {
  const theme = createTheme();

  return render(
    <MemoryRouter>
      <ColorModeContext.Provider value={providerProps.colorMode}>
        <ThemeProvider theme={theme}>{ui}</ThemeProvider>
      </ColorModeContext.Provider>
    </MemoryRouter>,
    renderOptions
  );
};

describe("Friends Component", () => {
  const mockUserId = "test-user-id";

  beforeEach(() => {
    useAuth.mockReturnValue({
      userId: mockUserId,
    });

    mockFetch.mockImplementation((url) => {
      if (url.endsWith(`/friends/${mockUserId}`)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: "1", username: "Friend1", avatar: "avatar1.png" },
              { id: "2", username: "Friend2", avatar: "avatar2.png" },
            ]),
        });
      } else if (url.endsWith(`/friend-profile/1`)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              username: "Friend1",
              avatar: "avatar1.png",
              ticker: ["AAPL", "GOOG"],
              watchlist: ["MSFT", "TSLA"],
              trades: [{ symbol: "AAPL" }, { symbol: "GOOG" }],
            }),
        });
      } else if (url.endsWith(`/remove-friend`)) {
        return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders Friends component and fetches friends", async () => {
    renderWithProviders(<Friends />, { providerProps: { colorMode: {} } });

    await waitFor(() => {
      expect(screen.getByText(/Friend1/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Friend2/i)).toBeInTheDocument();
  });

  test("opens and closes friend profile dialog", async () => {
    renderWithProviders(<Friends />, { providerProps: { colorMode: {} } });

    await waitFor(() => {
      expect(screen.getByText(/Friend1/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByAltText("Friend")[0]);

    await waitFor(() => {
      expect(screen.getByText(/friend profile/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /close profile/i }));

    await waitFor(() => {
      expect(screen.queryByText(/friend profile/i)).not.toBeInTheDocument();
    });
  });

  test("shows loading indicator while fetching friends", () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve([]),
              }),
            1000
          )
        )
    );

    renderWithProviders(<Friends />, { providerProps: { colorMode: {} } });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
