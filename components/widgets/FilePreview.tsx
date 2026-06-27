import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const FilePreview = ({ fileVal, onClear, label }: { fileVal: any, onClear: () => void, label?: string }) => {
  const [url, setUrl] = useState<string>("");
  const [isImage, setIsImage] = useState(false);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    if (typeof fileVal === "string") {
      objectUrl = fileVal;
      const urlWithoutQuery = objectUrl.split('?')[0];
      const ext = urlWithoutQuery.split(".").pop()?.toLowerCase() || "";
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
        setIsImage(true);
        setIsVideo(false);
      } else if (["mp4", "webm", "ogg", "mov", "mkv", "avi"].includes(ext)) {
        setIsVideo(true);
        setIsImage(false);
      } else {
        setIsImage(true);
        setIsVideo(false);
      }
      setUrl(objectUrl);
    } else if (fileVal instanceof File) {
      objectUrl = URL.createObjectURL(fileVal);
      setIsImage(fileVal.type.startsWith("image/"));
      setIsVideo(fileVal.type.startsWith("video/"));
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [fileVal]);

  if (!fileVal) return null;

  return (
    <Box sx={{ position: "relative", display: "inline-block", mt: 2 }}>
      <IconButton
        size="small"
        onClick={onClear}
        sx={{
          position: "absolute",
          top: -12,
          right: -12,
          bgcolor: "background.paper",
          boxShadow: 1,
          "&:hover": { bgcolor: "background.paper" },
          zIndex: 1,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      {isImage ? (
        <img src={url} alt={label || "Preview"} style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px", objectFit: "contain" }} />
      ) : isVideo ? (
        <video src={url} controls style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px" }} />
      ) : (
        <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
          Selected: {typeof fileVal === "string" ? fileVal.split("/").pop() : (fileVal as File)?.name}
        </Typography>
      )}
    </Box>
  );
};
