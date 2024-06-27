import React, { useState, useEffect, useRef, memo } from 'react';
import { Box, TextField, Button, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, useTheme, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from '../../theme'; // Ensure you import your theme tokens

function TradingViewDashboard() {
  const container = useRef(null);
  const [watchlist, setWatchlist] = useState(['AAPL', 'IBM', 'TSLA', 'AMD', 'MSFT']); //State for watchlist
  const [newSymbol, setNewSymbol] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      watchlist: watchlist,
      autosize: true,
      width: '100%',
      height: '100%',
      symbol: 'NASDAQ:AAPL',
      interval: 'D',
      timezone: 'exchange',
      theme: theme.palette.mode,
      style: '1',
      withdateranges: true,
      allow_symbol_change: true,
      save_image: false,
      details: true,
      hide_side_toolbar: false,
      support_host: 'https://www.tradingview.com',
    });

    container.current.appendChild(script);
  }, [watchlist, theme.palette.mode]);

  const addSymbol = () => {
    if (newSymbol && !watchlist.includes(newSymbol.toUpperCase())) {
      setWatchlist([...watchlist, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (symbol) => {
    setWatchlist(watchlist.filter(item => item !== symbol));
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Button
        variant="contained"
        onClick={handleDialogOpen}
        sx={{
          position: 'absolute',
          top: 3,
          right: 15,
          zIndex: 1,
          backgroundColor: colors.blueAccent[600],
          color: colors.grey[100],
          fontWeight: "bold",
          '&:hover': {
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
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
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
              <Paper key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 2 }}>
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
        sx={{ height: '500px' }}
      >
        <Box className="tradingview-widget-container__widget"></Box>
        <Box className="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/"
            rel="noreferrer nofollow"
            target="_blank"
          >
          </a>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(TradingViewDashboard);