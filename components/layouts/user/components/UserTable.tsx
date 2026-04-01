import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Switch,
  FormControlLabel,
  IconButton,
  Menu,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as AddIcon,
  MoreVert as MoreIcon,
  Add,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import {
  STATUS_OPTIONS,
  USER_TABLE_HEADER,
  USERS,
  GRADE_OPTIONS,
} from "@/utils/constant";
import { useAppTheme } from "@/context/ThemeContext";
import UserTableRow from "./UserTableRow";
import { COLORS, UserRole, UserStatus } from "@/utils/enum";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import Link from "next/link";
import { useGetAllUsers } from "@/hooks/user/useGetAllUsers";
import { useQuery } from "@tanstack/react-query";
import { UserController } from "@/api/userControllers";

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

const UserTable: React.FC = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState(UserStatus.ALL);
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [isDense, setIsDense] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name",
    "phoneNumber",
    "grade",
    "status",
    "actions",
  ]);
  const {
    users,
    isLoading,
    error: fetchError,
  } = useGetAllUsers(UserRole.PARTICIPANT);

  const displayUsers = fetchError ? USERS : users;

  const counts = useMemo(() => {
    const countsMap: Record<string, number> = { All: displayUsers.length };
    STATUS_OPTIONS.slice(1).forEach((status) => {
      countsMap[status] = displayUsers.filter(
        (u) => u.status === status,
      ).length;
    });
    return countsMap;
  }, [displayUsers]);

  const uniqueSchools = useMemo(() => {
    const schools = displayUsers
      .map((u) => u.company)
      .filter((c): c is string => !!c);
    return Array.from(new Set(schools)).sort();
  }, [displayUsers]);

  const uniqueYears = useMemo(() => {
    const years = displayUsers
      .map((u) => u.joinedAt?.split("-")[0])
      .filter((y): y is string => !!y);
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, [displayUsers]);

  const filteredUsers = displayUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusTab === UserStatus.ALL || u.status === statusTab;
    const matchesSchool = schoolFilter === "All" || u.company === schoolFilter;
    const matchesGrade = gradeFilter === "All" || u.grade === gradeFilter;
    const matchesYear =
      yearFilter === "All" || u.joinedAt?.startsWith(yearFilter);
    return (
      matchesSearch &&
      matchesStatus &&
      matchesSchool &&
      matchesGrade &&
      matchesYear
    );
  });

  const handleExportCSV = () => {
    // Header for CSV
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

    // Rows
    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.phoneNumber || "",
      user.grade || "",
      user.status,
      user.joinedAt || "",
      user.lastLogin || "",
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    // Browser download trigger
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const handleOpenColumnMenu = (event: React.MouseEvent<HTMLElement>) => {
    setColumnAnchorEl(event.currentTarget);
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

  const visibleHeaders = USER_COLUMNS_CONFIG.filter((col) =>
    visibleColumns.includes(col.id),
  );

  const { data, isPending, error } = useQuery({
    queryKey: ["user-list"],
    queryFn: () => UserController.getAllUser(UserRole.PARTICIPANT),
    enabled: true,
  });

  console.log("data", data);

  return (
    <Box sx={{ p: 1 }}>
      {/* Header & Tabs */}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Breadcrumb
          title="Users"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Users", href: "/user-management/users" },
          ]}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleExportCSV}
            startIcon={<ExportIcon />}
            sx={{
              color: colors.TEXT_PRIMARY,
              borderColor: colors.BORDER,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.02)",
                borderColor: colors.TEXT_SECONDARY,
              },
            }}
          >
            Export to CSV
          </Button>

          <Link
            href="/user-management/users/add-user"
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="outlined"
              sx={{
                color: colors.PRIMARY,
                borderColor: colors.PRIMARY,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                "&:hover": {
                  bgcolor: colors.PRIMARY,
                  opacity: 0.9,
                  color: COLORS.SURFACE,
                },
              }}
              endIcon={<Add />}
            >
              Add User
            </Button>
          </Link>
        </Box>
      </Box>
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
            placeholder="Search..."
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

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
            startIcon={<FilterIcon />}
            sx={{
              height: 40,
              px: 2,
              borderRadius: 2,
              borderColor: showFilters ? colors.PRIMARY : colors.BORDER,
              color: showFilters ? colors.PRIMARY : colors.TEXT_SECONDARY,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: showFilters
                  ? `${colors.PRIMARY}05`
                  : "rgba(0,0,0,0.02)",
                borderColor: showFilters
                  ? colors.PRIMARY
                  : colors.TEXT_SECONDARY,
              },
            }}
          >
            Filters
          </Button>

          <IconButton
            size="small"
            sx={{ color: colors.TEXT_SECONDARY }}
            onClick={handleOpenColumnMenu}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        {showFilters && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.015)",
              border: `1px solid ${colors.BORDER}`,
              flexWrap: "wrap",
            }}
          >
            {/* School Filter */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ fontSize: "0.85rem" }}>School</InputLabel>
              <Select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                label="School"
                sx={{ borderRadius: 2, bgcolor: "white", fontSize: "0.85rem" }}
              >
                <MenuItem value="All">All Schools</MenuItem>
                {uniqueSchools.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Grade Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontSize: "0.85rem" }}>Grade</InputLabel>
              <Select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                label="Grade"
                sx={{ borderRadius: 2, bgcolor: "white", fontSize: "0.85rem" }}
              >
                <MenuItem value="All">All Grades</MenuItem>
                {GRADE_OPTIONS.map((g) => (
                  <MenuItem key={g.label} value={g.label}>
                    {g.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ fontSize: "0.85rem" }}>Year Joined</InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                label="Year Joined"
                sx={{ borderRadius: 2, bgcolor: "white", fontSize: "0.85rem" }}
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
              sx={{
                textTransform: "none",
                color: colors.TEXT_SECONDARY,
                "&:hover": { color: colors.ERROR },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}

        <Menu
          anchorEl={columnAnchorEl}
          open={Boolean(columnAnchorEl)}
          onClose={handleCloseColumnMenu}
          PaperProps={{
            sx: {
              py: 1,
              px: 1,
              border: `1px solid ${colors.BORDER}`,
              borderRadius: 2,
              boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
              minWidth: 200,
            },
          }}
        >
          {USER_COLUMNS_CONFIG.map((col) => (
            <MenuItem
              key={col.id}
              onClick={() => toggleColumn(col.id)}
              sx={{
                borderRadius: 1.5,
                fontSize: "0.85rem",
                py: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Checkbox
                size="small"
                checked={visibleColumns.includes(col.id)}
                sx={{ p: 0 }}
              />
              <Typography variant="body2">{col.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Table Container */}
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
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    indeterminate={
                      selectedUsers.length > 0 &&
                      selectedUsers.length < filteredUsers.length
                    }
                    checked={
                      filteredUsers.length > 0 &&
                      selectedUsers.length === filteredUsers.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                {visibleHeaders.map((h, i) => (
                  <TableCell
                    key={h.id}
                    align={h.id === "actions" ? "right" : "left"}
                    sx={{
                      color: colors.TEXT_PRIMARY,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      borderBottom: `1px solid ${colors.BORDER}`,
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {h.label}
                      {h.label === "Name" && (
                        <Typography
                          variant="caption"
                          sx={{ color: colors.TEXT_SECONDARY, fontSize: 16 }}
                        >
                          ↑
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 10, textAlign: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.TEXT_SECONDARY }}
                    >
                      Loading users...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user as any}
                    colors={colors}
                    dense={isDense}
                    selected={selectedUsers.includes(user.id)}
                    onSelect={() => handleSelectUser(user.id)}
                    visibleColumns={visibleColumns}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 10, textAlign: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.TEXT_SECONDARY }}
                    >
                      No users found matching "{searchTerm}"
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

          {/* <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
                Rows per page:
              </Typography>
              <Select
                value={5}
                size="small"
                variant="standard"
                disableUnderline
                sx={{ fontSize: "0.85rem", fontWeight: 600 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
              </Select>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              1–5 of {USERS.length}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography sx={{ cursor: "pointer", opacity: 0.3 }}>
                {"<"}
              </Typography>
              <Typography sx={{ cursor: "pointer" }}>{">"}</Typography>
            </Box>
          </Box> */}
        </Box>
      </Paper>
    </Box>
  );
};

export default UserTable;
