import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Topbar from "../scenes/global/Topbar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ColorModeContext } from "../theme";
import { useAuth } from "../components/AuthContext/AuthContext";
import { MemoryRouter } from "react-router-dom";

// Mock useAuth
jest.mock("../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const renderWithProviders = (ui, { providerProps, ...renderOptions }) => {
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

describe("Topbar Component", () => {
  const mockUserId = "test-user-id";
  const mockUsername = "test-user";

  beforeEach(() => {
    useAuth.mockReturnValue({
      userId: mockUserId,
      username: mockUsername,
      logout: jest.fn(),
    });

    // Mock fetch API for notifications
    global.fetch = jest.fn((url) => {
      if (url.includes(`/friend-requests/${mockUserId}`)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                sender_id: "123",
                created_at: "2023-07-25T00:00:00.000Z",
                sender_username: "friend1",
              },
            ]),
        });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders Topbar component", async () => {
    renderWithProviders(<Topbar />, { providerProps: { colorMode: {} } });

    await waitFor(() => {
      // Check if the search input is rendered
      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    });

    // Check if the light mode button is rendered
    expect(screen.getByTestId("LightModeOutlinedIcon")).toBeInTheDocument();

    // Check if the notifications button is rendered
    expect(screen.getByTestId("NotificationsOutlinedIcon")).toBeInTheDocument();

    // Check if the settings button is rendered
    expect(screen.getByTestId("SettingsOutlinedIcon")).toBeInTheDocument();

    // Check if the logout button is rendered
    expect(screen.getByTestId("LogoutIcon")).toBeInTheDocument();
  });

  test("toggles color mode", async () => {
    const toggleColorMode = jest.fn();
    renderWithProviders(<Topbar />, {
      providerProps: { colorMode: { toggleColorMode } },
    });

    // Toggle color mode
    fireEvent.click(screen.getByTestId("LightModeOutlinedIcon"));

    await waitFor(() => {
      expect(toggleColorMode).toHaveBeenCalled();
    });
  });

  test("fetches and displays notifications", async () => {
    renderWithProviders(<Topbar />, { providerProps: { colorMode: {} } });

    // Check notifications
    fireEvent.click(screen.getByTestId("NotificationsOutlinedIcon"));

    await waitFor(() => {
      expect(
        screen.getByText("You have 1 new friend request.")
      ).toBeInTheDocument();
    });
  });

  test("handles logout", async () => {
    const logout = jest.fn();
    useAuth.mockReturnValue({
      userId: mockUserId,
      username: mockUsername,
      logout,
    });

    renderWithProviders(<Topbar />, { providerProps: { colorMode: {} } });

    // Logout
    fireEvent.click(screen.getByTestId("LogoutIcon"));

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
    });
  });
});
