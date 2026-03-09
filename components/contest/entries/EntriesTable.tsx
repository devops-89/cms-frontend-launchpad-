"use client";

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { ENTRIES } from "@/utils/constant";
import { useAppTheme } from "@/context/ThemeContext";
import EntryTableRow from "./EntryTableRow";

interface EntriesTableProps {
  entryTab: number;
  onTabChange: (_: any, newValue: number) => void;
}

const EntriesTable: React.FC<EntriesTableProps> = ({
  entryTab,
  onTabChange,
}) => {
  const { colors } = useAppTheme();

  return (
    <>
      <Box sx={{ borderBottom: `1px solid ${colors.BORDER}` }}>
        <Tabs
          value={entryTab}
          onChange={onTabChange}
          sx={{
            px: 2,
            "& .MuiTab-root": {
              color: colors.TEXT_SECONDARY,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              py: 2,
              transition: "all 0.2s ease",
              "&:hover": { color: colors.PRIMARY, opacity: 0.8 },
            },
            "& .Mui-selected": { color: `${colors.PRIMARY} !important` },
            "& .MuiTabs-indicator": {
              bgcolor: colors.PRIMARY,
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab label="Latest Entries" />
          <Tab label="Top Entries" />
        </Tabs>
      </Box>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
            <TableRow>
              {[
                "Thumbnail",
                "Title",
                "Judges Score",
                "Uploaded",
                "Author Name",
                "Actions",
              ].map((h, i) => (
                <TableCell
                  key={h}
                  align={i === 5 ? "right" : "left"}
                  sx={{
                    color: colors.TEXT_PRIMARY,
                    fontWeight: 600,
                    borderBottom: `1px solid ${colors.BORDER}`,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ENTRIES.map((entry) => (
              <EntryTableRow key={entry.id} entry={entry} colors={colors} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default EntriesTable;
