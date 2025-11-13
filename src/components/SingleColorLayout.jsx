// src/components/SingleColorLayout.jsx
import React from 'react';
import { Box, CssBaseline } from '@mui/material';

export default function SingleColorLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'grey.900', // Color de fondo unificado
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CssBaseline />
      {children}
    </Box>
  );
}
