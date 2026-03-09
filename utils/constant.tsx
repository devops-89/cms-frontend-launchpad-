import React from "react";
import {
  Add as AddIcon,
  RemoveRedEye as ViewsIcon,
  Poll as VotesIcon,
  AttachMoney as RevenueIcon,
  ErrorOutline as ModerationIcon,
} from "@mui/icons-material";

export const STATS = [
  {
    label: "Entries",
    value: "43",
    subtitle: "VIEW ENTRIES",
    icon: <AddIcon sx={{ fontSize: 32 }} />,
    color: "#e2e8f0",
  },
  {
    label: "Needs moderation",
    value: "2",
    subtitle: "VIEW ENTRIES",
    icon: <ModerationIcon sx={{ fontSize: 32 }} />,
    color: "#fef3c7",
  },
  {
    label: "Views",
    value: "84",
    subtitle: "VIEW MORE",
    icon: <ViewsIcon sx={{ fontSize: 32 }} />,
    color: "#d1fae5",
  },
  {
    label: "Votes",
    value: "0",
    subtitle: "VIEW RANKING",
    icon: <VotesIcon sx={{ fontSize: 32 }} />,
    color: "#dbeafe",
  },
  {
    label: "Entry Revenue (USD)",
    value: "$ 0",
    subtitle: "VIEW ENTRY TRANSACTIONS",
    icon: <RevenueIcon sx={{ fontSize: 32 }} />,
    color: "#f3e8ff",
  },
  {
    label: "Vote Revenue (USD)",
    value: "$ 0",
    subtitle: "VIEW VOTE TRANSACTIONS",
    icon: <RevenueIcon sx={{ fontSize: 32 }} />,
    color: "#ffedd5",
  },
];

export const ENTRIES = [
  {
    id: 1,
    title: "Current of Consequences",
    score: 0,
    uploaded: "2026-03-06 13:18:26",
    author: "Oindrila Chakraborty",
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=60&fit=crop",
  },
  {
    id: 2,
    title: "test",
    score: 0,
    uploaded: "2026-03-05 03:04:54",
    author: "Anshumaan mishra",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=60&fit=crop",
  },
  {
    id: 3,
    title: "Revolt AI - REVOLUTIONIZING EV BATTERY LIFE WITH AI",
    score: 0,
    uploaded: "2026-03-01 04:21:05",
    author: "Jeremy Robin",
    thumbnail:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=100&h=60&fit=crop",
  },
  {
    id: 4,
    title: "Luminora",
    score: 0,
    uploaded: "2026-02-25 10:35:53",
    author: "Oindrila Chakraborty",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=60&fit=crop",
  },
];

export const CONTESTS = [
  {
    id: 1,
    title: "Spring Code Jam",
    status: "Active",
    participants: 156,
  },
  {
    id: 2,
    title: "UI/UX Challenge",
    status: "Upcoming",
    participants: 42,
  },
  {
    id: 3,
    title: "Tech Stack Hackathon",
    status: "Completed",
    participants: 89,
  },
  {
    id: 4,
    title: "AI Innovation Contest",
    status: "Active",
    participants: 210,
  },
];
export const USERS = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    role: "Admin",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=1",
    joinedAt: "2025-01-12",
    lastLogin: "2 min ago",
  },
  {
    id: "2",
    name: "Sarah Miller",
    email: "sarah.m@example.com",
    role: "Judge",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=2",
    joinedAt: "2025-02-15",
    lastLogin: "1 hour ago",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@example.com",
    role: "Participant",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=3",
    joinedAt: "2025-03-01",
    lastLogin: "3 hours ago",
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    role: "Moderator",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/150?u=4",
    joinedAt: "2025-01-20",
    lastLogin: "2 days ago",
  },
  {
    id: "5",
    name: "David Ross",
    email: "d.ross@example.com",
    role: "Participant",
    status: "Suspended",
    avatar: "https://i.pravatar.cc/150?u=5",
    joinedAt: "2025-02-10",
    lastLogin: "1 week ago",
  },
];
