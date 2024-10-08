import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import MessageBox from "../MessageBox/MessageBox";
import { tokens, ColorModeContext, useMode } from "../../theme";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  CssBaseline,
  ThemeProvider,
  CircularProgress,
} from "@mui/material";

import Sidebar from "../../scenes/global/Sidebar";
import Topbar from "../../scenes/global/Topbar";
import Header from "../Header/Header";

import "./AddFriends.css";

const AddFriends = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadSendRequest, setLoadSendRequest] = useState(false);
  const { userId, username } = useAuth();

  useEffect(() => {
    const fetchFriendRequests = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch(
          `https://stonks-bro-orbital24-server.vercel.app/friend-requests/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          setFriendRequests(data);
        } else {
          console.error("Failed to fetch friend requests");
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchFriendRequests();
  }, [userId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAccept = async (e, senderId) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            senderId: senderId,
          }),
        }
      );
      if (response.ok) {
        console.log("Successfully accepted friend request");
        setFriendRequests((prevRequests) =>
          prevRequests.filter((request) => request.sender_id !== senderId)
        );
        setLoading(false);
      } else {
        console.error("Failed to accept friend request");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error accepting friend requests:", error);
      setLoading(false);
    }
  };

  const handleReject = async (e, senderId) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            senderId: senderId,
          }),
        }
      );

      if (response.ok) {
        console.log("Successfully rejected friend request");
        setFriendRequests((prevRequests) =>
          prevRequests.filter((request) => request.sender_id !== senderId)
        );
        setLoading(false);
      } else {
        console.error("Failed to reject friend request");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error rejecting friend requests:", error);
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    setLoadSendRequest(true);

    if (searchQuery === username) {
      setMessage("You cannot send a friend request to yourself");
      setLoadSendRequest(false);
    } else {
      try {
        const response = await fetch(
          "https://stonks-bro-orbital24-server.vercel.app/send-friend-request",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              senderId: userId,
              receiverUsername: searchQuery,
            }),
          }
        );

        if (response.ok) {
          const responseMessage = await response.text();
          setMessage(responseMessage);
          setSearchQuery("");
          setLoadSendRequest(false);
        } else {
          const errorMessage = await response.text();
          setMessage(errorMessage);
          setSearchQuery("");
          setLoadSendRequest(false);
        }
      } catch (error) {
        console.error("Error sending friend request:", error);
        setMessage("Error sending friend request.");
        setSearchQuery("");
        setLoadSendRequest(false);
      }
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
              <Header title="ADD FRIENDS" />
            </Box>
            <Box m="15px">
              <Box>
                <form
                  onSubmit={handleSendFriendRequest}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <TextField
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search for friends..."
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                  <Button
                    type="submit"
                    sx={{
                      backgroundColor: colors.blueAccent[600],
                      color: colors.grey[100],
                      fontSize: "12px",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: colors.blueAccent[700],
                      },
                      marginLeft: 1,
                      marginTop: 1.1,
                    }}
                  >
                    Send Request
                  </Button>
                </form>
              </Box>

              <Box
                style={{
                  marginTop: 10,
                  height: "70vh",
                }}
              >
                {loading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    height="100%"
                  >
                    <CircularProgress />
                  </Box>
                ) : friendRequests.length > 0 ? (
                  <List>
                    {friendRequests.map((request) => (
                      <ListItem
                        key={request.id}
                        sx={{
                          border: "1px solid black",
                          display: "flex",
                          justifyContent: "space-between",
                          borderRadius: "5px",
                          marginBottom: "10px",
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="h3">
                              Username: {request.sender_username}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body4">
                              Created at: {request.created_at}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction
                          style={{ display: "flex", gap: 8 }}
                        >
                          <Button
                            sx={{
                              backgroundColor: colors.greenAccent[600],
                              color: colors.grey[100],
                              fontSize: "14px",
                              fontWeight: "bold",
                              height: "50px",
                              width: "100px",
                              "&:hover": {
                                backgroundColor: colors.greenAccent[700],
                              },
                            }}
                            onClick={(e) => handleAccept(e, request.sender_id)}
                          >
                            Accept
                          </Button>
                          <Button
                            sx={{
                              backgroundColor: colors.redAccent[600],
                              color: colors.grey[100],
                              fontSize: "14px",
                              fontWeight: "bold",
                              height: "50px",
                              width: "100px",
                              "&:hover": {
                                backgroundColor: colors.redAccent[700],
                              },
                            }}
                            onClick={(e) => handleReject(e, request.sender_id)}
                          >
                            Reject
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="h4" align="center">
                    No Incoming Friend requests
                  </Typography>
                )}
                {loadSendRequest ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    height="40%"
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box></Box>
                )}
                <MessageBox message={message} onClose={() => setMessage("")} />
              </Box>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default AddFriends;
