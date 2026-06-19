"use client";
import React, { useState } from "react";
import { Box, Typography, Button, IconButton, Paper, ToggleButtonGroup, ToggleButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import { montserrat } from "@/utils/fonts";
import { Add, Edit, Delete, Visibility, Person, Gavel } from "@mui/icons-material";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import { useRouter, useParams } from "next/navigation";

const NotificationsTab = () => {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useParams();
  const contestId = params?.id;
  
  const [audience, setAudience] = useState<"Participant" | "Judge">("Participant");
  const { templates, deleteTemplate } = useNotificationTemplates();

  const handleAudienceChange = (event: React.MouseEvent<HTMLElement>, newAudience: "Participant" | "Judge") => {
    if (newAudience !== null) {
      setAudience(newAudience);
    }
  };

  const handleCreateNew = () => {
    router.push(`/contest-management/contests/${contestId}/notifications/add-template`);
  };

  const handleEdit = (id: string) => {
    router.push(`/contest-management/contests/${contestId}/notifications/${id}/edit`);
  };

  const handlePreview = (id: string) => {
    router.push(`/contest-management/contests/${contestId}/notifications/${id}/view`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(id);
    }
  };

  const filteredTemplates = templates.filter(t => t.audience === audience);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <ToggleButtonGroup
          color="primary"
          value={audience}
          exclusive
          onChange={handleAudienceChange}
          size="small"
        >
          <ToggleButton value="Participant" sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}>
             <Person sx={{ fontSize: 20, mr: 1 }} /> Participant
          </ToggleButton>
          <ToggleButton value="Judge" sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}>
             <Gavel sx={{ fontSize: 20, mr: 1 }} /> Judge
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
          sx={{ bgcolor: colors.PRIMARY, textTransform: "none", borderRadius: 2, fontWeight: 600 }}
        >
          Create New Template
        </Button>
      </Box>

      {filteredTemplates.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: `1px dashed ${colors.BORDER}`, borderRadius: 3, bgcolor: "rgba(0,0,0,0.01)" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontFamily: montserrat.style.fontFamily }}>No Templates Found</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>You have not created any templates for {audience}s yet.</Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={handleCreateNew}>Create First Template</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${colors.BORDER}`, borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Event Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTemplates.map((row) => (
                <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Chip label={row.eventType} size="small" sx={{ bgcolor: "rgba(99, 102, 241, 0.1)", color: colors.PRIMARY, fontWeight: 500 }} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {row.subject}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Preview">
                      <IconButton onClick={() => handlePreview(row.id)} size="small" color="info"><Visibility fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(row.id)} size="small" color="primary" sx={{ mx: 0.5 }}><Edit fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(row.id)} size="small" color="error"><Delete fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default NotificationsTab;
