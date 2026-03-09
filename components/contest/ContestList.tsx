"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";
import { CONTESTS } from "@/utils/constant";
import { useAppTheme } from "@/context/ThemeContext";

interface ContestListProps {
  onViewContest: (contest: any) => void;
}

const ContestList: React.FC<ContestListProps> = ({ onViewContest }) => {
  const { colors, mode } = useAppTheme();
  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          color: colors.TEXT_PRIMARY,
          fontWeight: 700,
          mb: 1,
          letterSpacing: "-0.5px",
        }}
      >
        Contest Management
      </Typography>
      <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY, mb: 4 }}>
        Select a contest to view details and manage entries.
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${colors.BORDER}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead
            sx={{
              bgcolor: "rgba(0,0,0,0.02)",
            }}
          >
            <TableRow>
              <TableCell sx={{ color: colors.TEXT_PRIMARY, fontWeight: 600 }}>
                Title
              </TableCell>
              <TableCell sx={{ color: colors.TEXT_PRIMARY, fontWeight: 600 }}>
                Status
              </TableCell>
              <TableCell sx={{ color: colors.TEXT_PRIMARY, fontWeight: 600 }}>
                Participants
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: colors.TEXT_PRIMARY, fontWeight: 600 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CONTESTS.map((contest) => (
              <TableRow
                key={contest.id}
                sx={{
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.03)",
                  },
                }}
              >
                <TableCell sx={{ color: colors.TEXT_PRIMARY, fontWeight: 500 }}>
                  {contest.title}
                </TableCell>
                <TableCell>
                  <Chip
                    label={contest.status}
                    size="small"
                    sx={{
                      bgcolor:
                        contest.status === "Active"
                          ? `${colors.ACCENT}20`
                          : contest.status === "Upcoming"
                            ? `${colors.PRIMARY}20`
                            : "transparent",
                      color:
                        contest.status === "Active"
                          ? colors.ACCENT
                          : contest.status === "Upcoming"
                            ? colors.PRIMARY
                            : colors.TEXT_SECONDARY,
                      border: `1px solid ${contest.status === "Active" ? colors.ACCENT : contest.status === "Upcoming" ? colors.PRIMARY : colors.BORDER}`,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: colors.TEXT_PRIMARY }}>
                  {contest.participants}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onViewContest(contest)}
                    sx={{
                      color: colors.PRIMARY,
                      borderColor: colors.PRIMARY,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: `${colors.PRIMARY}10`,
                        borderColor: colors.PRIMARY,
                      },
                    }}
                  >
                    View Contest
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ContestList;
