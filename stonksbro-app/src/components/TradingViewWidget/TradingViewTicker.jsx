import { Box, useTheme } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";

const TradingViewTicker = ({ symbol }) => {
  const containerRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      colorTheme: theme.palette.mode,
      locale: "en",
    });
    containerRef.current.appendChild(script);
  }, [symbol, theme.palette.mode]);

  return (
    <Box
      ref={containerRef}
      role="region"
      sx={{
        width: "100%",
        maxWidth: 600,
        boxShadow: 1,
      }}
    >
      <Box className="tradingview-widget-container__widget"></Box>
    </Box>
  );
};

export default TradingViewTicker;
