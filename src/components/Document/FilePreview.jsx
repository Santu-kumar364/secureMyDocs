import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  Close,
  Download,
  Share,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
  Description,
  VideoFile,
  Delete,
} from "@mui/icons-material";
import OTPModal from "./OTPModal";
import { api } from "../../config/Api";
 

const FilePreview = ({ open, file, onClose, onDelete, userEmail }) => {
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  if (!file) return null;

  const fileName = file.documentName || file.imageName || file.videoName || "Untitled";

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handlePreviewAction = async (action) => {
    try {
      setIsProcessing(true);
      
      // Check if file is OTP protected
      const response = await api.get(`/api/posts/${file.id}/otp-status`);
      
      if (response.data.otpProtected) {
        setActionType(action);
        setOtpModalOpen(true);
        
        // Generate OTP immediately
        try {
          await api.post(`/api/otp/generate/${file.id}`);
          showSnackbar("OTP sent to your email", "info");
        } catch (error) {
          console.error("OTP generation error:", error);
          showSnackbar("Failed to send OTP", "error");
        }
      } else {
        executeAction(action);
      }
    } catch (error) {
      console.error("Error checking OTP status:", error);
      showSnackbar("Error checking file access", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAction = (action) => {
    switch (action) {
      case "download":
        downloadFile();
        break;
      case "delete":
        handleDelete();
        break;
      default:
        break;
    }
  };

  const handleValidateOTP = async (otp) => {
    try {
      setIsProcessing(true);
      const response = await api.post(
        `/api/otp/validate/${file.id}`,
        { code: otp }
      );

      const isValid = response.data.valid || response.data.status === "success";

      if (isValid) {
        showSnackbar("OTP verified successfully", "success");
        setOtpModalOpen(false);
        executeAction(actionType);
        return true;
      } else {
        const errorMsg = response.data.message || "Invalid OTP";
        showSnackbar(errorMsg, "error");
        return false;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid OTP";
      showSnackbar(errorMsg, "error");
      throw new Error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsProcessing(true);
      await api.post(`/api/otp/generate/${file.id}`);
      showSnackbar("OTP resent to your email", "success");
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to resend OTP";
      showSnackbar(errorMsg, "error");
      throw new Error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar("File downloaded successfully", "success");
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      onDelete();
      onClose();
    }
  };

  const getFileIcon = () => {
    switch (file.type) {
      case "pdf": return <PictureAsPdf sx={{ fontSize: 40, color: "error.main" }} />;
      case "image": return <ImageIcon sx={{ fontSize: 40, color: "primary.main" }} />;
      case "video": return <VideoFile sx={{ fontSize: 40, color: "primary.main" }} />;
      case "document": return <Description sx={{ fontSize: 40, color: "primary.main" }} />;
      default: return <InsertDriveFile sx={{ fontSize: 40 }} />;
    }
  };

  const renderPreview = () => {
    switch (file.type) {
      case "image":
        return (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", overflow: "hidden" }}>
            <img src={file.url} alt={fileName} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
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
          <Box sx={{ display: "flex", justifyContent: "center", height: "70vh", bgcolor: "#000" }}>
            <video controls autoPlay style={{ maxWidth: "100%", maxHeight: "100%" }}>
              <source src={file.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        );
      default:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "70vh" }}>
            {getFileIcon()}
            <Typography variant="h6" sx={{ mt: 2 }}>No preview available</Typography>
            <Typography color="text.secondary">Double-click to download and open</Typography>
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
        PaperProps={{ sx: { height: "90vh", maxHeight: "90vh", borderRadius: 2, overflow: "hidden" } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            {getFileIcon()}
            <Typography noWrap sx={{ maxWidth: 400 }}>{fileName}</Typography>
          </Box>
          <Tooltip title="Close">
            <IconButton onClick={onClose} disabled={isProcessing}>
              <Close />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {renderPreview()}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", px: 3, py: 2 }}>
          <Box>
            <Button 
              startIcon={<Delete />} 
              variant="outlined" 
              color="error" 
              sx={{ mr: 2 }} 
              onClick={() => handlePreviewAction('delete')}
              disabled={isProcessing}
            >
              Delete
            </Button>
            <Button
              startIcon={<Download />}
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => handlePreviewAction('download')}
              disabled={isProcessing}
            >
              Download
            </Button>
            <Button 
              startIcon={<Share />} 
              variant="contained" 
              color="primary"
              disabled={isProcessing}
            >
              Share
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* OTP Modal */}
      <OTPModal
        open={otpModalOpen}
        handleClose={() => !isProcessing && setOtpModalOpen(false)}
        onValidate={handleValidateOTP}
        onResend={handleResendOTP}
        email={userEmail}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Loading backdrop */}
      <Backdrop
        open={isProcessing}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff' }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default FilePreview;