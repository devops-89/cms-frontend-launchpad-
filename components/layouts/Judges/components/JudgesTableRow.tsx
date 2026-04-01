import { UserController } from "@/api/userControllers";
import { useModal } from "@/store/useModal";
import { UserStatus } from "@/utils/enum";
import {
  Assignment as AssignIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import AssignJudgesDialog from "./AssignJudgesDialog";

interface JudgesTableRowProps {
  judge: any;
  colors: Record<string, string>;
  dense?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  visibleHeaders: string[];
}

const getStatusStyles = (status: UserStatus | string) => {
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

const JudgesTableRow: React.FC<JudgesTableRowProps> = ({
  judge: initialJudge,
  colors,
  dense,
  selected,
  onSelect,
  visibleHeaders,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showModal, hideModal } = useModal();
  const [judge, setJudge] = useState(initialJudge);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const mutation = useMutation({
    mutationFn: (newStatus: string) =>
      UserController.updateUserStatus(judge.id, newStatus),
    onSuccess: (_, newStatus) => {
      setJudge({ ...judge, status: newStatus as UserStatus });
      queryClient.invalidateQueries({ queryKey: ["judge-list"] });
    },
    onError: () => {
      console.error("Failed to update status");
    },
  });

  const handleStatusChange = (newStatus: UserStatus) => {
    mutation.mutate(newStatus);
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
      {visibleHeaders.includes("Name") && (
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              width: "fit-content",
              "&:hover": {
                "& .MuiTypography-body2": {
                  color: colors.PRIMARY,
                  textDecoration: "underline",
                },
                "& .MuiAvatar-root": {
                  opacity: 0.8,
                  transform: "scale(1.05)",
                  transition: "all 0.2s ease",
                },
              },
            }}
            onClick={() => router.push(`/user-management/judges/${judge.id}`)}
          >
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
                .filter(Boolean)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: colors.TEXT_PRIMARY,
                  lineHeight: 1.2,
                  transition: "color 0.2s ease",
                }}
              >
                {judge.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: colors.TEXT_SECONDARY }}
              >
                {judge.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
      )}

      {/* Phone Number */}
      {visibleHeaders.includes("Phone number") && (
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY }}>
            {judge.phoneNumber || "—"}
          </Typography>
        </TableCell>
      )}

      {/* Expertise */}
      {visibleHeaders.includes("Expertise") && (
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {judge.expertise &&
          judge.expertise !== "N/A" &&
          judge.expertise !== "—" ? (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                flexWrap: "wrap",
                maxWidth: 250,
              }}
            >
              {judge.expertise.split(", ").map((exp: string, idx: number) => (
                <Chip
                  key={idx}
                  label={exp}
                  size="small"
                  sx={{
                    bgcolor: "rgba(0,0,0,0.04)",
                    color: colors.TEXT_PRIMARY,
                    fontSize: "0.75rem",
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>
              —
            </Typography>
          )}
        </TableCell>
      )}

      {visibleHeaders.includes("Status") && (
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <FormControl variant="standard" fullWidth>
            <Select
              value={judge.status}
              onChange={(e) => handleStatusChange(e.target.value as UserStatus)}
              disableUnderline
              disabled={mutation.isPending}
              IconComponent={
                mutation.isPending
                  ? () => (
                      <CircularProgress
                        size={14}
                        sx={{ mr: 1, ml: 0.5, color: statusStyle.color }}
                      />
                    )
                  : undefined
              }
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
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
      )}

      {visibleHeaders.includes("Actions") && (
        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
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
                onClick={() => {
                  handleCloseMenu();
                  showModal(
                    <AssignJudgesDialog
                      open={true}
                      onClose={hideModal}
                      judges={[{ id: judge.id, name: judge.name }]}
                    />,
                  );
                }}
                sx={{
                  fontSize: "0.85rem",
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <AssignIcon
                  fontSize="small"
                  sx={{ color: colors.PRIMARY, fontSize: 16 }}
                />
                Assign to Contest
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
      )}
    </TableRow>
  );
};

export default JudgesTableRow;
