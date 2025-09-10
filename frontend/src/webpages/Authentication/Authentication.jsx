import { Box } from "@mui/material";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
 
const Authentication = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword/>}/>
      <Route path="reset-password" element={<ResetPassword />} /> {/* Moved up */}
      <Route path="*" element={<Navigate to="/login" replace />} /> {/* Catch-all at the end */}
    </Routes>
  );
};

export default Authentication;