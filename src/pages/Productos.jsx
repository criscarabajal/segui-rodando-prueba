// src/pages/Productos.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProductos } from "../utils/fetchProductos";
import { Trash2 } from "lucide-react";
import generarRemitoPDF, { generarNumeroRemito } from "../utils/generarRemito";

export default function Productos() {
  const navigate = useNavigate();
  const location = useLocation();

  const datosCliente = JSON.parse(localStorage.getItem("cliente")) || {
    nombre: "",
    apellido: "",
    dni: "",
    atendidoPor: "",
    fechaRetiro: "",
    fechaDevolucion: "",
  };

  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState("");
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    fetchProductos().then(setProductos);
  }, []);

  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  const subcategorias = [
    ...new Set(
      productos
        .filter((p) => p.categoria === categoriaSeleccionada)
        .map((p) => p.subcategoria)
        .filter(Boolean)
    ),
  ];

  useEffect(() => {
    const filtroNombre = nombreBuscado.toLowerCase();
    const coincidencias = productos.filter((p) => {
      const nombreOk = (p.nombre || "").toLowerCase().includes(filtroNombre);
      const categoriaOk = !categoriaSeleccionada || p.categoria === categoriaSeleccionada;
      const subcategoriaOk = !subcategoriaSeleccionada || p.subcategoria === subcategoriaSeleccionada;
      const alquilableOk = (p.alquilable || "").toUpperCase() === "SI";
      return nombreOk && categoriaOk && subcategoriaOk && alquilableOk;
    });

    setSugerencias(nombreBuscado.trim() === "" ? [] : coincidencias);
  }, [nombreBuscado, categoriaSeleccionada, subcategoriaSeleccionada, productos]);

  const handleAgregarProducto = (producto) => {
    const yaEsta = seleccionados.find((p) => p.nombre === producto.nombre);
    if (yaEsta) return;
    setSeleccionados((prev) => [...prev, { ...producto, cantidad: 1 }]);
    setNombreBuscado("");
    setSugerencias([]);
  };

  const handleCantidadChange = (index, cantidad) => {
    const actualizados = [...seleccionados];
    actualizados[index].cantidad = parseInt(cantidad);
    setSeleccionados(actualizados);
  };

  const handleEliminarProducto = (index) => {
    const actualizados = [...seleccionados];
    actualizados.splice(index, 1);
    setSeleccionados(actualizados);
  };

  const borrarTodo = () => setSeleccionados([]);

  const handleGenerarRemito = () => {
    const numeroRemito = generarNumeroRemito();
    const fecha = new Date().toLocaleDateString("es-AR");

    const productosValidos = seleccionados.filter(
      (item) => typeof item.precio === "number" && !isNaN(item.precio)
    );

    if (productosValidos.length === 0) {
      alert("No hay productos válidos para generar el remito.");
      return;
    }

    generarRemitoPDF(
      datosCliente,
      productosValidos,
      datosCliente.atendidoPor,
      numeroRemito,
      fecha
    );

    alert(`Remito generado correctamente: ${numeroRemito}`);
  };

  return (
    <div className="p-4 bg-zinc-900 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-4">Buscar y Agregar Productos</h2>

      <div className="mb-4 italic">
        Cliente: <strong>{datosCliente.nombre} {datosCliente.apellido}</strong> | DNI: {datosCliente.dni} | Atendido por: {datosCliente.atendidoPor}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar producto por nombre"
          value={nombreBuscado}
          onChange={(e) => setNombreBuscado(e.target.value)}
          className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 w-full md:w-auto"
        />

        <select
          value={categoriaSeleccionada}
          onChange={(e) => {
            setCategoriaSeleccionada(e.target.value);
            setSubcategoriaSeleccionada("");
          }}
          className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={subcategoriaSeleccionada}
          onChange={(e) => setSubcategoriaSeleccionada(e.target.value)}
          disabled={!categoriaSeleccionada}
          className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700"
        >
          <option value="">Todas las subcategorías</option>
          {subcategorias.map((sub, idx) => (
            <option key={idx} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {sugerencias.length > 0 ? (
        <div className="mb-8">
          <h4 className="font-semibold mb-2">Sugerencias:</h4>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {sugerencias.map((p, i) => (
              <div
                key={i}
                className="pb-4 border-b border-zinc-700"
              >
                <strong>{p.nombre}</strong> - {p.categoria} - {p.subcategoria} - ${p.precio}<br />
                Incluye: {p.incluye || "Nada"}<br />
                <button
                  onClick={() => handleAgregarProducto(p)}
                  className="mt-2 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded"
                >
                  + Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        nombreBuscado && (
          <div className="mb-8 text-sm text-zinc-400">
            <p>No se encontraron productos con ese nombre.</p>
          </div>
        )
      )}

      <hr className="my-8 border-zinc-600" />

      <h3 className="text-xl font-semibold mb-4">Productos Seleccionados:</h3>
      {seleccionados.length === 0 && <p>No hay productos en el pedido.</p>}
      {seleccionados.map((prod, i) => (
        <div key={i} className="mb-4">
          <strong>{prod.nombre}</strong> - {prod.categoria} - {prod.subcategoria}<br />
          Cantidad:{" "}
          <input
            type="number"
            min="1"
            value={prod.cantidad}
            onChange={(e) => handleCantidadChange(i, e.target.value)}
            className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 w-20 mt-1"
          /><br />
          <button
            onClick={() => handleEliminarProducto(i)}
            className="mt-2 px-3 py-1 bg-zinc-800 text-red-400 hover:text-red-300 rounded flex items-center gap-2"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      ))}

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={borrarTodo}
          className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600"
        >
          Borrar todo
        </button>

        {seleccionados.length > 0 && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
            onClick={handleGenerarRemito}
          >
            Generar Remito PDF
          </button>
        )}

        <button
          onClick={() => navigate("/cliente")}
          className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
