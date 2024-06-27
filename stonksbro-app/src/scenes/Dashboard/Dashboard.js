import { useState } from "react";
import { tokens, ColorModeContext, useMode } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import Header from "../../components/Header/Header";
import Topbar from "../global/Topbar";
import Sidebar from "../global/Sidebar";
import TradingViewDashboard from "../../components/TradingViewWidget/TradingViewDashboard";
import TradingViewNews from "../../components/TradingViewWidget/TradingViewNews";
import TradingViewTicker from "../../components/TradingViewWidget/TradingViewTicker";
import {
  Box,
  Button,
  TextField,
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
  const [isSidebar, setIsSidebar] = useState(true); // State to toggle sidebar
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode

  // State for each ticker symbol
  const [symbols, setSymbols] = useState({
    ticker1: "FOREXCOM:SPXUSD",
    ticker2: "FOREXCOM:NSXUSD",
    ticker3: "BITSTAMP:BTCUSD",
    ticker4: "FX:EURUSD",
  });

  const handleSymbolChange = (e) => {
    const { name, value } = e.target;
    setSymbols((prevSymbols) => ({
      ...prevSymbols,
      [name]: value,
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

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
                      backgroundColor: colors.blueAccent[600],
                      color: colors.grey[100],
                      fontSize: "14px",
                      fontWeight: "bold",
                      padding: "10px 20px",
                      "&:hover": {
                        backgroundColor: colors.blueAccent[700],
                      },
                    }}
                    onClick={toggleEdit}
                  >
                    <AddIcon sx={{ mr: "10px" }} />
                    {isEditing ? "Save" : "Change"}
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
                {Object.keys(symbols).map((tickerKey, index) => (
                  <Box
                    key={tickerKey}
                    gridColumn="span 3"
                    backgroundColor={colors.blueAccent[600]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: "100%", width: "100%" }}
                  >
                    {isEditing ? (
                      <TextField
                        variant="outlined"
                        value={symbols[tickerKey]}
                        name={tickerKey}
                        onChange={handleSymbolChange}
                        sx={{ border: 1 }}
                      />
                    ) : (
                      <TradingViewTicker symbol={symbols[tickerKey]} />
                    )}
                  </Box>
                ))}

                {/* ROW 2 */}
                <Box
                  gridColumn="span 9"
                  gridRow="span 4"
                  backgroundColor={colors.primary[100]}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: "100%",
                      border: 1,
                    }}
                  >
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
                    border: 1,
                  }}
                >
                  <TradingViewNews />
                </Box>

                {/* ROW 3 */}

                <Box
                  gridColumn="span 3"
                  gridRow="span 2"
                  overflow="auto"
                  sx={{ border: 1 }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    borderBottom={`3px solid`}
                    colors={colors.grey[100]}
                    p="15px"
                  >
                    <Typography
                      color={colors.blueAccent[600]}
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
                      borderBottom={`2px solid`}
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

                        {transaction.user}
                      </Box>
                      <Box>{transaction.date}</Box>
                      <Box
                        p="5px 10px"
                        borderRadius="4px"
                        backgroundColor={colors.blueAccent[600]}
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
