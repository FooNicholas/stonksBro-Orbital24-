import React, { useState, useEffect, useRef, memo } from "react";
import { Box, TextField, Button, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, useTheme, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";
import { useAuth } from "../AuthContext/AuthContext";
import { Link } from 'react-router-dom'; // Ensure proper usage of Link

function TradingViewDashboard() {
  const container = useRef(null);
  const [watchlist, setWatchlist] = useState([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { userId } = useAuth();

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      watchlist: watchlist,
      autosize: true,
      width: "100%",
      height: "100%",
      symbol: "NASDAQ:AAPL",
      interval: "D",
      timezone: "exchange",
      theme: theme.palette.mode,
      style: "1",
      withdateranges: true,
      allow_symbol_change: true,
      save_image: false,
      details: true,
      hide_side_toolbar: false,
      support_host: "https://www.tradingview.com",
    });

    container.current.appendChild(script);
  }, [watchlist, theme.palette.mode]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch(`http://localhost:5000/watchlist/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setWatchlist(data);
          } else {
            console.error("Invalid data format: expected an array");
          }
        } else {
          console.error("Failed to fetch watchlist");
        }
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    fetchWatchlist();
  }, [userId]);

  const addSymbol = async () => {
    if (newSymbol && !watchlist.includes(newSymbol.toUpperCase())) {
      setWatchlist([...watchlist, newSymbol.toUpperCase()]);

      try {
        const response = await fetch(`http://localhost:5000/add-symbol`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: userId,
            newWatchlist: [...watchlist, newSymbol.toUpperCase()]
          })
        });

        if (response.ok) {
          console.log("Success adding symbol to watchlist");
        }
      } catch (error) {
        console.error("Error adding symbol to watchlist:", error);
      }
      setNewSymbol("");
    }
  };

  const removeSymbol = async (symbol) => {
    const updatedWatchlist = watchlist.filter(item => item !== symbol);
    setWatchlist(updatedWatchlist);

    try {
      const response = await fetch(`http://localhost:5000/remove-symbol`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userId,
          newWatchlist: updatedWatchlist
        })
      });

      if (response.ok) {
        console.log("Success removing symbol in watchlist");
      }
    } catch (error) {
      console.error("Error removing symbol in watchlist:", error);
    }
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Button
        variant="contained"
        onClick={handleDialogOpen}
        sx={{
          position: "absolute",
          top: 3,
          right: 15,
          zIndex: 1,
          backgroundColor: colors.blueAccent[600],
          color: colors.grey[100],
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: colors.blueAccent[700],
          },
        }}
      >
        Edit Watchlist
      </Button>

      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          Edit Watchlist
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
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
          <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
            <TextField
              label="Add Symbol"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              variant="outlined"
              sx={{ mr: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={addSymbol}
              sx={{
                backgroundColor: colors.blueAccent[600],
                color: colors.grey[100],
                fontWeight: "bold",
              }}
            >
              Add
            </Button>
          </Box>
          <Box>
            {watchlist.map((symbol, index) => (
              <Paper key={index} sx={{ display: "flex", alignItems: "center", mb: 1, p: 2 }}>
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {symbol}
                </Typography>
                <IconButton color="secondary" onClick={() => removeSymbol(symbol)}>
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" startIcon={<CloseIcon />}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        className="tradingview-widget-container"
        ref={container}
        sx={{ height: "500px" }}
      >
        <Box className="tradingview-widget-container__widget"></Box>
        <Box className="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/"
            rel="noreferrer nofollow"
            target="_blank"
          >
            TradingView
          </a>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(TradingViewDashboard);
