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
} from "@mui/material";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import CloseIcon from "@mui/icons-material/Close";

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
        console.log(data);
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
                        position: "relative",
                      }}
                    >
                      <IconButton
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
                        src={friend.avatar}
                        alt="Friend"
                        sx={{
                          width: "200px",
                          height: "200px",
                          borderRadius: "50%",
                          mt: 3,
                          marginBottom: "10px",
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
                          aria-label="close"
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
                          You are about to remove {
                            removeFriend.friendUsername
                          }{" "}
                          as friend.
                        </Typography>
                        <Typography>
                          {" "}
                          This action is irreversible. Are you sure?
                        </Typography>
                        <Button
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
                          {" "}
                          REMOVE
                        </Button>
                      </DialogContent>
                    </Dialog>
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
