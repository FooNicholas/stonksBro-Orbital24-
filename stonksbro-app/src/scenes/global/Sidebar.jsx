import { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  Box,
  Icon,
  IconButton,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  Button,
} from "@mui/material";

import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import { useAuth } from "../../components/AuthContext/AuthContext";

import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import BalanceIcon from "@mui/icons-material/Balance";
import TvIcon from "@mui/icons-material/Tv";
import { ThemeProvider } from "@emotion/react";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Link
      to={to}
      style={{
        color: colors.grey[100],
        textDecoration: "none",
      }}
    >
      <MenuItem
        active={selected === title}
        style={{
          color: colors.grey[100],
          textDecoration: "none",
        }}
        onClick={() => setSelected(title)}
        icon={icon}
        aria-label={title}
      >
        <Typography>{title}</Typography>
      </MenuItem>
    </Link>
  );
};

const Navbar = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const { username, userId } = useAuth();

  const [avatarURL, setAvatarURL] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const presetIcons = ["dog", "dog_1", "cat", "panda", "rabbit"];
  const [isIconPromptVisible, setIconPromptVisible] = useState(false);

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

  const handleChangeAvatarClose = () => {
    setSelectedIcon("");
    setIconPromptVisible(false);
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
        setSelectedIcon("");
      } else {
        console.error("Failed to change avatar");
      }
    } catch (error) {
      console.error("Error changing avatar:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },

        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <Sidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}

          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={
              isCollapsed ? <MenuOutlinedIcon aria-label="menu" /> : undefined
            }
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h7" color={colors.grey[100]}>
                  stonksBro
                </Typography>
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  aria-label="menu"
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>
          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Avatar
                  src={avatarURL}
                  alt="Avatar"
                  onClick={() => setIconPromptVisible(!isIconPromptVisible)}
                  sx={{
                    width: "150px",
                    height: "150px",
                    cursor: "pointer",
                  }}
                />

                {/* <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={avatarURL}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                /> */}
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {username}
                </Typography>
              </Box>
              <Dialog
                open={isIconPromptVisible}
                onClose={() => handleChangeAvatarClose()}
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
                              ? `2px solid ${colors.blueAccent[600]}`
                              : "none",
                          borderRadius: "50%",
                          padding: "5px",
                        }}
                      >
                        <Avatar
                          src={require(`../../components/Assets/avatar/${icon}.png`)}
                          alt={`icon-${index}`}
                          sx={{ cursor: "pointer", width: 70, height: 70 }}
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
                    onClick={() => handleChangeAvatarClose()}
                    color="secondary"
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<TvIcon />}
              selected={selected}
              setSelected={setSelected}
              aria-label="Dashboard"
            />

            <Typography
              variant="h6"
              color={colors.grey[500]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title="Friends"
              to="/friends"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              aria-label="Friends"
            />
            <Item
              title="Add"
              to="/add"
              icon={<PersonAddAltOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              aria-label="Add"
            />

            <Typography
              variant="h6"
              color={colors.grey[500]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="News"
              to="/news"
              icon={<NewspaperIcon />}
              selected={selected}
              setSelected={setSelected}
              aria-label="News"
            />
            {/* <Item
              title="Calendar"
              //to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            <Item
              title="Trading Simulator"
              to="/simulator"
              icon={<BalanceIcon />}
              selected={selected}
              setSelected={setSelected}
              aria-label="Trading Simulator"
            />

            {/* <Typography
              variant="h6"
              color={colors.grey[500]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              //to="/bar"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              //to="/pie"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              //to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Full Chart"
              //to="/line"
              icon={<StackedLineChartIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default Navbar;
