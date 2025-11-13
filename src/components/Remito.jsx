// src/utils/generarRemito.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatearFechaHora } from "./Fecha";

export function generarNumeroRemito() {
  const ahora = new Date();
  const timestamp = ahora.getTime();
  return `SR-${timestamp}`;
}

export default function generarRemitoPDF(
  cliente,
  productosSeleccionados,
  atendidoPor,
  numeroRemito,
  fechaEmision
) {
  const doc = new jsPDF();

  // Encabezado
  doc.setFontSize(18);
  doc.text("Seguí Rodando", 14, 20);
  doc.setFontSize(12);
  doc.text(`REMITO ${numeroRemito}`, 200 - 14, 20, { align: "right" });
  doc.line(14, 22, 200, 22);

  // Datos del cliente
  doc.setFontSize(10);
  let y = 30;
  doc.text(`Nombre: ${cliente.nombre} ${cliente.apellido}`, 14, y); 
  y += 6;
  doc.text(`DNI: ${cliente.dni}`, 14, y); 
  y += 6;
  doc.text(`Atendido por: ${atendidoPor}`, 14, y); 
  y += 6;
  if (cliente.fechaRetiro) {
    doc.text(`Retiro: ${formatearFechaHora(new Date(cliente.fechaRetiro))}`, 14, y);
    y += 6;
  }
  if (cliente.fechaDevolucion) {
    doc.text(`Devolución: ${formatearFechaHora(new Date(cliente.fechaDevolucion))}`, 14, y);
    y += 6;
  }
  doc.text(`Fecha emisión: ${fechaEmision}`, 14, y);
  y += 10;

  // Agrupar productos por Categoría y Subcategoría
  const groups = {};
  productosSeleccionados.forEach((item) => {
    const cat = item.categoria || "Sin categoría";
    const sub = item.subcategoria || "Sin subcategoría";
    if (!groups[cat]) groups[cat] = {};
    if (!groups[cat][sub]) groups[cat][sub] = [];
    groups[cat][sub].push(item);
  });

  const bodyRows = [];
  Object.entries(groups).forEach(([cat, subGroups]) => {
    Object.entries(subGroups).forEach(([sub, items]) => {
      bodyRows.push([
        {
          content: `Categoría: ${cat} - Subcategoría: ${sub}`,
          colSpan: 6,
          styles: { halign: 'left', fillColor: false, textColor: 0, fontStyle: 'bold' }
        }
      ]);
      items.forEach((item) => {
        bodyRows.push([
          item.nombre,
          item.categoria,
          item.subcategoria,
          item.cantidad,
          `$${parseFloat(item.precio || 0).toFixed(2)}`,
          `$${(parseFloat(item.precio || 0) * item.cantidad).toFixed(2)}`
        ]);
      });
    });
  });

  autoTable(doc, {
    startY: y,
    head: [["Producto", "Categoría", "Subcategoría", "Cantidad", "Precio Unitario", "Subtotal"]],
    body: bodyRows,
    theme: "grid",
    headStyles: { fillColor: false, textColor: 0, fontStyle: 'bold' },
    styles: { fontSize: 3 },
  });

  const total = productosSeleccionados.reduce(
    (acc, item) => acc + parseFloat(item.precio || 0) * item.cantidad,
    0
  );
  const finalY = doc.lastAutoTable?.finalY || y + 10;
  doc.setFontSize(3);
  doc.text(`TOTAL: $${total.toFixed(2)}`, 150, finalY + 10);

  // Leer descuento desde localStorage y aplicarlo
  const discountStored = localStorage.getItem('descuento');
  console.log("Valor descuento en remito:", discountStored); // Depuración
  let discountApplied = 0;
  if (discountStored) {
    discountApplied = parseFloat(discountStored);
    if (isNaN(discountApplied)) discountApplied = 0;
  }
  if (discountApplied > 0) {
    const discountAmount = total * (discountApplied / 100);
    const finalTotal = total - discountAmount;
    // Ajustamos la posición de estas líneas
    doc.text(`Descuento (${discountApplied}%): -$${discountAmount.toFixed(2)}`, 14, finalY + 20);
    doc.text(`TOTAL FINAL: $${finalTotal.toFixed(2)}`, 14, finalY + 30);
  }

  const yPie = doc.lastAutoTable?.finalY || finalY + 40;
  doc.line(14, yPie + 10, 80, yPie + 10);
  doc.text("Firma del cliente", 14, yPie + 15);

  doc.save(`remito-${cliente.apellido}-${cliente.nombre}.pdf`);
}
