import React from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  IconButton,
  Collapse,
  Divider,
  Grid,
  TextField,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { montserrat } from "@/utils/fonts";

interface FormIdentityProps {
  formName: string;
  setFormName: (val: string) => void;
  formTitle: string;
  setFormTitle: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const FormIdentity: React.FC<FormIdentityProps> = ({
  formName,
  setFormName,
  formTitle,
  setFormTitle,
  isOpen,
  setIsOpen,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: "20px",
        p: isOpen ? 2.5 : 1.5,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.08),
        boxShadow: "0px 8px 24px rgba(0,0,0,0.02)",
        background: "white",
        transition: "all 0.3s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              color: "primary.main",
              display: "flex",
            }}
          >
            <SettingsIcon sx={{ fontSize: "1.1rem" }} />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                fontFamily: montserrat.style.fontFamily,
                color: "primary.main",
              }}
            >
              Form Identity
            </Typography>
            {!isOpen && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                {formTitle || "Untitled"} • {formName || "no_id"}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton size="small">
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={isOpen}>
        <Divider sx={{ my: 1.5, opacity: 0.5 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Internal ID"
              placeholder="registration_form"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Display Title"
              placeholder="Public Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Card>
  );
};

export default FormIdentity;
