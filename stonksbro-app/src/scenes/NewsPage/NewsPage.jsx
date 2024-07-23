import React, { useState, useEffect } from "react";
import { tokens, ColorModeContext, useMode } from "../../theme";
import { useAuth } from "../../components/AuthContext/AuthContext";
import Header from "../../components/Header/Header";
import Topbar from "../global/Topbar";
import Sidebar from "../global/Sidebar";
import stonksBroIcon from "../../components/Assets/stonksBro-icon.png";
import noImageAvailable from "../../components/Assets/no-image-available.jpg";
import {
  Box,
  Button,
  Typography,
  useTheme,
  CssBaseline,
  ThemeProvider,
  Paper,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import AutocompleteNews from "./AutocompleteNews";

const NewsPage = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const { userId } = useAuth();

  const [query, setQuery] = useState("");
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);

  const newsSearch = async (symbol) => {
    setNewsLoading(true);
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/news/${symbol}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setNews(data);
          setNewsLoading(false);
          setError(null);
        } else {
          setError("No news found");
          setNewsLoading(false);
          setNews([]);
        }
      }
    } catch (error) {
      setError("Failed to fetch news");
      setNewsLoading(false);
      console.log("Error fetching news", error);
    }
  };

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch(
          `https://stonks-bro-orbital24-server.vercel.app/watchlist/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setWatchlist(data);
            setWatchlistLoading(false);
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

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                paddingRight: "15px",
                ml: "15px",
              }}
            >
              <Header title="NEWS SEARCH" />
              <Box mt={2} display="flex" alignItems="center">
                <AutocompleteNews setQuery={setQuery} />
                <Button
                  sx={{
                    backgroundColor: colors.blueAccent[600],
                    color: colors.grey[100],
                    fontSize: "15px",
                    fontWeight: "bold",
                    width: "120px",
                    height: "53px",
                    "&:hover": {
                      backgroundColor: colors.blueAccent[700],
                    },
                    ml: 2,
                  }}
                  onClick={() => newsSearch(query.symbol)}
                >
                  <SearchIcon sx={{ mr: "10px" }} />
                  Search
                </Button>
              </Box>
            </Box>
            <Box
              sx={{ mt: 2, ml: "15px", display: "flex", flexDirection: "row" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: 200,
                  height: "650px",
                  overflowY: "auto",
                  mt: 2,
                  alignItems: "center",
                }}
              >
                <Typography fontSize="20px" fontWeight="bold">
                  WATCHLIST
                </Typography>
                {watchlistLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "75%",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : watchlist.length > 0 ? (
                  watchlist.map((item, index) => (
                    <Paper
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                        p: 2,
                        width: "100px",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: colors.grey[900],
                        },
                      }}
                      onClick={() => newsSearch(item)}
                    >
                      <Typography
                        variant="body1"
                        sx={{ alignItems: "center", justifyContent: "center" }}
                      >
                        {item}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography>Watchlist is empty</Typography>
                )}
              </Box>
              <Box
                mt={3}
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gap="20px"
                sx={{
                  mr: "50px",
                  width: "100%",
                  height: "650px",
                  overflowY: "auto",
                  flexWrap: "no-warp",
                }}
              >
                {error && (
                  <Typography
                    gridColumn="span 12"
                    color="error"
                    textAlign="center"
                  >
                    {error}
                  </Typography>
                )}
                {newsLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      gridColumn: "span 12",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  news.map((item, index) => (
                    <Box
                      key={index}
                      gridColumn="span 3"
                      p={2}
                      borderRadius={4}
                      position="relative"
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-start"
                      sx={{
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        transition: "background-color 0.3s",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                        },
                      }}
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <Box display="flex" alignItems="center">
                        <img
                          src={item.urlToImage}
                          alt={noImageAvailable}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = noImageAvailable;
                          }}
                          style={{
                            width: "70px",
                            height: "50px",
                            borderRadius: "10px",
                            marginRight: "10px",
                          }}
                        />
                        <Typography variant="h6" gutterBottom>
                          {item.title}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default NewsPage;
