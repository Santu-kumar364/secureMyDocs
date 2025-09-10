import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Fade,
  Zoom
} from '@mui/material';
import { ArrowBack, Lock } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../config/Api';

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError("Invalid reset link");
      setValidating(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}auth/validate-reset-token`,
        { token }
      );
      
      if (response.status === 200) {
        setTokenValid(true);
      }
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || errorData?.error || 
                          (typeof errorData === 'string' ? errorData : 'Invalid or expired reset link');
      setError(errorMessage);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}auth/reset-password`, {
        token,
        password,
      });

      if (response.status === 200) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || errorData?.error || 
                          (typeof errorData === 'string' ? errorData : 'Error resetting password. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
          <Paper 
            elevation={24}
            sx={{
              width: '100%',
              maxWidth: 440,
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
            <Box position="relative" zIndex={1}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.1)'
                }}
              >
                Invalid reset link. Please request a new password reset.
              </Alert>
              
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="outlined"
                  color="primary"
                  startIcon={<ArrowBack />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Request New Reset Link
                </Button>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </Box>
    );
  }

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
        <Paper 
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: 440,
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
                <Lock sx={{ fontSize: 32 }} />
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
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new password for your account
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
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                  </Alert>
                )}
              </Box>
            </Fade>

            <Fade in={!!message} timeout={500}>
              <Box>
                {message && (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)'
                    }}
                  >
                    {message}
                  </Alert>
                )}
              </Box>
            </Fade>

            {validating ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Validating reset link...
                </Typography>
              </Box>
            ) : tokenValid ? (
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
                  label="New Password"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  label="Confirm New Password"
                  variant="outlined"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || !password || !confirmPassword}
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
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Reset Password'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This reset link is invalid or has expired.
                </Alert>
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="outlined"
                  color="primary"
                  startIcon={<ArrowBack />}
                >
                  Request New Reset Link
                </Button>
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mt: 3.5 }}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                color="primary"
                startIcon={<ArrowBack />}
                size="medium"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  color: '#667eea',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.08)'
                  }
                }}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        </Paper>
      </Zoom>
    </Box>
  );
}