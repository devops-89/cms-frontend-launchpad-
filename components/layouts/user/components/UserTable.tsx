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
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useState } from "react";

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

const StatusDropdown = ({ user }: { user: USER_DATA }) => {
  const queryClient = useQueryClient();
  const [currentStatus, setCurrentStatus] = useState<string>(user.status || "Pending");

  React.useEffect(() => {
    setCurrentStatus(user.status || "Pending");
  }, [user.status]);

  const mutation = useMutation({
    mutationFn: (newStatus: string) => UserController.updateUserStatus(user.id, newStatus),
    onSuccess: (_, newStatus) => {
      setCurrentStatus(newStatus);
      queryClient.invalidateQueries({ queryKey: ["user-list"] });
    },
    onError: () => {
      console.error("Failed to update status");
    },
  });

  const handleStatusChange = (e: any) => {
    mutation.mutate(e.target.value);
  };

  const statusStyle = getStatusStyles(currentStatus);

  return (
    <FormControl variant="standard" fullWidth>
      <Select
        value={currentStatus}
        onChange={handleStatusChange}
        disableUnderline
        disabled={mutation.isPending}
        IconComponent={
          mutation.isPending
            ? () => <CircularProgress size={14} sx={{ mr: 1, ml: 0.5, color: statusStyle.color }} />
            : undefined
        }
        sx={{
          fontSize: "0.75rem",
          fontWeight: 700,
          width: "fit-content",
          "& .MuiSelect-select": {
            py: 0.5,
            px: 1,
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
        {Object.values(UserStatus)
          .filter((s) => s !== UserStatus.ALL)
          .map((status) => (
            <MenuItem key={status} value={status} sx={{ fontSize: "0.85rem" }}>
              {status}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

const UserTable: React.FC = () => {
  const { colors } = useAppTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [statusTab, setStatusTab] = useState("All");

  const { data, isPending, error } = useQuery({
    queryKey: ["user-list", page, rowsPerPage],
    queryFn: () => UserController.getAllUser(UserRole.PARTICIPANT, page + 1, rowsPerPage),
    enabled: true,
  });

  const user_data = data?.data?.data;
  console.log("suer", user_data);

  // Filter users on the frontend
  const filteredUsers = React.useMemo(() => {
    const users = user_data?.users || [];
    if (statusTab === "All") return users;
    return users.filter((u: any) => u.status === statusTab);
  }, [user_data, statusTab]);

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
      getValue: (val: USER_DATA) => val.phone,
    },
    {
      header: "Grade",
      getValue: (val: USER_DATA) => val.participantProfile?.grade,
    },
    {
      header: "Date of birth",
      getValue: (val: USER_DATA) => val.participantProfile?.dateOfBirth ? moment(val.participantProfile.dateOfBirth).format("YYYY-MM-DD") : null,
    },
    {
      header: "Status",
      getValue: (val: USER_DATA) => val.status,
      render: (val: USER_DATA) => <StatusDropdown user={val} />,
    },
    {
      header: "School Name",
      getValue: (val: USER_DATA) => val.participantProfile?.schoolName,
    },
    {
      header: "Country Of Residence",
      getValue: (val: any) => val.country?.name || val.participantProfile?.country,
    },
    {
      header: "Joined At",
      getValue: (val: any) => val.created_at ? moment(val.created_at).format("YYYY-MM-DD") : null,
    },
    {
      header: "Contest",
      getValue: (val: any) => val.participants?.[0]?.contest?.name || val.contestName || val.contest?.name,
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
  
  // Update visible headers when active headers change
  React.useEffect(() => {
    setVisibleHeaders(ALL_HEADERS);
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
          <TextField placeholder="Search" fullWidth />
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
          <Table sx={{ minWidth: 1000 }}>
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
              {filteredUsers.map((val: any) => (
                <TableRow key={val.id}>
                  {activeColumns
                    .filter((col) => visibleHeaders.includes(col.header))
                    .map((col, idx) => (
                      <TableCell key={idx} sx={{ whiteSpace: "nowrap" }}>
                        {col.render ? col.render(val) : col.getValue(val) || "—"}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
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
