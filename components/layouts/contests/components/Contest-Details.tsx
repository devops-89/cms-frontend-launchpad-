"use client";
import { contestControllers } from "@/api/contestControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useContestDetails } from "@/store/useContestDetails";
import { montserrat, roboto } from "@/utils/fonts";
import { Add , ArrowBack} from "@mui/icons-material";
import { Box, Button, Card, Tab, Tabs, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import EntriesList from "./Entries-List";
import NotificationsTab from "./Notifications-Tab";
import OverviewTab from "./Overview-Tab";
import ParticipantsList from "./ParticipantsList";
import SettingsTab from "./Settings-Tab";
import VotesTab from "./Votes-Tab";

const ContestDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id;
  const initialTab = searchParams ? parseInt(searchParams.get("tab") || "0", 10) : 0;
  const [tabValue, setTabValue] = useState(isNaN(initialTab) ? 0 : initialTab);

  const contestId = (Array.isArray(id) ? id[0] : id) as string;

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
    // {
    //   label: "Category",
    // },
    {
      label: "Settings",
    },
    {
      label: "Votes",
    },
    {
      label: "Notifications",
    },
    // {
    //   label: "Transactions",
    // },
  ];

  useEffect(() => {
    if (contestData) {
      setContest(contestData);
    }
  }, [contestData]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumb
          title={contestData?.name}
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Contest Management", href: "/contest-management/contests" },
            { title: contestData?.name, href: "#" },
          ]}
        />
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: "#6366f1",
            color: "#6366f1",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#4f46e5",
              bgcolor: "rgba(99, 102, 241, 0.04)",
            },
          }}
        >
          Back
        </Button>
      </Box>
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

          {[1, 2].includes(tabValue) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                const baseRoute = `/contest-management/contests/${contestId}`;
                if (tabValue === 1) router.push(`${baseRoute}/add-user`);
                else if (tabValue === 2)
                  router.push(`${baseRoute}/entries/add-entries`);
                // else if (tabValue === 3)
                //   router.push(`${baseRoute}/add-category`);
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
                :"Add Entry"
                }
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
          {tabValue === 3 && <SettingsTab/>}
          {tabValue === 4 && <VotesTab contestId={contestId} />}
          {tabValue === 5 && <NotificationsTab />}
          {/* {tabValue === 7 && <TransactionsTab />} */}
        </Box>
      </Card>
    </Box>
  );
};

export default ContestDetails;
