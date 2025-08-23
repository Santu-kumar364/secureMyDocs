import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Facebook } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { registerUserAction } from "../../Redux/Auth/auth.action";
 

export default function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth } = useSelector((store) => store);

  useEffect(() => {
    if (auth.user) {
      navigate("/dashboard");
    }
  }, [auth.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await dispatch(registerUserAction({ 
        firstName, 
        lastName, 
        email, 
        password 
      }));
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Paper className="w-full max-w-md p-8 rounded-lg" elevation={3}>
        <div className="flex justify-center mb-6">
          <Typography variant="h4" className="font-bold">
            SecureMyDocs
          </Typography>
        </div>

        {auth.error && (
          <Typography
            variant="body2"
            align="center"
            className="mb-4 p-2 bg-red-100 text-red-600 rounded"
          >
            {auth.error.message || "Registration failed"}
          </Typography>
        )}

        {error && (
          <Typography
            variant="body2"
            align="center"
            className="mb-4 p-2 bg-red-100 text-red-600 rounded"
          >
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="First Name"
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: "8px",
              },
              "& .MuiInputLabel-root": {
                backgroundColor: "white",
                padding: "0 4px",
                borderRadius: "4px",
              },
            }}
          />

          <TextField
            fullWidth
            label="Last Name"
            variant="outlined"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: "8px",
              },
              "& .MuiInputLabel-root": {
                backgroundColor: "white",
                padding: "0 4px",
                borderRadius: "4px",
              },
            }}
          />

          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: "8px",
              },
              "& .MuiInputLabel-root": {
                backgroundColor: "white",
                padding: "0 4px",
                borderRadius: "4px",
              },
              mb: 3,
            }}
          />

          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: "8px",
              },
              "& .MuiInputLabel-root": {
                backgroundColor: "white",
                padding: "0 4px",
                borderRadius: "4px",
              },
              mb: 3,
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || !email || !firstName || !lastName || !password}
            className="h-12 font-bold mt-2 rounded-lg"
            sx={{ borderRadius: "8px" }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>

          <div className="flex items-center justify-center space-x-2 my-4">
            <Divider className="flex-1" />
            <Typography variant="body2" color="textSecondary">
              OR
            </Typography>
            <Divider className="flex-1" />
          </div>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Facebook color="primary" />}
            className="h-12 text-sm font-bold rounded-lg"
            sx={{ borderRadius: "8px" }}
          >
            Sign up with Facebook
          </Button>
        </form>
      </Paper>

      <Paper
        className="w-full max-w-md mt-4 p-6 text-center rounded-lg"
        elevation={3}
      >
        <Typography variant="body2">
          Have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 font-bold hover:text-blue-700"
          >
            Log in
          </Link>
        </Typography>
      </Paper>
    </div>
  );
}