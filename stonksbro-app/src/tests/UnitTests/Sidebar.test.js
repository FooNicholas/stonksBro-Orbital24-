import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "../../scenes/global/Sidebar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../theme";
import { useAuth } from "../../components/AuthContext/AuthContext";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock useAuth
jest.mock("../../components/AuthContext/AuthContext", () => ({
  useAuth: jest.fn(),
}));

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
    jest.clearAllMocks(); // Ensure that mocks are cleared between tests
  });

  test("renders Navbar component with user information", async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
          <ColorModeContext.Provider value={{}}>
            <Navbar />
          </ColorModeContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check if avatar image is rendered
      expect(screen.getByAltText("Avatar")).toBeInTheDocument();
    });

    // Check if username is rendered
    expect(screen.getByText(mockUsername)).toBeInTheDocument();
  });

  test("collapses and expands the sidebar", async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
          <ColorModeContext.Provider value={{}}>
            <Navbar />
          </ColorModeContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Check initial state of sidebar (expanded)
    expect(screen.getByText("stonksBro")).toBeInTheDocument();

    // Collapse sidebar
    fireEvent.click(screen.getByText("stonksBro"));
    expect(screen.queryByText("stonksBro")).not.toBeInTheDocument();

    // Expand sidebar
    fireEvent.click(screen.getByLabelText("menu"));
    expect(screen.getByText("stonksBro")).toBeInTheDocument();
  });

  test("opens and closes avatar change dialog", async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
          <ColorModeContext.Provider value={{}}>
            <Navbar />
          </ColorModeContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

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

  test("navigates to Dashboard page when Dashboard link is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
          <ColorModeContext.Provider value={{}}>
            <Routes>
              <Route path="/" element={<Navbar />} />
              <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            </Routes>
          </ColorModeContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("Dashboard"));
    expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
  });

  test("navigates to Friends page when Friends link is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
          <ColorModeContext.Provider value={{}}>
            <Routes>
              <Route path="/" element={<Navbar />} />
              <Route path="/friends" element={<div>Friends Page</div>} />
            </Routes>
          </ColorModeContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("Friends"));
    expect(await screen.findByText("Friends Page")).toBeInTheDocument();
  });

  test("navigates to Add page when Add link is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
          <ColorModeContext.Provider value={{}}>
            <Routes>
              <Route path="/" element={<Navbar />} />
              <Route path="/add" element={<div>Add Page</div>} />
            </Routes>
          </ColorModeContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("Add"));
    expect(await screen.findByText("Add Page")).toBeInTheDocument();
  });

  test("navigates to News page when News link is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
          <ColorModeContext.Provider value={{}}>
            <Routes>
              <Route path="/" element={<Navbar />} />
              <Route path="/news" element={<div>News Page</div>} />
            </Routes>
          </ColorModeContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("News"));
    expect(await screen.findByText("News Page")).toBeInTheDocument();
  });

  test("navigates to Simulator page when Simulator link is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
          <ColorModeContext.Provider value={{}}>
            <Routes>
              <Route path="/" element={<Navbar />} />
              <Route path="/simulator" element={<div>Simulator Page</div>} />
            </Routes>
          </ColorModeContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("Trading Simulator"));
    expect(await screen.findByText("Simulator Page")).toBeInTheDocument();
  });
});
