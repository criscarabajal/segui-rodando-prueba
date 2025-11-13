// src/pages/NuevoPedidoSide.jsx
import React, { useState } from 'react';
import { Grid, Paper, Box, CssBaseline, Typography, TextField, Button } from '@mui/material';
import ProductosPOS from '../components/ProductosPOS'; 
  // O el componente que muestre tu buscador/filtrado, 
  // como 'Productos.jsx', 'ProductosPOS.jsx', etc.

export default function NuevoPedidoSide() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    atendidoPor: 'Matias',
    fechaRetiro: '',
    fechaDevolucion: '',
  });

  // Estado para controlar si el formulario está completo
  const [formularioCompleto, setFormularioCompleto] = useState(false);

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validación sencilla y “submit” del formulario
  const handleConfirmarCliente = () => {
    const { nombre, apellido, dni, atendidoPor, fechaRetiro, fechaDevolucion } = formData;
    if (!nombre || !apellido || !dni || !atendidoPor || !fechaRetiro || !fechaDevolucion) {
      alert('Por favor, complete todos los campos antes de continuar.');
      return;
    }
    // Guardamos en localStorage o donde corresponda
    localStorage.setItem('cliente', JSON.stringify(formData));
    // Marcamos el formulario como completo
    setFormularioCompleto(true);
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />

      {/* COLUMNA IZQUIERDA (FORMULARIO CLIENTE) */}
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ mx: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Datos del Cliente
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="DNI"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Atendido por"
            name="atendidoPor"
            select
            SelectProps={{ native: true }}
            value={formData.atendidoPor}
            onChange={handleChange}
          >
            <option value="Matias">Matias</option>
            <option value="Jhona">Jhona</option>
          </TextField>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Fecha de Retiro"
            name="fechaRetiro"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={formData.fechaRetiro}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Fecha de Devolución"
            name="fechaDevolucion"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={formData.fechaDevolucion}
            onChange={handleChange}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 2, fontSize: '1.1rem' }}
            onClick={handleConfirmarCliente}
          >
            Confirmar Cliente
          </Button>
        </Box>
      </Grid>

      {/* COLUMNA DERECHA (BÚSQUEDA Y FILTRO DE PRODUCTOS) */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundColor: 'grey.900',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {formularioCompleto ? (
          <Box sx={{ p: 2, color: 'white', overflowY: 'auto' }}>
            {/* Aquí renderizas tu componente de búsqueda, como ProductosPOS */}
            <ProductosPOS />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5">
              Por favor, completa los datos del cliente para comenzar a agregar productos.
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
