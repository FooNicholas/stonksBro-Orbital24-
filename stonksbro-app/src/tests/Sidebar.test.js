import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "../scenes/global/Sidebar";
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

describe("Navbar Component", () => {
  const mockUserId = "test-user-id";
  const mockUsername = "test-user";

  beforeEach(() => {
    useAuth.mockReturnValue({
      userId: mockUserId,
      username: mockUsername,
    });

    global.fetch = jest.fn((url, options) => {
      if (url.includes(`/get-avatar/${mockUserId}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ avatar: "test-avatar-url.png" }),
        });
      }
      if (url.includes("/change-avatar")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("new-avatar-url.png"),
        });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders Navbar component with user information", async () => {
    renderWithProviders(<Navbar />, { providerProps: { colorMode: {} } });

    await waitFor(() => {
      // Check if avatar image is rendered
      expect(screen.getByAltText("Avatar")).toBeInTheDocument();
    });

    // Check if  username is rendered
    expect(screen.getByText(mockUsername)).toBeInTheDocument();
  });

  test("collapses and expands the sidebar", async () => {
    renderWithProviders(<Navbar />, { providerProps: { colorMode: {} } });

    // Check initial state of sidebar (expanded)
    expect(screen.getByText("stonksBro")).toBeInTheDocument();

    // Collapse sidebar
    fireEvent.click(screen.getByText("stonksBro"));
    expect(screen.queryByText("stonksBro")).not.toBeInTheDocument();

    // Expand sidebar
    fireEvent.click(screen.getByTestId("MenuOutlinedIcon"));
    expect(screen.getByText("stonksBro")).toBeInTheDocument();
  });

  test("opens and closes avatar change dialog", async () => {
    renderWithProviders(<Navbar />, { providerProps: { colorMode: {} } });

    // Open avatar change dialog
    fireEvent.click(await screen.findByAltText("Avatar"));

    await waitFor(() => {
      expect(screen.getByText("Choose an Avatar")).toBeInTheDocument();
    });

    // Close dialog
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText("Choose an Avatar")).not.toBeInTheDocument();
    });
  });
});
