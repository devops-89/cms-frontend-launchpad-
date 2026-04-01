"use client";
import React, { useState, useEffect } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  EmojiEvents as ContestIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import { useSnackbar } from "@/context/SnackbarContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { contestControllers } from "@/api/contestControllers";

interface AssignJudgesDialogProps {
  open: boolean;
  onClose: () => void;
  judges: { id: string; name: string }[];
}

const AssignJudgesDialog: React.FC<AssignJudgesDialogProps> = ({
  open,
  onClose,
  judges,
}) => {
  const { colors } = useAppTheme();
  const { showSnackbar } = useSnackbar();
  const [selectedContests, setSelectedContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: contestsData, isLoading: contestsLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: () => contestControllers.getContest(),
    enabled: open,
  });

  const contests = React.useMemo(() => {
    // API might return the list directly in data or nested in data.data
    const list = Array.isArray(contestsData?.data) 
      ? contestsData.data 
      : Array.isArray(contestsData) 
        ? contestsData 
        : [];
    
    return list.map((c: any) => ({
      id: c.id || c._id || Math.random().toString(),
      title: c.name || c.title || "Untitled Contest",
      status: c.status || "Unknown",
      participants: c.participantsCount || c.participants || 0,
    }));
  }, [contestsData]);

  // Reset selected contests when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedContests([]);
    }
  }, [open]);

  const handleAssign = () => {
    if (selectedContests.length === 0) {
      showSnackbar("Please select at least one contest", "warning");
      return;
    }

    setLoading(true);

    // Simulating API call
    setTimeout(() => {
      setLoading(false);
      showSnackbar(
        `Successfully assigned ${judges.length} judge${judges.length > 1 ? "s" : ""} to ${selectedContests.length} contest${selectedContests.length > 1 ? "s" : ""}`,
        "success"
      );
      onClose();
    }, 1200);
  };

  return (
    <Box sx={{ minWidth: { xs: 300, sm: 500, md: 600 } }}>
      <DialogTitle
        sx={{
          m: 0,
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "white",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
            Assign to Contest
          </Typography>
          <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY }}>
            {judges.length === 1
              ? `Select contests for ${judges[0].name}`
              : `Select contests for ${judges.length} selected judges`}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: colors.TEXT_SECONDARY,
            "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, fontWeight: 700, color: colors.TEXT_PRIMARY }}
          >
            Search and Select Contests
          </Typography>
          <Autocomplete
            multiple
            id="contest-selection"
            options={contests}
            loading={contestsLoading}
            slotProps={{
              popper: {
                sx: { zIndex: 3000 }
              }
            }}
            getOptionLabel={(option) => option.title}
            value={selectedContests}
            onChange={(_, newValue) => setSelectedContests(newValue)}
            disableCloseOnSelect
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={selectedContests.length > 0 ? "" : "Choose contests..."}
                variant="outlined"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {contestsLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "rgba(0,0,0,0.02)",
                    "& fieldset": { borderColor: colors.BORDER },
                  },
                }}
              />
            )}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  size="small"
                  checked={selected}
                  sx={{ mr: 1, color: colors.PRIMARY }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY }}>
                    {option.status} • {option.participants} participants
                  </Typography>
                </Box>
              </li>
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={option.title}
                  {...getTagProps({ index })}
                  key={option.id}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    bgcolor: `${colors.PRIMARY}15`,
                    color: colors.PRIMARY,
                    border: `1px solid ${colors.PRIMARY}30`,
                  }}
                />
              ))
            }
          />
        </Box>

        {selectedContests.length > 0 && (
          <Box
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: "rgba(99, 102, 241, 0.04)",
              border: `1px dashed ${colors.PRIMARY}30`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 800, color: colors.PRIMARY, display: "flex", alignItems: "center", gap: 1 }}
            >
              <ContestIcon sx={{ fontSize: 18 }} />
              Summary of Assignment
            </Typography>
            <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, mb: 1 }}>
              Assigning <strong>{judges.length}</strong> judge{judges.length > 1 ? "s" : ""} to:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedContests.map((c) => (
                <Typography
                  key={c.id}
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.5,
                    bgcolor: "white",
                    borderRadius: 1,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    fontWeight: 700,
                    color: colors.TEXT_PRIMARY,
                  }}
                >
                  {c.title}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            px: 4,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            color: colors.TEXT_SECONDARY,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={loading || selectedContests.length === 0}
          sx={{
            px: 5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            background: `linear-gradient(135deg, ${colors.PRIMARY} 0%, ${colors.PRIMARY} 100%)`,
            boxShadow: `0 8px 20px ${colors.PRIMARY}30`,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: `0 12px 24px ${colors.PRIMARY}40`,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Assign Judges"
          )}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AssignJudgesDialog;
