// src/utils/auth.js

const AUTH_KEY = "seguiRodandoAuth";

const USERS = [
  { user: "Pañol", pass: "mati1234" },
  { user: "veok", pass: "Uep1234" },
];

// Verifica si ya hay sesión
export function estaAutenticado() {
  return localStorage.getItem(AUTH_KEY) === "ok";
}

// Intenta iniciar sesión
export function intentarLogin(usuario, contrasena) {
  const encontrado = USERS.find(
    (u) => u.user === usuario && u.pass === contrasena
  );

  if (encontrado) {
    localStorage.setItem(AUTH_KEY, "ok");
    return { ok: true };
  }

  return {
    ok: false,
    error: "Escribí bien la contraseña pedazo de manco",
  };
}

export function cerrarSesion() {
  localStorage.removeItem(AUTH_KEY);
}
