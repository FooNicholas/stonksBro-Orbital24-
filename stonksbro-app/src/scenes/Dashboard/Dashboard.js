import { useState, useEffect } from "react";
import { tokens, ColorModeContext, useMode } from "../../theme";
import { useAuth } from "../../components/AuthContext/AuthContext";
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const Dashboard = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true); // State to toggle sidebar
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const { userId } = useAuth();

  // State for each ticker symbol
  const [symbols, setSymbols] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchTickerSymbol = async () => {
      try {
        const response = await fetch(
          `https://stonks-bro-orbital24-server.vercel.app/ticker/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setSymbols(data);
            console.log("Successfully fetched tickers");
          } else {
            console.error("Invalid data format: expected an array");
          }
        } else {
          console.error("Failed to fetch ticker symbols");
        }
      } catch (error) {
        console.error("Error fetching ticker symbols:", error);
      }
    };

    const fetchRecentTrades = async () => {
      try {
        const response = await fetch(
          `https://stonks-bro-orbital24-server.vercel.app/portfolio/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data[0].trades);
          setTrades(data[0].trades);
        }
      } catch (error) {
        console.error("Error fetching ticker symbols:", error);
      }
    };

    fetchTickerSymbol();
    fetchRecentTrades();
  }, [userId]);

  const handleSymbolChange = (e, index) => {
    const { value } = e.target;

    setSymbols((prevSymbols) => {
      const newSymbols = [...prevSymbols];
      newSymbols[index] = value;
      return newSymbols;
    });
  };

  const handleTickerChange = async () => {
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/update-ticker`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            symbols: symbols,
          }),
        }
      );

      if (response.ok) {
        console.log("successfully updated tickers ");
      } else {
        console.error("Failed to update ticker symbols");
      }
    } catch (error) {
      console.error("Error updating ticker symbols:", error);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      const hasEmptySymbol = symbols.some((symbol) => symbol.trim() === "");
      if (hasEmptySymbol) {
        setDialogMessage("Ticker symbols cannot be empty.");
        setOpenDialog(true);
        return;
      }
      handleTickerChange();
    }
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
                {symbols.map((symbol, index) => (
                  <Box
                    key={index}
                    gridColumn="span 3"
                    backgroundColor={colors.blueAccent[600]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: "100%", width: "100%" }}
                  >
                    {isEditing ? (
                      <TextField
                        required
                        label="Required"
                        variant="outlined"
                        value={symbol}
                        onChange={(e) => handleSymbolChange(e, index)}
                      />
                    ) : (
                      <TradingViewTicker symbol={symbols[index]} />
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
                    colors={colors.grey[100]}
                    ml="15px"
                    mt="15px"
                    mb="1px"
                  >
                    <Typography
                      color={colors.blueAccent[600]}
                      variant="h3"
                      fontWeight="600"
                    >
                      Portfolio
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent={"space-between"}
                    borderBottom={`3px solid`}
                  >
                    <Box
                      display="flex"
                      justifyContent={"space-between"}
                      alignItems="center"
                    >
                      <Typography
                        sx={{ width: 145, ml: 2 }}
                        variant="h5"
                        fontWeight="600"
                      >
                        {" "}
                        Symbol{" "}
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        {" "}
                        Quantity{" "}
                      </Typography>
                    </Box>{" "}
                    <Typography
                      sx={{ mr: "15px" }}
                      variant="h5"
                      fontWeight="600"
                    >
                      {" "}
                      Bought At
                    </Typography>
                  </Box>
                  {trades
                    ? trades.map((transaction, i) => (
                        <Box
                          display="flex"
                          justifyContent={"space-between"}
                          alignItems="center"
                          borderBottom={`2px solid`}
                          p="15px"
                        >
                          <Box justifyContent={"space-between"} display="flex">
                            <Box sx={{ width: 150 }}>
                              <Typography
                                color={colors.blueAccent[600]}
                                variant="h5"
                                fontWeight="600"
                              >
                                {transaction.symbol}
                              </Typography>
                            </Box>
                            <Box sx={{ width: 20 }}>{transaction.held}</Box>
                          </Box>

                          <Box
                            p="5px 10px"
                            borderRadius="4px"
                            backgroundColor={colors.blueAccent[600]}
                          >
                            ${transaction.boughtAt}
                          </Box>
                        </Box>
                      ))
                    : "No Recent Transactions"}
                </Box>
              </Box>
            </Box>
          </main>
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>
              <Typography fontSize="20px" fontWeight="bold">
                {" "}
                WARNING{" "}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={() => setOpenDialog(false)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography
                sx={{
                  color: colors.redAccent[500],
                }}
              >
                {dialogMessage}
              </Typography>
            </DialogContent>
          </Dialog>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Dashboard;
