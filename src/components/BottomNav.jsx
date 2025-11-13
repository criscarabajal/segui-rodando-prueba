// src/components/BottomNav.jsx
import React from 'react';
import { Box, Button } from '@mui/material';

export default function BottomNav({
  onOpenCliente = () => {},
  onGenerarRemito = () => {},
  onGenerarPresupuesto = () => {},
  onCancelar = () => {},
  onOpenSeguros = () => {}
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: '72px',            // alto fijo para que coincida con FOOTER=72
        bgcolor: 'grey.900',
        borderTop: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: { sm: 0.5, md: 1 },
        px: { sm: 1, md: 2 },
        zIndex: 2000,              // por encima de todo
        pointerEvents: 'auto',     // asegura que reciba clics
        boxShadow: '0 -4px 10px rgba(0,0,0,0.35)',
        overflowX: 'auto'          // permite desplazar si el ancho no alcanza
      }}
    >
      <Button variant="outlined" onClick={onOpenCliente} sx={{ whiteSpace: 'nowrap' }}>Datos Cliente</Button>
      <Button variant="outlined" color="info" onClick={onOpenSeguros} sx={{ whiteSpace: 'nowrap' }}>Seguros</Button>
      <Button variant="contained" onClick={onGenerarRemito} sx={{ whiteSpace: 'nowrap' }}>Remito</Button>
      <Button variant="contained" color="success" onClick={onGenerarPresupuesto} sx={{ whiteSpace: 'nowrap' }}>Presupuesto</Button>
      <Button variant="text" color="error" sx={{ ml: 'auto' }} onClick={onCancelar}>Cancelar</Button>
    </Box>
  );
}
