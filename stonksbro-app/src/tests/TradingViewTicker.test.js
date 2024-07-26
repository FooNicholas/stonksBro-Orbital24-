import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TradingViewTicker from "../components/TradingViewWidget/TradingViewTicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const renderWithProviders = (ui, { theme }) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("TradingViewTicker Component", () => {
  test("renders TradingViewTicker and loads script", async () => {
    const theme = createTheme({
      palette: {
        mode: "light",
      },
    });

    const symbol = "AAPL";

    renderWithProviders(<TradingViewTicker symbol={symbol} />, { theme });

    const container = screen.getByRole("region");

    // Ensure the container is in the document
    expect(container).toBeInTheDocument();

    // Wait for the script to be added to the container
    await waitFor(() => {
      const script = container.querySelector("script");
      expect(script).toBeInTheDocument();
      expect(script.src).toContain(
        "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js"
      );
      expect(script.innerHTML).toContain('"symbol":"AAPL"');
    });
  });

  test("updates script when symbol changes", async () => {
    const theme = createTheme({
      palette: {
        mode: "light",
      },
    });

    const { rerender } = renderWithProviders(
      <TradingViewTicker symbol="AAPL" />,
      { theme }
    );

    const container = screen.getByRole("region");

    // Wait for the initial script to be added to the container
    await waitFor(() => {
      const script = container.querySelector("script");
      expect(script).toBeInTheDocument();
      expect(script.src).toContain(
        "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js"
      );
      expect(script.innerHTML).toContain('"symbol":"AAPL"');
    });

    // Rerender with a new symbol
    rerender(
      <ThemeProvider theme={theme}>
        <TradingViewTicker symbol="GOOG" />
      </ThemeProvider>
    );

    // Wait for the updated script to be added to the container
    await waitFor(() => {
      const script = container.querySelector("script");
      expect(script).toBeInTheDocument();
      expect(script.innerHTML).toContain('"symbol":"GOOG"');
    });
  });
});
