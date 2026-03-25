import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/context/SnackbarContext";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  alpha,
  useTheme,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  BuildRounded as BuildIcon,
  CalendarToday as DateIcon,
  Layers as LayersIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { FORM_CONTROLLERS } from "@/api/formControllers";
import { montserrat, roboto } from "@/utils/fonts";
import moment from "moment";

interface TemplateListProps {
  onEdit: (template: any) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ onEdit }) => {
  const theme = useTheme();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const handleCreateNew = () => router.push("/form-builder/add");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await FORM_CONTROLLERS.getAllTemplates();
      // Most APIs return data directly, but some might wrap it in a 'templates' key or 'data' key again.
      // We ensure we set an array to avoid map() errors.
      const rawData = response?.data;
      const templatesData = Array.isArray(rawData) 
        ? rawData 
        : (Array.isArray(rawData?.data) 
            ? rawData.data 
            : (Array.isArray(rawData?.templates) ? rawData.templates : []));
      
      setTemplates(templatesData);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await FORM_CONTROLLERS.deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete template:", error);
      showSnackbar("Failed to delete template.", "error");
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontFamily: montserrat.style.fontFamily,
              color: "text.primary",
              letterSpacing: -0.5,
            }}
          >
             Experience Templates
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mt: 0.5, fontWeight: 500 }}
          >
            Manage and deploy your custom form architectures
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: "15px",
            textTransform: "none",
            fontWeight: 800,
            fontSize: "0.95rem",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0px 10px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: `0px 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          Create New Template
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: "24px" }}
              />
            </Grid>
          ))}
        </Grid>
      ) : templates.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            borderRadius: "30px",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: "2px dashed",
            borderColor: alpha(theme.palette.divider, 0.1),
          }}
        >
          <BuildIcon
            sx={{
              fontSize: 64,
              color: "text.disabled",
              mb: 2,
              opacity: 0.2,
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.secondary" }}>
            No templates found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled", mb: 3 }}>
            Start building your first experience architecture
          </Typography>
          <Button
            variant="outlined"
            onClick={handleCreateNew}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
          >
            Open Form Builder
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(templates) && templates.map((template) => (
            <Grid key={template.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                      <LayersIcon sx={{ fontSize: "1.4rem" }} />
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(template)}
                          sx={{ color: "text.secondary" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(template.id)}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      fontFamily: montserrat.style.fontFamily,
                      mb: 0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {template.schema?.form_identity?.title || template.title || "Untitled"}
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
                      <BuildIcon sx={{ fontSize: "0.9rem", color: "text.disabled" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                        {template.schema?.fields?.length || 0} Components
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DateIcon sx={{ fontSize: "0.9rem", color: "text.disabled" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                        {template.schema?.form_identity?.timestamp
                          ? moment(template.schema.form_identity.timestamp).format("MMM DD, YYYY")
                          : "Unknown date"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    fullWidth
                    endIcon={<ArrowIcon />}
                    onClick={() => onEdit(template)}
                    sx={{
                      mt: 3,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      py: 1.2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    Manage Template
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

import { Divider } from "@mui/material";

export default TemplateList;
