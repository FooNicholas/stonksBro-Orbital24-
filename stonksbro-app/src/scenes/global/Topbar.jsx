import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext/AuthContext";
import { ColorModeContext, tokens } from "../../theme";

import InputBase from "@mui/material/InputBase";
import { Box, IconButton, Badge, useTheme, Menu, MenuItem, Typography } from "@mui/material";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import TvIcon from "@mui/icons-material/Tv";


const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { logout, userId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`https://stonks-bro-orbital24-server.vercel.app/friend-requests/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
  }, [userId]);


  const onLogout = () => {
    logout();
  };

  const handleNotificationsClick = (e) => {
    setAnchorEl(e.currentTarget);
  }

  const handleNotificationsClose = () => {
    setAnchorEl(null);
  }

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* Search Bar */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* Icons */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        <IconButton onClick={handleNotificationsClick}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleNotificationsClose}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body5">
                No new notifications
              </Typography>
            </MenuItem>
          ) : (
            <MenuItem onClick={handleNotificationsClose}>
              {notifications.length === 1 ? 
                <Typography variant="body5">
                  You have {notifications.length} new friend request.
                </Typography> : 
                <Typography variant="body5">
                  You have {notifications.length} new friend requests.
                </Typography>
              }
            </MenuItem>
            )
          }
        </Menu>

        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>

        <IconButton onClick={onLogout}>
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
