// src/components/Carrito.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Divider,
  Paper,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material';
import { Add, Remove, Delete, MoreVert } from '@mui/icons-material';

const DIAS_SEMANA = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export default function Carrito({
  productosSeleccionados,
  onIncrementar,
  onDecrementar,
  onCantidadChange,
  onEliminar,
  jornadasMap,
  setJornadasMap,
  comentario,            // compat PDFs
  setComentario,         // se actualiza con días tildados (selección actual)
  pedidoNumero,
  setPedidoNumero,
  onClearAll
}) {
  const [discount, setDiscount] = useState('0');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [openIncludes, setOpenIncludes] = useState(false);
  const [serialMap, setSerialMap] = useState({});
  const [massJornadas, setMassJornadas] = useState('');

  // ====== DÍAS SELECCIONADOS (para el grupo actual) ======
  const [diasSeleccionados, setDiasSeleccionados] = useState(() => {
    try { return JSON.parse(localStorage.getItem('diasSeleccionados')) || []; }
    catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem('diasSeleccionados', JSON.stringify(diasSeleccionados));
    if (setComentario) {
      const texto = diasSeleccionados.length ? `Días: ${diasSeleccionados.join(', ')}` : '';
      setComentario(texto);
    }
  }, [diasSeleccionados, setComentario]);
  const toggleDia = (dia) => {
    setDiasSeleccionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  // ====== GRUPOS ASIGNADOS POR DÍA (persistentes) ======
  // Estructura: { Lunes: [item, item], Martes: [...], ... }
  const [gruposDias, setGruposDias] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gruposDias')) || {}; }
    catch { return {}; }
  });
  useEffect(() => {
    localStorage.setItem('gruposDias', JSON.stringify(gruposDias));
  }, [gruposDias]);

  // Guardar descuento
  useEffect(() => {
    localStorage.setItem('descuento', JSON.stringify(appliedDiscount));
  }, [appliedDiscount]);

  // Inicializar serialMap al abrir detalles
  useEffect(() => {
    if (!openIncludes) return;
    const init = {};
    productosSeleccionados.forEach((item, idx) => {
      const opts = Array.isArray(item.seriales) ? item.seriales : [];
      init[idx] = serialMap[idx] ?? opts[0] ?? '';
    });
    setSerialMap(init);
  }, [openIncludes, productosSeleccionados]);

  const handleApplyDiscount = () => {
    if (discount === 'especial') {
      const pwd = prompt('Contraseña:');
      if (pwd !== 'veok') return alert('Contraseña incorrecta');
      const pct = parseFloat(prompt('Porcentaje (0–100):'));
      if (isNaN(pct) || pct < 0 || pct > 100) return alert('Inválido');
      return setAppliedDiscount(pct);
    }
    const pct = parseFloat(discount);
    if (isNaN(pct) || pct < 0 || pct > 100) return alert('Seleccione válido');
    setAppliedDiscount(pct);
  };

  const handleAccept = () => setOpenIncludes(false);

  // ====== Jornadas masivas (selección actual) ======
  const bumpAllJornadas = (delta) => {
    setJornadasMap(prev => {
      const next = { ...prev };
      productosSeleccionados.forEach((_, idx) => {
        const cur = parseInt(next[idx], 10) || 1;
        next[idx] = Math.max(1, cur + delta);
      });
      return next;
    });
  };
  const applyAllJornadas = (val) => {
    const v = Math.max(1, parseInt(val, 10) || 1);
    setJornadasMap(prev => {
      const next = { ...prev };
      productosSeleccionados.forEach((_, idx) => { next[idx] = v; });
      return next;
    });
  };

  // ====== ACEPTAR: guarda el grupo actual en los días seleccionados ======
  const handleAceptarGrupo = () => {
    if (!diasSeleccionados.length) return alert('Seleccioná al menos un día.');
    if (!productosSeleccionados.length) return alert('Agregá productos al carrito antes de aceptar.');

    setGruposDias(prev => {
      const next = { ...prev };
      diasSeleccionados.forEach(dia => {
        const existentes = Array.isArray(next[dia]) ? next[dia] : [];
        const aAgregar = productosSeleccionados.map((it) => {
          const cantidad = Math.max(1, parseInt(it.cantidad, 10) || 1);
          const precio = parseFloat(it.precio) || 0;
          return { ...it, cantidad, precio, __fromGroup: true };
        });
        next[dia] = [...existentes, ...aAgregar];
      });
      return next;
    });

    // Reset: limpiar selección actual y los días seleccionados
    onClearAll && onClearAll();
    setDiasSeleccionados([]);
    setComentario && setComentario('');
  };

  // ====== Edición dentro de cada día ======
  const incrementDayItem = (dia, idx) => {
    setGruposDias(prev => {
      const copy = { ...prev };
      copy[dia] = copy[dia].map((it, i) => i === idx ? { ...it, cantidad: (parseInt(it.cantidad,10)||1) + 1 } : it);
      return copy;
    });
  };
  const decrementDayItem = (dia, idx) => {
    setGruposDias(prev => {
      const copy = { ...prev };
      copy[dia] = copy[dia].map((it, i) => {
        if (i !== idx) return it;
        const c = Math.max(1, (parseInt(it.cantidad,10)||1) - 1);
        return { ...it, cantidad: c };
      });
      return copy;
    });
  };
  const changeDayItemQty = (dia, idx, val) => {
    setGruposDias(prev => {
      const copy = { ...prev };
      const n = val === '' ? '' : Math.max(1, parseInt(val, 10) || 1);
      copy[dia] = copy[dia].map((it, i) => i === idx ? { ...it, cantidad: n } : it);
      return copy;
    });
  };
  const deleteDayItem = (dia, idx) => {
    setGruposDias(prev => {
      const copy = { ...prev };
      copy[dia] = copy[dia].filter((_, i) => i !== idx);
      if (copy[dia].length === 0) delete copy[dia];
      return copy;
    });
  };
  const clearDay = (dia) => {
    setGruposDias(prev => {
      const copy = { ...prev };
      delete copy[dia];
      return copy;
    });
  };

  // ====== Totales ======
  // Total de la selección actual (respeta jornadasMap como antes)
  const totalSeleccionActual = productosSeleccionados.reduce((sum, item, idx) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const j = parseInt(jornadasMap[idx], 10) || 1;
    const price = parseFloat(item.precio) || 0;
    return sum + qty * price * j;
  }, 0);

  // Total ya asignado por día (asumo 1 jornada por cada día en que aparece)
  const totalAsignado = Object.values(gruposDias).flat().reduce((sum, item) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const price = parseFloat(item.precio) || 0;
    return sum + qty * price * 1;
  }, 0);

  const totalConJornadas = totalSeleccionActual + totalAsignado;
  const discountAmount = totalConJornadas * (appliedDiscount / 100);
  const finalTotal = totalConJornadas - discountAmount;
  const totalWithIva = finalTotal * 1.21;

  // Ordeno días según DIAS_SEMANA para mostrar en la UI
  const diasConAsignados = DIAS_SEMANA.filter(d => Array.isArray(gruposDias[d]) && gruposDias[d].length > 0);

  // Para la lista visual de selección actual
  const ordenados = productosSeleccionados.map((p, i) => ({ p, i })).reverse();

  return (
    <Paper
      sx={{
        width: '100%',
        bgcolor: '#1e1e1e',
        color: '#fff',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        fontSize: '0.875rem'
      }}
    >
      {/* Header pedido */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
          Pedido N°
        </Typography>
        <TextField
          size="small"
          variant="outlined"
          value={pedidoNumero}
          onChange={e => setPedidoNumero(e.target.value)}
          sx={{
            width: 80,
            bgcolor: '#2c2c2c',
            borderRadius: 1,
            '& .MuiInputBase-input': { color: '#fff', padding: '4px', textAlign: 'center' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
          }}
        />

        {/* Checkboxes de días (selección actual) */}
        <Box
          sx={{
            flex: 1,
            minWidth: 140,
            bgcolor: '#2c2c2c',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.5
          }}
        >
          <Typography variant="caption" sx={{ mr: 1, color: '#bbb' }}>
            Días:
          </Typography>
          <FormGroup row sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}>
            {DIAS_SEMANA.map(dia => (
              <FormControlLabel
                key={dia}
                control={
                  <Checkbox
                    size="small"
                    checked={diasSeleccionados.includes(dia)}
                    onChange={() => toggleDia(dia)}
                    sx={{ color: '#fff' }}
                  />
                }
                label={dia}
              />
            ))}
          </FormGroup>
        </Box>

        {/* Botón Aceptar: graba el grupo en los días seleccionados */}
        <Button
          variant="contained"
          size="small"
          onClick={handleAceptarGrupo}
          disabled={diasSeleccionados.length === 0 || productosSeleccionados.length === 0}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Aceptar
        </Button>

        <IconButton size="small" onClick={() => setOpenIncludes(true)}>
          <MoreVert sx={{ color: '#fff' }} />
        </IconButton>
      </Box>

      {/* Selección actual (productos aún no asignados a días) */}
      {productosSeleccionados.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Selección actual</Typography>
          <List sx={{ maxHeight: { sm: 180, md: 220, lg: 260 }, overflowY: 'auto' }}>
            {ordenados.map(({ p: item, i: idx }) => (
              <React.Fragment key={idx}>
                <ListItem
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#2c2c2c',
                    borderRadius: 1,
                    mb: 1,
                    py: 1,
                    px: 1
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.825rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flexGrow: 1
                    }}
                  >
                    {item.nombre}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => onDecrementar(idx)}><Remove /></IconButton>
                    <TextField
                      value={item.cantidad}
                      onChange={e => onCantidadChange(idx, e.target.value)}
                      size="small"
                      inputProps={{ style: { textAlign: 'center', width: 32 } }}
                      sx={{ bgcolor: '#2c2c2c', borderRadius: 1 }}
                    />
                    <IconButton size="small" onClick={() => onIncrementar(idx)}><Add /></IconButton>
                    <IconButton size="small" color="error" onClick={() => onEliminar(idx)}><Delete /></IconButton>
                  </Box>
                </ListItem>
                <Divider sx={{ borderColor: '#333', mb: 1 }} />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Asignado por día (grupos guardados) */}
      {DIAS_SEMANA.filter(d => Array.isArray((JSON.parse(localStorage.getItem('gruposDias'))||{})[d]) && (JSON.parse(localStorage.getItem('gruposDias'))||{})[d].length > 0).length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Asignado por día</Typography>
          <Box sx={{ maxHeight: { sm: 420, md: 560, lg: 700 }, overflowY: 'auto' }}>
            {DIAS_SEMANA.filter(d => Array.isArray((gruposDias||{})[d]) && (gruposDias||{})[d].length > 0).map(dia => (
              <Box
                key={dia}
                sx={{
                  mb: 1,
                  p: 1,
                  bgcolor: '#2a2a2a',
                  borderRadius: 1,
                  border: '1px solid #444'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 600, mr: 1 }}>{dia}</Typography>
                  <Button size="small" color="error" variant="outlined" onClick={() => clearDay(dia)}>
                    Borrar día
                  </Button>
                </Box>

                {gruposDias[dia].map((item, i) => (
                  <Box
                    key={`${dia}-${i}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      py: 0.5
                    }}
                  >
                    <Typography variant="body2" sx={{ pr: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nombre}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => decrementDayItem(dia, i)}><Remove fontSize="small" /></IconButton>
                      <TextField
                        value={item.cantidad}
                        onChange={(e) => changeDayItemQty(dia, i, e.target.value)}
                        size="small"
                        inputProps={{ style: { textAlign: 'center', width: 38 } }}
                        sx={{ bgcolor: '#1e1e1e', borderRadius: 1 }}
                      />
                      <IconButton size="small" onClick={() => incrementDayItem(dia, i)}><Add fontSize="small" /></IconButton>

                      <Typography variant="body2" sx={{ mx: 1 }}>
                        ${Number(item.precio || 0).toFixed(2)}
                      </Typography>

                      <IconButton size="small" color="error" onClick={() => deleteDayItem(dia, i)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/*  Sticky Footer: totales + descuento (fijos al fondo) */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          pt: 1,
          mt: 'auto',
          bgcolor: '#1e1e1e',
          borderTop: '1px solid #333',
          boxShadow: '0 -6px 12px rgba(0,0,0,0.35)',
          zIndex: 5
        }}
      >
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" justifyContent="space-between">
          {/* Totales */}
          <Box textAlign="left" sx={{ minWidth: 260 }}>
            <Typography>Subtotal: ${totalConJornadas.toLocaleString()}</Typography>
            {appliedDiscount > 0 && (
              <>
                <Typography variant="body2">
                  Descuento ({appliedDiscount}%): -${discountAmount.toLocaleString()}
                </Typography>
                <Typography fontWeight="bold">
                  Total: ${finalTotal.toLocaleString()}
                </Typography>
              </>
            )}
            <Typography fontWeight="bold" sx={{ mt: 0.25 }}>
              Total + IVA (21%): ${totalWithIva.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Box>

          {/* Controles de descuento */}
          <Box display="flex" alignItems="center" gap={1} sx={{ ml: 'auto' }}>
            <TextField
              select
              label="Descuento"
              size="small"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              sx={{ bgcolor: '#2c2c2c', borderRadius: 1, minWidth: 140 }}
            >
              <MenuItem value="0">Ninguno</MenuItem>
              <MenuItem value="10">10%</MenuItem>
              <MenuItem value="20">20%</MenuItem>
              <MenuItem value="25">25%</MenuItem>
              <MenuItem value="especial">Especial</MenuItem>
            </TextField>

            <Button variant="contained" size="small" onClick={handleApplyDiscount}>
              Aplicar descuento
            </Button>

            <Button variant="outlined" color="error" size="small" onClick={onClearAll}>
              Borrar todo
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Diálogo Detalles de productos (sin cambios de lógica de días) */}
      <Dialog open={openIncludes} onClose={() => setOpenIncludes(false)} maxWidth="lg" PaperProps={{ sx: { width: '80vw', height: '80vh' } }}>
        <DialogTitle>Detalles de productos</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto' }}>
          {productosSeleccionados.length ? (
            <>
              {/* Controles masivos de jornadas */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  p: 1,
                  border: '1px dashed #666',
                  borderRadius: 1,
                  bgcolor: '#222'
                }}
              >
                <Typography sx={{ mr: 1, fontWeight: 600 }}>Jornadas (todas):</Typography>

                <IconButton size="small" onClick={() => bumpAllJornadas(-1)}>
                  <Remove fontSize="small" />
                </IconButton>

                <TextField
                  size="small"
                  type="number"
                  value={massJornadas}
                  onChange={(e) => setMassJornadas(e.target.value)}
                  inputProps={{ min: 1, style: { textAlign: 'center', width: 70 } }}
                  sx={{ bgcolor: '#1e1e1e', borderRadius: 1 }}
                  placeholder="n°"
                />

                <IconButton size="small" onClick={() => bumpAllJornadas(1)}>
                  <Add fontSize="small" />
                </IconButton>

                <Button
                  size="small"
                  variant="contained"
                  onClick={() => applyAllJornadas(massJornadas)}
                  sx={{ ml: 'auto' }}
                >
                  Aplicar a todas
                </Button>
              </Box>

              {productosSeleccionados.map((item, idx) => {
                const j = jornadasMap[idx] || 1;
                return (
                  <Box
                    key={idx}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      columnGap: 16,
                      alignItems: 'center',
                      mb: 2,
                      p: 1,
                      border: '1px solid #444',
                      borderRadius: 1,
                      bgcolor: '#2a2a2a'
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>{item.nombre}</Typography>
                      <Typography variant="body2">{item.incluye || 'Sin info.'}</Typography>
                    </Box>

                    {/* Jornadas por ítem (selección actual) */}
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Typography variant="caption" color="gray">Jornadas</Typography>
                      <Box display="flex" alignItems="center" sx={{ border: '1px dashed gray', borderRadius: 1, p: '2px 4px', bgcolor: '#1e1e1e' }}>
                        <IconButton size="small" onClick={() =>
                          setJornadasMap(prev => ({ ...prev, [idx]: Math.max(1, (prev[idx]||1)-1) }))
                        }><Remove fontSize="small" /></IconButton>
                        <Typography mx={0.5}>{j}</Typography>
                        <IconButton size="small" onClick={() =>
                          setJornadasMap(prev => ({ ...prev, [idx]: (prev[idx]||1)+1 }))
                        }><Add fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </>
          ) : (
            <Typography>No hay productos seleccionados.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="success" onClick={handleAccept}>Aceptar</Button>
          <Button onClick={() => setOpenIncludes(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
