"use client";
import { UserController } from "@/api/userControllers";
import EditJudgeForm from "@/components/layouts/Judges/components/Edit-judge-form";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import { ArrowBack } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

const EditJudgePage = () => {
  const params = useParams();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string;
  const router = useRouter();
  const { colors } = useAppTheme();

  const { data, isPending, isError } = useQuery({
    queryKey: ["judge-details", id],
    queryFn: () => UserController.getUserById(id),
    enabled: !!id,
  });

  const judgeData = data?.data?.data || data?.data;

  if (isPending) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !judgeData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Judge not found or failed to load.</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const initialData = {
    firstName: judgeData.firstName || "",
    lastName: judgeData.lastName || "",
    email: judgeData.email || "",
    phone: judgeData.phone || "",
    expertise: judgeData.judgeProfile?.expertise || judgeData.expertise || [],
    judgeProfileId: judgeData.judgeProfile?.id,
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Breadcrumb
          title={`Edit Judge: ${judgeData.firstName} ${judgeData.lastName}`}
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Judges", href: "/user-management/judges" },
            { title: "Edit", href: `/user-management/judges/${id}/edit` },
          ]}
        />
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ color: colors.PRIMARY }}
        >
          Back to List
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.BORDER}`, boxShadow: "none" }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
          Edit Judge Details
        </Typography>

        <EditJudgeForm judgeId={id} initialData={initialData} />
      </Paper>
    </Box>
  );
};

export default EditJudgePage;
