"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as AddIcon,
} from "@mui/icons-material";
import { USERS } from "@/utils/constant";
import { useAppTheme } from "@/context/ThemeContext";
import UserTableRow from "./UserTableRow";

const UserTable: React.FC = () => {
  const { colors } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box>
      {/* Header & Search */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: colors.TEXT_PRIMARY, mb: 0.5 }}
          >
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
            Manage and monitor all platform users, roles and permissions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: colors.PRIMARY,
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            py: 1.2,
            boxShadow: `0 8px 20px ${colors.PRIMARY}30`,
            "&:hover": { bgcolor: colors.PRIMARY, opacity: 0.9 },
          }}
        >
          Add New User
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${colors.BORDER}`,
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            p: 2.5,
            borderBottom: `1px solid ${colors.BORDER}`,
            display: "flex",
            gap: 2,
          }}
        >
          <TextField
            placeholder="Search users by name or email..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "rgba(0,0,0,0.02)",
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: colors.BORDER },
                "&.Mui-focused fieldset": { borderColor: colors.PRIMARY },
              },
            }}
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
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: colors.TEXT_PRIMARY,
              borderColor: colors.BORDER,
            }}
          >
            Filters
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
              <TableRow>
                {[
                  "User Details",
                  "Role",
                  "Status",
                  "Joined Date",
                  "Last Login",
                  "Actions",
                ].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i === 5 ? "right" : "left"}
                    sx={{
                      color: colors.TEXT_SECONDARY,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${colors.BORDER}`,
                      py: 2,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user as any}
                    colors={colors}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 10, textAlign: "center" }}>
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
      </Paper>
    </Box>
  );
};

export default UserTable;
