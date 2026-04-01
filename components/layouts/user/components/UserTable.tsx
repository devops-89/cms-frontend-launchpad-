"use client";
import { UserController } from "@/api/userControllers";
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
  const { data, isPending, error } = useQuery({
    queryKey: ["user-list"],
    queryFn: () => UserController.getAllUser(UserRole.PARTICIPANT),
    enabled: true,
  });

  const user_data = data?.data?.data;
  console.log("suer", user_data);
  const [value, setValue] = useState(0);

  const tabChangeHandler = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const ALL_HEADERS = [
    "Id",
    "Name",
    "Email",
    "Phone number",
    "Grade",
    "Date of birth",
    "Status",
    "School Name",
    "Country Of Residence",
    "Joined At",
    // "Actions",
  ];

  const [visibleHeaders, setVisibleHeaders] = useState<string[]>(ALL_HEADERS);

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
          value={value}
          onChange={tabChangeHandler}
          sx={{ borderBottom: "1px solid #d7d7d7" }}
        >
          {USER_STATUS_TABS.map((val, i) => (
            <Tab key={i} label={val.label} />
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
              {user_data?.users.map((val: USER_DATA, i: number) => (
                <TableRow key={i}>
                  {visibleHeaders.includes("Id") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {val.id}
                    </TableCell>
                  )}
                  {visibleHeaders.includes("Name") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {val.firstName} {val.lastName}
                    </TableCell>
                  )}
                  {visibleHeaders.includes("Email") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {val.email}
                    </TableCell>
                  )}
                  {visibleHeaders.includes("Phone number") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {val.phone}
                    </TableCell>
                  )}
                  {visibleHeaders.includes("Grade") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {val.participantProfile?.grade}
                    </TableCell>
                  )}
                  {visibleHeaders.includes("Date of birth") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {val.participantProfile?.dateOfBirth
                        ? moment(val.participantProfile.dateOfBirth).format(
                            "YYYY-MM-DD",
                          )
                        : "-"}
                    </TableCell>
                  )}
                  {visibleHeaders.includes("Status") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <StatusDropdown user={val} />
                    </TableCell>
                  )}
                  {visibleHeaders.includes("School Name") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {val.participantProfile?.schoolName}
                    </TableCell>
                  )}
                  {visibleHeaders.includes("Country Of Residence") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {val.participantProfile?.country}
                    </TableCell>
                  )}
                  {visibleHeaders.includes("Joined At") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {moment(val.participantProfile?.createdAt).format(
                        "YYYY-MM-DD",
                      )}
                    </TableCell>
                  )}
                  {/* {visibleHeaders.includes("Actions") && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <IconButton>
                       
                      </IconButton>
                    </TableCell>
                  )} */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default UserTable;
