"use client";
import React from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";
import { roboto } from "@/utils/fonts";

const TransactionsTab = () => {
  const transactions = [
    { id: "TXN001", user: "John Doe", type: "Entry Fee", amount: "$15.00", date: "2026-03-20" },
    { id: "TXN002", user: "Jane Smith", type: "Vote Credit", amount: "$5.00", date: "2026-03-21" },
    { id: "TXN003", user: "Mike Johnson", type: "Entry Fee", amount: "$15.00", date: "2026-03-22" },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
        Financial Transactions
      </Typography>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ fontSize: 13 }}>{row.id}</TableCell>
                <TableCell sx={{ fontSize: 13 }}>{row.user}</TableCell>
                <TableCell sx={{ fontSize: 13 }}>{row.type}</TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "success.main" }}>{row.amount}</TableCell>
                <TableCell sx={{ fontSize: 13 }}>{row.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TransactionsTab;
