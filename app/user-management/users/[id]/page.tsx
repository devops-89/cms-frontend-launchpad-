"use client";
import { UserController } from "@/api/userControllers";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import { useAppTheme } from "@/context/ThemeContext";
import { ArrowBack, CalendarToday, Email, Phone, Public, School } from "@mui/icons-material";
import { Avatar, Box, Button, Chip, CircularProgress, Divider, Grid, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";

const UserDetailsPage = () => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const { colors } = useAppTheme();

  const { data, isPending, error } = useQuery({
    queryKey: ["user-details", id],
    queryFn: () => UserController.getUserById(id as string),
    enabled: !!id,
  });

  const user = data?.data?.data || data?.data;

  const profileData = user?.participantProfile?.submission?.data?.data || user?.participantProfile?.submission?.data || user?.participant_profile_data || {};

  let displayAvatar = user?.avatarUrl || user?.participantProfile?.avatarUrl || "";
  if (!displayAvatar && user) {
    const isImageUrl = (url: any) => typeof url === "string" && /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i.test(url.split('?')[0]);
    
    let downloadUrlKey = Object.keys(profileData).find(key => 
      key.endsWith("_downloadUrl") && !key.endsWith("_downloadUrl_downloadUrl") && isImageUrl(profileData[key])
    );
    
    if (!downloadUrlKey) {
      downloadUrlKey = Object.keys(profileData).find(key => isImageUrl(profileData[key]));
    }
    
    if (downloadUrlKey) {
      displayAvatar = profileData[downloadUrlKey];
    }
  }

  let displaySchool = user?.participantProfile?.schoolName;
  let displayGrade = user?.participantProfile?.grade;
  let displayDob = user?.participantProfile?.dateOfBirth;
  let displayCountry = user?.country?.name || user?.participantProfile?.country;
  let displayPhone = user?.phone || user?.participantProfile?.phone;

  if (profileData && user?.formTemplate?.schema?.fields) {
    const fields = user.formTemplate.schema.fields;
    const schoolField = fields.find((f: any) => f.label?.toLowerCase().includes("school"));
    if (schoolField && profileData[schoolField.id]) displaySchool = profileData[schoolField.id];

    const gradeField = fields.find((f: any) => f.label?.toLowerCase().includes("grade"));
    if (gradeField && profileData[gradeField.id]) displayGrade = profileData[gradeField.id];

    const dobField = fields.find((f: any) => f.label?.toLowerCase().includes("date of birth") || f.label?.toLowerCase().includes("dob"));
    if (dobField && profileData[dobField.id]) displayDob = profileData[dobField.id];
    
    const countryField = fields.find((f: any) => f.label?.toLowerCase().includes("country"));
    if (countryField && profileData[countryField.id]) displayCountry = profileData[countryField.id];
    
    const phoneField = fields.find((f: any) => f.label?.toLowerCase().includes("phone"));
    if (phoneField && profileData[phoneField.id]) displayPhone = profileData[phoneField.id];
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Published":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#16a34a", border: "1px solid rgba(22, 163, 74, 0.2)" };
      case "Pending":
      case "Draft":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#ea580c", border: "1px solid rgba(234, 88, 12, 0.2)" };
      case "Banned":
      case "Rejected":
        return { bgcolor: "rgba(220, 38, 38, 0.1)", color: "#dc2626", border: "1px solid rgba(220, 38, 38, 0.2)" };
      default:
        return { bgcolor: "rgba(107, 114, 128, 0.1)", color: "#6b7280", border: "1px solid rgba(107, 114, 128, 0.2)" };
    }
  };

  const resolveUserStatus = (u: any) => {
    if (u?.participants && u.participants.length > 0) {
      const allBanned = u.participants.every((p: any) => p.status?.toLowerCase() === "banned");
      if (allBanned) return "Banned";

      const active = u.participants.find((p: any) => p.status?.toLowerCase() !== "banned");
      if (active) {
        const st = active.status;
        if (st?.toLowerCase() === "approved") return "Active";
        return st ? st.charAt(0).toUpperCase() + st.slice(1).toLowerCase() : "Pending";
      }
    }
    
    let st = u?.status || "Pending";
    if (st?.toLowerCase() === "approved") return "Active";
    if (st?.toLowerCase() === "banned") return "Banned";
    return st ? st.charAt(0).toUpperCase() + st.slice(1).toLowerCase() : "Pending";
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', transform: 'translateY(-2px)' } }}>
      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}>{value || "—"}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Breadcrumb
          title="User Details"
          data={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "User Management", href: "/user-management/users" },
            { title: "Users", href: "/user-management/users" },
            { title: "Details", href: `/user-management/users/${id}` },
          ]}
        />
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          variant="contained"
          sx={{ 
            bgcolor: '#ffffff', 
            color: '#1e293b', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
          }}
        >
          Back to List
        </Button>
      </Box>

      {isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
      ) : error || !user ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <Typography color="error" variant="h6" fontWeight={600}>Failed to load user details.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
          {/* Profile Summary Card */}
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
                  src={displayAvatar} 
                  sx={{ 
                    width: 130, 
                    height: 130, 
                    mx: 'auto', 
                    mt: '-65px', 
                    mb: 3, 
                    bgcolor: '#4f46e5',
                    border: '6px solid #ffffff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '3rem',
                    fontWeight: 700
                  }}
                >
                  {(user.fullName || user.firstName || "U")[0].toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                  {user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User"}
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#64748b', mb: 3, textTransform: 'capitalize', fontWeight: 500 }}>
                  {user.role || "Participant"}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {user && (
                    <Chip 
                      label={resolveUserStatus(user)}
                      sx={{ 
                        ...getStatusColor(resolveUserStatus(user)),
                        fontWeight: 700,
                        borderRadius: '8px',
                        px: 1
                      }} 
                    />
                  )}
                  <Chip 
                    label={`Joined ${moment(user.created_at || user.createdAt).format("MMM YYYY")}`}
                    sx={{ 
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }} 
                  />
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Details Card */}
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
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={Email} label="Email Address" value={user.email} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={Phone} label="Phone Number" value={displayPhone} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={CalendarToday} label="Date of Birth" value={displayDob ? moment(displayDob).format("MMMM DD, YYYY") : ""} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={Public} label="Country / Region" value={displayCountry} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ width: 8, height: 24, bgcolor: '#a855f7', borderRadius: 4, mr: 2 }} />
                Academic Information
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={School} label="School / Institution" value={displaySchool} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={School} label="Grade / Year" value={displayGrade} />
                </Grid>
              </Grid>
            </Paper>

            {/* Participations Card */}
            {user.participants && user.participants.length > 0 && (
              <Paper 
                sx={{ 
                  p: { xs: 3, md: 5 }, 
                  borderRadius: 4, 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #f1f5f9',
                  bgcolor: '#ffffff',
                  mt: 4
                }} 
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ width: 8, height: 24, bgcolor: '#ec4899', borderRadius: 4, mr: 2 }} />
                  Contest Participations
                </Typography>
                
                <Grid container spacing={3}>
                  {user.participants.map((p: any) => (
                    <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                      <Box 
                        sx={{ 
                          p: 3, 
                          border: '1px solid #e2e8f0', 
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          bgcolor: '#f8fafc',
                          '&:hover': {
                            borderColor: '#cbd5e1',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                          {p.contest?.name || "Unknown Contest"}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                            Joined: {moment(p.joined_at).format("MMM DD, YYYY")}
                          </Typography>
                          <Chip 
                            label={p.status} 
                            size="small" 
                            sx={{ 
                              ...getStatusColor(p.status),
                              textTransform: "capitalize", 
                              fontWeight: 700, 
                              fontSize: "0.75rem", 
                              borderRadius: '6px'
                            }} 
                          />
                        </Box>

                        {p.entries && p.entries.length > 0 && (
                          <>
                            <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ec4899' }} />
                              Submitted Entries ({p.entries.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {p.entries.map((entry: any) => {
                                const entryFields = p.contest?.entryLevelTemplate?.schema?.fields || p.contest?.entry_level_template?.schema?.fields || [];
                                const titleField = entryFields.find((f: any) => f.label?.toLowerCase().includes("title") || f.id?.toLowerCase().includes("title"));
                                const submissionData = entry.submission?.data || {};
                                let entryTitle = titleField ? (submissionData[titleField.id] || submissionData[titleField.label]) : "";
                                if (!entryTitle) {
                                  entryTitle = submissionData.lwiwu56nx || submissionData.title || "Innovation Entry";
                                }
                                
                                return (
                                  <Box 
                                    key={entry.id} 
                                    sx={{ 
                                      p: 2, 
                                      borderRadius: 2, 
                                      bgcolor: '#ffffff', 
                                      border: '1px solid #e2e8f0', 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        borderColor: '#cbd5e1'
                                      }
                                    }}
                                  >
                                    <Box sx={{ minWidth: 0, flex: 1, pr: 2 }}>
                                      <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        {entryTitle}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                                        Submitted: {moment(entry.created_at || entry.createdAt || entry.submission?.createdAt).format("MMM DD, YYYY")}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <Chip 
                                        label={entry.status} 
                                        size="small" 
                                        sx={{ 
                                          ...getStatusColor(entry.status),
                                          textTransform: "capitalize", 
                                          fontWeight: 700, 
                                          fontSize: "0.7rem", 
                                          borderRadius: '4px',
                                          height: 20
                                        }} 
                                      />
                                      <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={() => router.push(`/contest-management/entries/${entry.id}?contestId=${entry.contest_id || p.contest_id}`)}
                                        sx={{ 
                                          textTransform: 'none', 
                                          fontSize: '0.75rem', 
                                          py: 0.2, 
                                          px: 1, 
                                          borderRadius: 1.5,
                                          fontWeight: 600
                                        }}
                                      >
                                        View
                                      </Button>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          </>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserDetailsPage;
