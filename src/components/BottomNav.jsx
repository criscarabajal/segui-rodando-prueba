// src/components/BottomNav.jsx
import React from 'react';
import { Box, Button } from '@mui/material';

export default function BottomNav({
  onOpenCliente = () => {},
  onGenerarRemito = () => {},
  onGenerarPresupuesto = () => {},
  onGenerarSeguro = () => {},      // ✅ AGREGADO
  onCancelar = () => {},
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: '72px',
        bgcolor: 'grey.900',
        borderTop: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: { sm: 0.5, md: 1 },
        px: { sm: 1, md: 2 },
        zIndex: 2000,
        pointerEvents: 'auto',
        boxShadow: '0 -4px 10px rgba(0,0,0,0.35)',
        overflowX: 'auto',
      }}
    >

      {/* ✅ AHORA EL BOTÓN LLAMA A onGenerarSeguro */}
      <Button variant="outlined" color="info" onClick={onGenerarSeguro} sx={{ whiteSpace: 'nowrap' }}>
        Seguros
      </Button>

      <Button variant="contained" onClick={onGenerarRemito} sx={{ whiteSpace: 'nowrap' }}>
        Remito
      </Button>

      <Button variant="contained" color="success" onClick={onGenerarPresupuesto} sx={{ whiteSpace: 'nowrap' }}>
        Presupuesto
      </Button>

      <Button variant="text" color="error" sx={{ ml: 'auto' }} onClick={onCancelar}>
        Cancelar
      </Button>
    </Box>
  );
}
