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
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  Visibility,
  Lock,
  ArrowBack,
  Email,
  Security,
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
  const [fileId, setFileId] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    fetchSharedFileInfo();
  }, [token]);

  const fetchSharedFileInfo = async (otp = null) => {
    try {
      setLoading(true);
      setError("");

      const params = otp ? { otp } : {};
      const response = await api.get(`/api/public/shared/${token}`, { params });

      if (response.data.status === "success") {
        setFileInfo(response.data.post);
        setOtpRequired(response.data.post.otpProtected && !otp);

        if (!response.data.post.otpProtected || otp) {
          await fetchFileUrl(otp);
        }
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

  const fetchFileUrl = async (otp = null) => {
    try {
      const params = otp ? { otp } : {};
      const response = await api.get(`/api/public/shared/${token}/view`, {
        params,
      });

      if (response.data.status === "success") {
        setFileUrl(response.data.fileUrl);
      }
    } catch (err) {
      console.error("Error fetching file URL:", err);
      setError("Failed to load file for viewing.");
    }
  };

  const handleRequestOtp = async () => {
    try {
      setError("");
      const response = await api.post(
        `/api/public/shared/${token}/request-otp`
      );

      if (response.data.status === "success") {
        setOtpModalOpen(true);
        setError("OTP has been sent to the file owner's email.");
      }
    } catch (err) {
      console.error("OTP request error:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
          "Failed to request OTP. Please try again."
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

  const renderFileViewer = () => {
    if (!fileUrl) return null;

    const fileExtension =
      fileInfo?.documentName?.split(".").pop()?.toLowerCase() ||
      fileInfo?.imageName?.split(".").pop()?.toLowerCase() ||
      fileInfo?.videoName?.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
      return (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Box
            sx={{
              p: 2,
              border: "2px dashed",
              borderColor: "primary.main",
              borderRadius: 3,
              backgroundColor: "rgba(102, 126, 234, 0.05)",
            }}
          >
            <img
              src={fileUrl}
              alt={
                fileInfo.documentName ||
                fileInfo.imageName ||
                fileInfo.videoName
              }
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                border: "3px solid white",
              }}
            />
          </Box>
        </Box>
      );
    } else if (["pdf"].includes(fileExtension)) {
      return (
        <Box
          sx={{ mt: 3, height: "500px", borderRadius: 3, overflow: "hidden" }}
        >
          <iframe
            src={fileUrl}
            title={
              fileInfo.documentName || fileInfo.imageName || fileInfo.videoName
            }
            width="100%"
            height="100%"
            style={{
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          />
        </Box>
      );
    } else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
      return (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Box
            sx={{
              p: 2,
              border: "2px dashed",
              borderColor: "secondary.main",
              borderRadius: 3,
              backgroundColor: "rgba(118, 75, 162, 0.05)",
            }}
          >
            <video
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                border: "3px solid white",
              }}
            >
              <source src={fileUrl} type={`video/${fileExtension}`} />
              Your browser does not support the video tag.
            </video>
          </Box>
        </Box>
      );
    } else {
      return (
        <Card sx={{ mt: 3, backgroundColor: "grey.50", border: "none" }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Button
              variant="contained"
              onClick={() => window.open(fileUrl, "_blank")}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              Open File
            </Button>
          </CardContent>
        </Card>
      );
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
          padding: 2,
        }}
      >
        <Zoom in={true}>
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.98)",
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: "primary.main",
                mb: 3,
              }}
            />
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              Loading Shared File
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Please wait while we prepare your content...
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
        backgroundAttachment: "fixed",
      }}
    >
      <Zoom in={true}>
        <Paper
          sx={{
            width: "100%",
            maxWidth: 900,
            p: 5,
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: 4,
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Error Display */}
          <Fade in={!!error}>
            <Box sx={{ mb: 4 }}>
              {error && (
                <Alert
                  severity={
                    error.includes("OTP has been sent") ? "success" : "error"
                  }
                  sx={{
                    borderRadius: 3,
                    alignItems: "center",
                    fontSize: "0.95rem",
                  }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>

          {fileInfo ? (
            <>
              {/* Header Section */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    mb: 3,
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <Security sx={{ fontSize: 40, color: "white" }} />
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    textFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 800,
                    mb: 1,
                  }}
                >
                  Secure File Access
                </Typography>
 
              </Box>

              {/* Protection Status Section */}
              {fileInfo.otpProtected ? (
                // File is protected - show OTP options
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Alert
                    severity="info"
                    sx={{
                      mb: 3,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)",
                    }}
                    icon={<Lock sx={{ fontSize: 24 }} />}
                  >
                    <Typography variant="body1" fontWeight={600}>
                      Enhanced Security Enabled
                    </Typography>
                  </Alert>

                  <Button
                    variant="contained"
                    onClick={handleRequestOtp}
                    startIcon={<Email />}
                    size="large"
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                        boxShadow: "0 12px 32px rgba(102, 126, 234, 0.4)",
                      },
                    }}
                  >
                    Request Access Code
                  </Button>
                </Box>
              ) : (
                // File is not protected - show file content
                <Box>
                  <Alert
                    severity="success"
                    sx={{
                      mb: 3,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                    }}
                    icon={<Visibility sx={{ fontSize: 24 }} />}
                  >
                    <Typography variant="body1" fontWeight={600}>
                      Ready to View
                    </Typography>
                  </Alert>

                  {fileUrl && renderFileViewer()}
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h4" color="error" gutterBottom>
                ⚠️ Link Expired
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                This share link is no longer valid or has expired.
              </Typography>
            </Box>
          )}

          {/* Navigation */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              onClick={() => navigate(-1)}
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              Return to Previous Page
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
