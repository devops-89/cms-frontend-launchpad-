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
import { useQuery } from "@tanstack/react-query";
import { contestControllers } from "@/api/contestControllers";
import moment from "moment";
import { CircularProgress, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";

const VotesTab = ({ contestId }: { contestId: string }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { showModal } = useModal();

  const handleShowModal = () => {
    showModal(<AddVotingPeriod />);
  };

  const handleEditClick = (row: any) => {
    showModal(<AddVotingPeriod votingPeriod={row} />);
  };

  const { data: votingPeriodsData, isPending } = useQuery({
    queryKey: ["votingPeriods", contestId],
    queryFn: () => contestControllers.getAllVotingPeriods(contestId),
    enabled: !!contestId,
  });

  const voteData = votingPeriodsData?.data || [];

  const headers = ["Voting Type", "Start Date", "End Date", "Actions"];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = voteData.filter((item: any) =>
    Object.values(item).some(
      (val) =>
        val &&
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
        <Table sx={{ width: "100%" }} size="small">
          <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} align={header === "Actions" ? "right" : "left"}>
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
            {isPending ? (
              <TableRow>
                <TableCell colSpan={headers.length} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredData.length > 0 ? (
              filteredData.map((row: any, index: number) => (
                <TableRow key={row.id || index} hover>
                  <TableCell
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {row.voting_type === "PUBLIC" ? "Public Voting" : row.voting_type === "JUDGE" ? "Judge Evaluation" : row.voting_type}
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {moment(row.start_date).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                  >
                    {moment(row.end_date).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<Edit fontSize="small" />}
                      onClick={() => handleEditClick(row)}
                      sx={{ textTransform: "capitalize", fontFamily: roboto.style.fontFamily }}
                    >
                      Edit
                    </Button>
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
