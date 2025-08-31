import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuditLogsAction } from "../../Redux/Audit/audit.action";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  TablePagination,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  Tooltip,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import {
  Search,
  FilterList,
  Clear,
  CalendarToday,
  Sort,
  Refresh,
} from "@mui/icons-material";
import ErrorBoundary from "../Document/ErrorBoudary";

const AuditLog = () => {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((store) => store.audit);
  const { posts } = useSelector((store) => store.post);
  const { auth } = useSelector((store) => store);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc",
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const getFileName = (log) => {
    if (!log) return "N/A";
    return (
      log.fileName || // direct field
      log.documentName ||
      log.imageName ||
      log.videoName ||
      "N/A"
    );
  };

  // Function to truncate file names
  const truncateName = (name, mode = "list") => {
    if (!name || name === "N/A") return "N/A";
    const limit = mode === "list" ? 25 : 40;
    return name.length > limit ? name.slice(0, limit) + "..." : name;
  };

  // Snackbar handler
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fetch audit logs on mount
  useEffect(() => {
    fetchLogs();
  }, [dispatch]);

  const fetchLogs = () => {
    dispatch(getAuditLogsAction())
      .then((result) => {
        if (result.success) {
          showSnackbar("Audit logs loaded successfully", "success");
        } else {
          showSnackbar(result.error, "error");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch audit logs:", err);
        showSnackbar("Failed to load audit logs", "error");
      });
  };

  // Memoized logs processing
  const safeLogs = useMemo(() => {
    try {
      return logs || [];
    } catch (err) {
      console.error("Error preparing logs:", err);
      return [];
    }
  }, [logs]);

  // Enhanced logs with file information
  const enhancedLogs = useMemo(() => {
    return safeLogs.map((log) => {
      const fileName = getFileName(log);
      
      return {
        ...log,
        fileName,
        displayName: truncateName(fileName, "list")
      };
    });
  }, [safeLogs]);

  // Filter and sort logs
  const processedLogs = useMemo(() => {
    let filteredLogs = [...enhancedLogs];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          (log.user?.email && log.user.email.toLowerCase().includes(term)) ||
          (log.action && log.action.toLowerCase().includes(term)) ||
          (log.fileName && log.fileName.toLowerCase().includes(term))
      );
    }

    // Apply action filter
    if (actionFilter !== "all") {
      filteredLogs = filteredLogs.filter(
        (log) => log.action && log.action === actionFilter
      );
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.timestamp && new Date(log.timestamp).toDateString() === filterDate
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredLogs.sort((a, b) => {
        let aValue, bValue;

        // Handle file name sorting
        if (sortConfig.key === "fileName") {
          aValue = a.fileName;
          bValue = b.fileName;
        }
        // Handle nested properties (e.g., user.email)
        else if (sortConfig.key === "userEmail") {
          aValue = a.user?.email || "";
          bValue = b.user?.email || "";
        }
        // Handle direct properties
        else {
          aValue = a[sortConfig.key] || "";
          bValue = b[sortConfig.key] || "";
        }

        // Handle null/undefined values
        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredLogs;
  }, [enhancedLogs, searchTerm, sortConfig, actionFilter, dateFilter]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get unique actions for filter
  const uniqueActions = useMemo(() => {
    const actions = new Set();
    safeLogs.forEach((log) => {
      if (log.action) actions.add(log.action);
    });
    return Array.from(actions);
  }, [safeLogs]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setActionFilter("all");
    setDateFilter("");
    setSortConfig({ key: "timestamp", direction: "desc" });
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Audit Logs...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchLogs}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "100%", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: { xs: 2, sm: 0 },
          }}
        >
          Audit Logs
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh logs">
            <IconButton onClick={fetchLogs} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            data-testid="filter-button"
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Logs
              </Typography>
              <Typography variant="h5" component="div">
                {safeLogs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Filtered Logs
              </Typography>
              <Typography variant="h5" component="div">
                {processedLogs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unique Actions
              </Typography>
              <Typography variant="h5" component="div">
                {uniqueActions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          placeholder="Search by action or file name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm("")} size="small">
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {(searchTerm || actionFilter !== "all" || dateFilter) && (
          <Button onClick={clearFilters} startIcon={<Clear />}>
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter by Action</Typography>
        </MenuItem>
        <MenuItem
          selected={actionFilter === "all"}
          onClick={() => {
            setActionFilter("all");
            setFilterAnchorEl(null);
          }}
        >
          All Actions
        </MenuItem>
        {uniqueActions.map((action) => (
          <MenuItem
            key={action}
            selected={actionFilter === action}
            onClick={() => {
              setActionFilter(action);
              setFilterAnchorEl(null);
            }}
          >
            {action}
          </MenuItem>
        ))}

        <MenuItem disabled sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Filter by Date</Typography>
        </MenuItem>
        <MenuItem>
          <TextField
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday fontSize="small" />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </MenuItem>
      </Menu>

      <ErrorBoundary>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ borderRadius: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <strong>Action</strong>
                    <IconButton
                      size="small"
                      onClick={() => handleSort("action")}
                    >
                      <Sort
                        fontSize="small"
                        color={
                          sortConfig.key === "action" ? "primary" : "inherit"
                        }
                      />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <strong>File Name</strong>
                    <IconButton
                      size="small"
                      onClick={() => handleSort("fileName")}
                    >
                      <Sort
                        fontSize="small"
                        color={
                          sortConfig.key === "fileName" ? "primary" : "inherit"
                        }
                      />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <strong>Timestamp</strong>
                    <IconButton
                      size="small"
                      onClick={() => handleSort("timestamp")}
                    >
                      <Sort
                        fontSize="small"
                        color={
                          sortConfig.key === "timestamp" ? "primary" : "inherit"
                        }
                      />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedLogs.length > 0 ? (
                processedLogs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((log, index) => (
                    <TableRow key={log.id || index} hover>
                      <TableCell>
                        <Chip
                          label={log.action || "N/A"}
                          size="small"
                          color={
                            log.action === "UPLOAD"
                              ? "primary"
                              : log.action === "DELETE"
                              ? "error"
                              : log.action === "ENABLE_OTP" ||
                                log.action === "DISABLE_OTP"
                              ? "secondary"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={log.fileName}
                      >
                        {log.displayName}
                      </TableCell>
                      <TableCell>
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No audit logs found
                    </Typography>
                    {(searchTerm || actionFilter !== "all" || dateFilter) && (
                      <Button onClick={clearFilters} sx={{ mt: 1 }}>
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {processedLogs.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={processedLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ mt: 2 }}
          />
        )}
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

export default AuditLog;