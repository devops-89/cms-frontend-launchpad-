import React from "react";
import JudgesList from "./Judges-list";
import { Box, Button, Stack } from "@mui/material";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { Add } from "@mui/icons-material";
import Link from "next/link";

const JudgesLayout = () => {
  return (
    <Box>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{ mb: 3 }}
      >
        <Breadcrumb
          title="Judges"
          data={[
            {
              title: "Dashboard",
              href: "/dashboard",
            },
            {
              title: "Judges",
              href: "/user-management/judges",
            },
          ]}
        />
        <Link href="/user-management/judges/add-judge">
          <Button variant="outlined" endIcon={<Add />}>
            Add Judge
          </Button>
        </Link>
      </Stack>
      <JudgesList />
    </Box>
  );
};

export default JudgesLayout;
