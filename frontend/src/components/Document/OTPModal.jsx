
import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Backdrop,
  Alert,
} from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  outline: "none",
};

const OTPModal = ({ open, handleClose, onValidate, onResend, email }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [otpSent, setOtpSent] = useState(false); // Track if OTP was sent

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (open && !otpSent) {
      handleAutoResend();
    }
  }, [open]);

  const handleAutoResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await onResend();
      setOtpSent(true);
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onValidate(otp);
      setSuccess("OTP verified successfully!");
      setTimeout(() => handleClose(), 1000);
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await onResend();
      setSuccess("OTP resent to your email!");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={!loading ? handleClose : undefined}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Verify OTP
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" sx={{ mb: 2 }}>
          OTP sent to: {email}
        </Typography>

        <TextField
          fullWidth
          label="Enter OTP"
          variant="outlined"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        />

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={handleResend} disabled={loading}>
            Resend OTP
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !otp}
          >
            Verify
          </Button>
        </Box>

        <Backdrop
          open={loading}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Modal>
  );
};
export default OTPModal;