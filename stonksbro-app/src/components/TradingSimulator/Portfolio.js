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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { mockPorfolio } from "../../data/mockPortfolio";

const Portolio = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);

  const [portfolio, setPortfolio] = useState(mockPorfolio);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);

  const [sellData, setSellData] = useState({
    symbol: "", //text
    quantity: "", //integer
    currentValue: "", //integer
  });

  const handleSellDialogOpen = (symbol, held, currentValue) => {
    setSellData({ symbol: symbol, quantity: held, currentValue: currentValue });
    setIsSellDialogOpen(true);
  };

  const handleSellDialogClose = () => {
    setSellData({ symbol: "", quantity: "", currentValue: "" });
    setIsSellDialogOpen(false);
  };

  return (
    <Box /*Portolio Display*/
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
            {portfolio.map((data) => (
              <TableRow>
                <TableCell sx={{ fontSize: "14px" }}>{data.symbol}</TableCell>
                <TableCell sx={{ fontSize: "14px" }}>{data.position}</TableCell>
                <TableCell sx={{ fontSize: "14px" }}>{data.held}</TableCell>
                <TableCell sx={{ fontSize: "14px" }}>
                  ${data.boughtAt}
                </TableCell>
                <TableCell sx={{ fontSize: "14px" }}>
                  ${data.currentValue}
                </TableCell>
                <TableCell sx={{ fontSize: "14px" }}>
                  {(() => {
                    const profitOrLoss = (
                      parseFloat(data.currentValue) - parseFloat(data.boughtAt)
                    ).toFixed(2);

                    const percent = (
                      (profitOrLoss / parseFloat(data.boughtAt)) *
                      100
                    ).toFixed(2);

                    return profitOrLoss > 0 ? (
                      <Typography color={colors.greenAccent[500]}>
                        +${profitOrLoss * parseFloat(data.held)} ( +{percent}%)
                      </Typography>
                    ) : (
                      <Typography color={colors.redAccent[500]}>
                        -${Math.abs(profitOrLoss)} ({percent}%)
                      </Typography>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() =>
                      handleSellDialogOpen(
                        data.symbol,
                        data.held,
                        data.currentValue
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
                        {" "}
                        SELL{" "}
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
                          If you proceed with this sell action, you cannot undo
                          this action. Are you sure?
                        </Typography>
                        <Box display={"flex"} justifyContent={"center"} mt={3}>
                          <Button
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
                            Sell
                          </Button>
                        </Box>
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
  );
};

export default Portolio;
