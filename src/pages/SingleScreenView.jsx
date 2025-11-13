// src/pages/SingleScreenView.jsx
import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import ProductosPOS from '../components/ProductosPOS';
import BottomNav from '../components/BottomNav';
import generarRemitoPDF, { generarNumeroRemito } from '../utils/generarRemito';
import generarCotizacionPDF, { generarNumeroPresupuesto } from '../utils/generarPresupuesto';

export default function SingleScreenView() {
  const [formData, setFormData] = useState({ /* ... */ });

  const handleGenerarRemito = () => {
    // ... existente
  };

 const handleGenerarPresupuesto = () => {
   const cliente = formData;
   const carritoStr = localStorage.getItem('carrito');
   if (!carritoStr) return alert("No hay productos en el pedido.");
   const carrito = JSON.parse(carritoStr);
   if (!carrito.length) return alert("No hay productos en el pedido.");

   const numero = generarNumeroPresupuesto();
   const fecha = new Date().toLocaleDateString("es-AR");
   generarCotizacionPDF(cliente, carrito, cliente.atendidoPor, numero, fecha);
 };

  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        <Box sx={{ flexGrow: 1, backgroundColor: 'grey.900', p: 4 }}>
          <ProductosPOS />
        </Box>
      </Box>

     <BottomNav
       onOpenCliente={() => {}}
       onGenerarRemito={handleGenerarRemito}
       onGenerarPresupuesto={handleGenerarPresupuesto}
       onCancelar={() => localStorage.removeItem('carrito')}
       onBuscarPedido={() => {}}
     />
    </Box>
  );
}
