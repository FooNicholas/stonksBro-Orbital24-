import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext";
import { tokens, ColorModeContext, useMode } from "../../theme";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Grid,
  useTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Sidebar from "../../scenes/global/Sidebar";
import Topbar from "../../scenes/global/Topbar";

import logo_icon from "../Assets/stonksBro-icon.png";
import user_icon from "../Assets/person.png";
import portfolio_icon from "../Assets/portfolio.png";
import add_icon from "../Assets/add_friends.png";
import Friends from "../FriendsList/FriendsList";
import Add from "../AddFriends/AddFriends";
import ComingSoon from "../ComingSoon/ComingSoon";

import "./Profile.css";

const Profile = () => {
  const colorTheme = useTheme();
  const colors = colorTheme.palette;
  const [theme, colorMode] = useMode();
  const { username, userId } = useAuth();
  const [avatarURL, setAvatarURL] = useState("");
  const [isIconPromptVisible, setIconPromptVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState("portfolio");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [isSidebar, setIsSidebar] = useState(true); // State to toggle sidebar
  const presetIcons = ["dog", "dog_1", "cat", "panda", "rabbit"];

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const handleGetAvatar = async () => {
      try {
        const response = await fetch(
          `https://stonks-bro-orbital24-server.vercel.app/get-avatar/${userId}`,
          { signal }
        );
        if (response.ok) {
          const data = await response.json();
          setAvatarURL(data.avatar);
        } else {
          console.error("Failed to fetch avatar");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error getting avatar:", error);
        }
      }
    };

    handleGetAvatar();
    return () => controller.abort();
  });

  const handleIconClick = (icon) => {
    setSelectedIcon(icon);
  };

  const handleChangeAvatar = async () => {
    setIconPromptVisible(false);
    try {
      const response = await fetch(
        "https://stonks-bro-orbital24-server.vercel.app/change-avatar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avatar: selectedIcon,
            userId: userId,
          }),
        }
      );

      if (response.ok) {
        console.log("Avatar updated successfully");
        const data = await response.text();
        setAvatarURL(data.avatar);
      } else {
        console.error("Failed to change avatar");
      }
    } catch (error) {
      console.error("Error changing avatar:", error);
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
            <Box
              sx={{
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: "10px",
                p: 3,
                mt: 5,
                mx: "auto",
                width: "80%",
                border: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Avatar
                  src={avatarURL}
                  alt="Avatar"
                  onClick={() => setIconPromptVisible(!isIconPromptVisible)}
                  sx={{
                    width: "150px",
                    height: "150px",
                    cursor: "pointer",
                    mr: 2,
                  }}
                />
                <Typography
                  variant="h2"
                  color={colors.grey[900]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {username}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Box
                  sx={{
                    width: "150px",
                    display: "flex",
                    flexDirection: "column",
                    mr: 3,
                  }}
                >
                  <Button
                    variant={
                      selectedSection === "portfolio" ? "contained" : "outlined"
                    }
                    onClick={() => setSelectedSection("portfolio")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      mb: 1,
                    }}
                  >
                    <img
                      src={portfolio_icon}
                      alt="user_icon"
                      style={{
                        marginRight: "10px",
                        width: "25px",
                        height: "25px",
                      }}
                    />
                    Portfolio
                  </Button>
                  <Button
                    variant={
                      selectedSection === "friends" ? "contained" : "outlined"
                    }
                    onClick={() => setSelectedSection("friends")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      mb: 1,
                    }}
                  >
                    <img
                      src={user_icon}
                      alt="user_icon"
                      style={{
                        marginRight: "10px",
                        width: "25px",
                        height: "25px",
                      }}
                    />
                    Friends
                  </Button>
                  <Button
                    variant={
                      selectedSection === "add" ? "contained" : "outlined"
                    }
                    onClick={() => setSelectedSection("add")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <img
                      src={add_icon}
                      alt="add_icon"
                      style={{
                        marginRight: "10px",
                        width: "30px",
                        height: "30px",
                      }}
                    />
                    Add
                  </Button>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    maxHeight: "550px",
                    overflow: "auto",
                  }}
                ></Box>
              </Box>

              <Dialog
                open={isIconPromptVisible}
                onClose={() => setIconPromptVisible(false)}
              >
                <DialogTitle>Choose an Avatar</DialogTitle>
                <DialogContent>
                  <Box display="flex" justifyContent="center" flexWrap="wrap">
                    {presetIcons.map((icon, index) => (
                      <Box
                        key={index}
                        sx={{
                          m: 1,
                          border:
                            selectedIcon === icon
                              ? `2px solid ${colors.primary.main}`
                              : "none",
                          borderRadius: "50%",
                          padding: "5px",
                        }}
                      >
                        <Avatar
                          src={require(`../Assets/avatar/${icon}.png`)}
                          alt={`icon-${index}`}
                          sx={{ cursor: "pointer", width: 56, height: 56 }}
                          onClick={() => handleIconClick(icon)}
                        />
                      </Box>
                    ))}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleChangeAvatar} color="secondary">
                    Save
                  </Button>
                  <Button
                    onClick={() => setIconPromptVisible(false)}
                    color="secondary"
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Profile;
