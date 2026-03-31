"use client";
import {
  CONTEST_DATA,
  CONTEST_TABLE_HEADER,
  CONTEST_TABLE_STATUS,
} from "@/utils/constant";
import { UserStatus } from "@/utils/enum";
import { roboto } from "@/utils/fonts";
import { Delete, Edit, RemoveRedEye } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contestControllers } from "@/api/contestControllers";
import { useSnackbar } from "@/context/SnackbarContext";
import moment from "moment";

const ContestTable = () => {
  const theme = useTheme();
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const tabChangeHandler = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { data, isPending, error } = useQuery({
    queryKey: ["contests"],
    queryFn: () => contestControllers.getContest(),
    enabled: true,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contestControllers.updateStatus({ status }, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      showSnackbar("Status updated successfully", "success");
    },
    onError: (err: any) => {
      showSnackbar(
        err?.response?.data?.message || "Failed to update status",
        "error",
      );
    },
  });

  const contestsList = data?.data || [];

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.PUBLISHED:
        return "success";
      case UserStatus.OFFLINE:
        return "error";
      case UserStatus.DRAFT:
        return "warning";
      default:
        return "default";
    }
  };

  // console.log("test", data);

  return (
    <Box>
      <Tabs value={value} onChange={tabChangeHandler}>
        {CONTEST_TABLE_STATUS.map((item, index) => (
          <Tab key={index} label={item.label} />
        ))}
      </Tabs>
      <Box sx={{ textAlign: "center" }}>
        <TextField
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            fontFamily: roboto.style.fontFamily,
            mt: 2,
            width: "100%",
          }}
        />
      </Box>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            {CONTEST_TABLE_HEADER.map((item, index) => (
              <TableCell key={index}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: roboto.style.fontFamily,
                  }}
                >
                  {item}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={CONTEST_TABLE_HEADER.length} align="center">
                <Typography sx={{ py: 4 }}>Loading contests...</Typography>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={CONTEST_TABLE_HEADER.length} align="center">
                <Typography color="error" sx={{ py: 4 }}>
                  Error loading contests.
                </Typography>
              </TableCell>
            </TableRow>
          ) : contestsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={CONTEST_TABLE_HEADER.length} align="center">
                <Typography sx={{ py: 4 }}>No contests found.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            contestsList.map((item: any, index: number) => (
              <TableRow key={item.id || index}>
                <TableCell>
                  <Typography
                    onClick={() =>
                      router.push(`/contest-management/contests/${item.id}`)
                    }
                    sx={{
                      fontWeight: 500,
                      fontFamily: roboto.style.fontFamily,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: "primary.main",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {item.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontFamily: roboto.style.fontFamily,
                      fontSize: 13,
                    }}
                  >
                    {item.description.slice(0, 20) + "..."}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {moment(item.start_date).format("YYYY-MM-DD")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {moment(item.end_date).format("YYYY-MM-DD")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.status || UserStatus.DRAFT}
                    size="small"
                    onChange={(e) =>
                      mutation.mutate({
                        id: item.id,
                        status: e.target.value as string,
                      })
                    }
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      height: 30,
                      minWidth: 110,
                      borderRadius: 1.5,
                      textTransform: "capitalize",
                      "& .MuiSelect-select": {
                        py: 0.5,
                        px: 1.5,
                        display: "flex",
                        alignItems: "center",
                        bgcolor: alpha(
                          theme.palette[
                            getStatusColor(
                              (item.status || UserStatus.DRAFT) as UserStatus,
                            ) as "success" | "warning" | "error" | "info"
                          ]?.main || theme.palette.grey[400],
                          0.1,
                        ),
                        color:
                          theme.palette[
                            getStatusColor(
                              (item.status || UserStatus.DRAFT) as UserStatus,
                            ) as "success" | "warning" | "error" | "info"
                          ]?.main || theme.palette.grey[700],
                        borderRadius: 1,
                      },
                      "& fieldset": { border: "none" },
                      "&:hover fieldset": { border: "none" },
                    }}
                    disabled={mutation.isPending}
                  >
                    {[
                      UserStatus.PUBLISHED,
                      UserStatus.DRAFT,
                      UserStatus.OFFLINE,
                    ].map((status) => (
                      <MenuItem
                        key={status}
                        value={status}
                        sx={{ fontSize: 13, textTransform: "capitalize" }}
                      >
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {item.entries || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() =>
                        router.push(`/contest-management/contests/${item.id}`)
                      }
                    >
                      <RemoveRedEye fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() =>
                        router.push(
                          `/contest-management/contests/${item.id}/edit`,
                        )
                      }
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ContestTable;
