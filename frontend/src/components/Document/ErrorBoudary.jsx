import React, { Component } from 'react';
import { Typography, Box } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3} border={1} borderColor="error.main" borderRadius={2}>
          <Typography color="error" variant="h6">
            Something went wrong
          </Typography>
          <Typography>
            We're having trouble displaying this content. Please try again later.
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;