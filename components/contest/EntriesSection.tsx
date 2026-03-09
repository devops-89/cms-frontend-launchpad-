"use client";

import React from "react";
import { Box, Paper } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import EntryFormBuilder from "./EntryFormBuilder";
import EntriesSidebar, { SubSection } from "./entries/EntriesSidebar";
import ModerationContent from "./entries/ModerationContent";
import WinnerContent from "./entries/WinnerContent";
import DownloadContent from "./entries/DownloadContent";
import TrashContent from "./entries/TrashContent";
import EntriesTable from "./entries/EntriesTable";

const EntriesSection: React.FC = () => {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [activeSection, setActiveSection] =
    React.useState<SubSection>("entries");
  const [entryTab, setEntryTab] = React.useState(0);

  const handleEntryTabChange = (_: any, newValue: number) =>
    setEntryTab(newValue);

  const handleNavClick = (id: SubSection) => {
    if (id === "add-entry") {
      router.push("/dashboard/add-entry");
      return;
    }
    setActiveSection(id);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "moderation":
        return <ModerationContent />;
      case "winner":
        return <WinnerContent />;
      case "add-entry":
        return <EntryFormBuilder />;
      case "download":
        return <DownloadContent />;
      case "trash":
        return <TrashContent />;
      case "entries":
      default:
        return (
          <EntriesTable
            entryTab={entryTab}
            onTabChange={handleEntryTabChange}
          />
        );
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
      <EntriesSidebar
        activeSection={activeSection}
        onNavClick={handleNavClick}
      />

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${colors.BORDER}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {renderContent()}
      </Paper>
    </Box>
  );
};

export default EntriesSection;
