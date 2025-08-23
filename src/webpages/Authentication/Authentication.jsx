import { Box } from "@mui/material";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";

const Authentication = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword/>}/>
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default Authentication;