import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  InputBase,
  Grid,
  Avatar,
  Badge,
  Snackbar,
  CircularProgress,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  MoreVert,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
  Description,
  Download,
  Share,
  Search,
  ViewList,
  GridView,
  Delete,
  Star,
  StarBorder,
  Lock,
  LockOpen,
  Warning,
} from "@mui/icons-material";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import FilePreview from "./FilePreview";
import Alert from "@mui/material/Alert";
import OTPModal from "./OTPModal";
import { api } from "../../config/Api";

const FileTable = ({
  files = [],
  onDelete,
  onToggleOtpProtection,
  userEmail,
}) => {
  // State management
  const [selected, setSelected] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [starredFiles, setStarredFiles] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [currentFileForOtp, setCurrentFileForOtp] = useState(null);
  const [isCheckingOtp, setIsCheckingOtp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState(""); // 'view', 'download', 'delete'
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Filter files based on search query
  const filteredFiles = files.filter((file) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (file.documentName || "").toLowerCase().includes(searchLower) ||
      (file.imageName || "").toLowerCase().includes(searchLower) ||
      (file.videoName || "").toLowerCase().includes(searchLower)
    );
  });

  const handleFileAccess = async (file, action = "view") => {
    try {
      setIsCheckingOtp(true);
      const response = await api.get(`/api/posts/${file.id}/otp-status`);

      if (response.data.otpProtected) {
        setCurrentFileForOtp(file);
        setActionType(action);
        setOtpModalOpen(true); // Open modal immediately

        // 🔥 Generate and send OTP immediately
        try {
          await api.post(`/api/otp/generate/${file.id}`);
          showSnackbar("OTP sent to your email", "info");
        } catch (otpError) {
          console.error("OTP generation error:", otpError);
          showSnackbar("Failed to send OTP. Please try again.", "error");
        }
      } else {
        // Execute action directly if no OTP protection
        executeAction(file, action);
      }
    } catch (error) {
      showSnackbar("Error checking file access", "error");
      console.error("OTP check error:", error);
    } finally {
      setIsCheckingOtp(false);
    }
  };

  const executeAction = (file, action) => {
    switch (action) {
      case "view":
        handleDoubleClick(file);
        break;
      case "download":
        downloadFile(file);
        break;
      case "delete":
        // Show confirmation dialog for delete
        setFileToDelete(file);
        setDeleteConfirmOpen(true);
        break;
      default:
        break;
    }
  };

  const handleValidateOTP = async (otp) => {
    try {
      setIsProcessing(true);
      const response = await api.post(
        `/api/otp/validate/${currentFileForOtp.id}`,
        { code: otp }
      );

      // Handle both response formats
      const isValid = response.data.valid || response.data.status === "success";

      if (isValid) {
        showSnackbar("OTP verified successfully", "success");
        setOtpModalOpen(false);

        // If the action was delete, show confirmation dialog
        if (actionType === "delete") {
          setFileToDelete(currentFileForOtp);
          setDeleteConfirmOpen(true);
        } else {
          executeAction(currentFileForOtp, actionType);
        }
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
      const response = await api.post(
        `/api/otp/generate/${currentFileForOtp.id}`
      );

      if (response.status === 200) {
        showSnackbar("OTP resent to your email", "success");
        return true;
      } else if (response.status === 429) {
        showSnackbar("Please wait before requesting another OTP", "warning");
      }
      return false;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to resend OTP";
      showSnackbar(errorMsg, "error");
      throw new Error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file selection
  const handleSelect = (fileId) => {
    const selectedIndex = selected.indexOf(fileId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, fileId];
    } else {
      newSelected = selected.filter((id) => id !== fileId);
    }
    setSelected(newSelected);
  };

  const handleDoubleClick = (file) => {
    setCurrentFile({
      ...file,
      type: file.image
        ? "image"
        : file.document?.endsWith(".pdf")
        ? "pdf"
        : file.video
        ? "video"
        : "file",
      url: file.image || file.document || file.video,
      name:
        file.documentName ||
        file.imageName ||
        file.videoName ||
        file.document?.split("/").pop() ||
        file.image?.split("/").pop() ||
        file.video?.split("/").pop() ||
        "Untitled",
      owner: file.user?.firstName || "You",
      modified: file.createdAt || new Date().toISOString(),
    });
    setPreviewOpen(true);
  };

  // Handle context menu opening
  const handleMenuClick = (event, file) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setCurrentFile(file);
  };

  // Close context menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Toggle star on files
  const toggleStar = (fileId, event) => {
    event.stopPropagation();
    setStarredFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  // Download file
  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.image || file.document || file.video;
    link.download =
      file.documentName || file.imageName || file.videoName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar("File downloaded successfully", "success");
  };

  // Delete single file
  const handleDelete = async (fileId) => {
    try {
      await onDelete(fileId);
      setSelected(selected.filter((id) => id !== fileId));
      showSnackbar("File deleted successfully", "success");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to delete file. Please try again.";
      showSnackbar(errorMsg, "error");
      console.error("Delete error:", error);
    }
    handleMenuClose();
    setDeleteConfirmOpen(false);
  };

  // Delete multiple selected files
  const handleDeleteSelected = () => {
    if (selected.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selected.length} selected files?`
      )
    ) {
      selected.forEach((fileId) => {
        onDelete(fileId);
      });
      setSelected([]);
      showSnackbar(`${selected.length} files deleted successfully`, "success");
    }
  };

  // Get appropriate icon for file type
  const getFileIcon = (file, size = "medium") => {
    const iconProps = { fontSize: size };
    if (file.image) return <ImageIcon color="primary" {...iconProps} />;
    if (file.document) {
      return file.document.endsWith(".pdf") ? (
        <PictureAsPdf color="error" {...iconProps} />
      ) : (
        <Description color="primary" {...iconProps} />
      );
    }
    if (file.video) return <VideoLibraryIcon color="primary" {...iconProps} />;
    return <InsertDriveFile {...iconProps} />;
  };

  // Get thumbnail for file
  const getFileThumbnail = (file, size = 80) => {
    const badgeContent = starredFiles.includes(file.id) ? (
      <Star color="warning" fontSize="small" />
    ) : null;

    if (file.image) {
      return (
        <Badge
          badgeContent={badgeContent}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <Avatar
            variant="rounded"
            src={file.image}
            sx={{ width: size, height: size }}
          />
        </Badge>
      );
    }

    if (file.video) {
      return (
        <Badge
          badgeContent={badgeContent}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <Box
            sx={{
              width: size,
              height: size,
              position: "relative",
              bgcolor: "grey.200",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VideoLibraryIcon sx={{ fontSize: size / 2, color: "grey.600" }} />
          </Box>
        </Badge>
      );
    }

    if (file.document?.endsWith(".pdf")) {
      return (
        <Badge
          badgeContent={badgeContent}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: size,
              height: size,
              bgcolor: "error.light",
              color: "error.contrastText",
            }}
          >
            <PictureAsPdf sx={{ fontSize: size / 2 }} />
          </Avatar>
        </Badge>
      );
    }

    return (
      <Badge
        badgeContent={badgeContent}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: size,
            height: size,
            bgcolor: "grey.300",
            color: "grey.600",
          }}
        >
          <InsertDriveFile sx={{ fontSize: size / 2 }} />
        </Avatar>
      </Badge>
    );
  };

  // Format date in the desired format: "23 Aug 2025 15:54:34"
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid date";

    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  // Truncate long file names
  const truncateName = (name, mode) => {
    if (!name) return "Untitled";
    const limit = mode === "grid" ? 10 : 25;
    return name.length > limit ? `${name.substring(0, limit)}...` : name;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toolbar with search and view options */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          gap: 1,
        }}
      >
        <Checkbox
          indeterminate={
            selected.length > 0 && selected.length < filteredFiles.length
          }
          checked={
            selected.length === filteredFiles.length && filteredFiles.length > 0
          }
          onChange={() => {
            setSelected(
              selected.length === filteredFiles.length
                ? []
                : filteredFiles.map((file) => file.id)
            );
          }}
        />

        {selected.length > 0 ? (
          <>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {selected.length} selected
            </Typography>
            <Tooltip title="Download">
              <IconButton
                onClick={() => {
                  if (selected.length === 1) {
                    const file = files.find((f) => f.id === selected[0]);
                    handleFileAccess(file, "download");
                  } else {
                    showSnackbar("Multiple download not supported", "warning");
                  }
                }}
              >
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton>
                <Share fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                onClick={() => {
                  if (selected.length === 1) {
                    const file = files.find((f) => f.id === selected[0]);
                    handleFileAccess(file, "delete");
                  } else {
                    handleDeleteSelected();
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="List view">
              <IconButton
                onClick={() => setViewMode("list")}
                color={viewMode === "list" ? "primary" : "default"}
              >
                <ViewList fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid view">
              <IconButton
                onClick={() => setViewMode("grid")}
                color={viewMode === "grid" ? "primary" : "default"}
              >
                <GridView fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "action.hover",
            borderRadius: 1,
            px: 1,
            py: 0.5,
            width: 300,
          }}
        >
          <Search fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
          <InputBase
            placeholder="Search in Drive"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: "100%" }}
          />
        </Box>
      </Box>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {viewMode === "list" ? (
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell sx={{ width: "70%" }}>Name</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell padding="checkbox"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    hover
                    selected={selected.includes(file.id)}
                    onDoubleClick={() => handleFileAccess(file, "view")}
                    sx={{
                      cursor: "pointer",
                      "& .MuiTableCell-root": { py: 1.4 },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(file.id)}
                        onChange={() => handleSelect(file.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Tooltip
                          title={
                            starredFiles.includes(file.id)
                              ? "Remove star"
                              : "Add star"
                          }
                        >
                          <IconButton
                            onClick={(e) => toggleStar(file.id, e)}
                            size="small"
                          >
                            {starredFiles.includes(file.id) ? (
                              <Star color="warning" />
                            ) : (
                              <StarBorder />
                            )}
                          </IconButton>
                        </Tooltip>
                        {file.otpProtected && (
                          <Lock fontSize="small" color="primary" />
                        )}
                        {getFileIcon(file, "small")}
                        <Typography variant="body2">
                          {truncateName(
                            file.documentName ||
                              file.imageName ||
                              file.videoName,
                            "list"
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(file.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell padding="checkbox">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, file)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={2} p={2}>
            {filteredFiles.map((file) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={file.id}>
                <Box
                  onDoubleClick={() => handleFileAccess(file, "view")}
                  sx={{
                    p: 1,
                    border: "1px solid",
                    borderColor: selected.includes(file.id)
                      ? "primary.main"
                      : "divider",
                    borderRadius: 1,
                    cursor: "pointer",
                    bgcolor: selected.includes(file.id)
                      ? "action.selected"
                      : "background.paper",
                    "&:hover": { bgcolor: "action.hover" },
                    position: "relative",
                  }}
                >
                  <Checkbox
                    checked={selected.includes(file.id)}
                    onChange={() => handleSelect(file.id)}
                    sx={{ position: "absolute", p: 0.5 }}
                    size="small"
                  />
                  {file.otpProtected && (
                    <Lock
                      fontSize="small"
                      color="primary"
                      sx={{ position: "absolute", top: 4, right: 4 }}
                    />
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {getFileThumbnail(file)}
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        textAlign: "center",
                        wordBreak: "break-word",
                        width: "100%",
                      }}
                    >
                      {truncateName(
                        file.documentName || file.imageName || file.videoName,
                        "grid"
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Context menu for file actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            currentFile && handleFileAccess(currentFile, "view");
          }}
        >
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onToggleOtpProtection(currentFile.id, !currentFile.otpProtected);
          }}
        >
          <ListItemIcon>
            {currentFile?.otpProtected ? (
              <LockOpen fontSize="small" />
            ) : (
              <Lock fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {currentFile?.otpProtected ? "Disable OTP" : "Enable OTP"}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            currentFile && handleFileAccess(currentFile, "download");
          }}
        >
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            currentFile && handleFileAccess(currentFile, "delete");
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* File preview dialog */}
      <FilePreview
        open={previewOpen}
        file={currentFile}
        onClose={() => setPreviewOpen(false)}
        onDelete={() => {
          if (currentFile?.id) {
            handleDelete(currentFile.id);
            setPreviewOpen(false);
          }
        }}
      />

      {/* OTP verification modal */}
      <OTPModal
        open={otpModalOpen}
        handleClose={() => !isProcessing && setOtpModalOpen(false)}
        onValidate={handleValidateOTP}
        onResend={handleResendOTP}
        email={userEmail}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            Confirm Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "
            {fileToDelete?.documentName ||
              fileToDelete?.imageName ||
              fileToDelete?.videoName}
            "?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={() => fileToDelete && handleDelete(fileToDelete.id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Global loading indicators */}
      <Backdrop
        open={isCheckingOtp}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default FileTable;
