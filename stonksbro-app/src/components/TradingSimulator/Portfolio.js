import { useState, useEffect } from "react";
import { tokens, ColorModeContext, useMode } from "../../theme";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  TextField,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  InputAdornment,
  CircularProgress,
  formControlClasses,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { useAuth } from "../AuthContext/AuthContext";
import AutocompleteBox from "./Autocomplete";

const Portfolio = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);
  const { userId } = useAuth();

  const [portfolio, setPortfolio] = useState([]);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [accountBalance, setAccountBalance] = useState(0);

  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [accountBalanceLoading, setAccountBalanceLoading] = useState(true);
  const [totalValueLoading, setTotalValueLoading] = useState(true);

  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorDialogOpen, setErrorDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSellAmountDialogOpen, setSellAmountDialogOpen] = useState(false);
  const [sellAmountError, setSellAmountError] = useState("");

  const totalAccountValue = (
    parseFloat(totalCurrentValue) + parseFloat(accountBalance)
  ).toFixed(2);

  const [buyData, setBuyData] = useState({
    symbol: "", //text
    position: "Long", //text
    quantity: "", //integer
    type: "Market", //text
    price: "", //integer
  });

  const handleErrorDialogClose = () => {
    setErrorMessage("");
    setErrorDialogOpen(false);
  };

  const handleTradeDialogOpen = () => {
    setIsTradeDialogOpen(true);
  };

  const handleTradeDialogClose = () => {
    setBuyData({
      symbol: "",
      position: "Long",
      quantity: 0,
      type: "Market",
      price: 0,
    });
    setErrorMessage("");
    setIsTradeDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (
      buyData.quantity <= 0 ||
      (buyData.type === "Limit" && buyData.price <= 0)
    ) {
      setErrorMessage("Invalid quantity and/or price");
      console.log("Invalid quantity and/or price");
    } else if (
      !buyData.symbol ||
      !buyData.quantity ||
      (buyData.type === "Limit" && !buyData.price)
    ) {
      setErrorMessage("Do not leave any input fields empty!");
      console.log("Do not leave any input fields empty!");
    } else {
      handleBuyOrder();
      setErrorMessage("");
      setIsTradeDialogOpen(false);
    }
  };

  const handleBuyOrder = async () => {
    try {
      setAccountBalanceLoading(true);
      setTotalValueLoading(true);
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/api/buy/${buyData.symbol}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            position: buyData.position,
            held: buyData.quantity,
            userId: userId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        getPortfolio();
        console.log("Successfully ordered!");
        setTotalValueLoading(false);
        setAccountBalanceLoading(false);
      } else {
        const data = await response.json();
        setErrorDialogOpen(true);
        setErrorMessage(data);
        setTotalValueLoading(false);
        setAccountBalanceLoading(false);
        console.error("Error handling buy order:", data.error);
      }
    } catch (error) {
      setTotalValueLoading(false);
      setAccountBalanceLoading(false);
      console.error("Error handling buy order", error);
    }
  };

  const [sellData, setSellData] = useState({
    index: "",
    symbol: "", //text
    quantity: "", //integer
    currentValue: "", //integer
    held: "", //integer
  });

  const handleSellDialogOpen = () => {
    setIsSellDialogOpen(true);
  };

  const handleSellDialogClose = () => {
    setIsSellDialogOpen(false);
    setSellData({ symbol: "", quantity: "", currentValue: "", held: "" });
  };

  const handleSellAmountOpen = (index, symbol, held, currentValue) => {
    setSellData({
      index: index,
      symbol: symbol,
      held: held,
      currentValue: currentValue,
    });
    setSellAmountDialogOpen(true);
  };

  const handleSellAmountClose = () => {
    setSellAmountDialogOpen(false);
    setSellAmountError("");
    setSellData({ symbol: "", quantity: "", currentValue: "", held: "" });
  };

  const handleSellAmountConfirm = () => {
    console.log(sellData);
    if (!sellData.quantity || sellData.quantity <= 0) {
      setSellAmountError("Please enter a valid number");
    } else if (sellData.quantity > sellData.held) {
      setSellAmountError("You do not have enough stocks to conduct this trade");
    } else {
      setSellAmountDialogOpen(false);
      setSellAmountError("");
      handleSellDialogOpen();
    }
  };

  const handleSellOrder = async () => {
    setPortfolioLoading(true);
    setAccountBalanceLoading(true);
    try {
      const updatedPortfolio = portfolio
        .map((stock, index) => {
          if (index === sellData.index) {
            return {
              ...stock,
              held: parseFloat(stock.held - sellData.quantity),
              currentValue: parseFloat(stock.currentValue),
            };
          }
          return stock;
        })
        .filter((stock) => stock.held > 0);

      const newAccountBalance = parseFloat(
        sellData.quantity * sellData.currentValue + accountBalance
      ).toFixed(2);

      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/sell/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updatedPortfolio: updatedPortfolio,
            newAccountBalance: newAccountBalance,
          }),
        }
      );

      if (response.ok) {
        getPortfolio();
        console.log("Successfully processed sell order");
        handleSellDialogClose();
        setTotalValueLoading(false);
        setAccountBalanceLoading(false);
      } else {
        console.error("Failed to process sell order");
        setTotalValueLoading(false);
        setAccountBalanceLoading(false);
      }
    } catch (error) {
      setTotalValueLoading(false);
      setAccountBalanceLoading(false);
      console.error("Error processing sell order", error);
    }
  };

  const [addBalance, setAddBalance] = useState(0);

  const handleAddDialogOpen = () => {
    setIsAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddBalance(0);
    setIsAddDialogOpen(false);
    setErrorMessage("");
  };

  const handleAddBalance = async () => {
    if (addBalance > 0) {
      setAccountBalanceLoading(true);
      setTotalValueLoading(true);
      try {
        const response = await fetch(
          `https://stonks-bro-orbital24-server.vercel.app/add-balance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
              newBalance: parseFloat(addBalance) + parseFloat(accountBalance),
            }),
          }
        );

        if (response.ok) {
          getPortfolio();
          setIsAddDialogOpen(false);
          setAddBalance(0);
          setErrorMessage("");
          setTotalValueLoading(false);
          setAccountBalanceLoading(false);
          console.log("Successfully added to available balance");
        }
      } catch (error) {
        console.error("Error adding to available balance", error);
      }
    } else {
      setErrorMessage("Please enter a valid amount");
    }
  };

  const getPortfolio = async () => {
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/portfolio/${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        setPortfolio(data[0].trades);
        fetchRealTimePrices(data[0].trades);
        setAccountBalance(data[0].balance);
        setPortfolioLoading(false);
      } else {
        console.error("Failed to fetch portfolio");
      }
    } catch (error) {
      console.error("Error fetching portfolio", error);
    }
  };

  const fetchRealTimePrices = async (currentPortfolio) => {
    try {
      const updatedPortfolio = await Promise.all(
        currentPortfolio.map(async (stock) => {
          const response = await fetch(
            `https://stonks-bro-orbital24-server.vercel.app/api/stock/${stock.symbol}`
          );

          if (response.ok) {
            const data = await response.json();
            const currentValue = data.currentValue;

            return {
              ...stock,
              currentValue: parseFloat(currentValue),
            };
          } else {
            console.error("Error fetching stock prices");
          }
        })
      );
      setPortfolio(updatedPortfolio);
      calculateTotalCurrentValue(updatedPortfolio);
      updateCurrentPricesInDatabase(updatedPortfolio);
    } catch (error) {
      console.error("Error fetching real-time prices", error);
    }
  };

  const updateCurrentPricesInDatabase = async (portfolio) => {
    try {
      const response = await fetch(
        `https://stonks-bro-orbital24-server.vercel.app/portfolio/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            portfolio: portfolio,
          }),
        }
      );

      if (response.ok) {
        console.log("Successfully updated current prices in database");
      } else {
        console.log("Unable to update current prices in database");
      }
    } catch (error) {
      console.error("Error updating current prices in database", error);
    }
  };

  const calculateTotalCurrentValue = (portfolio) => {
    const total = portfolio.reduce(
      (acc, stock) => acc + parseFloat(stock.currentValue * stock.held),
      0
    );
    setTotalCurrentValue(total.toFixed(2));
    setTotalValueLoading(false);
  };

  useEffect(() => {
    if (userId) {
      const fetchPortfolioData = async () => {
        setPortfolioLoading(true);
        setAccountBalanceLoading(true);
        setTotalValueLoading(true);
        getPortfolio();
        setPortfolioLoading(false);
        setAccountBalanceLoading(false);
      };

      fetchPortfolioData();
      const interval = setInterval(fetchPortfolioData, 300000);

      return () => clearInterval(interval);
    }
  }, [userId]);

  return (
    <>
      <Box
        m="15px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <Typography variant="h3">
              Total Account Value:{" "}
              {totalValueLoading || accountBalanceLoading ? (
                <CircularProgress />
              ) : (
                parseFloat(totalAccountValue).toFixed(2)
              )}
            </Typography>
            <Typography variant="h3" marginTop="15px">
              Account Balance:{" "}
              {accountBalanceLoading ? (
                <CircularProgress />
              ) : (
                parseFloat(accountBalance).toFixed(2)
              )}
            </Typography>
          </Box>
          <Box /* Profit / Loss of total account value*/
            sx={{
              marginLeft: "50px",
              border: 0,
              height: "100px",
              width: "150px",
              alignContent: "center",
            }}
          ></Box>
        </Box>
        <Box sx={{ flexDirection: "row", display: "flex" }}>
          <Box sx={{ mr: 2 }}>
            <Button
              onClick={handleAddDialogOpen}
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
              Add Balance
            </Button>
            <Dialog open={isAddDialogOpen} onClose={handleAddDialogClose}>
              <DialogTitle width={275}>
                <Typography fontSize="20px" fontWeight="bold">
                  {" "}
                  Add Balance{" "}
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={handleAddDialogClose}
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
                <TextField
                  label="Amount"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  value={addBalance}
                  onChange={(e) => setAddBalance(e.target.value)}
                  variant="outlined"
                  sx={{ width: "100%", mt: 1 }}
                />
                {errorMessage !== "" ? (
                  <Typography sx={{ color: colors.redAccent[500] }}>
                    {" "}
                    {errorMessage}{" "}
                  </Typography>
                ) : (
                  <Box></Box>
                )}
                <Button
                  onClick={handleAddBalance}
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: colors.blueAccent[600],
                    color: colors.grey[100],
                    fontSize: 15,
                    fontWeight: "bold",
                    width: "100%",
                    "&:hover": {
                      backgroundColor: colors.blueAccent[700],
                    },
                    mt: 2,
                  }}
                >
                  Add Balance
                </Button>
              </DialogContent>
            </Dialog>
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
                    <Box height={50} width={300} ml={2}>
                      <AutocompleteBox
                        buyData={buyData}
                        setBuyData={setBuyData}
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
                    <Box height={50} width={300} ml={2}>
                      <FormControl fullWidth>
                        <InputLabel> Position </InputLabel>
                        <Select
                          label="position"
                          value={buyData.position}
                          onChange={(e) =>
                            setBuyData({
                              ...buyData,
                              position: e.target.value,
                            })
                          }
                          variant="outlined"
                        >
                          <MenuItem value="Long"> Long </MenuItem>
                          {/* <MenuItem value="Short"> Short </MenuItem> */}
                          //not sure how to implement
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
                    <Box height={50} width={300} ml={2}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={buyData.quantity}
                        onChange={(e) =>
                          setBuyData({
                            ...buyData,
                            quantity: e.target.value,
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
                      <Typography> Type: </Typography>
                    </Box>
                    <Box height={50} width={300} ml={2}>
                      <FormControl fullWidth>
                        <InputLabel> Type </InputLabel>
                        <Select
                          label="Type"
                          value={buyData.type}
                          onChange={(e) =>
                            setBuyData({
                              ...buyData,
                              type: e.target.value,
                            })
                          }
                          variant="outlined"
                          sx={{
                            width: "100%",
                          }}
                        >
                          <MenuItem value="Market"> Market </MenuItem>
                          {/* <MenuItem value="Limit"> Limit </MenuItem> */}
                          //not sure how to implement
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                  {buyData.type === "Limit" ? (
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
                          type="number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                          value={buyData.price}
                          onChange={(e) =>
                            setBuyData({
                              ...buyData,
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
                {errorMessage !== "" ? (
                  <Typography sx={{ color: colors.redAccent[500] }}>
                    {" "}
                    {errorMessage}{" "}
                  </Typography>
                ) : (
                  <Box></Box>
                )}
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
                    mt: 2,
                  }}
                >
                  BUY
                </Button>
              </DialogContent>
            </Dialog>
          </Box>
        </Box>
        <Dialog open={isErrorDialogOpen} onClose={handleTradeDialogClose}>
          {" "}
          <DialogTitle>
            <Typography fontSize="20px" fontWeight="bold">
              {" "}
              WARNING{" "}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleErrorDialogClose}
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
            {" "}
            <Typography fontSize="14px">
              Your balance is insufficient to conduct this trade.
            </Typography>
            <Typography fontSize="14px" mt="5px">
              Your available balance: $
              {parseFloat(errorMessage.balance).toFixed(2)}
            </Typography>
            <Typography fontSize="14px">
              Trade cost: ${parseFloat(errorMessage.tradecost).toFixed(2)}
            </Typography>
            <Typography fontSize="14px" mt="5px">
              $
              {parseFloat(
                errorMessage.tradecost - errorMessage.balance
              ).toFixed(2)}{" "}
              more is needed.
            </Typography>
          </DialogContent>
        </Dialog>
      </Box>
      <Box /*Portfolio Display*/
        sx={{
          margin: "15px",
          height: "655px",
          overflowY: "auto",
          fontSize: "15px",
          border: 1,
        }}
      >
        <TableContainer component={Paper}>
          <Table stickyHeader="true">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  Symbol
                </TableCell>
                <TableCell sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  Position
                </TableCell>
                <TableCell sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  Held
                </TableCell>
                <TableCell sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  Bought At
                </TableCell>
                <TableCell sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  Current Value
                </TableCell>
                <TableCell sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  Profit & Loss
                </TableCell>
                <TableCell sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.map((data, index) => (
                <TableRow>
                  <TableCell sx={{ fontSize: "14px" }}>{data.symbol}</TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    {data.position}
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    {parseFloat(data.held).toFixed(1)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    ${parseFloat(data.boughtAt).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    ${parseFloat(data.currentValue).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    {(() => {
                      const profitOrLoss = parseFloat(
                        parseFloat(data.currentValue) -
                          parseFloat(data.boughtAt)
                      ).toFixed(2);

                      const percent = (
                        parseFloat(profitOrLoss / parseFloat(data.boughtAt)) *
                        100
                      ).toFixed(2);

                      return profitOrLoss > 0 ? (
                        <Typography color={colors.greenAccent[500]}>
                          +${(profitOrLoss * data.held).toFixed(2)} ( +{percent}
                          %)
                        </Typography>
                      ) : (
                        <Typography color={colors.redAccent[500]}>
                          -${(Math.abs(profitOrLoss) * data.held).toFixed(2)} (
                          {percent}%)
                        </Typography>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() =>
                        handleSellAmountOpen(
                          index,
                          data.symbol,
                          parseFloat(data.held),
                          parseFloat(data.currentValue)
                        )
                      }
                      sx={{
                        backgroundColor: colors.blueAccent[600],
                        color: colors.grey[100],
                        fontSize: "12px",
                        fontWeight: "bold",
                        padding: "5px",
                        "&:hover": {
                          backgroundColor: colors.blueAccent[700],
                        },
                      }}
                    >
                      Sell
                    </Button>
                    <Dialog /*Sell Dialog*/
                      open={isSellDialogOpen}
                      onClose={handleSellDialogClose}
                    >
                      <DialogTitle>
                        <Typography fontSize="20px" fontWeight="bold">
                          CONFIRMATION
                        </Typography>
                        <IconButton
                          aria-label="close"
                          onClick={handleSellDialogClose}
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
                        <Box width={300}>
                          <Typography>
                            You are about to sell {sellData.quantity}{" "}
                            {sellData.symbol} Stocks @ ${sellData.currentValue}.
                          </Typography>
                          <Typography>
                            If you proceed with this sell action, you cannot
                            undo this action. Are you sure?
                          </Typography>
                          <Box
                            display={"flex"}
                            justifyContent={"center"}
                            mt={3}
                          >
                            <Button
                              onClick={handleSellOrder}
                              sx={{
                                backgroundColor: colors.blueAccent[600],
                                color: colors.grey[100],
                                fontSize: "15px",
                                fontWeight: "bold",
                                padding: "5px",
                                "&:hover": {
                                  backgroundColor: colors.blueAccent[700],
                                },
                                width: "100%",
                              }}
                            >
                              {" "}
                              Confirm Sell
                            </Button>
                          </Box>
                        </Box>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={isSellAmountDialogOpen}
                      onClose={handleSellAmountClose}
                    >
                      {" "}
                      <DialogTitle>
                        <Typography fontSize="20px" fontWeight="bold">
                          {" "}
                          SELL{" "}
                        </Typography>
                        <IconButton
                          aria-label="close"
                          onClick={handleSellAmountClose}
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
                        <Box sx={{ width: 300 }}>
                          <Typography>
                            {" "}
                            Please enter how many {sellData.symbol} stocks you
                            want to sell @ ${sellData.currentValue}.
                          </Typography>
                          <Typography>
                            You currently hold {sellData.held} {sellData.symbol}{" "}
                            stocks.
                          </Typography>
                          <TextField
                            label="Amount"
                            type="number"
                            value={setSellData.quantity}
                            onChange={(e) =>
                              setSellData({
                                ...sellData,
                                quantity: e.target.value,
                              })
                            }
                            variant="outlined"
                            sx={{ width: "100%", mt: 1 }}
                          />
                          {sellAmountError && (
                            <Typography
                              sx={{ color: colors.redAccent[500], mt: 1 }}
                            >
                              {sellAmountError}
                            </Typography>
                          )}
                          <Button
                            onClick={handleSellAmountConfirm}
                            sx={{
                              backgroundColor: colors.blueAccent[600],
                              color: colors.grey[100],
                              fontSize: "15px",
                              fontWeight: "bold",
                              padding: "5px",
                              "&:hover": {
                                backgroundColor: colors.blueAccent[700],
                              },
                              width: "100%",
                              mt: 2,
                            }}
                          >
                            {" "}
                            Sell
                          </Button>
                        </Box>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default Portfolio;
