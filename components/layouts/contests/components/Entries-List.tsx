"use client";

import { entryControllers } from "@/api/entryControllers";
import { roboto } from "@/utils/fonts";

import {
  Delete,
  Edit,
  RemoveRedEye,
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";

import {
  useParams,
  useRouter,
} from "next/navigation";

const EntriesList = () => {
  const router = useRouter();

  const params = useParams();

  const id = (
    Array.isArray(params?.id)
      ? params.id[0]
      : params?.id
  ) as string;

  const {
    data: entriesData,
    isPending,
  } = useQuery({
    queryKey: [
      "entries",
      id,
    ],

    queryFn: () =>
      entryControllers.getAllEntries(
        id,
      ),

    enabled: !!id,
  });

  console.log(
    "entriesData",
    entriesData,
  );

  if (isPending) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
          mt: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontFamily:
                    roboto.style
                      .fontFamily,
                }}
              >
                Thumbnail
              </Typography>
            </TableCell>

            <TableCell>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontFamily:
                    roboto.style
                      .fontFamily,
                }}
              >
                Title
              </Typography>
            </TableCell>

            <TableCell>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontFamily:
                    roboto.style
                      .fontFamily,
                }}
              >
                Author
              </Typography>
            </TableCell>

            <TableCell>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontFamily:
                    roboto.style
                      .fontFamily,
                }}
              >
                Score
              </Typography>
            </TableCell>

            <TableCell>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontFamily:
                    roboto.style
                      .fontFamily,
                }}
              >
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {entriesData?.data?.map(
            (
              entry: any,
              index: number,
            ) => {
              console.log(entry);

              return (
                <TableRow
                  key={index}
                >
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src=""
                      onClick={() =>
                        router.push(
                          `/contest-management/entries/${entry.id}?contestId=${entry.contest_id}`,
                        )
                      }
                      sx={{
                        width: 50,
                        height: 30,
                        cursor:
                          "pointer",

                        "&:hover": {
                          opacity: 0.8,
                          transform:
                            "scale(1.1)",
                        },

                        transition:
                          "all 0.2s ease",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography
                      onClick={() =>
                        router.push(
                          `/contest-management/entries/${entry.id}?contestId=${entry.contest_id}`,
                        )
                      }
                      sx={{
                        fontFamily:
                          roboto
                            .style
                            .fontFamily,

                        fontSize: 13,

                        fontWeight: 500,

                        cursor:
                          "pointer",

                        "&:hover": {
                          color:
                            "primary.main",

                          textDecoration:
                            "underline",
                        },

                        transition:
                          "color 0.2s ease",
                      }}
                    >
                      {
                        entry
                          ?.submission
                          ?.data
                          ?.ho1p00z0q ||
                        "Untitled"
                      }
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontFamily:
                          roboto
                            .style
                            .fontFamily,

                        fontSize: 13,
                      }}
                    >
                      {
                        entry
                          ?.participant
                          ?.submission
                          ?.data
                          ?.yg9snrxlh ||
                        "Unknown"
                      }
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontFamily:
                          roboto
                            .style
                            .fontFamily,

                        fontSize: 13,
                      }}
                    >
                      {entry.score}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() =>
                          router.push(
                            `/contest-management/entries/${entry.id}?contestId=${entry.contest_id}`,
                          )
                        }
                      >
                        <RemoveRedEye fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        sx={{
                          color:
                            "#8b5cf6",
                        }}
                        onClick={() =>
                          router.push(
                            `/contest-management/contests/${entry?.contest_id}/entries/edit-entry?entryId=${entry.id}`,
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default EntriesList;