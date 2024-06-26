import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material";

const TradingViewNews = () => {
  const containerRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        feedMode: "all_symbols",
        displayMode: "regular",
        width: "100%",
        height: "100%",
        colorTheme: theme.palette.mode,
        locale: "en",
      });
      containerRef.current.appendChild(script);
    }
  }, [theme.palette.mode]);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height: "100vh", width: "100%" }}
    >
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noreferrer nofollow"
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default TradingViewNews;
