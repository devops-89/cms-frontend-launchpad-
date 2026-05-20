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
  Stack,
  Button,
} from "@mui/material";
import { roboto } from "@/utils/fonts";
import { COLORS } from "@/utils/enum";
import { useModal } from "@/store/useModal";
import AddVotingPeriod from "@/components/widgets/modals/Add-Voting-Period";

const VotesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { showModal } = useModal();

  const handleShowModal = () => {
    showModal(<AddVotingPeriod />);
  };

  const voteData = [
    {
      voting_type: "Public Voting",
      start_date: "10/12/2026",
      end_date: "01/01/2027",
    },
    {
      voting_type: "Public Voting",
      start_date: "10/12/2026",
      end_date: "01/01/2027",
    },
    {
      voting_type: "Public Voting",
      start_date: "10/12/2026",
      end_date: "01/01/2027",
      userEmail: "user2@example.com",
    },
    {
      voting_type: "Judge Voting",
      start_date: "10/12/2026",
      end_date: "01/01/2027",
    },
    {
      voting_type: "Judge Voting",
      start_date: "10/12/2026",
      end_date: "01/01/2027",
    },
  ];

  const headers = ["Voting Type", "Start Date", "End Date"];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = voteData.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        width={"100%"}
      >
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
        <Button
          sx={{
            backgroundColor: COLORS.PRIMARY,
            color: "#ffffff",
            fontFamily: roboto.style.fontFamily,
            textTransform: "capitalize",
            borderRadius: 2,
          }}
          onClick={handleShowModal}
        >
          Add Voting Period
        </Button>
      </Stack>

      {/* <TextField
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
      /> */}

      <TableContainer
        component={Paper}
        sx={{ boxShadow: "none", border: "1px solid #eeeeee" }}
      >
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
                  <TableCell
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {row.voting_type}
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {row.start_date}
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {row.end_date}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontFamily: roboto.style.fontFamily,
                    }}
                  >
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
