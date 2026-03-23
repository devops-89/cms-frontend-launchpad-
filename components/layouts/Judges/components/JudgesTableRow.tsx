import React, { useState } from "react";
import {
  TableRow,
  TableCell,
  Typography,
  Avatar,
  Box,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Checkbox,
  Select,
  FormControl,
} from "@mui/material";
import { Edit as EditIcon, MoreVert as MoreIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { UserStatus } from "@/utils/enum";

interface JudgesTableRowProps {
  judge: any;
  colors: Record<string, string>;
  dense?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const getStatusStyles = (status: UserStatus) => {
  switch (status) {
    case UserStatus.ACTIVE:
      return { bgcolor: "#dcfce7", color: "#166534", label: "Active" };
    case UserStatus.PENDING:
      return { bgcolor: "#fef3c7", color: "#92400e", label: "Pending" };
    case UserStatus.BANNED:
      return { bgcolor: "#fee2e2", color: "#991b1b", label: "Banned" };
    case UserStatus.REJECTED:
      return { bgcolor: "#f3f4f6", color: "#374151", label: "Rejected" };
    default:
      return { bgcolor: "#f3f4f6", color: "#374151", label: status };
  }
};

const JudgesTableRow: React.FC<JudgesTableRowProps> = ({
  judge: initialJudge,
  colors,
  dense,
  selected,
  onSelect,
}) => {
  const router = useRouter();
  const [judge, setJudge] = useState(initialJudge);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus: UserStatus) => {
    setJudge({ ...judge, status: newStatus });
  };

  const statusStyle = getStatusStyles(judge.status);

  return (
    <TableRow
      sx={{
        bgcolor: selected ? "rgba(99, 102, 241, 0.04)" : "transparent",
        "&:hover": {
          bgcolor: selected ? "rgba(99, 102, 241, 0.08)" : "rgba(0,0,0,0.01)",
        },
        "& .MuiTableCell-root": {
          borderBottom: `1px solid ${colors.BORDER}`,
          py: dense ? 1 : 2,
        },
      }}
    >
      {/* Checkbox */}
      <TableCell padding="checkbox">
        <Checkbox size="small" checked={selected} onChange={onSelect} />
      </TableCell>

      {/* Name / Judge Details */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={judge.avatar}
            sx={{
              width: 36,
              height: 36,
              bgcolor: colors.PRIMARY,
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {judge.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: colors.TEXT_PRIMARY,
                lineHeight: 1.2,
              }}
            >
              {judge.name}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY }}>
              {judge.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Phone Number */}
      <TableCell>
        <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY }}>
          {judge.phoneNumber || "—"}
        </Typography>
      </TableCell>

      {/* Expertise */}
      <TableCell>
        <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY }}>
          {judge.expertise || "—"}
        </Typography>
      </TableCell>

      {/* Status Selector */}
      <TableCell>
        <FormControl variant="standard" fullWidth>
          <Select
            value={judge.status}
            onChange={(e) => handleStatusChange(e.target.value as UserStatus)}
            disableUnderline
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
              },
            }}
          >
            {Object.values(UserStatus)
              .filter((s) => s !== UserStatus.ALL)
              .map((status) => (
                <MenuItem
                  key={status}
                  value={status}
                  sx={{ fontSize: "0.85rem" }}
                >
                  {status}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <IconButton size="small" sx={{ color: colors.TEXT_SECONDARY }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: colors.TEXT_SECONDARY }}
            onClick={handleOpenMenu}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 0,
              sx: {
                minWidth: 120,
                border: `1px solid ${colors.BORDER}`,
                borderRadius: 2,
                mt: 0.5,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              },
            }}
          >
            <MenuItem onClick={handleCloseMenu} sx={{ fontSize: "0.85rem" }}>
              View Details
            </MenuItem>
            <MenuItem
              onClick={handleCloseMenu}
              sx={{ fontSize: "0.85rem", color: colors.ERROR }}
            >
              Delete Judge
            </MenuItem>
          </Menu>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default JudgesTableRow;
