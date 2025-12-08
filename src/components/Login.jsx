// src/components/Login.jsx
import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { intentarLogin } from "../utils/auth";

export default function Login({ onLoginExitoso }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const resultado = intentarLogin(usuario.trim(), contrasena.trim());

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

    setError("");
    onLoginExitoso(usuario.trim()); // 👈 Envía el usuario al App.jsx
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.900",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 380,
          p: 4,
          borderRadius: 2,
          bgcolor: "grey.800",
        }}
      >
        <Typography
          variant="h5"
          sx={{ textAlign: "center", mb: 3, color: "#fff" }}
        >
          Iniciar sesión
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Usuario */}
          <TextField
            label="Usuario"
            fullWidth
            margin="normal"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#ccc" },
            }}
          />

          {/* Contraseña con ojito 👁️ */}
          <TextField
            label="Contraseña"
            type={showPass ? "text" : "password"}
            fullWidth
            margin="normal"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)}>
                    {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#ccc" },
            }}
          />

          {/* Botón ingresar */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
          >
            Entrar
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
