import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Fade,
  Zoom,
  IconButton,
} from "@mui/material";
import {
  Download,
  Lock,
  ArrowBack,
  ContentCopy,
  Email,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../config/Api";
import OTPModal from "./OTPModal";

const SharedFileAccess = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileId, setFileId] = useState(null);

  useEffect(() => {
    fetchSharedFileInfo();
  }, [token]);

  const fetchSharedFileInfo = async (otp = null) => {
    try {
      setLoading(true);
      setError("");

      const params = otp ? { otp } : {};
      const response = await api.get(`/api/public/shared/${token}`, { params });

      console.log("API Response:", response.data);

      if (response.data.status === "success") {
        setFileInfo(response.data.post);
        setOtpRequired(response.data.post.otpProtected && !otp);
      } else if (response.data.status === "otp_required") {
        setOtpRequired(true);
        setFileId(response.data.fileId);
        setError("This file is protected. Please provide an OTP.");
      }
    } catch (err) {
      console.error("Full error details:", err.response?.data || err);

      if (err.response?.status === 400) {
        if (err.response.data?.status === "otp_required") {
          setOtpRequired(true);
          setFileId(err.response.data.fileId);
          setError("This file is protected. Please provide an OTP.");
        } else {
          setError(err.response.data?.message || "Invalid request");
        }
      } else if (err.response?.status === 404) {
        setError("This share link is invalid or has expired.");
      } else if (err.response?.status === 401) {
        setError("Invalid OTP. Please try again.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to access the shared file. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestOtp = async () => {
    try {
      setError("");
      const response = await api.post(`/api/public/shared/${token}/request-otp`);
      
      if (response.data.status === "success") {
        setOtpModalOpen(true);
        setError("OTP has been sent to the file owner's email.");
      }
    } catch (err) {
      console.error("OTP request error:", err.response?.data || err);
      setError(
        err.response?.data?.message || "Failed to request OTP. Please try again."
      );
    }
  };

  const handleValidateOtp = async (otp) => {
    try {
      setError("");
      await fetchSharedFileInfo(otp);
      setOtpModalOpen(false);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleDownload = async (otp = null) => {
    try {
      const params = otp ? { otp } : {};
      
      // Use the direct download endpoint (not redirect)
      const response = await api.get(`/api/public/shared/${token}/download`, {
        params,
        responseType: "blob",
      });

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Get filename from content-disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = "download";
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Download error:", err.response?.data || err);
      
      if (err.response?.status === 400 || err.response?.status === 401) {
        setError("OTP required or invalid. Please provide a valid OTP.");
        setOtpModalOpen(true);
      } else if (err.response?.status === 500) {
        const errorMessage = err.response.data?.message || "Server error occurred";
        setError(`Download failed: ${errorMessage}`);
      } else {
        setError("Failed to download the file. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Zoom in={true}>
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: 3,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading shared file...
            </Typography>
          </Paper>
        </Zoom>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Zoom in={true}>
        <Paper
          sx={{
            width: "100%",
            maxWidth: 500,
            p: 4,
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          {/* Error Display */}
          <Fade in={!!error}>
            <Box>
              {error && (
                <Alert
                  severity={
                    error.includes("OTP has been sent") ? "success" : "error"
                  }
                  sx={{ mb: 3 }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>

          {fileInfo ? (
            <>
              <Lock color="primary" sx={{ fontSize: 48, mb: 2 }} />

              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                }}
              >
                Shared File
              </Typography>

              <Typography variant="h6" gutterBottom>
                {fileInfo.documentName || fileInfo.imageName || fileInfo.videoName}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                This file has been shared with you securely.
                {fileInfo.otpProtected && " OTP protection is enabled for this file."}
              </Typography>

              {/* Copy Link Button */}
              <Button
                startIcon={<ContentCopy />}
                onClick={handleCopyLink}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                {copied ? "Copied!" : "Copy Share Link"}
              </Button>

              {otpRequired ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This file is protected. An OTP is required to access it.
                  </Alert>
                  <Button
                    variant="contained"
                    onClick={handleRequestOtp}
                    startIcon={<Email />}
                    sx={{ mr: 2 }}
                  >
                    Request OTP
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => handleDownload()}
                  size="large"
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    },
                  }}
                >
                  Download File
                </Button>
              )}
            </>
          ) : (
            <Alert severity="warning">
              This share link is invalid or has expired.
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              onClick={() => navigate(-1)}
              variant="text"
              startIcon={<ArrowBack />}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Zoom>

      <OTPModal
        open={otpModalOpen}
        handleClose={() => setOtpModalOpen(false)}
        onValidate={handleValidateOtp}
        onResend={handleRequestOtp}
        email="recipient@example.com"
        actionType="access"
      />
    </Box>
  );
};

export default SharedFileAccess;