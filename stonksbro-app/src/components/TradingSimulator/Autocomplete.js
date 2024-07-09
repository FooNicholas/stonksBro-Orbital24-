import React, { useState, useEffect, useMemo, useCallback } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import debounce from "lodash.debounce";

import { AutocompleteData } from "../../data/AutocompleteData";

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export default function AutocompleteBox({ buyData, setBuyData }) {
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
      ListboxProps={{ style: { maxHeight: "15rem" }, position: "bottom-start" }}
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
        setBuyData({
          ...buyData,
          symbol: newValue ? newValue.Symbol : "",
        });
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
      sx={{ width: 300 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Buy Symbol"
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
