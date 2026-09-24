// ============================================================
//  CONFIGURACIÓN — edita solo este archivo para personalizar
// ============================================================
const CONFIG = {
  empresa: {
    nombre: "Mi Empresa",
    rut: "12.345.678-9",
    direccion: "Calle Ejemplo 123, Ciudad",
    telefono: "+56 9 1234 5678",
    email: "contacto@miempresa.cl",
  },

  moneda: "CLP",          // Código ISO: CLP, USD, EUR, MXN, ARS...
  locale: "es-CL",        // Formato de números y fechas
  decimales: 0,           // 0 para CLP, 2 para USD/EUR

  iva: 19,                // % de impuesto. Usa 0 para no mostrar IVA
  preciosIncluyenIva: false, // true = los precios del catálogo ya traen IVA

  validezDias: 15,        // Días de validez de la cotización
  prefijoFolio: "COT-",   // Ej: COT-0001
  colorPrincipal: "#1f4e79", // Color del PDF y de la página

  notas: "Precios sujetos a cambio sin previo aviso. Se requiere 50% de anticipo.",

  // Productos con los que parte el catálogo (solo la primera vez que se abre)
  productosIniciales: [
    { nombre: "Plano A1 blanco y negro", precio: 2500 },
    { nombre: "Plano A0 blanco y negro", precio: 4500 },
    { nombre: "Afiche A2 papel fotográfico", precio: 6900 },
  ],
};
