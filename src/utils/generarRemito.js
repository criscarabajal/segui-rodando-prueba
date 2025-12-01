// src/utils/generarRemito.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png";
import lochImg from "../assets/loch.jpeg";
import { formatearFechaHora } from "./Fecha";

export function generarNumeroRemito() {
  const ahora = new Date();
  const dd = String(ahora.getDate()).padStart(2, "0");
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const yy = String(ahora.getFullYear()).slice(-2);
  const fecha = `${dd}${mm}${yy}`;
  const contador = Math.floor(Math.random() * 1000) + 1;
  return `${fecha}-${contador}`;
}

// Helper para el nombre del archivo
const sanitize = (s) =>
  String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 _()-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Helper: asegura que solo usamos string o número para IDs
const toIdString = (val) => {
  if (typeof val === "string" || typeof val === "number") {
    return String(val).trim();
  }
  return "";
};

export default function generarRemitoPDF(
  cliente,
  productosSeleccionados,
  numeroRemito,
  pedidoNumero = "",
  jornadasMap = {},
  comentario = "" // nota libre
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const FOOTER_RESERVED = 230; // espacio reservado al final para totales + pago + firmas

  // 👉 Prioriza el número que viene del input "Pedido N°"
  const remitoEfectivo = toIdString(pedidoNumero) || toIdString(numeroRemito);
  const numeroVisible = remitoEfectivo;

  // ——— HEADER ———
  const drawHeader = () => {
    const imgP = doc.getImageProperties(logoImg);
    const logoW = 100;
    const logoH = (imgP.height * logoW) / imgP.width;
    doc.addImage(logoImg, "PNG", M, 20, logoW, logoH);

    const lochP = doc.getImageProperties(lochImg);
    const lochW = 60;
    const lochH = (lochP.height * lochW) / lochP.width;
    doc.addImage(lochImg, "JPEG", M + logoW + 10, 20, lochW, lochH);

    // Número principal (usa Pedido N° si hay)
    doc.setFontSize(16);
    doc.text(`${numeroVisible}`, W - M, 40, { align: "right" });

    // Pedido N°
    doc.setFontSize(10);
    doc.text(`Pedido N°: ${numeroVisible}`, W - M, 88, { align: "right" });

    doc.setFillColor(242, 242, 242);
    doc.rect(M, 80, W - 2 * M, 18, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("CRONOGRAMA DEL PEDIDO", W / 2, 93, { align: "center" });
  };

  const drawClientData = () => {
    doc.setFontSize(9);
    doc.text(`CLIENTE: ${cliente.nombre || ""} ${cliente.apellido || ""}`, M, 110);
   
    doc.text(
      `RETIRO: ${formatearFechaHora(new Date(cliente.fechaRetiro || ""))}`,
      M,
      160
    );
    doc.text(
      `DEVOLUCIÓN: ${formatearFechaHora(new Date(cliente.fechaDevolucion || ""))}`,
      M + 300,
      160
    );
  };

  // ——— FOOTER (firmas en TODAS las páginas) ———
  const drawFooter = () => {
    const sigY = H - 60; // línea de firmas
    const segment = (W - 2 * M) / 3;

    doc.setFontSize(8);
    ["FIRMA", "ACLARACIÓN", "D.N.I."].forEach((txt, i) => {
      const x = M + i * segment;
      doc.line(x, sigY, x + segment - 20, sigY);
      doc.text(txt, x, sigY + 12);
    });

    doc.setFontSize(6);
    doc.text("guardias no incluidas", M, sigY + 30);
  };

  drawHeader();
  drawClientData();
  drawFooter();

  const cols = [
    { header: "Cantidad", dataKey: "cantidad" },
    { header: "Detalle", dataKey: "detalle" },
    { header: "N° de Serie", dataKey: "serie" },
    { header: "Cod.", dataKey: "cod" }
  ];

  const comentarioLinea = (comentario ?? localStorage.getItem("comentario") ?? "").trim();
  const body = [];

  // Fila de comentario debajo del encabezado
  if (comentarioLinea) {
    body.push([{
      content: comentarioLinea,
      colSpan: 4,
      styles: {
        fillColor: [245, 245, 245],
        fontStyle: "bold",
        fontSize: 14,
        halign: "left",
        valign: "middle",
        cellPadding: { top: 8, bottom: 8, left: 4, right: 4 }
      }
    }]);
  }

  // --- Agrupar por Día/Separador (grupo) y dentro por Categoría ---
  const normalizar = (s) => (String(s || "")).trim();
  const itemsConIdx = productosSeleccionados.map((it, idx) => ({ ...it, __idx: idx }));

  const grupos = itemsConIdx.reduce((acc, it) => {
    const g = normalizar(it.grupo) || "";   // ya NO usamos "Sin grupo"
    if (!acc[g]) acc[g] = [];
    acc[g].push(it);
    return acc;
  }, {});

  const nombresGrupo = Object.keys(grupos);

  nombresGrupo.forEach((gName) => {
    // Encabezado del grupo (día / separador)
    if (gName.trim()) {
      body.push([{
        content: gName,
        colSpan: 4,
        styles: {
          fillColor: [210, 210, 210],
          fontStyle: "bold",
          fontSize: 12,
          halign: "left",
          valign: "middle",
          cellPadding: { top: 6, bottom: 6, left: 4, right: 4 }
        }
      }]);
    }

    // Sub-agrupación por categoría dentro del grupo
    const porCategoria = grupos[gName].reduce((acc, it) => {
      const cat = it.categoria || "Sin categoría";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(it);
      return acc;
    }, {});

    Object.entries(porCategoria).forEach(([cat, items]) => {
      // Encabezado de categoría
      body.push([{
        content: cat,
        colSpan: 4,
        styles: {
          fillColor: [235, 235, 235],
          fontStyle: "bold",
          halign: "left",
          valign: "middle",
          cellPadding: { top: 4, bottom: 4, left: 4, right: 4 }
        }
      }]);

      // Filas de productos
      items.forEach((i) => {
        const lineas = [i.nombre];
        if (i.incluye) lineas.push(...String(i.incluye).split("\n"));
        body.push([i.cantidad, lineas.join("\n"), i.serial || "", ""]);
      });
    });
  });

  autoTable(doc, {
    startY: 180,
    margin: { top: 180, left: M, right: M, bottom: FOOTER_RESERVED },
    head: [cols.map(c => c.header)],
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    theme: "grid",
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    didDrawPage: () => {
      drawHeader();
      drawClientData();
      drawFooter(); // 👉 firmas en cada página
    }
  });

  // Totales (sin IVA, con jornadas y descuento) – anclados en la parte baja de la ÚLTIMA página
  const totalSinIVA = productosSeleccionados.reduce((sum, item, idx) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const j = parseInt(jornadasMap[idx], 10) || 1;
    const precio = parseFloat(item.precio) || 0;
    return sum + qty * precio * j;
  }, 0);

  const appliedDiscount = parseFloat(localStorage.getItem("descuento")) || 0;
  const totalConDescuento = totalSinIVA * (1 - appliedDiscount / 100);

  // Caja de totales y pago en la franja reservada al pie de la ÚLTIMA página
  const boxX = W - M - 150;
  const boxH = appliedDiscount > 0 ? 60 : 40;
  const footerTop = H - FOOTER_RESERVED;

  const totalsBoxY = footerTop + 10; // parte alta del área de totales

  // Caja de totales
  doc.rect(boxX, totalsBoxY, 150, boxH);
  doc.setFontSize(10);
  doc.text("PRECIO s/IVA", boxX + 75, totalsBoxY + 12, { align: "center" });

  if (appliedDiscount > 0) {
    doc.text(`Descuento ${appliedDiscount}%`, boxX + 75, totalsBoxY + 28, { align: "center" });
    doc.text(`$${totalConDescuento.toFixed(2)}`, boxX + 75, totalsBoxY + 44, { align: "center" });
  } else {
    doc.text(`$${totalSinIVA.toFixed(2)}`, boxX + 75, totalsBoxY + 28, { align: "center" });
  }

  // Opciones de pago, debajo de totales
  const pagoBoxY = totalsBoxY + boxH + 10;
  doc.rect(boxX, pagoBoxY, 150, 70);
  doc.text("PAGO", boxX + 75, pagoBoxY + 15, { align: "center" });
  doc.text("Efectivo [  ]", boxX + 5, pagoBoxY + 30);
  doc.text("QR [  ]", boxX + 5, pagoBoxY + 45);

  // Nombre de archivo: REMITO (N°) + Nombre
  const nombreCompleto = sanitize(
    [cliente?.nombre, cliente?.apellido].filter(Boolean).join(" ")
  );
  const filename = `REMITO (${sanitize(remitoEfectivo)}) ${nombreCompleto}.pdf`;
  doc.save(filename);
}
