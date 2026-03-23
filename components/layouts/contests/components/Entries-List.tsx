"use client";
import { ENTRIES } from "@/utils/constant";
import { roboto } from "@/utils/fonts";
import { RemoveRedEye } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Avatar,
} from "@mui/material";
import React from "react";

const EntriesList = () => {
  return (
    <Box>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Thumbnail</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Title</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Author</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Score</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Actions</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ENTRIES.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>
                <Avatar variant="rounded" src={entry.thumbnail} sx={{ width: 50, height: 30 }} />
              </TableCell>
              <TableCell>
                <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13, fontWeight: 500 }}>{entry.title}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{entry.author}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{entry.score}</Typography>
              </TableCell>
              <TableCell>
                <IconButton size="small" color="info">
                  <RemoveRedEye fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default EntriesList;
