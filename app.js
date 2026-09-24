const $ = (id) => document.getElementById(id);
const fmt = (n) =>
  new Intl.NumberFormat(CONFIG.locale, {
    style: "currency",
    currency: CONFIG.moneda,
    minimumFractionDigits: CONFIG.decimales,
    maximumFractionDigits: CONFIG.decimales,
  }).format(n).replace(/[\u202f\u00a0]/g, " ");
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

let productos = load("cot_productos", CONFIG.productosIniciales.map((p, i) => ({ id: "p" + i, ...p })));
let lineas = [];

document.documentElement.style.setProperty("--color", CONFIG.colorPrincipal);
document.title = CONFIG.empresa.nombre + " · Cotizador";
$("titulo").textContent = CONFIG.empresa.nombre;

// ---------- Catálogo ----------
function renderProd() {
  $("tProd").innerHTML =
    "<tr><th>Producto</th><th>Precio</th><th></th></tr>" +
    productos.map((p) =>
      `<tr><td>${esc(p.nombre)}</td>
       <td><input class="pp" data-id="${p.id}" type="number" min="0" step="any" value="${p.precio}"></td>
       <td><button class="x" data-id="${p.id}" aria-label="Eliminar ${esc(p.nombre)}">Quitar</button></td></tr>`
    ).join("");
  $("sProd").innerHTML = productos.map((p) => `<option value="${p.id}">${esc(p.nombre)} (${fmt(p.precio)})</option>`).join("");
  save("cot_productos", productos);
}

$("fProd").onsubmit = (e) => {
  e.preventDefault();
  productos.push({ id: "p" + Date.now(), nombre: $("pNombre").value.trim(), precio: +$("pPrecio").value });
  e.target.reset();
  renderProd();
};
$("tProd").onchange = (e) => {
  if (e.target.classList.contains("pp")) {
    productos.find((p) => p.id === e.target.dataset.id).precio = +e.target.value || 0;
    renderProd();
  }
};
$("tProd").onclick = (e) => {
  if (e.target.classList.contains("x")) {
    productos = productos.filter((p) => p.id !== e.target.dataset.id);
    renderProd();
  }
};

$("bExp").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(productos, null, 2)], { type: "application/json" }));
  a.download = "catalogo.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
$("fImp").onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!Array.isArray(d) || !d.every((p) => p.nombre && !isNaN(p.precio))) throw 0;
      productos = d.map((p, i) => ({ id: "p" + Date.now() + i, nombre: String(p.nombre), precio: +p.precio }));
      renderProd();
    } catch { alert("El archivo no tiene el formato correcto. Usa uno exportado desde esta página."); }
  };
  r.readAsText(f);
  e.target.value = "";
};

// ---------- Cotización ----------
function calc() {
  const sub = lineas.reduce((a, l) => a + l.cant * l.precio, 0);
  const d = Math.min(100, Math.max(0, +$("desc").value || 0));
  const dm = (sub * d) / 100;
  const base = sub - dm;
  let neto, iva, total;
  if (CONFIG.preciosIncluyenIva) { total = base; neto = base / (1 + CONFIG.iva / 100); iva = total - neto; }
  else { neto = base; iva = (base * CONFIG.iva) / 100; total = neto + iva; }
  return { sub, d, dm, neto, iva, total };
}

function filasTotales(t) {
  const f = [["Subtotal", t.sub]];
  if (t.d > 0) f.push([`Descuento (${t.d}%)`, -t.dm]);
  if (CONFIG.iva > 0) { f.push(["Neto", t.neto]); f.push([`IVA (${CONFIG.iva}%)`, t.iva]); }
  return f;
}

function renderCot() {
  $("tCot").innerHTML =
    "<tr><th>Producto</th><th>Cant.</th><th>P. unit.</th><th>Subtotal</th><th></th></tr>" +
    (lineas.length
      ? lineas.map((l, i) =>
          `<tr><td>${esc(l.nombre)}</td>
           <td><input class="qc" data-i="${i}" type="number" min="1" value="${l.cant}"></td>
           <td>${fmt(l.precio)}</td><td>${fmt(l.cant * l.precio)}</td>
           <td><button class="xl" data-i="${i}">Quitar</button></td></tr>`).join("")
      : `<tr><td colspan="5" class="hint">Elige un producto y pulsa “Añadir a la cotización”.</td></tr>`);
  const t = calc();
  $("totales").innerHTML =
    filasTotales(t).map(([k, v]) => `<div><span>${k}</span><span>${fmt(v)}</span></div>`).join("") +
    `<div class="total"><span>Total</span><span>${fmt(t.total)}</span></div>`;
}

$("bAdd").onclick = () => {
  const p = productos.find((x) => x.id === $("sProd").value);
  if (!p) return alert("Primero agrega productos al catálogo.");
  const cant = Math.max(1, +$("qCant").value || 1);
  const ex = lineas.find((l) => l.id === p.id && l.precio === p.precio);
  if (ex) ex.cant += cant; else lineas.push({ id: p.id, nombre: p.nombre, precio: p.precio, cant });
  renderCot();
};
$("tCot").onchange = (e) => {
  if (e.target.classList.contains("qc")) { lineas[e.target.dataset.i].cant = Math.max(1, +e.target.value || 1); renderCot(); }
};
$("tCot").onclick = (e) => {
  if (e.target.classList.contains("xl")) { lineas.splice(+e.target.dataset.i, 1); renderCot(); }
};
$("desc").oninput = renderCot;

// ---------- PDF ----------
$("bPdf").onclick = () => {
  if (!lineas.length) return alert("Añade al menos un producto a la cotización.");
  if (!window.jspdf) return alert("No se pudo cargar la librería de PDF. Revisa tu conexión a internet.");
  const doc = new window.jspdf.jsPDF();
  const E = CONFIG.empresa, t = calc(), col = CONFIG.colorPrincipal;
  const n = load("cot_folio", 0) + 1;
  save("cot_folio", n);
  const folio = CONFIG.prefijoFolio + String(n).padStart(4, "0");
  const hoy = new Date(), vence = new Date(hoy.getTime() + CONFIG.validezDias * 864e5);
  const fecha = (d) => d.toLocaleDateString(CONFIG.locale);

  doc.setFontSize(18); doc.setTextColor(col); doc.text(E.nombre, 14, 18);
  doc.setFontSize(9); doc.setTextColor(90);
  [E.rut, E.direccion, E.telefono, E.email].filter(Boolean).forEach((x, i) => doc.text(x, 14, 24 + i * 4.5));
  doc.setFontSize(15); doc.setTextColor(col); doc.text("COTIZACIÓN", 196, 18, { align: "right" });
  doc.setFontSize(9); doc.setTextColor(90);
  doc.text(`N° ${folio}`, 196, 24, { align: "right" });
  doc.text(`Fecha: ${fecha(hoy)}`, 196, 28.5, { align: "right" });
  doc.text(`Válida hasta: ${fecha(vence)}`, 196, 33, { align: "right" });

  doc.setTextColor(0); doc.setFontSize(10);
  doc.text(`Cliente: ${$("cNombre").value || "-"}`, 14, 48);
  doc.text(`RUT / ID: ${$("cRut").value || "-"}`, 14, 53);
  doc.text(`Contacto: ${$("cContacto").value || "-"}`, 14, 58);

  doc.autoTable({
    startY: 64,
    head: [["Producto", "Cant.", "P. unit.", "Subtotal"]],
    body: lineas.map((l) => [l.nombre, l.cant, fmt(l.precio), fmt(l.cant * l.precio)]),
    headStyles: { fillColor: col },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });

  let y = doc.lastAutoTable.finalY + 10;
  const filas = filasTotales(t);
  if (y + filas.length * 6 + 40 > 280) { doc.addPage(); y = 20; }
  doc.setFontSize(10);
  filas.forEach(([k, v], i) => {
    doc.text(k, 150, y + i * 6, { align: "right" });
    doc.text(fmt(v), 196, y + i * 6, { align: "right" });
  });
  y += filas.length * 6 + 2;
  doc.setFont(undefined, "bold"); doc.setFontSize(12);
  doc.text("TOTAL", 150, y, { align: "right" });
  doc.text(fmt(t.total), 196, y, { align: "right" });
  doc.setFont(undefined, "normal"); doc.setFontSize(9); doc.setTextColor(90);
  if (CONFIG.notas) doc.text(doc.splitTextToSize(CONFIG.notas, 180), 14, y + 14);
  doc.save(`${folio}.pdf`);
};

renderProd();
renderCot();
