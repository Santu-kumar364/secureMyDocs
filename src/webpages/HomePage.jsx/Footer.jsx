import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Paper,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  GitHub,
  Email,
  LocationOn,
  Phone,
  Security,
  CloudUpload,
  History,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: "white",
        py: 6,
        mt: "auto",
        width: '100%',
        position: 'relative',
        left: 0,
        right: 0,
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container 
        maxWidth={false} 
        sx={{ 
          width: '100%',
          px: { xs: 2, sm: 3 },
          marginLeft: { md: '280px' },
          width: { md: 'calc(100% - 280px)' },
        }}
      >
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Security sx={{ fontSize: 32, mr: 1.5 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: "bold",
                  background: 'linear-gradient(45deg, #fff 30%, #e0e0e0 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                secureMyDocs
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
              Your trusted document security solution. We provide cutting-edge
              protection for your important files with OTP-based security and
              comprehensive audit trails.
            </Typography>
            
            {/* Social Media Links */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, opacity: 0.9 }}>
                Connect with us
              </Typography>
              <Box>
                {[
                  { icon: <Facebook />, href: "#", label: "Facebook" },
                  { icon: <Twitter />, href: "#", label: "Twitter" },
                  { icon: <LinkedIn />, href: "https://www.linkedin.com/in/santu-kumar-72239231b/", label: "LinkedIn" },
                  { icon: <GitHub />, href: "https://github.com/Santu-kumar364", label: "GitHub" },
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    color="inherit"
                    aria-label={social.label}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      mr: 1,
                      mb: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': { 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { text: 'Upload Documents', icon: <CloudUpload sx={{ fontSize: 20 }} />, href: '/upload' },
                { text: 'View Documents', icon: <Security sx={{ fontSize: 20 }} />, href: '/documents' },
                { text: 'Audit Logs', icon: <History sx={{ fontSize: 20 }} />, href: '/audit-logs' },
              ].map((link, index) => (
                <Button
                  key={index}
                  component="a"
                  href={link.href}
                  startIcon={link.icon}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'white',
                    opacity: 0.9,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {link.text}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* Contact & Developer Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
              Contact & Developer
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocationOn sx={{ mr: 1.5, fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Mumbai, India
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Email sx={{ mr: 1.5, fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  support@securemydocs.com
                </Typography>
              </Box>
            </Box>

            {/* Developer Info */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold", opacity: 0.9 }}>
                Developed by Santu Kumar
              </Typography>
              <Box sx={{ display: "flex", flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                {[
                  { label: "Portfolio", href: "https://my-portfolio-chi-rose-78.vercel.app/" },
                  { label: "LeetCode", href: "https://leetcode.com/u/santukumar7619/" },
                  { label: "GitHub", href: "https://github.com/Santu-kumar364" },
                ].map((link, index) => (
                  <Button
                    key={index}
                    component="a"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      },
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1.5
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 4, 
          backgroundColor: "rgba(255,255,255,0.3)",
        }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center', pt: 2 }}>
          <Typography
            variant="body2"
            sx={{ 
              opacity: 0.8,
              fontSize: '0.9rem'
            }}
          >
            © {new Date().getFullYear()} secureMyDocs. All rights reserved. | 
            Built with ❤️ for secure document management
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;