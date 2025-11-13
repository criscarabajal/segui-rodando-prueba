// src/utils/generarRemito.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png";
import lochImg from "../assets/loch.jpeg";
import { formatearFechaHora } from "./Fecha";

export default function generarRemitoPDF(
  cliente,
  productosSeleccionados = [],
  numeroRemito = "",
  pedidoNumero = "",
  jornadasMap = {},
  comentario = ""
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  const numeroVisible = pedidoNumero || numeroRemito || "";

  // --- HEADER ---
  const drawHeader = () => {
    try {
      const logoW = 100;
      const imgP = doc.getImageProperties(logoImg);
      const logoH = (imgP.height * logoW) / imgP.width;
      doc.addImage(logoImg, "PNG", M, 20, logoW, logoH);

      const lochW = 60;
      const imgL = doc.getImageProperties(lochImg);
      const lochH = (imgL.height * lochW) / imgL.width;
      doc.addImage(lochImg, "JPEG", M + logoW + 10, 20, lochW, lochH);
    } catch {}
    doc.setFontSize(16);
    doc.text(`Remito N°: ${numeroVisible}`, W - M, 40, { align: "right" });
    doc.setFontSize(10);
    const hoy = new Date();
    const emision = `${String(hoy.getDate()).padStart(2,"0")}/${String(hoy.getMonth()+1).padStart(2,"0")}/${hoy.getFullYear()}`;
    doc.text(`Emisión: ${emision}`, W - M, 55, { align: "right" });
    doc.setFillColor(242, 242, 242);
    doc.rect(M, 80, W - 2*M, 18, "F");
    doc.text("CRONOGRAMA DEL PEDIDO", W/2, 93, { align:"center" });
  };

  const drawClientData = () => {
    doc.setFontSize(9);
    doc.text(`CLIENTE: ${cliente?.nombre || "-"}`, M, 110);
    doc.text(
      `RETIRO: ${
        cliente?.fechaRetiro ? formatearFechaHora(new Date(cliente.fechaRetiro)) : "-"
      }`,
      M,
      125
    );
    doc.text(
      `DEVOLUCIÓN: ${
        cliente?.fechaDevolucion ? formatearFechaHora(new Date(cliente.fechaDevolucion)) : "-"
      }`,
      M,
      140
    );
  };

  drawHeader();
  drawClientData();

  // --- DATOS DE DÍAS (gruposDias del localStorage) ---
  let gruposDias = {};
  try {
    const raw = localStorage.getItem("gruposDias");
    gruposDias = raw ? JSON.parse(raw) : {};
  } catch {}

  const headers = ["Cant.", "Detalle", "Serie", "Cod."];
  const body = [];

  const comentarioLinea = (comentario ?? localStorage.getItem("comentario") ?? "").trim();
  if (comentarioLinea) {
    body.push([{
      content: comentarioLinea,
      colSpan: 4,
      styles: { fillColor: [245,245,245], fontStyle: "bold", fontSize: 12 }
    }]);
  }

  const ORDEN_DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  let hayGrupos = Object.values(gruposDias).some(arr => Array.isArray(arr) && arr.length>0);

  if (hayGrupos) {
    ORDEN_DIAS.forEach(dia => {
      const itemsDia = Array.isArray(gruposDias[dia]) ? gruposDias[dia] : [];
      if (!itemsDia.length) return;
      body.push([{
        content: `Día: ${dia}`,
        colSpan: 4,
        styles: { fillColor:[220,230,255], fontStyle:"bold" }
      }]);

      // Agrupar por categoría dentro del día
      const porCat = {};
      itemsDia.forEach(it => {
        const cat = it.categoria || "Sin categoría";
        if (!porCat[cat]) porCat[cat] = [];
        porCat[cat].push(it);
      });

      Object.entries(porCat).forEach(([cat, items])=>{
        body.push([{
          content: cat,
          colSpan: 4,
          styles: { fillColor:[235,235,235], fontStyle:"bold" }
        }]);
        items.forEach(i=>{
          const detalle = [i.nombre];
          if (i.incluye) detalle.push(...String(i.incluye).split("\n"));
          body.push([
            i.cantidad || 1,
            detalle.join("\n"),
            i.serial || "",
            ""
          ]);
        });
      });
    });
  }

  // Si no hay gruposDias o también hay productos sueltos:
  if (productosSeleccionados.length > 0) {
    if (hayGrupos) {
      body.push([{ content:"Otros productos sin día", colSpan:4, styles:{ fillColor:[240,240,240], fontStyle:"bold" } }]);
    }
    productosSeleccionados.forEach(item=>{
      const detalle = [item.nombre];
      if (item.incluye) detalle.push(...String(item.incluye).split("\n"));
      body.push([
        item.cantidad || 1,
        detalle.join("\n"),
        item.serial || "",
        ""
      ]);
    });
  }

  if (body.length===0) {
    body.push([{content:"No hay productos para mostrar.",colSpan:4,styles:{halign:"center"}}]);
  }

  autoTable(doc,{
    startY:160,
    head:[headers],
    body,
    styles:{ fontSize:8, cellPadding:3 },
    headStyles:{ fillColor:[230,230,230] },
    theme:"grid",
    didDrawPage:()=>{ drawHeader(); drawClientData(); }
  });

  const endY = doc.lastAutoTable.finalY + 20;
  const total = productosSeleccionados.reduce((sum,i)=>{
    const q = parseInt(i.cantidad,10)||0;
    const j = parseInt(jornadasMap[i.__idx]||1,10);
    const p = parseFloat(i.precio)||0;
    return sum + q*p*j;
  },0);

  doc.setFontSize(10);
  doc.text(`Total: $${total.toFixed(2)}`, W - M, endY, {align:"right"});

  doc.save(`Remito_${cliente?.nombre||"cliente"}.pdf`);
}
