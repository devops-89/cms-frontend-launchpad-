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
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as AddIcon,
  MoreVert as MoreIcon,
  Add,
} from "@mui/icons-material";
import { STATUS_OPTIONS, USER_TABLE_HEADER, USERS } from "@/utils/constant";
import { useAppTheme } from "@/context/ThemeContext";
import UserTableRow from "./UserTableRow";
import { COLORS, UserRole, UserStatus } from "@/utils/enum";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import Link from "next/link";
import { useGetAllUsers } from "@/hooks/user/useGetAllUsers";

const UserTable: React.FC = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState(UserStatus.ALL);
  const [roleFilter, setRoleFilter] = useState(UserRole.ALL);
  const [isDense, setIsDense] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const {
    users,
    isLoading,
    error: fetchError,
  } = useGetAllUsers(UserRole.PARTICIPANT);

  const displayUsers = fetchError ? USERS : users;

  const counts = useMemo(() => {
    const countsMap: Record<string, number> = { All: displayUsers.length };
    STATUS_OPTIONS.slice(1).forEach((status) => {
      countsMap[status] = displayUsers.filter((u) => u.status === status).length;
    });
    return countsMap;
  }, [displayUsers]);

  const filteredUsers = displayUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusTab === UserStatus.ALL || u.status === statusTab;
    const matchesRole = roleFilter === UserRole.ALL;
    return matchesSearch && matchesStatus && matchesRole;
  });

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

          <IconButton size="small" sx={{ color: colors.TEXT_SECONDARY }}>
            <MoreIcon />
          </IconButton>
        </Box>
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
                {USER_TABLE_HEADER.map((h, i) => (
                  <TableCell
                    key={h}
                    align={i === 5 ? "right" : "left"}
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
                      {h}
                      {h === "Name" && (
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
