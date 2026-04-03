import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/context/SnackbarContext";
import {
  Box,
  Typography,
  Button,
  Grid,
  alpha,
  useTheme,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Add as AddIcon, BuildRounded as BuildIcon } from "@mui/icons-material";
import { montserrat } from "@/utils/fonts";
import FormBuilderCard from "./Form-Builder-Card";
import { useGetAllTemplates } from "@/hooks/form/useGetAllTemplates";
import { FORM_CONTROLLERS } from "@/api/formControllers";

interface TemplateListProps {
  onEdit: (template: any) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ onEdit }) => {
  const theme = useTheme();
  const { templates, isLoading: loading, refetch } = useGetAllTemplates();

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const handleCreateNew = () => router.push("/form-builder/add");

  useEffect(() => {
    // Force a fresh fetch when the component mounts to ensure the list is up to date
    refetch();
  }, [refetch]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await FORM_CONTROLLERS.deleteTemplate(templateToDelete);
      showSnackbar("Template deleted successfully", "success");
      refetch();
    } catch (error) {
      console.error("Failed to delete template:", error);
      showSnackbar("Failed to delete template.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
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
              fontWeight: 700,
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
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: "15px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
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
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "text.secondary" }}
          >
            No templates found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled", mb: 3 }}>
            Start building your first experience architecture
          </Typography>
          <Button
            variant="outlined"
            onClick={handleCreateNew}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Open Form Builder
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(templates) &&
            templates.map((template) => (
              <Grid key={template.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <FormBuilderCard
                  template={template}
                  onEdit={onEdit}
                  onDelete={handleDeleteClick}
                />
              </Grid>
            ))}
        </Grid>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
            boxShadow: "0px 20px 50px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary", fontWeight: 500 }}>
            Are you sure you want to delete this template? This action cannot be
            undone and may affect contests using this architecture.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="text"
            sx={{
              borderRadius: "10px",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            autoFocus
            sx={{
              borderRadius: "10px",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { boxShadow: "none", bgcolor: "error.dark" },
            }}
          >
            Delete Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateList;
