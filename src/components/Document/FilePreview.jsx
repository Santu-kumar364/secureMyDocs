import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Box,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  Close,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
  Description,
  VideoFile,
} from "@mui/icons-material";

const FilePreview = ({ open, file, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!file) return null;

  const fileName =
    file.documentName || file.imageName || file.videoName || "Untitled";

  const getFileIcon = () => {
    switch (file.type) {
      case "pdf":
        return <PictureAsPdf sx={{ fontSize: 40, color: "error.main" }} />;
      case "image":
        return <ImageIcon sx={{ fontSize: 40, color: "primary.main" }} />;
      case "video":
        return <VideoFile sx={{ fontSize: 40, color: "primary.main" }} />;
      case "document":
        return <Description sx={{ fontSize: 40, color: "primary.main" }} />;
      default:
        return <InsertDriveFile sx={{ fontSize: 40 }} />;
    }
  };

  const renderPreview = () => {
    switch (file.type) {
      case "image":
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
              overflow: "hidden",
            }}
          >
            <img
              src={file.url}
              alt={fileName}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        );
      case "pdf":
        return (
          <iframe
            src={`${file.url}#view=fitH`}
            width="100%"
            height="70vh"
            style={{ border: "none" }}
            title="PDF Preview"
          />
        );
      case "video":
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              height: "70vh",
              bgcolor: "#000",
            }}
          >
            <video
              controls
              autoPlay
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            >
              <source src={file.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        );
      default:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
            }}
          >
            {getFileIcon()}
            <Typography variant="h6" sx={{ mt: 2 }}>
              No preview available
            </Typography>
            <Typography color="text.secondary">
              This file type cannot be previewed
            </Typography>
          </Box>
        );
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: "90vh",
            maxHeight: "90vh",
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            {getFileIcon()}
            <Typography noWrap sx={{ maxWidth: 400 }}>
              {fileName}
            </Typography>
          </Box>
          <Tooltip title="Close">
            <IconButton onClick={onClose} disabled={isProcessing}>
              <Close />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {renderPreview()}
        </DialogContent>
      </Dialog>

      {/* Loading backdrop */}
      <Backdrop
        open={isProcessing}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: "#fff" }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default FilePreview;