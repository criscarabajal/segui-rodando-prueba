// src/utils/fetchClientes.js
export async function fetchClientes() {
  const sheetId = "1DhpNyUyM-sTHuoucELtaDP3Ul5-JemSrw7uhnhohMZc";
  const sheetName = "CLIENTES"; // o el nombre real de tu pestaña
  const query = encodeURIComponent("SELECT *");
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=${query}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    //  👉 Imprime los labels y un par de filas
    const cols = json.table.cols.map(col => col.label);
    console.log("📑 Columnas encontradas en la hoja:", cols);
    console.log("📋 Primeras filas crudas:", json.table.rows.slice(0,3));

    const rows = json.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[cols[i]] = cell?.v ?? "";
      });
      return obj;
    });

    return rows;
  } catch (err) {
    console.error("Error fetchClientes:", err);
    return [];
  }
}
