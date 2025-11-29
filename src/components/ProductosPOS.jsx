// src/components/ProductosPOS.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  useTheme,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Slider from 'react-slick';
import Carrito from './Carrito';
import BottomNav from './BottomNav';
import { fetchProductos } from '../utils/fetchProductos';
import generarRemitoPDF from '../utils/generarRemito';
import generarPresupuestoPDF from '../utils/generarPresupuesto';
import generarSeguroPDF from '../utils/generarSeguro';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import logoImg from '../assets/logo.png';

const defaultCats = [
  'LUCES',
  'GRIPERIA',
  'TELAS',
  'CAMARAS',
  'LENTES',
  'BATERIAS',
  'MONITOREO',
  'FILTROS',
  'ACCESORIOS DE CAMARA',
  'SONIDO',
];

export default function ProductosPOS() {
  const theme = useTheme();
  const HEADER = 72;
  const FOOTER = 72;

  const CARD_HEIGHT = 180;
  const ROW_GAP = 16;
  const SLIDES_PER_ROW = 5;

  // ===== Pedido / separador =====
  const [pedidoNumero, setPedidoNumero] = useState('');
  const [grupoActual, setGrupoActual] = useState(''); // Día/separador activo

  // ===== Categorías nav (editables) =====
  const [categoriasNav, setCategoriasNav] = useState(() => {
    const saved = localStorage.getItem('categoriasNav');
    return saved ? JSON.parse(saved) : defaultCats;
  });
  useEffect(() => {
    localStorage.setItem('categoriasNav', JSON.stringify(categoriasNav));
  }, [categoriasNav]);

  const [openEditCats, setOpenEditCats] = useState(false);
  const handleOpenEditCats = () => setOpenEditCats(true);
  const handleCloseEditCats = () => setOpenEditCats(false);
  const handleCatChange = (idx, val) =>
    setCategoriasNav((c) => {
      const cc = [...c];
      cc[idx] = val;
      return cc;
    });

  // ===== Productos (fetch + agrupado por nombre con seriales) =====
  const [productosRaw, setProductosRaw] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    fetchProductos()
      .then((raw) => {
        setProductosRaw(raw);
        const grouped = raw.reduce((acc, p) => {
          if (!acc[p.nombre]) {
            acc[p.nombre] = {
              nombre: p.nombre,
              precio: p.precio,
              categoria: p.categoria,
              subcategoria: p.subcategoria,
              incluye: p.incluye,
              seriales: [],
              valorReposicion: p.valorReposicion,
            };
          }
          if (p.serial) acc[p.nombre].seriales.push(p.serial);
          if (
            typeof p.valorReposicion === 'number' &&
            p.valorReposicion > (acc[p.nombre].valorReposicion || 0)
          ) {
            acc[p.nombre].valorReposicion = p.valorReposicion;
          }
          return acc;
        }, {});
        setProductos(Object.values(grouped));
      })
      .finally(() => setIsSliding(false));
  }, []);

  // ===== Filtros =====
  const [buscar, setBuscar] = useState('');
  const [favorita, setFavorita] = useState('');
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    setSugerencias(
      productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
          (!favorita || p.categoria === favorita)
      )
    );
  }, [productos, buscar, favorita]);

  // ===== Slider =====
  const [rows, setRows] = useState(1);
  const sliderRef = useRef(null);
  useEffect(() => setIsSliding(false), []);
  const calcularFilas = useCallback(() => {
    const alto = window.innerHeight - HEADER - FOOTER - ROW_GAP;
    setRows(Math.max(1, Math.floor(alto / (CARD_HEIGHT + ROW_GAP))));
  }, [HEADER, FOOTER]);

  useEffect(() => {
    calcularFilas();
    window.addEventListener('resize', calcularFilas);
    return () => window.removeEventListener('resize', calcularFilas);
  }, [calcularFilas]);

  useEffect(() => {
    sliderRef.current?.slickGoTo(0);
  }, [buscar, favorita, rows, sugerencias.length]);

  const settings = {
    arrows: true,
    infinite: false,
    rows,
    slidesPerRow: SLIDES_PER_ROW,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 600,
    cssEase: 'ease-in-out',
    beforeChange: (o, n) => o !== n && setIsSliding(true),
    afterChange: () => setIsSliding(false),
  };

  // ===== Carrito =====
  const [carrito, setCarrito] = useState(() =>
    JSON.parse(localStorage.getItem('carrito') || '[]')
  );
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarritoConSerial = (prod, serial) => {
    setCarrito((c) => [
      ...c,
      {
        ...prod,
        serial,
        cantidad: 1,
        grupo: (grupoActual || '').trim(),
        valorReposicion: prod.valorReposicion,
      },
    ]);
  };

  // ===== Diálogo de serial =====
  const [openSerialDialog, setOpenSerialDialog] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [selectedSerial, setSelectedSerial] = useState('');

  const handleCardClick = (prod) => {
    if (isSliding) return;

    const seriales = Array.isArray(prod.seriales) ? prod.seriales : [];
    if (seriales.length === 0) {
      agregarAlCarritoConSerial(prod, '');
      return;
    }
    if (seriales.length === 1) {
      agregarAlCarritoConSerial(prod, seriales[0]);
      return;
    }
    setPendingProduct(prod);
    setSelectedSerial(seriales[0] || '');
    setOpenSerialDialog(true);
  };

  const handleConfirmSerial = () => {
    if (pendingProduct) {
      agregarAlCarritoConSerial(pendingProduct, selectedSerial || '');
    }
    setOpenSerialDialog(false);
    setPendingProduct(null);
    setSelectedSerial('');
  };

  const handleCloseSerialDialog = () => {
    setOpenSerialDialog(false);
    setPendingProduct(null);
    setSelectedSerial('');
  };

  // ===== Jornadas =====
  const [jornadasMap, setJornadasMap] = useState({});

  // ===== Cliente =====
  const initialClienteForm = {
    nombre: '',
    fechaRetiro: '',
    fechaDevolucion: '',
  };

  const [openCliente, setOpenCliente] = useState(false);
  const handleOpenCliente = () => setOpenCliente(true);
  const handleCloseCliente = () => setOpenCliente(false);

  const [clienteForm, setClienteForm] = useState(initialClienteForm);
  const [cliente, setCliente] = useState({}); // se mantiene pero ya no va a localStorage

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setClienteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCliente = () => {
    // Ya no es obligatorio completar nombre/fechas para cerrar
    setCliente(clienteForm);
    setOpenCliente(false);
  };

  // ===== Generar PDFs =====
  const handleGenerarRemito = () => {
    const nro = String(pedidoNumero || '').trim();
    if (!nro) {
      alert('Ingresá un "Pedido N°" en el carrito para generar el Remito.');
      return;
    }

    const clienteParaPDF = {
      ...clienteForm,
      nombre: (clienteForm.nombre || '').trim(),
    };

    generarRemitoPDF(clienteParaPDF, carrito, nro, nro, jornadasMap);
  };

  const handleGenerarPresupuesto = () => {
    const nro = String(pedidoNumero || '').trim();
    if (!nro) {
      alert('Ingresá un "Pedido N°" en el carrito para generar el Presupuesto.');
      return;
    }
    const fecha = new Date().toLocaleDateString('es-AR');

    const clienteParaPDF = {
      ...clienteForm,
      nombre: (clienteForm.nombre || '').trim(),
    };

    // (cliente, productosSeleccionados, jornadasMap, fechaEmision, pedidoNumero)
    generarPresupuestoPDF(clienteParaPDF, carrito, jornadasMap, fecha, nro);

    // 👇 Reiniciar contador de jornadas en "Detalles de productos"
    setJornadasMap({});
  };

  const handleGenerarSeguro = () => {
    const nro = String(pedidoNumero || '').trim();
    if (!nro) {
      alert('Ingresá un "Pedido N°" en el carrito para generar el Seguro.');
      return;
    }
    const fecha = new Date().toLocaleDateString('es-AR');

    const clienteParaPDF = {
      ...clienteForm,
      nombre: (clienteForm.nombre || '').trim(),
    };

    // (cliente, productosSeleccionados, atendidoPor, numeroSeguro, pedidoNumero, jornadasMap)
    generarSeguroPDF(clienteParaPDF, carrito, fecha, nro, nro, jornadasMap);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'grey.900',
      }}
    >
      {/* HEADER: nombre + fechas (izq) + buscador (centro) + logo (der) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER,
          bgcolor: 'grey.900',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          zIndex: 1200,
        }}
      >
        <Box sx={{ width: '100%', position: 'relative', height: '100%' }}>
          {/* Nombre + fechas (izquierda) */}
          <Box
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TextField
              size="small"
              variant="outlined"
              label="Nombre"
              name="nombre"
              value={clienteForm.nombre || ''}
              onChange={handleClienteChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'grey.800',
                borderRadius: 1,
                '& .MuiOutlinedInput-input': { color: '#fff' },
                '& .MuiInputLabel-root': { color: '#bbb' },
                minWidth: 180,
              }}
            />

            <TextField
              size="small"
              variant="outlined"
              label="Fecha retiro"
              name="fechaRetiro"
              type="datetime-local"
              value={clienteForm.fechaRetiro || ''}
              onChange={handleClienteChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'grey.800',
                borderRadius: 1,
                '& .MuiOutlinedInput-input': { color: '#fff' },
                '& .MuiInputLabel-root': { color: '#bbb' },
                minWidth: 210,
              }}
            />

            <TextField
              size="small"
              variant="outlined"
              label="Fecha devolución"
              name="fechaDevolucion"
              type="datetime-local"
              value={clienteForm.fechaDevolucion || ''}
              onChange={handleClienteChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'grey.800',
                borderRadius: 1,
                '& .MuiOutlinedInput-input': { color: '#fff' },
                '& .MuiInputLabel-root': { color: '#bbb' },
                minWidth: 210,
              }}
            />
          </Box>

          {/* Buscador (centro) */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <TextField
              size="small"
              variant="outlined"
              placeholder="Buscar producto"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: '28vw', bgcolor: 'grey.800', borderRadius: 1 }}
            />
          </Box>

          {/* Logo (derecha) */}
          <Box
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <img
              src={logoImg}
              alt="logo"
              style={{
                height: '70px',
                padding: '8px 0',
                opacity: 0.9,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Carrito */}
      <Box
        sx={{
          position: 'fixed',
          top: HEADER,
          bottom: FOOTER,
          left: 0,
          width: '30vw',
          p: 2,
          bgcolor: 'grey.900',
          overflowY: 'auto',
          zIndex: 1000,
        }}
      >
        <Carrito
          productosSeleccionados={carrito}
          onIncrementar={(i) => {
            const c = [...carrito];
            c[i].cantidad++;
            setCarrito(c);
          }}
          onDecrementar={(i) => {
            const c = [...carrito];
            if (c[i].cantidad > 1) c[i].cantidad--;
            setCarrito(c);
          }}
          onCantidadChange={(i, v) => {
            const c = [...carrito];
            c[i].cantidad = v === '' ? '' : Math.max(1, parseInt(v, 10));
            setCarrito(c);
          }}
          onEliminar={(i) => {
            const c = [...carrito];
            c.splice(i, 1);
            setCarrito(c);

            // 🔁 Reindexar jornadasMap para que los índices sigan matcheando
            setJornadasMap((prev) => {
              const next = {};
              Object.keys(prev).forEach((kStr) => {
                const k = parseInt(kStr, 10);
                if (Number.isNaN(k)) return;
                if (k < i) {
                  next[k] = prev[k]; // mismos índices antes del borrado
                } else if (k > i) {
                  next[k - 1] = prev[k]; // corremos uno hacia atrás
                }
                // si k === i lo saltamos (era el que se borró)
              });
              return next;
            });
          }}
          jornadasMap={jornadasMap}
          setJornadasMap={setJornadasMap}
          pedidoNumero={pedidoNumero}
          setPedidoNumero={setPedidoNumero}
          grupoActual={grupoActual}
          setGrupoActual={setGrupoActual}
          onClearAll={() => {
            setCarrito([]);
            setJornadasMap({}); // 🧹 limpias también las jornadas
          }}
        />
      </Box>

      {/* Productos + filtros */}
      <Box
        sx={{
          position: 'fixed',
          top: HEADER,
          bottom: FOOTER,
          left: '30vw',
          right: 0,
          bgcolor: 'grey.800',
          overflowY: 'auto',
          zIndex: 900,
        }}
      >
        {/* Categorías */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1300,
            px: 1,
            py: 1,
            bgcolor: 'grey.800',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Button
              size="small"
              variant={!favorita ? 'contained' : 'outlined'}
              onClick={() => setFavorita('')}
            >
              TODAS
            </Button>

            {categoriasNav.map((cat, i) => (
              <Button
                key={i}
                size="small"
                variant={favorita === cat ? 'contained' : 'outlined'}
                onClick={() =>
                  setFavorita(favorita === cat ? '' : cat)
                }
              >
                {cat}
              </Button>
            ))}

            <IconButton
              size="small"
              sx={{ ml: 'auto' }}
              onClick={handleOpenEditCats}
            >
              <MoreVertIcon sx={{ color: '#fff' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Slider de productos */}
        <Slider ref={sliderRef} {...settings}>
          {sugerencias.map((p, i) => (
            <Box key={i} sx={{ px: 1, pb: `${ROW_GAP}px` }}>
              <Box
                onClick={() => handleCardClick(p)}
                sx={{
                  height: CARD_HEIGHT,
                  bgcolor: 'grey.700',
                  borderRadius: 1,
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: isSliding ? 'not-allowed' : 'pointer',
                  opacity: isSliding ? 0.6 : 1,
                  pointerEvents: isSliding ? 'none' : 'auto',
                  '&:hover': {
                    bgcolor: 'grey.600',
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.2,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}
                >
                  {p.nombre}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  ${(parseFloat(p.precio) || 0).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Editar categorías */}
      <Dialog open={openEditCats} onClose={handleCloseEditCats}>
        <DialogTitle>Editar categorías</DialogTitle>
        <DialogContent>
          {categoriasNav.map((cat, idx) => (
            <TextField
              key={idx}
              fullWidth
              size="small"
              variant="outlined"
              label={`Categoría ${idx + 1}`}
              value={cat}
              onChange={(e) => handleCatChange(idx, e.target.value)}
              sx={{ mb: 2 }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditCats} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

     

      {/* Diálogo selección de serie */}
      <Dialog open={openSerialDialog} onClose={handleCloseSerialDialog}>
        <DialogTitle>Seleccionar N° de Serie</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {pendingProduct?.nombre}
          </Typography>
          <RadioGroup
            value={selectedSerial}
            onChange={(e) => setSelectedSerial(e.target.value)}
          >
            {(pendingProduct?.seriales || []).map((s, idx) => (
              <FormControlLabel
                key={idx}
                value={s}
                control={<Radio />}
                label={s}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSerialDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSerial}
            disabled={!selectedSerial}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom bar */}
      <BottomNav
        onOpenCliente={handleOpenCliente}
        onGenerarRemito={handleGenerarRemito}
        onGenerarPresupuesto={handleGenerarPresupuesto}
        onGenerarSeguro={handleGenerarSeguro}
        onCancelar={() => {
          if (
            window.confirm(
              '¿Seguro que querés cancelar TODO el pedido? Esta acción no se puede deshacer.'
            )
          ) {
            setCarrito([]);
            setCliente({});
            setClienteForm(initialClienteForm);
            setPedidoNumero('');
            setJornadasMap({});
            setGrupoActual('');
            localStorage.clear();
            window.location.reload();
          }
        }}
      />
    </Box>
  );
}
