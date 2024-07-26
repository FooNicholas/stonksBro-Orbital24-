import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import { tokens, ColorModeContext, useMode } from "../../theme";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  useTheme,
  CssBaseline,
  ThemeProvider,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import TradingViewTicker from "../TradingViewWidget/TradingViewTicker";

import Sidebar from "../../scenes/global/Sidebar";
import Topbar from "../../scenes/global/Topbar";
import "./FriendsList.css";
import Header from "../Header/Header";

const Friends = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  const [friends, setFriends] = useState([]);
  const { userId } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [removeFriend, setRemoveFriend] = useState({
    friendUsername: "",
    friendId: "",
  });
  const [friendDialog, setFriendDialog] = useState(false);
  const [friendData, setFriendData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/friends/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
        setLoading(false);
      } else {
        console.error("Failed to fetch friends");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleDeleteDialogOpen = (username, id) => {
    setRemoveFriend({ friendUsername: username, friendId: id });
    setDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialog(false);
    setRemoveFriend({ friendUsername: "", friendId: "" });
  };

  const handleRemoveFriend = async (friendId) => {
    handleDeleteDialogClose();
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/remove-friend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            friendId: friendId,
          }),
        }
      );

      if (response.ok) {
        fetchFriends();
        console.log("Successfully removed friend from friends list");
      } else {
        console.log("Failed to remove friend from friends list");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const handleFriendProfileClose = () => {
    setFriendDialog(false);
  };

  const handleOpenProfile = async (friendId) => {
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/friend-profile/${friendId}`
      );
      if (response.ok) {
        const data = await response.json();
        setFriendDialog(true);
        setFriendData(data[0] || {});
        console.log("Successfully fetched friend data");
      }
    } catch (error) {
      console.error("Error fetching friend data:", error);
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
              <Header title="FRIENDS" />
            </Box>
            <Box m="15px">
              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="600px"
                  justifySelf="center"
                >
                  <CircularProgress />
                </Box>
              ) : friends.length > 0 ? (
                <Grid container spacing={1}>
                  {friends.map((friend) => (
                    <Grid item key={friend.id} xs={12} sm={6} md={4} lg={3}>
                      <Box
                        sx={{
                          textAlign: "center",
                          padding: "10px",
                          border: "1px solid #ccc",
                          borderRadius: "10px",
                          overflowWrap: "break-word",
                          color: "black",
                          height: "300px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        <IconButton
                          aria-label={`remove friend`}
                          onClick={() =>
                            handleDeleteDialogOpen(friend.username, friend.id)
                          }
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 16,
                            color: colors.redAccent[500],
                            "&:hover": {
                              color: colors.redAccent[700],
                            },
                          }}
                        >
                          <PersonRemoveOutlinedIcon />
                        </IconButton>
                        <Avatar
                          onClick={() => handleOpenProfile(friend.id)}
                          src={friend.avatar}
                          alt="Friend"
                          sx={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "50%",
                            mt: 3,
                            marginBottom: "10px",
                            cursor: "pointer",
                          }}
                        />
                        <Typography variant="h4">{friend.username}</Typography>
                      </Box>
                      <Dialog
                        open={deleteDialog}
                        onClose={handleDeleteDialogClose}
                      >
                        <DialogTitle>
                          <Typography fontSize="20px" fontWeight="bold">
                            {" "}
                            CONFIRMATION{" "}
                          </Typography>
                          <IconButton
                            aria-label="close confirmation"
                            onClick={handleDeleteDialogClose}
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
                          <Typography>
                            {" "}
                            You are about to remove{" "}
                            {removeFriend.friendUsername} as friend.
                          </Typography>
                          <Typography>
                            {" "}
                            This action is irreversible. Are you sure?
                          </Typography>
                          <Button
                            aria-label="confirm remove"
                            onClick={() =>
                              handleRemoveFriend(removeFriend.friendId)
                            }
                            sx={{
                              backgroundColor: colors.redAccent[600],
                              color: colors.grey[100],
                              fontSize: "15px",
                              fontWeight: "bold",
                              padding: "5px",
                              "&:hover": {
                                backgroundColor: colors.redAccent[700],
                              },
                              width: "100%",
                              mt: 2,
                            }}
                          >
                            REMOVE
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="h4" align="center">
                  You currently have no friends
                </Typography>
              )}
            </Box>
            <Dialog
              open={friendDialog}
              onClose={handleFriendProfileClose}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  maxHeight: "80vh",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <DialogTitle>
                <Typography fontSize="20px" fontWeight="bold">
                  FRIEND PROFILE
                </Typography>
                <IconButton
                  aria-label="close profile"
                  onClick={handleFriendProfileClose}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    src={friendData?.avatar || ""}
                    alt="Friend"
                    sx={{
                      width: "150px",
                      height: "150px",
                      mt: 2,
                      mb: 2,
                      mr: 5,
                    }}
                  />
                  <Typography variant="h1" fontWeight="bold">
                    {friendData?.username || "Username not available"}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography variant="h4" fontWeight="bold">
                    Tickers:
                  </Typography>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap="10px"
                  >
                    {friendData?.ticker?.length > 0 ? (
                      friendData.ticker.map((item, index) => (
                        <Box
                          key={index}
                          backgroundColor={colors.blueAccent[600]}
                          gridColumn="span 3"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          sx={{ height: "100%", border: 1 }}
                        >
                          <TradingViewTicker symbol={item} />
                        </Box>
                      ))
                    ) : (
                      <Typography>No tickers available</Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ width: "100%", mt: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    Watchlist:
                  </Typography>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap="10px"
                  >
                    {friendData?.watchlist?.length > 0 ? (
                      friendData.watchlist.map((item, index) => (
                        <Box
                          key={index}
                          backgroundColor={colors.blueAccent[600]}
                          gridColumn="span 3"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          sx={{ height: "100%", border: 1 }}
                        >
                          <TradingViewTicker symbol={item} />
                        </Box>
                      ))
                    ) : (
                      <Typography>No watchlist available</Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ width: "100%", mt: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    Portfolio:
                  </Typography>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap="10px"
                  >
                    {friendData?.trades?.length > 0 ? (
                      [
                        ...new Set(
                          friendData.trades.map((trade) => trade.symbol)
                        ),
                      ].map((symbol, index) => {
                        const trade = friendData.trades.find(
                          (t) => t.symbol === symbol
                        );
                        return (
                          <Box
                            key={index}
                            backgroundColor={colors.blueAccent[600]}
                            display="flex"
                            gridColumn="span 3"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ height: "100%", border: 1 }}
                          >
                            <TradingViewTicker symbol={symbol} />
                          </Box>
                        );
                      })
                    ) : (
                      <Typography>No portfolio available.</Typography>
                    )}
                  </Box>
                </Box>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Friends;
