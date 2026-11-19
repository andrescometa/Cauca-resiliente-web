import axios from 'axios';

// Backend local (npm run dev en cauca-resiliente-api, puerto 3000).
// Cuando se despliegue la web, basta con crear un .env con
// VITE_API_URL=https://cauca-resiliente-api-production.up.railway.app
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 25000,
});

// Adjunta el token JWT en todas las peticiones (necesario para cambiar roles).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cauca_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const CLAVE_SESION = 'cauca_sesion_admin';

export function guardarSesion(token, usuario) {
  localStorage.setItem('cauca_token', token);
  localStorage.setItem(CLAVE_SESION, JSON.stringify({ token, usuario }));
}

export function leerSesion() {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION);
    if (!guardada) return null;
    const sesion = JSON.parse(guardada);
    if (!sesion?.token || !sesion?.usuario) return null;
    return sesion;
  } catch {
    return null;
  }
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
  localStorage.removeItem('cauca_token');
}

export function mensajeError(error) {
  if (error?.response?.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (error?.response?.status === 403) return 'Tu cuenta no tiene permisos de administrador.';
  return (
    error?.response?.data?.mensaje ||
    error?.response?.data?.error ||
    error?.message ||
    'No se pudo conectar con la API'
  );
}

// Roles reales de la colección "roles" de la base de datos.
export const ROLES = [
  { id: 1, nombre: 'Ciudadano' },
  { id: 2, nombre: 'Estudiante' },
  { id: 3, nombre: 'Socorrista' },
  { id: 4, nombre: 'Administrador' },
];

export const nombreRol = (rolId) =>
  ROLES.find((rol) => rol.id === Number(rolId))?.nombre || 'Sin rol';

const textoRol = (usuario) => String(usuario?.rol || '').trim().toLowerCase();

// La API guarda el texto del rol con su propia numeración. Didier, por
// ejemplo, es socorrista con rol_id 2 y texto "socorrista"; por eso miramos
// también el texto para no perder los usuarios que ya existen.
export const esSocorrista = (usuario) =>
  Number(usuario?.rol_id) === 3 || textoRol(usuario) === 'socorrista';

export const esAdmin = (usuario) =>
  Number(usuario?.rol_id) === 4 ||
  Number(usuario?.rol_id) === 5 ||
  ['admin', 'administrador'].includes(textoRol(usuario));

// Rol que mostramos en pantalla, resolviendo los datos antiguos.
export const rolVisible = (usuario) => {
  if (esAdmin(usuario)) return 4;
  if (esSocorrista(usuario)) return 3;
  if (Number(usuario?.rol_id) === 2) return 2;
  return 1;
};

export const nombreRolUsuario = (usuario) => nombreRol(rolVisible(usuario));

export const telefonoWhatsApp = (telefono) => {
  const digitos = String(telefono || '').replace(/\D/g, '');
  if (!digitos) return null;
  return digitos.length === 10 ? `57${digitos}` : digitos;
};

export const enlaceGoogleMaps = (latitud, longitud) =>
  `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;

export const enlaceIndicaciones = (latitud, longitud) =>
  `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`;

export const ESTADOS_SOLICITUD = [
  'Pendiente',
  'En proceso',
  'En camino',
  'En el sitio',
  'Atendido',
  'Finalizado',
  'Cancelado',
];

// Una solicitud sigue activa mientras el rescate no haya terminado.
export const ESTADOS_SOS_ACTIVOS = ['Pendiente', 'En proceso', 'En camino', 'En el sitio'];

export const sosActiva = (sos) => ESTADOS_SOS_ACTIVOS.includes(sos?.estado_solicitud);

// Agrupa las solicitudes activas por socorrista. La API permite asignar
// varias SOS a la misma persona, así que esta es la fuente de verdad para
// saber si está ocupada.
export const activasPorSocorrista = (solicitudes = []) => {
  const mapa = new Map();
  for (const sos of solicitudes) {
    if (!sosActiva(sos) || !sos.socorrista_id) continue;
    const id = Number(sos.socorrista_id);
    if (!mapa.has(id)) mapa.set(id, []);
    mapa.get(id).push(sos);
  }
  return mapa;
};

// Un socorrista solo puede atender un rescate a la vez.
export const estaOcupado = (asignadasPorSocorrista, socorristaId) =>
  (asignadasPorSocorrista.get(Number(socorristaId)) || []).length > 0;

// Disponible = sin rescates activos y sin un estado operativo que lo bloquee.
export const disponibleParaAsignar = (asignadasPorSocorrista, usuario) => {
  if (estaOcupado(asignadasPorSocorrista, usuario?._id)) return false;
  const estado = String(usuario?.estado_operativo || '').trim().toLowerCase();
  return estado === '' || estado === 'disponible';
};

// Texto que ve el administrador en la tarjeta del socorrista.
export const estadoRescate = (asignadas = []) => {
  if (!asignadas.length) return 'Disponible';
  if (asignadas.length > 1) {
    return `Atendiendo ${asignadas.length} rescates`;
  }
  return asignadas[0].estado_solicitud === 'En el sitio'
    ? 'Atendiendo un rescate'
    : 'En camino a un rescate';
};
