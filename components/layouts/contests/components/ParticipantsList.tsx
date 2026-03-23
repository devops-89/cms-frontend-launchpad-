"use client";
import { USERS } from "@/utils/constant";
import { roboto } from "@/utils/fonts";
import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

const ParticipantsList = () => {
  return (
    <Box>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Name</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Email</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Phone</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600, fontFamily: roboto.style.fontFamily }}>Actions</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {USERS.map((user, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{user.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{user.email}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{user.phoneNumber}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton size="small" color="primary">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ParticipantsList;
