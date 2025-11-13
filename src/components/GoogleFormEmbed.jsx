// src/components/GoogleFormEmbed.jsx
import React from 'react';

export default function GoogleFormEmbed() {
  return (
    <iframe
      title="Registro de Clientes"
      src="https://docs.google.com/forms/d/e/1FAIpQLSeQEoCYnL9EYe3Rkx7qc0YQloLcdfEh6gLJ8ksnF5jg7BEUhQ/viewform?embedded=true"
      width="100%"
      height="600"
      frameBorder="0"
      marginHeight="0"
      marginWidth="0"
      style={{ border: 'none' }}
    >
      Cargando…
    </iframe>
  );
}
