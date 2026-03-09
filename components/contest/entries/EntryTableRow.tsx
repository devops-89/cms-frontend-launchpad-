"use client";

import React from "react";
import {
  Box,
  Typography,
  TableCell,
  TableRow,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

interface EntryTableRowProps {
  entry: any;
  colors: Record<string, string>;
}

const EntryTableRow: React.FC<EntryTableRowProps> = ({ entry, colors }) => {
  return (
    <TableRow
      sx={{
        transition: "background-color 0.2s ease",
        "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
      }}
    >
      <TableCell sx={{ borderBottom: `1px solid ${colors.BORDER}` }}>
        <Box
          sx={{
            width: 60,
            height: 36,
            borderRadius: 1,
            overflow: "hidden",
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          <img
            src={entry.thumbnail}
            alt={entry.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      </TableCell>
      <TableCell sx={{ borderBottom: `1px solid ${colors.BORDER}` }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: colors.TEXT_PRIMARY }}
        >
          {entry.title}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          color: colors.TEXT_PRIMARY,
          borderBottom: `1px solid ${colors.BORDER}`,
        }}
      >
        {entry.score}
      </TableCell>
      <TableCell
        sx={{
          color: colors.TEXT_PRIMARY,
          borderBottom: `1px solid ${colors.BORDER}`,
        }}
      >
        {entry.uploaded}
      </TableCell>
      <TableCell
        sx={{
          color: colors.TEXT_PRIMARY,
          borderBottom: `1px solid ${colors.BORDER}`,
        }}
      >
        {entry.author}
      </TableCell>
      <TableCell
        align="right"
        sx={{ borderBottom: `1px solid ${colors.BORDER}` }}
      >
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            variant="outlined"
            size="small"
            sx={{
              color: colors.PRIMARY,
              borderColor: colors.PRIMARY,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1,
              px: 2,
              "&:hover": {
                bgcolor: `${colors.PRIMARY}10`,
                borderColor: colors.PRIMARY,
              },
            }}
          >
            Manage
          </Button>
          <IconButton
            size="small"
            sx={{
              color: colors.TEXT_SECONDARY,
              border: `1px solid ${colors.BORDER}`,
              borderRadius: 1,
              "&:hover": {
                color: colors.ERROR,
                borderColor: colors.ERROR,
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default EntryTableRow;
