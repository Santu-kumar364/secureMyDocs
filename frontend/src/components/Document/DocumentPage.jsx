import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPostAction,
  deletePostAction,
} from "../../Redux/Post/post.action";
import FileTable from "./FileTable";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { api } from "../../config/Api";
import ErrorBoundary from "./ErrorBoudary";

const DocumentPage = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((store) => store.post);
  const { auth } = useSelector((store) => store);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    dispatch(getAllPostAction());
  }, [dispatch]);

  const handleDelete = async (postId) => {
    try {
      // Dispatch the action and wait for it to complete
      await dispatch(deletePostAction(postId));
      showSnackbar("File deleted successfully", "success");
    } catch (error) {
      showSnackbar(error.message || "Failed to delete file", "error");
    }
  };

  const handleToggleOtpProtection = async (postId, enable) => {
    try {
      const response = await api.patch(
        `/api/posts/${postId}/otp-protection?enabled=${enable}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        dispatch(getAllPostAction());
        showSnackbar(
          `OTP protection ${enable ? "enabled" : "disabled"} successfully`,
          "success"
        );
      }
    } catch (error) {
      console.error("Failed to update OTP protection:", error);
    }
  };

  const files = React.useMemo(() => {
    try {
      return (
        posts?.filter((post) => post?.document || post?.image || post?.video) ||
        []
      );
    } catch (error) {
      console.error("Error filtering posts:", error);
      return [];
    }
  }, [posts]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "100%", overflow: "hidden" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        My Documents
      </Typography>

      <ErrorBoundary>
        <FileTable
          files={files}
          onDelete={handleDelete}
          onToggleOtpProtection={handleToggleOtpProtection}
          userEmail={auth.user?.email}
        />
      </ErrorBoundary>

      {/* Global snackbar for notifications */}
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
    </Box>
  );
};

export default DocumentPage;
