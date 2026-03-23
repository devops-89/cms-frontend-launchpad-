import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon, trend, trendType }) => {
  const { colors } = useAppTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: colors.SURFACE,
        backdropFilter: "blur(10px)",
        border: `1px solid ${colors.BORDER}`,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
          borderColor: color,
          "& .icon-box": {
            bgcolor: `${color}15`,
            transform: 'scale(1.1)',
          }
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box
          className="icon-box"
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(0,0,0,0.03)',
            color: color,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: trendType === 'up' ? '#10b981' : '#ef4444',
              bgcolor: trendType === 'up' ? '#10b98115' : '#ef444415',
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              height: 'fit-content'
            }}
          >
            {trend}
          </Typography>
        )}
      </Box>
      <Typography
        variant="body2"
        sx={{ color: colors.TEXT_SECONDARY, mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        sx={{ color: colors.TEXT_PRIMARY, fontWeight: 800, letterSpacing: '-1px' }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

export default StatCard;
