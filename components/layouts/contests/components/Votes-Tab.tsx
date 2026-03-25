"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Paper,
  TableContainer,
} from "@mui/material";
import { roboto } from "@/utils/fonts";

const VotesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const voteData = [
    {
      voteId: "V001",
      entryId: "E101",
      voteEmail: "john@example.com",
      userEmail: "user1@example.com",
      scheduleName: "Morning Slot",
      voteCount: 1,
      payment: "Paid",
      judgeScore: 8.5,
      ip: "192.168.1.1",
      sessionId: "sess_abc123",
      fingerprintId: "fp_xyz789",
    },
    {
      voteId: "V002",
      entryId: "E102",
      voteEmail: "sarah@example.com",
      userEmail: "user2@example.com",
      scheduleName: "Evening Slot",
      voteCount: 1,
      payment: "Unpaid",
      judgeScore: 7.0,
      ip: "192.168.1.2",
      sessionId: "sess_def456",
      fingerprintId: "fp_uvw012",
    },
    {
      voteId: "V003",
      entryId: "E101",
      voteEmail: "mike@example.com",
      userEmail: "user3@example.com",
      scheduleName: "Morning Slot",
      voteCount: 1,
      payment: "Paid",
      judgeScore: 9.0,
      ip: "192.168.1.3",
      sessionId: "sess_ghi789",
      fingerprintId: "fp_rst345",
    },
  ];

  const headers = [
    "Vote ID",
    "Entry ID",
    "Vote Email",
    "User Email",
    "Schedule Name",
    "Vote Count",
    "Payment",
    "Judge Score",
    "IP",
    "Session ID",
    "Fingerprint ID",
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = voteData.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontFamily: roboto.style.fontFamily,
        }}
      >
        Voting List
      </Typography>

      <TextField
        placeholder="Search votes..."
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{
          mb: 3,
          width: "100%",
          maxWidth: 400,
          fontFamily: roboto.style.fontFamily,
        }}
      />

      <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #eeeeee" }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: roboto.style.fontFamily,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.voteId}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.entryId}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.voteEmail}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.userEmail}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.scheduleName}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.voteCount}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.payment}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.judgeScore}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.ip}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.sessionId}</TableCell>
                  <TableCell sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}>{row.fingerprintId}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontFamily: roboto.style.fontFamily }}>
                    No data available in table
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VotesTab;
