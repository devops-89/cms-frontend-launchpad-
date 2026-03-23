"use client";
import {
  CONTEST_DATA,
  CONTEST_TABLE_HEADER,
  CONTEST_TABLE_STATUS,
} from "@/utils/constant";
import { UserStatus } from "@/utils/enum";
import { roboto } from "@/utils/fonts";
import { Delete, Edit, RemoveRedEye } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ContestTable = () => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const tabChangeHandler = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = CONTEST_DATA.filter((item) => {
    const matchesTab =
      value === 0 || item.status === CONTEST_TABLE_STATUS[value].label;
    const matchesSearch = item.contestName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.PUBLISHED:
        return "success";
      case UserStatus.OFFLINE:
        return "error";
      case UserStatus.DRAFT:
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Tabs value={value} onChange={tabChangeHandler}>
        {CONTEST_TABLE_STATUS.map((item, index) => (
          <Tab key={index} label={item.label} />
        ))}
      </Tabs>
      <Box sx={{ textAlign: "center" }}>
        <TextField
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            fontFamily: roboto.style.fontFamily,
            mt: 2,
            width: "100%",
          }}
        />
      </Box>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            {CONTEST_TABLE_HEADER.map((item, index) => (
              <TableCell key={index}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: roboto.style.fontFamily,
                  }}
                >
                  {item}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography
                  sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                >
                  {item.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontFamily: roboto.style.fontFamily,
                    fontSize: 13,
                  }}
                >
                  {item.contestName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontFamily: roboto.style.fontFamily,
                    fontSize: 13,
                  }}
                >
                  {item.description}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                >
                  {item.start}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                >
                  {item.end}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={item.status}
                  color={getStatusColor(item.status as UserStatus)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>
                <Typography
                  sx={{ fontFamily: roboto.style.fontFamily, fontSize: 13 }}
                >
                  {item.entries}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    color="info"
                    onClick={() =>
                      router.push(`/contest-management/contests/${item.id}`)
                    }
                  >
                    <RemoveRedEye fontSize="small" />
                  </IconButton>
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

export default ContestTable;
