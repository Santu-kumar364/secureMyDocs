import { Box } from "@mui/material";
import { Route, Routes, Navigate } from "react-router-dom";
import AuditLog from "../../components/AuditLog/AuditLog";
import DocumentPage from "../../components/Document/DocumentPage";
import Dashboard from "../../components/MiddlePart/Dashboard";

const drawerWidth = 240;

const HomePages = () => {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 8, lg: 2 },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Routes>
          {/* Add a route for root path that redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentPage />} />
          <Route path="/audit-logs" element={<AuditLog />} />
          {/* Catch-all route for authenticated users */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default HomePages;