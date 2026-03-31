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
import { useRouter } from "next/navigation";

const EntriesList = () => {
  const router = useRouter();
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
                <Avatar
                    variant="rounded"
                    src={entry.thumbnail}
                    onClick={() => router.push(`/contest-management/entries/${entry.id}`)}
                    sx={{
                        width: 50,
                        height: 30,
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8, transform: "scale(1.1)" },
                        transition: "all 0.2s ease",
                    }}
                />
              </TableCell>
              <TableCell>
                <Typography
                    onClick={() => router.push(`/contest-management/entries/${entry.id}`)}
                    sx={{
                        fontFamily: roboto.style.fontFamily,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        "&:hover": { color: "primary.main", textDecoration: "underline" },
                        transition: "color 0.2s ease",
                    }}
                >
                    {entry.title}
                </Typography>
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
