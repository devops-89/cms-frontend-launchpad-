"use client";
import { contestControllers } from "@/api/contestControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import { ArrowBack as ArrowBackIcon, Info as InfoIcon } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const ViewUserDetails = () => {
  const { colors } = useAppTheme();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string;
  const participantId = searchParams.get("participantId") as string;

  const router = useRouter();

  const { data, isPending: isContestPending } = useQuery({
    queryKey: ["Contest Details", id],
    queryFn: () => contestControllers.getContestDetails(id),
    enabled: !!id,
  });

  const fields = data?.data?.userLevelTemplate?.schema?.fields || data?.data?.user_level_template?.schema?.fields || [];

  const { data: participantResponse, isPending: isParticipantPending } = useQuery({
    queryKey: ["Participant Details", id, participantId],
    queryFn: () => contestControllers.getParticipantById(id, participantId),
    enabled: !!id && !!participantId,
  });
  
  const rawDetails = participantResponse?.data || participantResponse;
  const participant = rawDetails;
  const formData = participant?.submission?.data || participant?.participantProfile?.submission?.data?.data || participant?.participantProfile?.submission?.data || participant?.user?.participantProfile?.submission?.data?.data || participant?.user?.participantProfile?.submission?.data || participant?.participant_profile_data || participant?.submission?.data?.data || participant?.submission?.data || participant?.data || {};

  if (isContestPending || isParticipantPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (!rawDetails) {
    return (
      <Paper sx={{ p: 6, m: 4, textAlign: 'center', borderRadius: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <Typography color="error" variant="h6" fontWeight={600}>Failed to load participant details.</Typography>
      </Paper>
    );
  }

  // Find full name from form data
  const fullNameField = fields.find((f: any) => {
    const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
    return l.includes("fullname") || l === "name" || (l.includes("name") && !l.includes("first") && !l.includes("last"));
  });
  const firstNameField = fields.find((f: any) => {
    const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
    return l.includes("firstname") || l === "first";
  });
  const lastNameField = fields.find((f: any) => {
    const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
    return l.includes("lastname") || l === "last";
  });
  
  let displayName = "Unknown Name";
  if (fullNameField && (formData[fullNameField.label] || formData[fullNameField.id])) {
    displayName = formData[fullNameField.label] || formData[fullNameField.id];
  } else if ((firstNameField && (formData[firstNameField.label] || formData[firstNameField.id])) || (lastNameField && (formData[lastNameField.label] || formData[lastNameField.id]))) {
    const first = firstNameField ? (formData[firstNameField.label] || formData[firstNameField.id]) : "";
    const last = lastNameField ? (formData[lastNameField.label] || formData[lastNameField.id]) : "";
    displayName = `${first || ""} ${last || ""}`.trim();
  } else {
      displayName = formData.qlon5xekd || formData.an7ffo0mu || formData.yg9snrxlh || "Participant";
  }

  const isImageUrl = (url: string) => typeof url === "string" && /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i.test(url.split('?')[0]);
  const downloadUrlKey = Object.keys(formData).find(k => k.endsWith('_downloadUrl') && isImageUrl(formData[k]));
  const avatarUrl = downloadUrlKey ? formData[downloadUrlKey] : undefined;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "approved":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#16a34a", border: "1px solid rgba(22, 163, 74, 0.2)" };
      case "pending":
      case "draft":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#ea580c", border: "1px solid rgba(234, 88, 12, 0.2)" };
      case "banned":
      case "rejected":
        return { bgcolor: "rgba(220, 38, 38, 0.1)", color: "#dc2626", border: "1px solid rgba(220, 38, 38, 0.2)" };
      default:
        return { bgcolor: "rgba(107, 114, 128, 0.1)", color: "#6b7280", border: "1px solid rgba(107, 114, 128, 0.2)" };
    }
  };

  // Extract Email and Phone
  let userEmail = formData.ppdwdyx34 || formData.waqb6gjzw || "";
  let userPhone = formData.h7695htwx || "";

  if (!userEmail || !userPhone) {
    fields.forEach((f: any) => {
      const l = f.label?.toLowerCase().replace(/\s+/g, '') || "";
      if (l.includes("email")) {
         userEmail = userEmail || formData[f.label] || formData[f.id];
      }
      if (l.includes("phone") || l.includes("mobile")) {
         userPhone = userPhone || formData[f.label] || formData[f.id];
      }
    });
  }

  const InfoItem = ({ label, value }: { label: string, value: any }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', transform: 'translateY(-2px)' } }}>
      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
        <InfoIcon sx={{ fontSize: 22 }} />
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}>{value || "—"}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Breadcrumb
          title="Participant Details"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Contests", href: "/contest-management/contests" },
            { title: "Participants", href: `/contest-management/contests/${id}` },
            { title: "Participant Details", href: "#" },
          ]}
        />
        <Button
          startIcon={<ArrowBackIcon />}
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

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
        {/* Left Card: Profile Summary */}
        <Box sx={{ width: { xs: '100%', sm: '35%', md: '30%' }, flexShrink: 0 }}>
          <Paper 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)', 
              border: '1px solid rgba(255,255,255,0.5)',
              bgcolor: '#ffffff',
              position: 'sticky',
              top: 24
            }} 
          >
            <Box sx={{ height: 120, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2, background: 'radial-gradient(circle at top right, #ffffff 0%, transparent 60%)' }} />
            </Box>
            
            <Box sx={{ px: 4, pb: 4, pt: 0, textAlign: 'center', position: 'relative' }}>
              <Avatar 
                src={avatarUrl} 
                sx={{ 
                  width: 130, 
                  height: 130, 
                  mx: 'auto', 
                  mt: '-65px', 
                  mb: 2, 
                  bgcolor: '#4f46e5',
                  border: '6px solid #ffffff',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  fontSize: '3rem',
                  fontWeight: 700
                }}
              >
                {displayName[0]?.toUpperCase() || "P"}
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                {displayName}
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userEmail}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={rawDetails.status || "Pending"}
                  sx={{ 
                    ...getStatusColor(rawDetails.status),
                    fontWeight: 700,
                    borderRadius: '8px',
                    px: 1,
                    textTransform: 'capitalize'
                  }} 
                />
                {(rawDetails.joined_at || rawDetails.createdAt) && (
                  <Chip 
                    label={`Joined ${moment(rawDetails.joined_at || rawDetails.createdAt).format("MMM YYYY")}`}
                    sx={{ 
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }} 
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right Card: Form Data */}
        <Box sx={{ width: { xs: '100%', sm: '65%', md: '70%' } }}>
          <Paper 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 4, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
              border: '1px solid #f1f5f9',
              bgcolor: '#ffffff'
            }} 
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, color: '#0f172a', display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ width: 8, height: 24, bgcolor: '#6366f1', borderRadius: 4, mr: 2 }} />
              Participant Details
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(formData).map(([key, value]) => {
                if (typeof value !== 'string' || value.length === 0 || key.endsWith("_downloadUrl")) return null;
                if (value === "Yes" || value === "No" || value === "true" || value === "false") return null;
                
                // Filter out Name Fields since they are already in the profile card
                if (
                  key === fullNameField?.id || key === fullNameField?.label ||
                  key === firstNameField?.id || key === firstNameField?.label ||
                  key === lastNameField?.id || key === lastNameField?.label
                ) {
                   return null;
                }
                
                const fieldMatch = fields.find((f: any) => f.id === key || f.label === key);
                const displayLabel = fieldMatch ? fieldMatch.label : key;

                // Filter out password, image, email fields
                const labelLower = displayLabel.toLowerCase().replace(/\s+/g, '');
                if (
                  labelLower.includes('password') || 
                  labelLower.includes('confirmpassword') || 
                  labelLower.includes('uploadyourimage') || 
                  labelLower.includes('profilephoto') || 
                  labelLower.includes('profilepicture') || 
                  labelLower.includes('email') || 
                  fieldMatch?.type === 'image'
                ) {
                  return null;
                }

                const downloadUrl = formData[`${key}_downloadUrl`] || formData[`${fieldMatch?.label}_downloadUrl`] || (fieldMatch?.label?.trim() ? formData[`${fieldMatch.label.trim()}_downloadUrl`] : null);
                const actualValue = downloadUrl || value;
                const isLink = typeof actualValue === 'string' && (actualValue.startsWith("http") || /\.(png|jpe?g|gif|webp|svg|bmp|mp4|pdf|doc|docx)(\?|$)/i.test(actualValue.split('?')[0]));

                // Format Dates properly
                let displayValue: any = actualValue;
                if (!isLink) {
                   if (labelLower === 'dob' || labelLower.includes('dateofbirth') || labelLower.includes('birth') || fieldMatch?.type === 'datePicker') {
                      // format date only, no time
                      if (moment(actualValue).isValid()) {
                         displayValue = moment(actualValue).format('DD MMM, YYYY');
                      }
                   }
                }

                return (
                  <Grid size={{xs:12,sm:6}} key={key}>
                    {isLink ? (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', transform: 'translateY(-2px)' } }}>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                          <InfoIcon sx={{ fontSize: 22 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>{displayLabel}</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            <a href={actualValue} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
                              View Attached File
                            </a>
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <InfoItem label={displayLabel} value={displayValue} />
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewUserDetails;
