import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Divider,
  CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage(`Password reset link sent to ${email}`);
    } catch (error) {
      setMessage('Error sending reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Paper className="w-full max-w-md p-8" elevation={3}>
        <div className="flex justify-center mb-6">
          <Typography variant="h4" className="font-bold">
            SecureMyDocs
          </Typography>
        </div>

        <Typography variant="h5" align="center" className="mb-2 font-bold">
          Reset your password
        </Typography>

        <Typography variant="body2" align="center" color="textSecondary" className="mb-6">
          Enter your email to receive a password reset link
        </Typography>

        {message && (
          <Typography 
            variant="body2" 
            align="center" 
            className={`mb-4 p-2 rounded ${
              message.includes('Error') 
                ? 'bg-red-100 text-red-600' 
                : 'bg-green-100 text-green-600'
            }`}
          >
            {message}
          </Typography>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white"
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || !email}
            className="h-12 font-bold"
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </form>

        <Divider className="my-6" />

        <div className="flex items-center justify-center space-x-1">
          <ArrowBack fontSize="small" className="text-gray-500" />
          <Link 
            to="/login" 
            className="text-sm font-medium text-blue-500 hover:text-blue-700"
          >
            Back to login
          </Link>
        </div>
      </Paper>
    </div>
  );
}