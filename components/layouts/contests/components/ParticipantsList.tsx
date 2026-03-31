"use client";
import React, { useState, useMemo, useEffect } from "react";
import { USERS, GRADE_OPTIONS, STATUS_OPTIONS } from "@/utils/constant";
import { roboto } from "@/utils/fonts";
import {
  Delete,
  Edit,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Switch,
  FormControlLabel,
  Menu,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { UserStatus } from "@/utils/enum";
import UserTableRow from "@/components/layouts/user/components/UserTableRow";
import { useContestDetails } from "@/store/useContestDetails";
import moment from "moment";

const USER_COLUMNS_CONFIG = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "id", label: "Id" },
  { id: "phoneNumber", label: "Phone number" },
  { id: "grade", label: "Grade" },
  { id: "joinedAt", label: "Joined" },
  { id: "lastLogin", label: "Last Visited" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions" },
];

const ParticipantsList = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [isDense, setIsDense] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const { contest } = useContestDetails();

  const participants = contest?.participants || [];
  const fields = contest?.userLevelTemplate?.schema?.fields || [];

  const dynamicColumns = useMemo(() => {
    return fields.map((field) => ({
      id: field.id,
      label: field.label,
    }));
  }, [fields]);

  const allColumns = useMemo(() => {
    return [
      ...dynamicColumns,
      { id: "status", label: "Status" },
      { id: "joined_at", label: "Joined At" },
      { id: "actions", label: "Actions" },
    ];
  }, [dynamicColumns]);

  useEffect(() => {
    if (allColumns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(allColumns.map((col) => col.id));
    }
  }, [allColumns]);

  const uniqueSchools = useMemo(() => {
    const schools = USERS.map((u) => u.company).filter((c): c is string => !!c);
    return Array.from(new Set(schools)).sort();
  }, []);

  const uniqueYears = useMemo(() => {
    const years = USERS.map((u) => u.joinedAt?.split("-")[0]).filter(
      (y): y is string => !!y,
    );
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, []);

  const filteredParticipants = USERS.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = schoolFilter === "All" || u.company === schoolFilter;
    const matchesGrade = gradeFilter === "All" || u.grade === gradeFilter;
    const matchesYear =
      yearFilter === "All" || u.joinedAt?.startsWith(yearFilter);
    return matchesSearch && matchesSchool && matchesGrade && matchesYear;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredParticipants.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  // const { contest } = useContestDetails();

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Grade",
      "Status",
      "Joined",
      "Last Login",
    ];
    const rows = filteredParticipants.map((user) => [
      user.id,
      user.name,
      user.email,
      user.phoneNumber || "",
      user.grade || "",
      user.status,
      user.joinedAt || "",
      user.lastLogin || "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `participants_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseColumnMenu = () => {
    setColumnAnchorEl(null);
  };

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId],
    );
  };

  const visibleHeaders = useMemo(() => {
    return allColumns.filter((col) => visibleColumns.includes(col.id));
  }, [allColumns, visibleColumns]);

  const handleOpenColumnMenu = (event: React.MouseEvent<HTMLElement>) => {
    setColumnAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      {/* Action Bar */}
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
          placeholder="Search participants..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: colors.TEXT_SECONDARY, fontSize: 20 }}
                />
              </InputAdornment>
            ),
          }}
        />

        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
          size="small"
          startIcon={<FilterIcon />}
          sx={{ height: 40, px: 2, borderRadius: 2, textTransform: "none" }}
        >
          Filters
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={handleExportCSV}
          startIcon={<ExportIcon />}
          sx={{ height: 40, px: 2, borderRadius: 2, textTransform: "none" }}
        >
          Export
        </Button>

        <IconButton onClick={handleOpenColumnMenu}>
          <MoreIcon />
        </IconButton>
      </Box>

      {/* Advanced Filters */}
      {showFilters && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.02)",
            border: `1px solid ${colors.BORDER}`,
            flexWrap: "wrap",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>School</InputLabel>
            <Select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              label="School"
            >
              <MenuItem value="All">All Schools</MenuItem>
              {uniqueSchools.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Grade</InputLabel>
            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              label="Grade"
            >
              <MenuItem value="All">All Grades</MenuItem>
              {GRADE_OPTIONS.map((g) => (
                <MenuItem key={g.label} value={g.label}>
                  {g.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year Joined</InputLabel>
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              label="Year Joined"
            >
              <MenuItem value="All">All Years</MenuItem>
              {uniqueYears.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            size="small"
            onClick={() => {
              setSchoolFilter("All");
              setGradeFilter("All");
              setYearFilter("All");
            }}
          >
            Clear
          </Button>
        </Box>
      )}

      <Menu
        anchorEl={columnAnchorEl}
        open={Boolean(columnAnchorEl)}
        onClose={handleCloseColumnMenu}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 250,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.BORDER}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Column Preferences
          </Typography>
        </Box>
        {allColumns.map((col) => (
          <MenuItem
            key={col.id}
            onClick={() => toggleColumn(col.id)}
            sx={{ py: 1 }}
          >
            <Checkbox
              size="small"
              checked={visibleColumns.includes(col.id)}
              sx={{ p: 0, mr: 1.5 }}
            />
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>
              {col.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Table */}
      <Paper
        sx={{
          border: `1px solid ${colors.BORDER}`,
          borderRadius: 2,
          overflowX: "auto",
        }}
        elevation={0}
      >
        <Table sx={{ mt: 0, minWidth: 800 }} size={isDense ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
              {visibleHeaders.map((h) => (
                <TableCell
                  key={h.id}
                  align={h.id === "actions" ? "right" : "left"}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontFamily: roboto.style.fontFamily,
                      fontSize: 14,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant) => (
              <TableRow
                key={participant.id}
                sx={{
                  "&:hover": { bgcolor: "rgba(0,0,0,0.01)" },
                  "& .MuiTableCell-root": {
                    borderBottom: `1px solid ${colors.BORDER}`,
                    py: isDense ? 1 : 2,
                  },
                }}
              >
                {dynamicColumns
                  .filter((col) => visibleColumns.includes(col.id))
                  .map((col) => {
                    const field = fields.find((f) => f.id === col.id);
                    const rawValue = participant.submission.data[col.id];
                    let displayValue = rawValue || "—";

                    if (field?.type === "datePicker" && rawValue) {
                      displayValue = moment(rawValue).format("MMM DD, YYYY");
                    }

                    return (
                      <TableCell key={col.id}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.TEXT_PRIMARY,
                            fontSize: 13,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayValue}
                        </Typography>
                      </TableCell>
                    );
                  })}
                {visibleColumns.includes("status") && (
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        px: 1,
                        py: 0.5,
                        borderRadius: "6px",
                        bgcolor:
                          participant.status === "pending"
                            ? "#fef3c7"
                            : "#dcfce7",
                        color:
                          participant.status === "pending"
                            ? "#92400e"
                            : "#166534",
                        width: "fit-content",
                      }}
                    >
                      {participant.status}
                    </Typography>
                  </TableCell>
                )}
                {visibleColumns.includes("joined_at") && (
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.TEXT_PRIMARY,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {moment(participant.joined_at).format("MMM DD, YYYY")}
                    </Typography>
                  </TableCell>
                )}
                {visibleColumns.includes("actions") && (
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{ color: colors.TEXT_SECONDARY }}
                        onClick={() =>
                          router.push(
                            `/contest-management/contests/${contest?.id}/edit-user?participantId=${participant.id}`,
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: colors.TEXT_SECONDARY }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Footer / Dense Toggle */}
      <Box sx={{ mt: 2, px: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isDense}
              onChange={(e) => setIsDense(e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">Dense View</Typography>}
        />
      </Box>
    </Box>
  );
};

export default ParticipantsList;
