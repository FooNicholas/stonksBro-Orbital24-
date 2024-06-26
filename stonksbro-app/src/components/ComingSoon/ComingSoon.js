import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const ComingSoon = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        backgroundColor: theme.palette.background.default,
        border: 1
      }}
    >
      <Typography variant="h2" align="center">
        Coming Soon
      </Typography>
    </Box>
  );
};

export default ComingSoon;