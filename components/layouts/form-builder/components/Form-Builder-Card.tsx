import {
  ArrowForwardRounded,
  Build,
  DateRange,
  Delete,
  Edit,
  Layers,
  FolderOpen,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import moment from "moment";
import React from "react";
import { roboto } from "@/utils/fonts";

interface FormBuilderCardProps {
  template: any;
  onEdit: (template: any) => void;
  onDelete: (id: string) => void;
}

const FormBuilderCard: React.FC<FormBuilderCardProps> = ({
  template,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  return (
    <Box>
      <Card
        sx={{
          borderRadius: "24px",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.08),
          boxShadow: "0px 10px 40px rgba(0,0,0,0.03)",
          transition: "all 0.3s ease",
          overflow: "visible",
          position: "relative",
          "&:hover": {
            transform: "translateY(-5px)",
            borderColor: alpha(theme.palette.primary.main, 0.2),
            boxShadow: `0px 20px 50px ${alpha(theme.palette.primary.main, 0.05)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: "12px",
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                color: "primary.main",
                display: "flex",
              }}
            >
              <Layers sx={{ fontSize: "1.4rem" }} />
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit(template)}
                  sx={{ color: "text.secondary" }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete(template.id)}
                  sx={{ color: "error.main" }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              fontFamily: roboto.style.fontFamily,
              mb: 0.5,
              lineHeight: 1.2,
            }}
          >
            {template.schema?.form_identity?.title ||
              template.title ||
              "Untitled"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              fontWeight: 700,
              display: "block",
              mb: 2,
              fontFamily: roboto.style.fontFamily,
            }}
          >
            ID: {template.schema?.form_identity?.name || template.name || "N/A"}
          </Typography>

          <Divider sx={{ my: 2, opacity: 0.5 }} />

          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FolderOpen sx={{ fontSize: "0.9rem", color: "text.disabled" }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary" }}
              >
                {template.schema?.form_identity?.section_name || template.section_name || "Uncategorized Section"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Build sx={{ fontSize: "0.9rem", color: "text.disabled" }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary" }}
              >
                {template.schema?.fields?.length || 0} Components
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DateRange sx={{ fontSize: "0.9rem", color: "text.disabled" }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary" }}
              >
                {template.schema?.form_identity?.timestamp
                  ? moment(template.schema.form_identity.timestamp).format(
                      "MMM DD, YYYY",
                    )
                  : "Unknown date"}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FormBuilderCard;
