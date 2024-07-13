import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { AutocompleteData } from "../../data/AutocompleteData";

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export default function AutocompleteWatchlist({ setNewSymbol }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;
    if (!loading) {
      return undefined;
    }

    (async () => {
      await sleep(1e3);

      if (active) {
        setOptions([...AutocompleteData]);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      disablePortal
      ListboxProps={{ position: "bottom-start" }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      options={options}
      loading={loading}
      getOptionLabel={(option) => option.Name}
      onChange={(event, newValue) => {
        setNewSymbol(newValue.Symbol);
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ flexDirection: "row" }}>
          <Box
            sx={{
              mr: 2,
              width: 200,
              whiteSpace: "normal",
            }}
          >
            ({option.Symbol})
          </Box>
          <Box sx={{ mr: 2, width: 250, whiteSpace: "normal" }}>
            {option.Name}
          </Box>
          <Box>{option.Exchange}</Box>
        </Box>
      )}
      sx={{ width: 250 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Add Symbol"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
