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
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  GitHub,
  Email,
  LocationOn,
  Phone,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "primary.main",
        color: "white",
        py: 4,
         
         
        mt: "auto",
        width: '100%',
        position: 'relative',
        left: 0,
        right: 0,
      }}
    >
      <Container 
        maxWidth={false} 
        sx={{ 
          width: '100%',
          px: { xs: 2, sm: 3 },
          // On desktop, if sidebar is visible (not mobile), add left margin
          marginLeft: { md: '280px' },
          width: { md: 'calc(100% - 280px)' },
        }}
      >
        <Grid container spacing={4}>
          {/* Company Info - Expanded to take more space */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              secureMyDocs
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
              Your trusted document security solution. We provide cutting-edge
              protection for your important files with OTP-based security and
              comprehensive audit trails.
            </Typography>
            
            {/* Social Media Links */}
            <Box sx={{ mt: 2 }}>
              <IconButton
                color="inherit"
                aria-label="Facebook"
                component="a"
                href="#"
                sx={{ 
                  mr: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Twitter"
                component="a"
                href="#"
                sx={{ 
                  mr: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="LinkedIn"
                component="a"
                href="https://www.linkedin.com/in/santu-kumar-72239231b/"
                sx={{ 
                  mr: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="GitHub"
                component="a"
                href="https://github.com/Santu-kumar364"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <GitHub />
              </IconButton>
            </Box>
          </Grid>

          {/* Contact Info - Expanded to take more space */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Contact & Developer Info
            </Typography>
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2.5 }}>
              <LocationOn sx={{ mr: 1.5, mt: 0.5 }} />
              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                Mumbai, India
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
              <Email sx={{ mr: 1.5 }} />
              <Typography variant="body2">support@securemydocs.com</Typography>
            </Box>
            
            {/* Developer Links */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold" }}>
                Developed by Santu Kumar
              </Typography>
              <Box sx={{ display: "flex", flexWrap: 'wrap', gap: 1 }}>
                <IconButton
                  color="inherit"
                  aria-label="Portfolio"
                  component="a"
                  href="https://my-portfolio-chi-rose-78.vercel.app/"
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  }}
                >
                  <Typography variant="caption">Portfolio</Typography>
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="LeetCode"
                  component="a"
                  href="https://leetcode.com/u/santukumar7619/"
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  }}
                >
                  <Typography variant="caption">LeetCode</Typography>
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 4, 
          backgroundColor: "rgba(255,255,255,0.3)",
          display: { xs: 'none', md: 'block' } 
        }} />

        {/* Copyright */}
        <Typography
          variant="body2"
          align="center"
          sx={{ 
            opacity: 0.8,
            pt: { xs: 2, md: 0 }
          }}
        >
          © {new Date().getFullYear()} secureMyDocs. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;