import { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../scenes/global/Sidebar";
import Topbar from "../../scenes/global/Topbar";
import { tokens, ColorModeContext, useMode } from "../../theme";
import { Box, useTheme, CssBaseline, ThemeProvider } from "@mui/material";

import Portfolio from "./Portfolio";

const TradingSimulator = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Box m="15px">
              <Header title="TRADING SIMULATOR" />
            </Box>
            <Portfolio />
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default TradingSimulator;
