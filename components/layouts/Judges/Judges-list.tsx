"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Assignment as AssignIcon,
} from "@mui/icons-material";
import { STATUS_OPTIONS, JUDGES } from "@/utils/constant";
import { useAppTheme } from "@/context/ThemeContext";
import JudgesTableHeader from "./components/Judges-Table-header";
import JudgesTableRow from "./components/JudgesTableRow";
import { UserStatus } from "@/utils/enum";
import AssignJudgesDialog from "./components/AssignJudgesDialog";

const JudgesList: React.FC = () => {
  const { colors } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState(UserStatus.ALL);
  const [isDense, setIsDense] = useState(false);
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);
  const [headerMenuAnchorEl, setHeaderMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);

  const counts = useMemo(() => {
    const countsMap: Record<string, number> = { All: JUDGES.length };
    STATUS_OPTIONS.slice(1).forEach((status) => {
      countsMap[status] = JUDGES.filter((j) => j.status === status).length;
    });
    return countsMap;
  }, []);

  const filteredJudges = useMemo(() => {
    return JUDGES.filter((j) => {
      const matchesSearch =
        j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.expertise.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusTab === UserStatus.ALL || j.status === statusTab;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusTab]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJudges(filteredJudges.map((j) => j.id));
    } else {
      setSelectedJudges([]);
    }
  };

  const handleSelectJudge = (id: string) => {
    setSelectedJudges((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const getSelectedJudgesData = () => {
    return JUDGES.filter((j) => selectedJudges.includes(j.id)).map((j) => ({
      id: j.id,
      name: j.name,
    }));
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={statusTab}
          onChange={(_, newValue) => setStatusTab(newValue)}
          sx={{
            minHeight: 48,
            "& .MuiTabs-indicator": {
              backgroundColor: colors.PRIMARY,
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
            borderBottom: `1px solid ${colors.BORDER}`,
            mb: 2,
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <Tab
              key={status}
              value={status}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: statusTab === status ? 700 : 500 }}
                  >
                    {status}
                  </Typography>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.2,
                      borderRadius: "6px",
                      bgcolor:
                        statusTab === status
                          ? `${colors.PRIMARY}20`
                          : "rgba(0,0,0,0.05)",
                      color:
                        statusTab === status
                          ? colors.PRIMARY
                          : colors.TEXT_SECONDARY,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {counts[status]}
                  </Box>
                </Box>
              }
              sx={{
                textTransform: "none",
                minWidth: "auto",
                px: 3,
                color: colors.TEXT_SECONDARY,
                "&.Mui-selected": { color: colors.TEXT_PRIMARY },
              }}
            />
          ))}
        </Tabs>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search judges by name, email or expertise..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "white",
                "& fieldset": { borderColor: colors.BORDER },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: colors.TEXT_SECONDARY, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <IconButton 
            size="small" 
            sx={{ color: colors.TEXT_SECONDARY }}
            onClick={(e) => setHeaderMenuAnchorEl(e.currentTarget)}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={headerMenuAnchorEl}
            open={Boolean(headerMenuAnchorEl)}
            onClose={() => setHeaderMenuAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                mt: 1,
                minWidth: 160,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: `1px solid ${colors.BORDER}`,
              },
            }}
          >
            <MenuItem
              disabled={selectedJudges.length === 0}
              onClick={() => {
                setHeaderMenuAnchorEl(null);
                setIsBulkAssignDialogOpen(true);
              }}
              sx={{ fontSize: "0.85rem", display: "flex", gap: 1, alignItems: "center" }}
            >
              <AssignIcon fontSize="small" sx={{ color: colors.PRIMARY }} />
              Assign selected to Contest
            </MenuItem>
            <MenuItem
              disabled={selectedJudges.length === 0}
              onClick={() => {
                setHeaderMenuAnchorEl(null);
                // Placeholder for other bulk actions
              }}
              sx={{ fontSize: "0.85rem", color: colors.ERROR }}
            >
              Delete selected
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <AssignJudgesDialog
        open={isBulkAssignDialogOpen}
        onClose={() => setIsBulkAssignDialogOpen(false)}
        judges={getSelectedJudgesData()}
      />

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${colors.BORDER}`,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <TableContainer>
          <Table size={isDense ? "small" : "medium"}>
            <JudgesTableHeader
              colors={colors}
              selectedCount={selectedJudges.length}
              totalCount={filteredJudges.length}
              onSelectAll={handleSelectAll}
            />
            <TableBody>
              {filteredJudges.length > 0 ? (
                filteredJudges.map((judge) => (
                  <JudgesTableRow
                    key={judge.id}
                    judge={judge}
                    colors={colors}
                    dense={isDense}
                    selected={selectedJudges.includes(judge.id)}
                    onSelect={() => handleSelectJudge(judge.id)}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 10, textAlign: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.TEXT_SECONDARY }}
                    >
                      No judges found matching "{searchTerm}"
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${colors.BORDER}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isDense}
                onChange={(e) => setIsDense(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Dense
              </Typography>
            }
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default JudgesList;
