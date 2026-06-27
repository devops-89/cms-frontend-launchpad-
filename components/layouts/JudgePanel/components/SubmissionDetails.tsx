import {
  AccountCircle, CalendarToday, CheckCircle, EmojiEvents, Info, Mail, Phone, Star, Tune, Download, InsertDriveFile, PlayCircleOutline, Videocam, Image as ImageIcon
} from "@mui/icons-material";
import React from "react";
import { Box, Chip, Grid, Paper, Rating, Typography, Button } from '@mui/material';
import Image from "next/image";

const VideoPlayerRenderer = ({ urlStr }: { urlStr: string }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', width: "100%", maxWidth: 600, height: 340, borderRadius: 3, overflow: 'hidden', 
        flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)', bgcolor: "#000",
        display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}
    >
      <video 
        ref={videoRef}
        src={urlStr} 
        controls={isPlaying} 
        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
        preload="metadata" 
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      {!isPlaying && (
        <Box 
          onClick={handlePlay}
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            bgcolor: 'rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 10,
            "&:hover .play-icon": { transform: "scale(1.1)", color: "#fff" }
          }}
        >
          <PlayCircleOutline className="play-icon" sx={{ fontSize: 80, color: "rgba(255,255,255,0.9)", transition: "all 0.2s ease" }} />
        </Box>
      )}
    </Box>
  );
};

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
    if (type === "file_upload" || lowercaseLabel.includes("video")) {
      if (lowercaseLabel.includes("video")) return <Videocam sx={{ fontSize: 20 }} />;
      if (lowercaseLabel.includes("image") || lowercaseLabel.includes("photo")) return <ImageIcon sx={{ fontSize: 20 }} />;
      return <InsertDriveFile sx={{ fontSize: 20 }} />;
    }
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
      const urlWithoutQuery = urlStr.split('?')[0];
      const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();
      const isImage = typeof urlStr === 'string' && urlStr.match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i);
      const isVideo = ['mp4', 'mov', 'mkv', 'webm', 'ogg'].includes(extension || "");
      
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
        <Box sx={{ mt: 1, display: 'flex', flexDirection: isVideo ? 'column' : { xs: 'column', sm: 'row' }, alignItems: isVideo ? 'stretch' : 'center', gap: 2, p: 2, border: `1px solid ${colors.BORDER}`, borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          {isVideo ? (
            <VideoPlayerRenderer urlStr={urlStr} />
          ) : isImage ? (
            <Box sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: `1px solid ${colors.BORDER}`, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <Image src={urlStr} alt="Uploaded file" fill style={{ objectFit: "cover" }} sizes="80px" />
            </Box>
          ) : (
            <Box sx={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2, color: colors.PRIMARY, flexShrink: 0 }}>
              <InsertDriveFile sx={{ fontSize: 36 }} />
            </Box>
          )}
          {!isVideo && (
            <Box sx={{ flexGrow: 1, minWidth: 0, pl: 1 }}>
               <Typography variant="body1" noWrap sx={{ display: 'block', fontWeight: 700, color: colors.TEXT_PRIMARY }}>
                 {isImage ? "Image File" : "Document File"}
               </Typography>
               <Button variant="outlined" size="small" onClick={handleDownload} startIcon={<Download />} sx={{ mt: 1, textTransform: 'none', py: 0.5, px: 2, fontSize: '0.85rem', borderRadius: 2, fontWeight: 600 }}>
                 Download File
               </Button>
            </Box>
          )}
          {isVideo && (
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", width: "100%", maxWidth: 600, gap: 2, px: 1 }}>
               <Typography variant="h6" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
                 Video Attachment
               </Typography>
               <Button variant="contained" size="large" onClick={handleDownload} startIcon={<Download />} sx={{ textTransform: 'none', py: 1, px: 3, borderRadius: 3, fontWeight: 700, boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)", flexShrink: 0 }}>
                 Download Video
               </Button>
            </Box>
          )}
        </Box>
      );
    }
    const stringValue = String(value);
    const isUrl = stringValue.startsWith("http://") || stringValue.startsWith("https://") || stringValue.startsWith("www.");
    const hrefValue = stringValue.startsWith("www.") ? `https://${stringValue}` : stringValue;

    return (
      <Typography variant="body2" sx={{ fontWeight: 600, color: isUrl ? colors.PRIMARY : colors.TEXT_PRIMARY, wordBreak: "break-word", mt: 0.5 }}>
        {isUrl ? (
          <a href={hrefValue} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
            {stringValue}
          </a>
        ) : (
          stringValue
        )}
      </Typography>
    );
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
          <Box sx={{ display: "flex", flexDirection: "column", bgcolor: colors.SURFACE, borderRadius: 4, border: `1px solid ${colors.BORDER}`, p: 1, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {group.fields.filter((field: any) => field.type !== "textblock" && field.type !== "checkbox").map((field: any, idx: number, arr: any[]) => (
              <Box
                key={field.id}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  py: 3,
                  borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${colors.BORDER}`,
                  "&:hover": { bgcolor: "rgba(99, 102, 241, 0.04)" },
                  px: { xs: 3, sm: 4 },
                  gap: { xs: 1.5, sm: 0 },
                  transition: "background-color 0.3s ease"
                }}
              >
                <Box sx={{ width: { xs: "100%", sm: "35%", md: "30%" }, display: "flex", alignItems: "center", gap: 2.5, flexShrink: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 1.2, borderRadius: 2, bgcolor: "rgba(99, 102, 241, 0.08)", color: colors.PRIMARY, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
                    {getFieldIcon(field.type, field.label)}
                  </Box>
                  <Typography variant="body1" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 700, letterSpacing: 0.5 }}>
                    {field.label}
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "65%", md: "70%" }, pl: { xs: 0, sm: 3 }, pt: { xs: 1, sm: 0 }, borderLeft: { xs: 'none', sm: `2px solid rgba(0,0,0,0.04)` } }}>
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
