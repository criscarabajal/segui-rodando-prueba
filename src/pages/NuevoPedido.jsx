import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from '@mui/material';

export default function NuevoPedido() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.900', color: 'white', p: 6 }}>
      <Typography variant="h3" fontWeight="bold" mb={4}>Nuevo Pedido</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate("/cliente")}
          sx={{ py: 2, borderRadius: 2, fontSize: '1.125rem', boxShadow: 3 }}
        >
          Ingresar Datos del Cliente
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/")}
          sx={{ py: 2, borderRadius: 2, fontSize: '1.125rem', boxShadow: 3 }}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
