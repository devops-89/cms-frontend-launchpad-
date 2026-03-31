"use client";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { montserrat, roboto } from "@/utils/fonts";
import { Box, Button, Card, Tab, Tabs, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { contestControllers } from "@/api/contestControllers";
import { useContestDetails } from "@/store/useContestDetails";

const ContestDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [tabValue, setTabValue] = useState(0);

  const contestId = Array.isArray(id) ? id[0] : id;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const { data, isPending, error } = useQuery({
    queryKey: ["contest-details", contestId],
    queryFn: () => contestControllers.getContestDetails(contestId),
    enabled: !!contestId,
  });
  const { setContest } = useContestDetails();
  const contestData = data?.data;
  // if (contestData) {
  //   setContest(contestData);
  // }

  const contestTabs = [
    {
      label: "Overview",
    },
    {
      label: "Participants",
    },
    {
      label: "Entries",
    },
    {
      label: "Category",
    },
    {
      label: "Settings",
    },
    {
      label: "Votes",
    },
    {
      label: "Notifications",
    },
    {
      label: "Transactions",
    },
  ];

  useEffect(() => {
    if (contestData) {
      setContest(contestData);
    }
  }, [contestData]);

  return (
    <Box>
      <Breadcrumb
        title={contestData?.name}
        data={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Contest Management", href: "/contest-management/contests" },
          { title: contestData?.name, href: "#" },
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
            {contestData?.name}
          </Typography>

          {[1, 2, 3].includes(tabValue) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                const baseRoute = `/contest-management/contests/${contestId}`;
                if (tabValue === 1) router.push(`${baseRoute}/add-user`);
                else if (tabValue === 2) router.push(`${baseRoute}/add-entry`);
                else if (tabValue === 3)
                  router.push(`${baseRoute}/add-category`);
              }}
              sx={{
                fontFamily: roboto.style.fontFamily,
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 600,
                boxShadow: "none",
                ":hover": { boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" },
              }}
            >
              {tabValue === 1
                ? "Add Participant"
                : tabValue === 2
                  ? "Add Entry"
                  : "Add Category"}
            </Button>
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            color: "text.secondary",
            fontFamily: roboto.style.fontFamily,
          }}
        >
          {contestData?.description}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="contest details tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {contestTabs.map((val, i) => (
              <Tab
                key={i}
                label={val.label}
                sx={{ fontFamily: roboto.style.fontFamily, fontWeight: 600 }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && <OverviewTab contest={contestData} />}
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
