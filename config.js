// ============================================================
//  CONFIGURACIÓN — edita solo este archivo para personalizar
// ============================================================
const CONFIG = {
  empresa: {
    nombre: "Taurus Proyect",
    rut: "78.192.628-0",
    direccion: "El Litre 2162, La Serena",
    telefono: "+56 9 9580 0495",
    email: "taurus.atacama@gmail.com",
  },

  moneda: "CLP",          // Código ISO: CLP, USD, EUR, MXN, ARS...
  locale: "es-CL",        // Formato de números y fechas
  decimales: 0,           // 0 para CLP, 2 para USD/EUR

  iva: 19,                // % de impuesto. Usa 0 para no mostrar IVA
  preciosIncluyenIva: false, // true = los precios del catálogo ya traen IVA

  validezDias: 5,        // Días de validez de la cotización
  prefijoFolio: "COT-",   // Ej: COT-0001
  colorPrincipal: "#1f4e79", // Color del PDF y de la página

  notas: "Precios sujetos a cambio sin previo aviso. Se requiere 50% de anticipo.",

  // Productos con los que parte el catálogo (solo la primera vez que se abre)
  productosIniciales: [
    { nombre: "Plano A1 B/N", precio: 1000 },
    { nombre: "Plano A1 LINEA COLOR", precio: 1500 },
    { nombre: "Plano A1 IMAGEN COLOR", precio: 3000 },
  ],
};
