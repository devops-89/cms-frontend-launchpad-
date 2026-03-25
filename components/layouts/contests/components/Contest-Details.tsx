"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { montserrat, roboto } from "@/utils/fonts";
import { Box, Button, Card, Tab, Tabs, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import React, { useState } from "react";
import ParticipantsList from "./ParticipantsList";
import EntriesList from "./Entries-List";
import OverviewTab from "./Overview-Tab";
import CategoryTab from "./Category-Tab";
import SettingsTab from "./Settings-Tab";
import VotesTab from "./Votes-Tab";
import NotificationsTab from "./Notifications-Tab";
import TransactionsTab from "./Transactions-Tab";
import { useParams, useRouter } from "next/navigation";
import { CONTEST_DATA } from "@/utils/constant";

const ContestDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [tabValue, setTabValue] = useState(0);

  const contestId = Array.isArray(id) ? id[0] : id;
  const contest =
    CONTEST_DATA.find((c) => c.id === Number(contestId)) || CONTEST_DATA[0];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Breadcrumb
        title={contest.contestName}
        data={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Contest Management", href: "/contest-management/contests" },
          { title: "Contest Details", href: "#" },
        ]}
      />
      <Card
        sx={{
          mt: 2,
          boxShadow: "0px 0px 2px 2px #eeeeee",
          borderRadius: 2,
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontFamily: montserrat.style.fontFamily, fontWeight: 600 }}
          >
            {contest.contestName}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              router.push(`/contest-management/contests/${contestId}/add-user`)
            }
            sx={{
              fontFamily: roboto.style.fontFamily,
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              boxShadow: "none",
              ":hover": { boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" },
            }}
          >
            Add User
          </Button>
        </Box>
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            color: "text.secondary",
            fontFamily: roboto.style.fontFamily,
          }}
        >
          {contest.description}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="contest details tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Overview"
              sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
            />
            <Tab
              label="Participants"
              sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
            />
            <Tab
              label="Entries"
              sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
            />
            <Tab
              label="Category"
              sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
            />
            <Tab
              label="Settings"
              sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
            />
            <Tab
              label="Votes"
              sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
            />
            <Tab
              label="Notifications"
              sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
            />
            <Tab
              label="Transactions"
              sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && <OverviewTab contest={contest} />}
          {tabValue === 1 && <ParticipantsList />}
          {tabValue === 2 && <EntriesList />}
          {tabValue === 3 && <CategoryTab />}
          {tabValue === 4 && <SettingsTab />}
          {tabValue === 5 && <VotesTab />}
          {tabValue === 6 && <NotificationsTab />}
          {tabValue === 7 && <TransactionsTab />}
        </Box>
      </Card>
    </Box>
  );
};

export default ContestDetails;
