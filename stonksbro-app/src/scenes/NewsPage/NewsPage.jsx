import React, { useState, useEffect } from "react";
import { tokens, ColorModeContext, useMode } from "../../theme";
import { useAuth } from "../../components/AuthContext/AuthContext";
import Header from "../../components/Header/Header";
import Topbar from "../global/Topbar";
import Sidebar from "../global/Sidebar";
import stonksBroIcon from "../../components/Assets/stonksBro-icon.png";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import AutocompleteNews from "./AutocompleteNews";

const NewsPage = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const { userId } = useAuth();

  // State for search query and news results
  const [query, setQuery] = useState("");
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    const apiKey = process.env.REACT_APP_ALPHAVANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${query.symbol}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.feed) {
        setNews(data.feed);
        setError(null);
      } else {
        setError("No news found");
        setNews([]);
      }
    } catch (error) {
      setError("Failed to fetch news");
      setNews([]);
    }
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
              <Box>
                <Header title="NEWS SEARCH" />
                <Box mt={2} display="flex" alignItems="center" >
                  <AutocompleteNews setQuery={setQuery}/>
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
                    onClick={handleSearch}
                  >
                    <SearchIcon sx={{ mr: "10px" }} />
                    Search
                  </Button>
                </Box>
              </Box>

              {/* News Results */}
              <Box
                mt={3}
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gap="20px"
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
                {news.length > 0 &&
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
                          src={item.banner_image}
                          alt={item.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = stonksBroIcon;
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
                  ))}
              </Box>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default NewsPage;
