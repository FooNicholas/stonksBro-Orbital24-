import { useState, useEffect } from "react";
import { tokens, ColorModeContext, useMode } from "../../theme";

import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  InputAdornment,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { mockPorfolio } from "../../data/mockPortfolio";

const Subheader = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(mockPorfolio);

  const [formData, setFormData] = useState({
    symbol: "", //text
    position: "Long", //text
    quantity: "", //integer
    type: "Market", //text
    price: "", //integer
  });

  const availableBalance = 1000;

  const portfolioValue = portfolio
    .filter((data) => data.currentValue)
    .reduce((acc, curr) => acc + curr.currentValue, 0);

  const handleTradeDialogOpen = () => {
    setIsTradeDialogOpen(true);
  };

  const handleTradeDialogClose = () => {
    setFormData({
      symbol: "",
      position: "Long",
      quantity: "",
      type: "Market",
      price: "",
    });
    setIsTradeDialogOpen(false);
  };

  const handleSubmit = () => {
    if (
      !formData.symbol ||
      !formData.quantity ||
      (formData.type === "Limit" && !formData.price)
    ) {
      console.log("Do not leave any input fields empty!");
    } else {
      console.log("Successfully ordered!");
      setIsTradeDialogOpen(false);
    }
  };

  return (
    <Box
      m="15px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box>
          <Typography variant="h3">
            Account Value: ${portfolioValue + availableBalance}
          </Typography>
          <Typography variant="h3" marginTop="15px">
            Available Balance: ${availableBalance}
          </Typography>
        </Box>
        <Box /* Profit / Loss of total account value*/
          sx={{
            marginLeft: "50px",
            border: 1,
            height: "100px",
            width: "150px",
            alignContent: "center",
          }}
        >
          Test
        </Box>
      </Box>
      <Box>
        <Button
          onClick={handleTradeDialogOpen}
          sx={{
            backgroundColor: colors.blueAccent[600],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
            "&:hover": {
              backgroundColor: colors.blueAccent[700],
            },
          }}
        >
          <AddIcon sx={{ mr: "10px" }} />
          Trade
        </Button>
        <Dialog /*Trade Dialog*/
          open={isTradeDialogOpen}
          onClose={handleTradeDialogClose}
        >
          <DialogTitle>
            <Typography fontSize="20px" fontWeight="bold">
              {" "}
              TRADE{" "}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleTradeDialogClose}
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
            <Box
              sx={{
                mb: 2,
                flexDirection: "column",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.9 }}>
                <Box
                  height={50}
                  width={50}
                  alignItems={"center"}
                  display={"flex"}
                >
                  <Typography> Symbol: </Typography>
                </Box>
                <Box height={50} width={200} ml={2}>
                  <TextField
                    label="Buy Symbol"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symbol: e.target.value,
                      })
                    }
                    variant="outlined"
                    sx={{ width: "100%" }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
                <Box
                  height={50}
                  width={50}
                  alignItems={"center"}
                  display={"flex"}
                >
                  <Typography> Position: </Typography>
                </Box>
                <Box height={50} width={200} ml={2}>
                  <FormControl fullWidth>
                    <InputLabel> Position </InputLabel>
                    <Select
                      label="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          position: e.target.value,
                        })
                      }
                      variant="outlined"
                    >
                      <MenuItem value="Long"> Long </MenuItem>
                      {/* <MenuItem value="Short"> Short </MenuItem> */}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
                <Box
                  height={50}
                  width={50}
                  alignItems={"center"}
                  display={"flex"}
                >
                  <Typography> Quantity: </Typography>
                </Box>
                <Box height={50} width={200} ml={2}>
                  <TextField
                    label="Quantity"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: e.target.value,
                      })
                    }
                    variant="outlined"
                    sx={{ width: "100%" }}
                    InputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
                <Box
                  height={50}
                  width={50}
                  alignItems={"center"}
                  display={"flex"}
                >
                  <Typography> Type: </Typography>
                </Box>
                <Box height={50} width={200} ml={2}>
                  <FormControl fullWidth>
                    <InputLabel> Type </InputLabel>
                    <Select
                      label="Type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value,
                        })
                      }
                      variant="outlined"
                      sx={{
                        width: "100%",
                      }}
                    >
                      <MenuItem value="Market"> Market </MenuItem>
                      <MenuItem value="Limit"> Limit </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              {formData.type === "Limit" ? (
                <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
                  <Box
                    height={50}
                    width={50}
                    alignItems={"center"}
                    display={"flex"}
                  >
                    <Typography> Price: </Typography>
                  </Box>
                  <Box height={50} width={200} ml={2}>
                    <TextField
                      label="Price"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value,
                        })
                      }
                      variant="outlined"
                      sx={{ width: "100%" }}
                    />
                  </Box>
                </Box>
              ) : (
                <></>
              )}
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{
                backgroundColor: colors.blueAccent[600],
                color: colors.grey[100],
                fontSize: 15,
                fontWeight: "bold",
                width: "100%",
                "&:hover": {
                  backgroundColor: colors.blueAccent[700],
                },
              }}
            >
              BUY
            </Button>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Subheader;
