"use client";
import React from "react";
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from "@mui/material";
import { roboto } from "@/utils/fonts";
import { Info, CheckCircle, Warning } from "@mui/icons-material";

const NotificationsTab = () => {
  const notifications = [
    { id: 1, title: "New Entry Submitted", desc: "Project 'Luminora' has been submitted.", time: "10 mins ago", icon: <Info color="info" /> },
    { id: 2, title: "Contest Published", desc: "The contest is now live for all users.", time: "2 hours ago", icon: <CheckCircle color="success" /> },
    { id: 3, title: "Low Storage Warning", desc: "Contest media storage is almost full.", time: "1 day ago", icon: <Warning color="warning" /> },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: roboto.style.fontFamily }}>
        Recent Notifications
      </Typography>
      <List>
        {notifications.map((n) => (
          <ListItem key={n.id} alignItems="flex-start" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "background.paper" }}>{n.icon}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 600, fontSize: 14 }}>{n.title}</Typography>}
              secondary={
                <React.Fragment>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>{n.desc}</Typography>
                  <Typography variant="caption" color="text.disabled">{n.time}</Typography>
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NotificationsTab;
