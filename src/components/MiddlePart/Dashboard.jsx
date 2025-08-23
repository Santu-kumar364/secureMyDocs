import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPostAction } from "../../Redux/Post/post.action";
import { getAuditLogsAction } from "../../Redux/Audit/audit.action";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Chip,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Avatar,
  Drawer,
  Divider,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Description,
  Image,
  Videocam,
  History,
  CloudUpload,
  Lock,
  FolderOpen,
  Security,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Logout,
  MoreVert,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CreatePost from "../CreatePost/CreatePost";
import { logoutAction } from "../../Redux/Auth/auth.action";
import Footer from "../../webpages/HomePage.jsx/Footer";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const {
    posts,
    loading: postsLoading,
    error: postsError,
  } = useSelector((store) => store.post);
  const {
    logs,
    loading: logsLoading,
    error: logsError,
  } = useSelector((store) => store.audit);
  const { auth } = useSelector((store) => store);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllPostAction());
    dispatch(getAuditLogsAction());
  }, [dispatch]);

  // Filter files from posts
  const files = useMemo(() => {
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

  // Function to get filename from backend fields
  const getFilename = (file) => {
    if (file.document && file.documentName) {
      return file.documentName;
    } else if (file.image && file.imageName) {
      return file.imageName;
    } else if (file.video && file.videoName) {
      return file.videoName;
    }
    return "Untitled";
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

  // Get file statistics
  const fileStats = useMemo(() => {
    const documents = files.filter((file) => file.document).length;
    const images = files.filter((file) => file.image).length;
    const videos = files.filter((file) => file.video).length;
    const otpProtected = files.filter((file) => file.otpProtected).length;

    // Sort files by createdAt date in descending order (newest first)
    const sortedFiles = [...files].sort((a, b) => {
      // Handle cases where createdAt might be null or undefined
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA; // Descending order (newest first)
    });

    return {
      total: files.length,
      documents,
      images,
      videos,
      otpProtected,
      recentUploads: sortedFiles.slice(0, 4), // Last 4 uploaded files
    };
  }, [files]);

  // Function to get file icon based on type
  const getFileIcon = (file) => {
    if (file.document) return <Description color="primary" />;
    if (file.image) return <Image color="secondary" />;
    if (file.video) return <Videocam color="error" />;
    return <FolderOpen color="disabled" />;
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutAction());
    setProfileMenuAnchor(null);
  };

  if (postsLoading || logsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (postsError || logsError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {postsError || logsError || "Failed to load dashboard data"}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
        {/* Mobile App Bar */}
        <AppBar
          position="fixed"
          sx={{
            display: { xs: "flex", md: "none" },
            backgroundColor: "white",
            color: "text.primary",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => setMobileSidebarOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 600,
                color: "primary.main",
              }}
            >
              secureMyDocs
            </Typography>
            <IconButton
              onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                }}
              >
                {auth.user?.firstName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Sidebar for Tablet and Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: 280,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
                textAlign: "center",
              }}
            >
              secureMyDocs
            </Typography>

            <List sx={{ flexGrow: 1 }}>
              {[
                {
                  text: "Dashboard",
                  icon: <DashboardIcon />,
                  path: "/",
                  action: null,
                },
                {
                  text: "My Documents",
                  icon: <FolderIcon />,
                  path: "/documents",
                  action: null,
                },
                {
                  text: "Upload",
                  icon: <CloudUpload />,
                  path: null,
                  action: () => setOpenCreatePost(true),
                },
                {
                  text: "Audit Logs",
                  icon: <History />,
                  path: "/audit-logs",
                  action: null,
                },
              ].map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={window.location.pathname === item.path}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.path) {
                        navigate(item.path);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color:
                          window.location.pathname === item.path
                            ? "primary.main"
                            : "inherit",
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Profile Section in Sidebar */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "primary.main",
                    mr: 2,
                  }}
                >
                  {auth.user?.firstName?.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {auth.user?.firstName} {auth.user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {auth.user?.email}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: { xs: -1, md: -9, lg: -3 } }}
        >
          {/* Welcome Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back,{" "}
              <Typography
                component="span"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                {auth.user?.firstName + " " + auth.user?.lastName || "User"}
              </Typography>
              ! Here's what's happening with your documents today.
            </Typography>
          </Box>

          {/* Statistics Cards - Hidden on small screens */}
          <Box sx={{ display: { xs: "block", md: "block" }, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Total Files Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <FolderOpen
                      sx={{ fontSize: 30, color: "primary.main", mb: 1 }}
                    />
                    <Typography variant="h4" component="div" gutterBottom>
                      {fileStats.total}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Files
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Documents Card */}
              <Grid item xs={12} sm="6" md={3}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.info.main}`,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <Description
                      sx={{ fontSize: 30, color: "info.main", mb: 1 }}
                    />
                    <Typography variant="h4" component="div" gutterBottom>
                      {fileStats.documents}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Documents
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Media Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.secondary.main}`,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <Image
                      sx={{ fontSize: 30, color: "secondary.main", mb: 1 }}
                    />
                    <Typography variant="h4" component="div" gutterBottom>
                      {fileStats.images + fileStats.videos}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Media Files
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* OTP Protected Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <Lock sx={{ fontSize: 30, color: "warning.main", mb: 1 }} />
                    <Typography variant="h4" component="div" gutterBottom>
                      {fileStats.otpProtected}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      OTP Protected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3} sx={{ mb: 2}}>
            
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{ p: 3, borderRadius: 2, height: "97%" }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Recent Uploads
                </Typography>
                <Divider />

                {fileStats.recentUploads.length > 0 ? (
                  <List sx={{ py: 0 }}>
                    {fileStats.recentUploads.map((file, index) => {
                      // Get the filename from backend fields
                      const filename = getFilename(file);

                      return (
                        <Box key={index}>
                          <ListItem sx={{ py: 1.5, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {getFileIcon(file)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                                >
                                  {filename}
                                </Typography>
                              }
                              secondary={`Uploaded on ${formatDate(
                                file.createdAt
                              )}`}
                            />
                            {file.otpProtected && (
                              <Chip
                                size="small"
                                icon={<Lock />}
                                label="OTP"
                                color="warning"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </ListItem>
                          {index < fileStats.recentUploads.length - 1 && (
                            <Divider />
                          )}
                        </Box>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <FolderOpen
                      sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      No files uploaded yet
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => setOpenCreatePost(true)}
                  sx={{ py: 1.5, borderRadius: 1, fontWeight: 600 }}
                >
                  Upload File
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FolderOpen />}
                  onClick={() => navigate("/documents")}
                  sx={{ py: 1.5, borderRadius: 1, fontWeight: 600 }}
                >
                  View Documents
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<History />}
                  onClick={() => navigate("/audit-logs")}
                  sx={{ py: 1.5, borderRadius: 1, fontWeight: 600 }}
                >
                  Audit Logs
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {openCreatePost && (
            <CreatePost
              open={openCreatePost}
              handleClose={() => setOpenCreatePost(false)}
            />
          )}
        </Box>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          variant="temporary"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280 },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
                textAlign: "center",
              }}
            >
              secureMyDocs
            </Typography>

            <List sx={{ flexGrow: 1 }}>
              {[
                {
                  text: "Dashboard",
                  icon: <DashboardIcon />,
                  path: "/",
                  action: null,
                },
                {
                  text: "My Documents",
                  icon: <FolderIcon />,
                  path: "/documents",
                  action: null,
                },
                {
                  text: "Upload",
                  icon: <CloudUpload />,
                  path: null,
                  action: () => {
                    setOpenCreatePost(true);
                    setMobileSidebarOpen(false);
                  },
                },
                {
                  text: "Audit Logs",
                  icon: <History />,
                  path: "/audit-logs",
                  action: null,
                },
              ].map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={window.location.pathname === item.path}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.path) {
                        navigate(item.path);
                        setMobileSidebarOpen(false);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color:
                          window.location.pathname === item.path
                            ? "primary.main"
                            : "inherit",
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Profile Section in Mobile Sidebar */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "primary.main",
                    mr: 2,
                  }}
                >
                  {auth.user?.firstName?.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {auth.user?.firstName} {auth.user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {auth.user?.email}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setProfileMenuAnchor(e.currentTarget);
                    setMobileSidebarOpen(false);
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Drawer>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={() => setProfileMenuAnchor(null)}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 180,
            },
          }}
        >
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
      <Footer />
    </>
  );
};

export default Dashboard;
