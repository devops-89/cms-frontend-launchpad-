import Breadcrumb from "@/components/widgets/Breadcrumb";
import { montserrat } from "@/utils/fonts";
import { Add } from "@mui/icons-material";
import { Box, Button, Card, Stack } from "@mui/material";
import React from "react";
import ContestTable from "./components/Contest-Table";
import Link from "next/link";

const ContestList = () => {
  return (
    <Box>
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Breadcrumb
          title="Contests"
          data={[
            {
              title: "Dashboard",
              href: "/dashboard",
            },
            {
              title: "Contest Management",
              href: "/contest-management/contests",
            },
          ]}
        />
        <Link href="/contest-management/contests/add-contest">
          <Button
            variant="outlined"
            sx={{ fontFamily: montserrat.style.fontFamily, p: 1.5 }}
            startIcon={<Add />}
          >
            Create Contest
          </Button>
        </Link>
      </Stack>
      <Card
        sx={{
          mt: 2,
          boxShadow: "0px 0px 2px 2px #eeeeee",
          borderRadius: 2,
          p: 2,
        }}
      >
        <ContestTable />
      </Card>
    </Box>
  );
};

export default ContestList;
