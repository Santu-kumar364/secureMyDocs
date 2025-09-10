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
import { LinkedIn, GitHub, AssignmentInd } from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
        color: "white",
        py: 6,
        mt: "auto",
        ml:4,
        width: "100%",
        position: "relative",
        left: 0,
        right: 0,
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          width: "100%",
          px: { xs: 2, sm: 3 },
          marginLeft: { md: "280px" },
           
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: { xs: "column", md: "row" },
                mb: 3,
                gap: { xs: 2, md: 3 },
              }}
            >
              <Box
                component="img"
                src="/secureMyDocs_logo.png"
                alt="secureMyDocs Logo"
                sx={{
                  height: 100,
                  width: "auto",
                  display: { xs: "none", md: "block" },
                  filter: "brightness(0) invert(1)",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  lineHeight: 1.6,
                  textAlign: { xs: "center", md: "left" },
                  fontSize: "0.9rem",
                  maxWidth: "600px",
                }}
              >
                Enterprise-grade document security solution providing
                cutting-edge protection for sensitive files with OTP-based
                authentication and comprehensive audit trails.
              </Typography>
            </Box>

            {/* Social Links */}
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {[
                {
                  icon: <LinkedIn />,
                  href: "https://www.linkedin.com/in/santu-kumar-72239231b/",
                  label: "LinkedIn",
                  text: "LinkedIn",
                },
                {
                  icon: <GitHub />,
                  href: "https://github.com/Santu-kumar364",
                  label: "GitHub",
                  text: "GitHub",
                },
                {
                  icon: (
                    <Box
                      component="img"
                      src="https://img.icons8.com/?size=100&id=wDGo581Ea5Nf&format=png&color=000000"
                      sx={{
                        height: 24,
                        width: 24,
                        filter: "brightness(0) invert(1)",
                      }}
                      alt="LeetCode"
                    />
                  ),
                  href: "https://leetcode.com/u/santukumar7619/",
                  label: "LeetCode",
                  text: "LeetCode",
                },
                {
                  icon: <AssignmentInd />,
                  href: "https://my-portfolio-chi-rose-78.vercel.app/",
                  label: "Portfolio",
                  text: "Portfolio",
                },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    m: 1,
                  }}
                >
                  <IconButton
                    component="a"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {item.icon}
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      opacity: 0.9,
                      fontSize: "0.75rem",
                      display: "block",
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: 4,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />

        {/* Copyright */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              fontSize: "0.85rem",
              letterSpacing: "0.5px",
            }}
          >
            © {new Date().getFullYear()} secureMyDocs. All rights reserved. |
            Enterprise document security solutions
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
