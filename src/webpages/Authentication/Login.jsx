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
  Alert,
  Box,
  Fade,
  Zoom
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { loginUserAction } from "../../Redux/Auth/auth.action";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth } = useSelector((store) => store.auth);

  useEffect(() => {
    if (auth?.user) {
      navigate("/dashboard");
    }
  }, [auth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await dispatch(loginUserAction({ email, password }));
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      <Zoom in={true} timeout={800}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Paper 
            elevation={24}
            sx={{
              padding: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -7,
                left: 0,
                right: 0,
                height: 6,
                background: 'linear-gradient(90deg, #667eea, #764ba2)'
              }
            }}
          >
            {/* Decorative elements */}
            <Box 
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                zIndex: 0
              }}
            />
            
            <Box 
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                zIndex: 0
              }}
            />

            <Box position="relative" zIndex={1}>
              {/* Header */}
              <Box textAlign="center" mb={3}>
                <Box 
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    mb: 2
                  }}
                >
                  <LoginIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to your SecureMyDocs account
                </Typography>
              </Box>

              <Fade in={!!error} timeout={500}>
                <Box>
                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.1)'
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                </Box>
              </Fade>

              <Fade in={!!auth?.error} timeout={500}>
                <Box>
                  {auth?.error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.1)'
                      }}
                    >
                      {auth.error.message || "Authentication failed"}
                    </Alert>
                  )}
                </Box>
              </Fade>

              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5
                }}
              >
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.5)'
                      }
                    }
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.5)'
                      }
                    }
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || !email || !password}
                  sx={{ 
                    py: 1.8,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 22px rgba(102, 126, 234, 0.5)',
                      transform: 'translateY(-2px)',
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    },
                    '&:active': {
                      transform: 'translateY(0)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Log In'}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', my: 3 }}>
                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Removed Google Login Button */}
              </Box>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="text"
                  color="primary"
                  size="small"
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Forgot your password?
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={8}
            sx={{
              mt: 2,
              p: 3,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}
          >
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button
                component={Link}
                to="/register"
                variant="text"
                color="primary"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 'inherit',
                  p: 0,
                  minWidth: 'auto'
                }}
              >
                Sign up
              </Button>
            </Typography>
          </Paper>
        </Box>
      </Zoom>
    </Box>
  );
}