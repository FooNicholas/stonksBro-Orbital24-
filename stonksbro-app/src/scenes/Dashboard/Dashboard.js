import { useState } from "react";
import { tokens, ColorModeContext, useMode } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import Header from "../../components/Header/Header";
import Topbar from "../global/Topbar";
import Sidebar from "../global/Sidebar";
import TradingViewDashboard from "../../components/TradingViewWidget/TradingViewDashboard";
import TradingViewNews from "../../components/TradingViewWidget/TradingViewNews";
import TradingViewTicker from "../../components/TradingViewWidget/TradingViewTicker";
import styles from "./Dashboard.module.css";
import {
  Box,
  Button,
  Icon,
  IconButton,
  Typography,
  useTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const Dashboard = () => {
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
              {/* HEADER */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Header title="DASHBOARD" />

                <Box>
                  <Button
                    sx={{
                      backgroundColor: colors.blueAccent[700],
                      color: colors.grey[100],
                      fontSize: "14px",
                      fontWeight: "bold",
                      padding: "10px 20px",
                    }}
                  >
                    <AddIcon sx={{ mr: "10px" }} />
                    Change
                  </Button>
                </Box>
              </Box>

              {/* GRID & CHARTS */}
              <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gridAutoRows="140px"
                gap="20px"
              >
                {/* ROW 1 */}
                <Box
                  gridColumn="span 3"
                  backgroundColor={colors.blueAccent[700]}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{ height: "100%", width: "100%" }}
                >
                  <TradingViewTicker  symbols="FOREXCOM:SPXUSD"/>
                </Box>

                <Box
                  gridColumn="span 3"
                  backgroundColor={colors.blueAccent[700]}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <TradingViewTicker  symbols="FOREXCOM:NSXUSD"/>
                </Box>
                <Box
                  gridColumn="span 3"
                  backgroundColor={colors.blueAccent[700]}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <TradingViewTicker  symbols="BITSTAMP:BTCUSD"/>
                </Box>
                <Box
                  gridColumn="span 3"
                  backgroundColor={colors.blueAccent[700]}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                >
                  <TradingViewTicker  symbols="FX:EURUSD"/>
                </Box>

                {/* ROW 2 */}
                <Box
                  gridColumn="span 9"
                  gridRow="span 4"
                  backgroundColor={colors.primary[100]}
                >
                  <Box sx={{
                    height: "100%",
                    width: "100%",
                    border: 1
                  }}>
                    <TradingViewDashboard />
                  </Box>
                </Box>
                <Box
                  gridColumn="span 3"
                  gridRow="span 2"
                  backgroundColor={colors.primary[400]}
                  sx={{
                    height: "100%",
                    width: "100%",
                    border: 1
                  }}
                >
                  <TradingViewNews />
                </Box>

                {/* ROW 3 */}

                <Box
                  gridColumn="span 3"
                  gridRow="span 2"
                  backgroundColor={colors.primary[1000]}
                  overflow="auto"
                  sx={{ border: 1}}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    borderBottom={`4px solid ${colors.primary[500]}`}
                    colors={colors.grey[100]}
                    p="15px"
                  >
                    <Typography
                      color={colors.grey[100]}
                      variant="h5"
                      fontWeight="600"
                    >
                      Recent Transactions
                    </Typography>
                  </Box>
                  {mockTransactions.map((transaction, i) => (
                    <Box
                      key={`${transaction.txId}-${i}`}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      borderBottom={`4px solid ${colors.primary[500]}`}
                      p="15px"
                    >
                      <Box>
                        <Typography
                          color={colors.blueAccent[600]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.txId}
                        </Typography>
                        <Typography color={colors.grey[100]}>
                          {transaction.user}
                        </Typography>
                      </Box>
                      <Box color={colors.grey[100]}>{transaction.date}</Box>
                      <Box
                        p="5px 10px"
                        borderRadius="4px"
                      >
                        ${transaction.cost}
                      </Box>
                    </Box>
                  ))}
                </Box>
                
              </Box>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Dashboard;
