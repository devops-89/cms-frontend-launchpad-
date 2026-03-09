"use client";

import React from "react";
import {
  TableRow,
  TableCell,
  Typography,
  Avatar,
  Box,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import { User, UserRole, UserStatus } from "@/types/user";

interface UserTableRowProps {
  user: User;
  colors: Record<string, string>;
}

const getRoleColor = (role: UserRole, colors: any) => {
  switch (role) {
    case "Admin":
      return colors.PRIMARY;
    case "Judge":
      return colors.SECONDARY;
    case "Moderator":
      return colors.ACCENT;
    default:
      return colors.TEXT_SECONDARY;
  }
};

const getStatusColor = (status: UserStatus, colors: any) => {
  switch (status) {
    case "Active":
      return colors.PRIMARY;
    case "Inactive":
      return colors.TEXT_SECONDARY;
    case "Suspended":
      return colors.ERROR;
    default:
      return colors.TEXT_SECONDARY;
  }
};

const UserTableRow: React.FC<UserTableRowProps> = ({ user, colors }) => {
  return (
    <TableRow
      sx={{
        "&:hover": { bgcolor: "rgba(0,0,0,0.01)" },
        "& .MuiTableCell-root": {
          borderBottom: `1px solid ${colors.BORDER}`,
          py: 2,
        },
      }}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user.avatar}
            sx={{
              width: 40,
              height: 40,
              bgcolor: colors.PRIMARY,
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: colors.TEXT_PRIMARY }}
            >
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Chip
          label={user.role}
          size="small"
          sx={{
            bgcolor: `${getRoleColor(user.role, colors)}10`,
            color: getRoleColor(user.role, colors),
            fontWeight: 700,
            borderRadius: "6px",
            fontSize: "0.75rem",
            height: 24,
            border: `1px solid ${getRoleColor(user.role, colors)}30`,
          }}
        />
      </TableCell>

      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: getStatusColor(user.status, colors),
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: getStatusColor(user.status, colors),
              fontSize: "0.85rem",
            }}
          >
            {user.status}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
          {user.joinedAt}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
          {user.lastLogin}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Edit User">
            <IconButton size="small" sx={{ color: colors.TEXT_SECONDARY }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton size="small" sx={{ color: colors.ERROR }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" sx={{ color: colors.TEXT_SECONDARY }}>
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

// Internal Import for Stack
import { Stack } from "@mui/material";

export default UserTableRow;
