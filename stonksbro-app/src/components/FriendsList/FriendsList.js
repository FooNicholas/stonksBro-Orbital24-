import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import { ColorModeContext, useMode } from "../../theme";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  useTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import Sidebar from "../../scenes/global/Sidebar";
import Topbar from "../../scenes/global/Topbar";
import "./FriendsList.css";
import Header from "../Header/Header";

const Friends = () => {
  const colorTheme = useTheme();
  const colors = colorTheme.palette;
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  const [friends, setFriends] = useState([]);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(
          `https://stonks-bro-orbital24-server.vercel.app/friends/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          setFriends(data);
          console.log(data);
        } else {
          console.error("Failed to fetch friends");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [userId]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Box m="15px">
              <Header title="FRIENDS" />
            </Box>
            <Box m="15px">
              <Grid container spacing={1}>
                {friends.map((friend) => (
                  <Grid item key={friend.id} xs={12} sm={6} md={4} lg={3}>
                    <Box
                      sx={{
                        textAlign: "center",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        cursor: "pointer",
                        overflowWrap: "break-word",
                        color: "black",
                        height: "300px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Avatar
                        src={friend.avatar}
                        alt="Friend"
                        sx={{
                          width: "200px",
                          height: "200px",
                          borderRadius: "50%",
                          marginBottom: "10px",
                        }}
                      />
                      <Typography variant="h4">
                        {friend.username}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Friends;
