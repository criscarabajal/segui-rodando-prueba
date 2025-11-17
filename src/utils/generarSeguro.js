// src/utils/generarSeguro.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png";
import lochImg from "../assets/loch.jpeg";
import { formatearFechaHora } from "./Fecha";

export function generarNumeroSeguro() {
  const ahora = new Date();
  const dd = String(ahora.getDate()).padStart(2, "0");
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const yy = String(ahora.getFullYear()).slice(-2);
  const fecha = `${dd}${mm}${yy}`;
  const contador = Math.floor(Math.random() * 1000) + 1;
  return `${fecha}-S${contador}`;
}

export default function generarSeguroPDF(
  cliente,
  productosSeleccionados,
  atendidoPor,
  numeroSeguro,
  pedidoNumero = "",
  jornadasMap = {}
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;

  // Valores seguros para número de pedido / seguro (evita [object Object])
  const pedidoRef =
    typeof pedidoNumero === "string" || typeof pedidoNumero === "number"
      ? String(pedidoNumero)
      : "";
  const seguroRef =
    typeof numeroSeguro === "string" || typeof numeroSeguro === "number"
      ? String(numeroSeguro)
      : "";

  const referencia = pedidoRef || seguroRef || "sin-numero";

  // —— HEADER ——
  const drawHeader = () => {
    const imgP = doc.getImageProperties(logoImg);
    const logoW = 100;
    const logoH = (imgP.height * logoW) / imgP.width;
    doc.addImage(logoImg, "PNG", M, 20, logoW, logoH);

    const imgL = doc.getImageProperties(lochImg);
    const lochW = 60;
    const lochH = (imgL.height * lochW) / imgL.width;
    doc.addImage(lochImg, "JPEG", M + logoW + 10, 20, lochW, lochH);

    doc.setFontSize(16);
    doc.text(`${seguroRef}`, W - M, 40, { align: "right" });

    doc.setFontSize(10);
    doc.text(`Pedido N°: ${pedidoRef || "-"}`, W - M, 88, { align: "right" });

    doc.setFillColor(242, 242, 242);
    doc.rect(M, 80, W - 2 * M, 18, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("SEGURO DEL PEDIDO", W / 2, 93, { align: "center" });
  };

  // —— CLIENT DATA ——
  const drawClientData = () => {
    const nombre = cliente?.nombre || "";
    const apellido = cliente?.apellido || "";
    const nombreCompleto = [nombre, apellido].filter(Boolean).join(" ");

    doc.setFontSize(9);
    doc.text(`CLIENTE: ${nombreCompleto}`, M, 110);

    doc.text(
      `RETIRO: ${formatearFechaHora(new Date(cliente.fechaRetiro))}`,
      M,
      160
    );
    doc.text(
      `DEVOLUCIÓN: ${formatearFechaHora(new Date(cliente.fechaDevolucion))}`,
      M + 300,
      160
    );
  };

  drawHeader();
  drawClientData();

  // —— TABLE ——
  const cols = [
    { header: "Detalle", dataKey: "detalle" },
    { header: "N° de Serie", dataKey: "serie" },
    { header: "Cant.", dataKey: "cantidad" },
    { header: "Valor reposición", dataKey: "valorReposicion" },
    { header: "Parcial valor de reposición", dataKey: "parcial" },
  ];

  const grupos = {};
  productosSeleccionados.forEach((item, idx) => {
    const cat = item.categoria || "Sin categoría";
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push({ ...item, __idx: idx });
  });

  const body = [];
  Object.entries(grupos).forEach(([cat, items]) => {
    body.push({ _category: cat });
    items.forEach(i => {
      const qty = parseInt(i.cantidad, 10) || 0;
      const valorRep = parseFloat(i.valorReposicion) || 0;
      const parcialVal = qty * valorRep;

      const líneas = [i.nombre];
      if (i.incluye) líneas.push(...i.incluye.split("\n"));

      body.push({
        detalle: líneas.join("\n"),
        serie: i.serial || "",
        cantidad: qty,
        valorReposicion: `${valorRep.toFixed(0)} USD`,
        parcial: `${parcialVal.toFixed(0)} USD`,
      });
    });
  });

  autoTable(doc, {
    startY: 180,
    margin: { top: 180, left: M, right: M },
    head: [cols.map(c => c.header)],
    body: body.map(row =>
      row._category
        ? [
            {
              content: row._category,
              colSpan: cols.length,
              styles: { fillColor: [235, 235, 235], fontStyle: "bold" }
            }
          ]
        : cols.map(c => row[c.dataKey])
    ),
    styles: { fontSize: 8, cellPadding: 2 },
    theme: "grid",
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    didParseCell: data => {
      if (data.row.raw[0] && data.row.raw[1] === undefined) {
        data.cell.colSpan = cols.length;
        data.cell.styles.fillColor = [235, 235, 235];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: () => { drawHeader(); drawClientData(); }
  });

  // —— FOOTER TOTAL ——
  const totalRep = productosSeleccionados.reduce((sum, item) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const valorRep = parseFloat(item.valorReposicion) || 0;
    return sum + qty * valorRep;
  }, 0);
  const totalText = `VALOR TOTAL DE REPOSICION EN DÓLAR OFICIAL (BCRA) = USD ${totalRep.toFixed(0)}`;
  const totalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text(totalText, M, totalY);

  // —— FOOTER NOTE ——
  const noteY = totalY + 20;
  doc.setFontSize(8);
  doc.text(
    "- ES RESPONSABILIDAD DEL CLIENTE EL COMPLETO CHEQUEO DE LOS EQUIPOS AL RETIRAR",
    M,
    noteY
  );
  doc.text(
    "- El pago deberá efectivizarse en la moneda detallada anteriormente o en su equivalente en pesos calculado al tipo de cambio vigente por el Banco de la Nación Argentina (tipo vendedor), al cierre del día hábil inmediato anterior al efectivo.",
    M,
    noteY + 14,
    { maxWidth: W - 2 * M }
  );

  // —— NOMBRE DE ARCHIVO (sin undefined / sin [object Object]) ——
  const nombre = cliente?.nombre || "";
  const apellido = cliente?.apellido || "";
  const nombreArchivoCliente =
    [nombre, apellido].filter(Boolean).join("_") || "cliente";

  doc.save(`Seguro_${nombreArchivoCliente}_${referencia}.pdf`);
}
