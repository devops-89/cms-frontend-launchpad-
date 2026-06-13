import {
  AccountCircle, CalendarToday, CheckCircle, EmojiEvents, Info, Mail, Phone, Star, Tune
} from "@mui/icons-material";
import { Box, Chip, Grid, Paper, Rating, Typography } from '@mui/material';

export const SubmissionDetails = ({ groupedFields, colors }: { groupedFields: any[], colors: any }) => {
  const getFieldIcon = (type: string, label: string) => {
    const lowercaseLabel = label?.toLowerCase() || "";
    if (lowercaseLabel.includes("phone") || lowercaseLabel.includes("mobile") || type === "telInput") return <Phone sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("email") || lowercaseLabel.includes("mail")) return <Mail sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("date") || lowercaseLabel.includes("dob") || lowercaseLabel.includes("birth") || type === "datePicker") return <CalendarToday sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("rating") || type === "rating") return <Star sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("score") || lowercaseLabel.includes("points")) return <EmojiEvents sx={{ fontSize: 20 }} />;
    if (type === "checkbox" || type === "switch") return <CheckCircle sx={{ fontSize: 20 }} />;
    if (type === "slider") return <Tune sx={{ fontSize: 20 }} />;
    if (lowercaseLabel.includes("name") || lowercaseLabel.includes("member") || lowercaseLabel.includes("father")) return <AccountCircle sx={{ fontSize: 20 }} />;
    return <Info sx={{ fontSize: 20 }} />;
  };

  const renderFieldValue = (field: any) => {
    const { type, value } = field;
    if (value === undefined || value === null || value === "") {
      return <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", mt: 0.5 }}>Not specified</Typography>;
    }
    if (type === "rating") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
          <Rating value={Number(value)} readOnly precision={0.5} size="small" />
          <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color: colors.TEXT_SECONDARY }}>({value})</Typography>
        </Box>
      );
    }
    if (type === "checkbox" || type === "switch") {
      const isTrue = value === true || String(value).toLowerCase() === "true" || value === "Yes";
      return (
        <Chip
          label={isTrue ? "Yes" : "No"}
          size="small"
          sx={{
            mt: 0.5, fontWeight: 600, fontSize: "0.75rem",
            bgcolor: isTrue ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
            color: isTrue ? "#10b981" : "#64748b",
            border: `1px solid ${isTrue ? "rgba(16, 185, 129, 0.2)" : "rgba(100, 116, 139, 0.2)"}`,
          }}
        />
      );
    }
    if (type === "datePicker") {
      try {
        return <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY, mt: 0.5 }}>{new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</Typography>;
      } catch (e) {
        return <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY, mt: 0.5 }}>{String(value)}</Typography>;
      }
    }
    return <Typography variant="body2" sx={{ fontWeight: 600, color: colors.TEXT_PRIMARY, wordBreak: "break-word", mt: 0.5 }}>{String(value)}</Typography>;
  };

  return (
    <>
      {groupedFields.map((group, gIdx) => (
        <Box key={gIdx} sx={{ mb: 10 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, mt: gIdx !== 0 ? 2 : 0 }}>
            <Box sx={{ width: 4, height: 24, borderRadius: 1, bgcolor: colors.PRIMARY, mt: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY, mt: 3 }}>
              {group.title}
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, md: 3, lg: 8 }}>
            {group.fields.map((field: any) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={field.id}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.BORDER}`, background: colors.SURFACE, height: "100%", display: "flex", alignItems: "flex-start", gap: 2, transition: "all 0.25s ease-in-out", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 24px -10px rgba(0,0,0,0.06)", borderColor: colors.PRIMARY } }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 1, borderRadius: 2.5, bgcolor: "rgba(99, 102, 241, 0.05)", color: colors.PRIMARY, flexShrink: 0 }}>
                    {getFieldIcon(field.type, field.label)}
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>
                      {field.label}
                    </Typography>
                    {renderFieldValue(field)}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </>
  );
};
