// src/App.jsx
import React, { useState, useEffect } from "react";
import ProductosPOS from "./components/ProductosPOS";
import Login from "./components/Login";
import HeaderUserMenu from "./components/HeaderUserMenu";
import { estaAutenticado } from "./utils/auth";

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState("");

  useEffect(() => {
    setAutenticado(estaAutenticado());

    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) setUsuarioActual(savedUser);
  }, []);

  const handleLoginExitoso = (usuario) => {
    localStorage.setItem("currentUser", usuario);

    // Guardar historial de usuarios logueados
    const lista = JSON.parse(localStorage.getItem("usuariosLogueados") || "[]");
    if (!lista.includes(usuario)) {
      lista.push(usuario);
      localStorage.setItem("usuariosLogueados", JSON.stringify(lista));
    }

    setUsuarioActual(usuario);
    setAutenticado(true);
  };

  const changeUser = () => {
    const lista = JSON.parse(localStorage.getItem("usuariosLogueados") || "[]");

    if (lista.length < 2) {
      // Solo un usuario → volver al login
      localStorage.removeItem("currentUser");
      setAutenticado(false);
      return;
    }

    const pos = lista.indexOf(usuarioActual);
    const siguiente = lista[(pos + 1) % lista.length]; // ciclo entre usuarios

    localStorage.setItem("currentUser", siguiente);
    setUsuarioActual(siguiente);
  };

  if (!autenticado) {
    return <Login onLoginExitoso={handleLoginExitoso} />;
  }

  return (
    <>
      {/* Avatar y nombre arriba a la derecha */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 3000,
        }}
      >
        <HeaderUserMenu
          usuario={usuarioActual}
          onLogout={() => {
            localStorage.removeItem("currentUser");
            setAutenticado(false);
          }}
          onChangeUser={changeUser}
        />
      </div>

      {/* RECARGA productos pero mantiene carrito */}
      <ProductosPOS key={usuarioActual} />
    </>
  );
}
