// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Stack, Typography } from '@mui/material';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Seguí Rodando
      </Typography>
      <Stack spacing={2}>
        <Button variant="contained" size="large" onClick={() => navigate('/cliente')}>
          Nuevo Pedido
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate('/buscar')}>
          Buscar Pedido
        </Button>
      </Stack>
    </Container>
  );
};

export default Home;
