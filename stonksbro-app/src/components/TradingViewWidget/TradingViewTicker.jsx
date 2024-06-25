import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

const TradingViewTicker = (symbols) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbols.symbols,
      width: "100%",
      colorTheme: "light",
      locale: "en",
    });
    containerRef.current.appendChild(script);
  }, [symbols]);

  return (
    <Box
      ref={containerRef}
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
