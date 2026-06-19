import Image from "next/image";
import {
  AccountCircle, CalendarToday, CheckCircle, EmojiEvents, Info, Mail, Phone, Star, Tune, Download, InsertDriveFile
} from "@mui/icons-material";
import { Box, Chip, Grid, Paper, Rating, Typography, Button } from '@mui/material';

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
    if (type === "file_upload") {
      if (!value) return null;
      const urlStr = typeof value === 'string' ? value : String(value);
      const isImage = typeof urlStr === 'string' && urlStr.match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i);
      
      const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
          const response = await fetch(urlStr);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          const objectUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          const urlParts = urlStr.split('?')[0].split('/');
          const filename = urlParts[urlParts.length - 1] || 'download';
          a.download = decodeURIComponent(filename);
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.error("Download failed, opening in new tab:", error);
          window.open(urlStr, "_blank");
        }
      };

      return (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: `1px solid ${colors.BORDER}`, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
          {isImage ? (
            <Box sx={{ position: 'relative', width: 60, height: 60, borderRadius: 1, overflow: 'hidden', flexShrink: 0, border: `1px solid ${colors.BORDER}` }}>
              <Image src={urlStr} alt="Uploaded file" fill style={{ objectFit: "cover" }} sizes="60px" />
            </Box>
          ) : (
            <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 1, color: colors.PRIMARY, flexShrink: 0 }}>
              <InsertDriveFile sx={{ fontSize: 30 }} />
            </Box>
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
             <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 600, color: colors.TEXT_PRIMARY }}>
               {isImage ? "Image File" : "Document File"}
             </Typography>
             <Button variant="outlined" size="small" onClick={handleDownload} startIcon={<Download />} sx={{ mt: 0.5, textTransform: 'none', py: 0.25, px: 1.5, fontSize: '0.75rem', borderRadius: 1.5 }}>
               Download
             </Button>
          </Box>
        </Box>
      );
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
          <Box sx={{ display: "flex", flexDirection: "column", bgcolor: colors.SURFACE, borderRadius: 3, border: `1px solid ${colors.BORDER}`, p: 1 }}>
            {group.fields.map((field: any, idx: number) => (
              <Box
                key={field.id}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  py: 2.5,
                  borderBottom: idx === group.fields.length - 1 ? 'none' : `1px dashed ${colors.BORDER}`,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                  px: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  gap: { xs: 1, sm: 0 },
                  transition: "background-color 0.2s ease"
                }}
              >
                <Box sx={{ width: { xs: "100%", sm: "35%", md: "30%" }, display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 1, borderRadius: 2, bgcolor: "rgba(99, 102, 241, 0.05)", color: colors.PRIMARY }}>
                    {getFieldIcon(field.type, field.label)}
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 600, letterSpacing: 0.5 }}>
                    {field.label}
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "65%", md: "70%" }, pl: { xs: 0, sm: 2 }, pt: { xs: 1, sm: 0 } }}>
                  {renderFieldValue(field)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
};
