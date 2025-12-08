// src/components/HeaderUserMenu.jsx
import { useState, useEffect } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import UploadIcon from "@mui/icons-material/UploadFile";

export default function HeaderUserMenu({ onLogout, onChangeUser, usuario }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);

  const open = Boolean(anchorEl);

  // Clave única por usuario para guardar avatar
  const avatarKey = `userAvatar_${usuario}`;

  useEffect(() => {
    const img = localStorage.getItem(avatarKey);
    if (img) setAvatarSrc(img);
  }, [usuario]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleChangeAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem(avatarKey, reader.result);
        setAvatarSrc(reader.result);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  return (
    <>
      {/* Avatar + nombre */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingRight: "4px",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 500,
            fontSize: "0.95rem",
          }}
        >
          {usuario}
        </span>

        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
          <Avatar
            src={avatarSrc}
            alt={usuario}
            sx={{ width: 42, height: 42, bgcolor: "grey.600" }}
          >
            {!avatarSrc && usuario?.[0]?.toUpperCase()}
          </Avatar>
        </IconButton>
      </div>

      {/* Menú */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} sx={{ mt: 1 }}>
        <MenuItem onClick={handleChangeAvatar}>
          <ListItemIcon>
            <UploadIcon fontSize="small" />
          </ListItemIcon>
          Cambiar imagen
        </MenuItem>

        <MenuItem
          onClick={() => {
            onChangeUser();
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Cambiar usuario
        </MenuItem>

        <MenuItem
          onClick={() => {
            onLogout();
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
}
