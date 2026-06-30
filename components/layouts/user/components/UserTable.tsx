"use client";
import { UserController } from "@/api/userControllers";
import { useAppTheme } from "@/context/ThemeContext";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { USER_DATA } from "@/types/user";
import { USER_STATUS_TABS } from "@/utils/constant";
import { UserRole, UserStatus } from "@/utils/enum";
import { MoreVert } from "@mui/icons-material";
import {
  Box,
  Card,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  TablePagination,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/context/SnackbarContext";
import { usePermissions } from "@/context/PermissionContext";
import moment from "moment";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Active":
    case "Published":
      return { bgcolor: "#dcfce7", color: "#166534" };
    case "Pending":
    case "Draft":
      return { bgcolor: "#ffedd5", color: "#c2410c" };
    case "Banned":
    case "Rejected":
      return { bgcolor: "#fee2e2", color: "#991b1b" };
    default:
      return { bgcolor: "#f3f4f6", color: "#374151" };
  }
};

const resolveUserStatus = (u: any) => {
  if (u.participants && u.participants.length > 0) {
    const allBanned = u.participants.every((p: any) => p.status?.toLowerCase() === "banned");
    if (allBanned) return "Banned";

    const active = u.participants.find((p: any) => p.status?.toLowerCase() !== "banned");
    if (active) {
      const st = active.status;
      if (st?.toLowerCase() === "approved") return "Active";
      return st ? st.charAt(0).toUpperCase() + st.slice(1).toLowerCase() : "Pending";
    }
  }
  
  let st = u.status || "Pending";
  if (st?.toLowerCase() === "approved") return "Active";
  if (st?.toLowerCase() === "banned") return "Banned";
  return st ? st.charAt(0).toUpperCase() + st.slice(1).toLowerCase() : "Pending";
};

const StatusDropdown = ({ user }: { user: any }) => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canEditUser = hasPermission("Users", "canEdit");
  
  const getStatus = () => {
    return resolveUserStatus(user);
  };

  const [currentStatus, setCurrentStatus] = useState<string>(getStatus());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [selectedContestId, setSelectedContestId] = useState<string>("");

  React.useEffect(() => {
    setCurrentStatus(getStatus());
  }, [user.participants, user.status]);

  const mutation = useMutation({
    mutationFn: ({ newStatus, contestId }: { newStatus: string, contestId?: string }) => 
      UserController.updateUserStatus(user.id, newStatus.toLowerCase(), contestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-list"] });
    },
    onError: () => {
      console.error("Failed to update status");
    },
  });

  const handleStatusChange = (e: any) => {
    const newStatus = e.target.value;
    // Always open popup if Banned is selected so they can choose a contest
    if (newStatus === "Banned" || newStatus !== currentStatus) {
      setPendingStatus(newStatus);
      if (newStatus === "Banned" && activeContests.length === 1) {
        setSelectedContestId(activeContests[0].contest?.id);
      } else {
        setSelectedContestId("");
      }
      setConfirmOpen(true);
    }
  };

  const confirmChange = () => {
    if (pendingStatus) {
      mutation.mutate({ newStatus: pendingStatus, contestId: selectedContestId || undefined });
    }
    setConfirmOpen(false);
  };

  const cancelChange = () => {
    setPendingStatus(null);
    setConfirmOpen(false);
  };

  const statusStyle = getStatusStyles(currentStatus);
  const activeContests = (user.participants || []).filter((p: any) => p.status !== "Banned" && p.status !== "banned");

  if (currentStatus === "Banned") {
    return (
      <Box
        sx={{
          fontSize: "0.75rem",
          fontWeight: 700,
          width: "fit-content",
          py: 0.5,
          px: 1,
          borderRadius: "6px",
          bgcolor: statusStyle.bgcolor,
          color: statusStyle.color,
          display: "flex",
          alignItems: "center",
        }}
      >
        Banned
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {canEditUser ? (
          <FormControl size="small" variant="standard" fullWidth>
            <Select
              value={currentStatus}
              onChange={handleStatusChange}
              disableUnderline
              disabled={mutation.isPending}
              IconComponent={mutation.isPending ? () => <CircularProgress size={14} sx={{ mr: 1, ml: 0.5, color: statusStyle.color }} /> : undefined}
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                "& .MuiSelect-select": {
                  py: 0.5,
                  px: 1.5,
                  borderRadius: "6px",
                  bgcolor: statusStyle.bgcolor,
                  color: statusStyle.color,
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiSvgIcon-root": {
                  color: statusStyle.color,
                },
              }}
            >
              {[UserStatus.ACTIVE, UserStatus.PENDING, UserStatus.INACTIVE, UserStatus.BANNED].map((status) => (
                <MenuItem key={status} value={status} sx={{ fontSize: "0.85rem" }}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              width: "fit-content",
              py: 0.5,
              px: 1.5,
              borderRadius: "6px",
              bgcolor: statusStyle.bgcolor,
              color: statusStyle.color,
            }}
          >
            {currentStatus}
          </Box>
        )}
      </Box>

      <Dialog open={confirmOpen} onClose={cancelChange} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Do you want to change the status to <strong>{pendingStatus}</strong>?
          </DialogContentText>
          {pendingStatus === "Banned" && activeContests.length > 1 && (
            <FormControl fullWidth sx={{ mt: 1 }} size="small">
              <InputLabel id="select-contest-label">Select Contest</InputLabel>
              <Select
                labelId="select-contest-label"
                value={selectedContestId}
                label="Select Contest"
                onChange={(e) => setSelectedContestId(e.target.value)}
              >
                {activeContests.map((p: any) => (
                  <MenuItem key={p.contest?.id} value={p.contest?.id}>
                    {p.contest?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelChange} color="inherit">Cancel</Button>
          <Button 
            onClick={confirmChange} 
            color="primary" 
            variant="contained"
            disabled={pendingStatus === "Banned" && activeContests.length > 1 && !selectedContestId}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const UserTable: React.FC = () => {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [statusTab, setStatusTab] = useState("All");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearchTerm, statusTab]);

  const { data, isPending, error } = useQuery({
    queryKey: ["user-list", page, rowsPerPage, debouncedSearchTerm, statusTab],
    queryFn: () => {
      let apiStatus = statusTab;
      if (apiStatus === "Active") apiStatus = "approved";
      if (apiStatus === "Banned") apiStatus = "banned";
      
      if (apiStatus === "Pending") {
        return UserController.getPendingUsers(page + 1, rowsPerPage, debouncedSearchTerm);
      }
      
      return UserController.getAllUser(UserRole.PARTICIPANT, page + 1, rowsPerPage, debouncedSearchTerm, apiStatus);
    },
    enabled: true,
  });

  const user_data = data?.data?.data;
  console.log("suer", user_data);

  // Filter users on the frontend
  const filteredUsers = React.useMemo(() => {
    return user_data?.users || [];
  }, [user_data]);

  const ALL_COLUMNS = [
    {
      header: "Name",
      getValue: (val: USER_DATA) => val.fullName || `${val.firstName || ""} ${val.lastName || ""}`.trim() || "—",
    },
    {
      header: "Email",
      getValue: (val: USER_DATA) => val.email,
    },
    {
      header: "Phone number",
      getValue: (val: any) => val.participant_profile_data?.h7695htwx || val.phone,
    },
    {
      header: "Grade",
      getValue: (val: any) => val.participant_profile_data?.wq5kjwwmo || val.participantProfile?.grade,
    },
    {
      header: "Date of birth",
      getValue: (val: any) => {
        const dob = val.participant_profile_data?.byf50cwek || val.participantProfile?.dateOfBirth;
        return dob ? moment(dob).format("YYYY-MM-DD") : null;
      },
    },
    {
      header: "Status",
      getValue: (val: any) => resolveUserStatus(val),
      render: (val: any) => <StatusDropdown user={val} />,
    },
    {
      header: "School Name",
      getValue: (val: any) => val.participant_profile_data?.["3swf0lufu"] || val.participantProfile?.schoolName,
    },
    {
      header: "Country Of Residence",
      getValue: (val: any) => val.participant_profile_data?.gjbq1pwch || val.country?.name || val.participantProfile?.country,
    },
    {
      header: "Joined At",
      getValue: (val: any) => val.created_at ? moment(val.created_at).format("YYYY-MM-DD") : null,
    },
    {
      header: "Contest",
      getValue: (val: any) => {
        const activeP = (val.participants || []).filter((p: any) => p.status !== "Banned" && p.status !== "banned");
        if (activeP.length > 0) {
          return activeP.map((p: any) => p.contest?.name).join(", ");
        }
        if (val.participants && val.participants.length > 0) {
          return val.participants.map((p: any) => p.contest?.name).join(", ");
        }
        return val.contestName || val.contest?.name || "—";
      },
    },
  ];

  // Determine which columns have data in the current user_data
  const activeColumns = ALL_COLUMNS.filter((col) => {
    // Always show Name, Email, and Status if possible, otherwise check if any user has data for this column
    if (["Name", "Email", "Status"].includes(col.header)) return true;
    return user_data?.users?.some((user: any) => {
      const val = col.getValue(user);
      return val !== null && val !== undefined && val !== "" && val !== "—";
    });
  });

  const ALL_HEADERS = activeColumns.map((col) => col.header);

  const [visibleHeaders, setVisibleHeaders] = useState<string[]>([]);
  
  // Update visible headers when active headers change - default to standard columns
  React.useEffect(() => {
    const defaultVisible = ["Name", "Email", "Status", "Joined At", "Contest"];
    const defaults = ALL_HEADERS.filter((h) => defaultVisible.includes(h));
    setVisibleHeaders(defaults);
  }, [user_data]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleHeader = (header: string) => {
    setVisibleHeaders((prev) => {
      if (prev.includes(header)) {
        if (prev.length === 1) return prev; // Prevent deselecting last column
        return prev.filter((h) => h !== header);
      } else {
        const next = [...prev, header];
        return ALL_HEADERS.filter((h) => next.includes(h));
      }
    });
  };

  return (
    <Box sx={{ p: 1 }}>
      <Breadcrumb
        title="Users"
        data={[
          {
            title: "Dashboard",
            href: "/dashboard",
          },
          {
            title: "User Management",
            href: "/user-management/users",
          },
          {
            title: "Users",
            href: "/user-management/users",
          },
        ]}
      />

      <Card
        sx={{
          boxShadow: "0px 0px 1px 1px #eee",
          mt: 2,
          border: "1px solid #eeeeee",
          py: 2,
        }}
      >
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
            px: 2,
          }}
        >
          {USER_STATUS_TABS.map((val) => (
            <Tab
              key={val.label}
              value={val.label}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: statusTab === val.label ? 700 : 500 }}
                  >
                    {val.label}
                  </Typography>
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

        <Stack
          direction={"row"}
          alignItems={"center"}
          spacing={3}
          sx={{ mt: 3, px: 2 }}
        >
          <TextField 
            placeholder="Search by name or email..." 
            fullWidth 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton onClick={handleClick}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {ALL_HEADERS.map((header) => (
              <MenuItem key={header} onClick={() => handleToggleHeader(header)}>
                <Checkbox checked={visibleHeaders.includes(header)} />
                <ListItemText primary={header} />
              </MenuItem>
            ))}
          </Menu>
        </Stack>

        <TableContainer sx={{ mt: 3, overflowX: "auto" }}>
          <Table sx={{ minWidth: 1000 }} size="small">
            <TableHead>
              <TableRow>
                {visibleHeaders.map((val, i) => (
                  <TableCell key={i} sx={{ whiteSpace: "nowrap" }}>
                    {val}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((val: any) => (
                  <TableRow 
                    key={val.id}
                    hover
                    onClick={() => router.push(`/user-management/users/${val.id}`)}
                    sx={{ cursor: "pointer" }}
                  >
                    {activeColumns
                      .filter((col) => visibleHeaders.includes(col.header))
                      .map((col, idx) => (
                        <TableCell 
                          key={idx} 
                          sx={{ whiteSpace: "nowrap" }}
                          onClick={(e) => {
                            // Prevent navigation if clicking on the Status Dropdown
                            if (col.header === "Status") {
                              e.stopPropagation();
                            }
                          }}
                        >
                          {col.render ? col.render(val) : col.getValue(val) || "—"}
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleHeaders.length} sx={{ py: 10, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
                      {isPending
                        ? "Loading users..."
                        : `No users found${statusTab !== "All" && statusTab !== "all" ? ` for status "${statusTab}"` : ""}.`}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={user_data?.total || 0}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </Box>
  );
};

export default UserTable;
