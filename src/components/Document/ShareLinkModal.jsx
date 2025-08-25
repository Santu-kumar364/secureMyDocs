import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Alert,
  Grid,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  ContentCopy,
  Close,
  CalendarToday,
  People
} from '@mui/icons-material';
import { api } from '../../config/Api';

const ShareLinkModal = ({ open, onClose, file }) => {
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Safe file name access
  const getFileName = () => {
    if (!file) return 'Unknown File';
    return file.documentName || file.imageName || file.videoName || 'Untitled';
  };

  const handleGenerateLink = async () => {
    if (!file || !file.id) {
      setError('No file selected for sharing');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Parse the date and time
      const expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        setError('Please enter a valid date and time');
        setLoading(false);
        return;
      }

      // Format for backend (ISO string)
      const formattedExpiry = expiryDate.toISOString();
      
      const response = await api.post(`/api/share/create/${file.id}`, null, {
        params: {
          expiresAt: formattedExpiry,
          maxUses: maxUses || null
        }
      });

      if (response.data.status === 'success') {
        setGeneratedLink(response.data.shareUrl);
      }
    } catch (err) {
      console.error('Error generating share link:', err);
      setError(err.response?.data?.message || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setExpiresAt('');
    setMaxUses('');
    setGeneratedLink('');
    setError('');
    setCopied(false);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Share "{getFileName()}"</Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {!generatedLink ? (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create a secure link to share this file. You can set an expiration time and usage limits.
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expiration Date & Time"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday fontSize="small" color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Maximum Uses (optional)"
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited if empty"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <People fontSize="small" color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" gutterBottom>
              Your secure share link has been created:
            </Typography>
            
            <Box
              sx={{
                p: 1.5,
                mt: 1,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mr: 1
                }}
              >
                {generatedLink}
              </Typography>
              
              <Tooltip title={copied ? "Copied!" : "Copy link"}>
                <IconButton onClick={copyToClipboard} size="small">
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Alert severity="info" icon={false} sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Recipients will need to request an OTP to access this file if OTP protection is enabled.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {!generatedLink ? (
          <>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              onClick={handleGenerateLink}
              variant="contained"
              disabled={!expiresAt || loading || !file}
            >
              {loading ? 'Creating...' : 'Create Link'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={resetForm}>Create Another</Button>
            <Button onClick={handleCloseModal} variant="contained">
              Done
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShareLinkModal;