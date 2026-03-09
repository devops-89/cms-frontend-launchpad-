"use client";

import DashboardLayout from "@/components/layouts/Dashboard";
import EntryFormBuilder from "@/components/contest/EntryFormBuilder";
import { Box, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/context/ThemeContext";
import EntryForm from "@/components/contest/entries/EntryForm";

export default function AddEntryPage() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <DashboardLayout>
      {/* <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{
            color: colors.TEXT_SECONDARY,
            mb: 3,
            textTransform: "none",
            "&:hover": {
              color: colors.PRIMARY,
              bgcolor: `${colors.PRIMARY}10`,
            },
          }}
        >
          Back
        </Button>
        <EntryFormBuilder />
      </Box> */}
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{
            color: colors.TEXT_SECONDARY,
            mb: 3,
            textTransform: "none",
            "&:hover": {
              color: colors.PRIMARY,
              bgcolor: `${colors.PRIMARY}10`,
            },
          }}
        >
          Back
        </Button>
        <EntryForm />
      </Box>
    </DashboardLayout>
  );
}
