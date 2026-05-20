import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { roboto } from "@/utils/fonts";
import { Close, FormatListNumbered } from "@mui/icons-material";
import { useModal } from "@/store/useModal";
import { VOTING_PERIOD_TYPE_DATA } from "@/utils/constant";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { COLORS } from "@/utils/enum";

const AddVotingPeriod = () => {
  const { hideModal } = useModal();

  const handleCloseModal: React.MouseEventHandler<HTMLButtonElement> = () => {
    hideModal();
  };

  return (
    <Box sx={{ width: 600 }}>
      <Box sx={{ textAlign: "end" }}>
        <IconButton onClick={handleCloseModal}>
          <Close />
        </IconButton>
      </Box>
      <Typography
        sx={{
          fontSize: 24,
          fontFamily: roboto.style.fontFamily,
          fontWeight: 600,
        }}
      >
        Add Voting Period
      </Typography>
      <form>
        <Stack spacing={3} sx={{ mt: 3 }}>
          <Autocomplete
            renderInput={(params) => (
              <TextField {...params} label="Select Voting Type" />
            )}
            options={VOTING_PERIOD_TYPE_DATA}
          />

          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker label="Start Date" disablePast />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker label="End Date" />
          </LocalizationProvider>
          <Button
            sx={{
              textTransform: "capitalize",
              backgroundColor: COLORS.PRIMARY,
              color: "#ffffff",
              width: "120px",
              px: 3,
            }}
          >
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default AddVotingPeriod;
