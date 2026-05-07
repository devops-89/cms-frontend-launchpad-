"use client";

import { useParams, useRouter, useSearchParams, } from "next/navigation";

import { entryControllers } from "@/api/entryControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import {
  ArrowBack,
  EmojiEvents,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

const EntryDetailsPage = () => {
  const { id } = useParams();
  const searchParams =useSearchParams();
  const contestId =searchParams.get("contestId",);
  const router = useRouter();

  const { colors } =useAppTheme();

  const {data: entryData,isPending,} = useQuery({
                                        queryKey: [
                                          "entry",
                                          contestId,
                                          id,
                                        ],

                                        queryFn: () =>
                                          entryControllers.getEntryById(
                                            contestId as string,
                                            id as string,
                                          ),
                                        enabled:!!contestId && !!id,
                                    });

  const entry =entryData?.data;

  if (isPending) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!entry) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h5">
          Entry not found
        </Typography>

        <Button
          onClick={() =>
            router.back()
          }
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <Breadcrumb
          title={`Entry Details: ${
            entry?.submission
              ?.data
              ?.ho1p00z0q ||
            "Untitled"
          }`}
          data={[
            {
              title:
                "Dashboard",
              href: "/dashboard",
            },

            {
              title:
                "Contests",

              href: "/contest-management/contests",
            },

            {
              title:
                "Entry Details",

              href: `/contest-management/contests/${contestId}`,
            },
          ]}
        />

        <Button
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            router.back()
          }
          sx={{
            color:
              colors.PRIMARY,
          }}
        >
          Back to List
        </Button>
      </Box>

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${colors.BORDER}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 4,
            alignItems:
              "flex-start",
          }}
        >
          <Avatar
            variant="rounded"
            src=""
            sx={{
              width: 300,
              height: 180,
              borderRadius: 2,
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 1,
                fontWeight: 700,
              }}
            >
              {
                entry
                  ?.submission
                  ?.data
                  ?.ho1p00z0q
              }
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 2,
                color:
                  colors.TEXT_SECONDARY,
              }}
            >
              Submitted by:{" "}
              <strong>
                {
                  entry
                    ?.participant
                    ?.submission
                    ?.data
                    ?.yg9snrxlh
                }
              </strong>
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
              }}
            >
              <Chip
                icon={
                  <EmojiEvents />
                }
                label={`Score: ${entry.score}`}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  alignSelf:
                    "center",
                  color:
                    colors.TEXT_SECONDARY,
                }}
              >
                Uploaded:{" "}
                {new Date(
                  entry.created_at,
                ).toLocaleString()}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color:
                  colors.TEXT_PRIMARY,
                lineHeight: 1.6,
              }}
            >
              Detailed submission
              information for entry{" "}
              <strong>
                #{id}
              </strong>{" "}
              will be displayed
              here.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EntryDetailsPage;