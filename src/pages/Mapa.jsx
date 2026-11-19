import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  api,
  enlaceGoogleMaps,
  enlaceIndicaciones,
  esSocorrista,
  mensajeError,
  telefonoWhatsApp,
} from '../api';
import Icono from '../components/Icono';

const CENTRO_CAUCA = [2.4448, -76.6147];
const ESTADOS_ACTIVOS = new Set(['Pendiente', 'En proceso', 'En camino', 'En el sitio']);

const CLASE_PRIORIDAD = {
  Crítica: 'etiqueta-sos-critica',
  Alta: 'etiqueta-sos-alta',
  Media: 'etiqueta-sos-media',
  Baja: 'etiqueta-sos-baja',
};

const COLOR_PRIORIDAD = {
  Crítica: '#dc2626',
  Alta: '#f97316',
  Media: '#eab308',
  Baja: '#16a34a',
};

const iconoSos = (prioridad) =>
  L.divIcon({
    className: 'marcador-sos',
    html: `<span style="display:block;width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${
      COLOR_PRIORIDAD[prioridad] || '#64748b'
    };border:3px solid #fff;box-shadow:0 2px 8px rgba(15,23,42,.4)"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

const iconoAlerta = L.divIcon({
  className: 'marcador-alerta',
  html: '<span style="display:flex;width:22px;height:22px;border-radius:6px;background:#7c3aed;color:#fff;border:2px solid #fff;align-items:center;justify-content:center;font:800 12px/1 sans-serif;box-shadow:0 2px 8px rgba(15,23,42,.35)">!</span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11],
});

const aNumero = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

const coordenadasSos = (sos) => {
  const lat = aNumero(sos?.latitud);
  const lng = aNumero(sos?.longitud);
  if (lat === null || lng === null) return null;
  return { lat, lng };
};

const codigoSos = (id) => `SOS-${String(id).padStart(4, '0')}`;

// Nombre corto para la etiqueta del mapa: "Daniela H." en vez del nombre completo.
const nombreCorto = (nombre) => {
  const partes = String(nombre || 'Usuario').trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[1].charAt(0).toUpperCase()}.`;
};

const fechaHoraCorta = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? '—'
    : fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};

function AjustarVista({ puntos, foco, ajuste }) {
  const map = useMap();

  useEffect(() => {
    if (puntos.length === 0) {
      map.setView(CENTRO_CAUCA, 12);
      return;
    }
    if (puntos.length === 1) {
      map.setView([puntos[0].lat, puntos[0].lng], 16);
      return;
    }
    const limites = L.latLngBounds(puntos.map((punto) => [punto.lat, punto.lng]));
    map.fitBounds(limites, { padding: [50, 50], maxZoom: 16 });
    // Solo reajustamos cuando cambia el filtro o se pide centrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ajuste, map]);

  useEffect(() => {
    if (!foco) return;
    map.flyTo([foco.lat, foco.lng], 17, { duration: 0.8 });
  }, [foco, map]);

  return null;
}

export default function Mapa() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [ultimasUbicaciones, setUltimasUbicaciones] = useState(() => new Map());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [verTodas, setVerTodas] = useState(false);
  const [verAlertas, setVerAlertas] = useState(false);
  const [foco, setFoco] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);
  const [copiada, setCopiada] = useState(null);
  const [ajuste, setAjuste] = useState(0);
  const [actualizado, setActualizado] = useState(null);

  const cargar = useCallback(async () => {
    const [resSolicitudes, resUsuarios, resAlertas] = await Promise.allSettled([
      api.get('/api/solicitudes'),
      api.get('/api/usuarios/todos'),
      api.get('/api/alerts'),
    ]);

    const listaSolicitudes =
      resSolicitudes.status === 'fulfilled' ? resSolicitudes.value.data?.solicitudes || [] : [];

    if (resSolicitudes.status === 'fulfilled') setSolicitudes(listaSolicitudes);
    if (resUsuarios.status === 'fulfilled') setUsuarios(resUsuarios.value.data || []);
    if (resAlertas.status === 'fulfilled') {
      const datos = resAlertas.value.data;
      setAlertas(Array.isArray(datos) ? datos : datos?.alertas || []);
    }

    // La API de ubicaciones es la que llena la app móvil cuando envía la
    // posición del teléfono. Aquí solo leemos la última de cada usuario.
    const idsUsuarios = [
      ...new Set(listaSolicitudes.map((sos) => Number(sos.usuario_id)).filter(Boolean)),
    ];

    const historiales = await Promise.allSettled(
      idsUsuarios.map((id) => api.get(`/api/ubicaciones/${id}`))
    );

    const mapaUbicaciones = new Map();
    historiales.forEach((resultado, indice) => {
      if (resultado.status !== 'fulfilled') return;
      const historial = resultado.value.data?.historial || [];
      const ultima = historial[0];
      if (!ultima) return;
      const lat = aNumero(ultima.latitud);
      const lng = aNumero(ultima.longitud);
      if (lat === null || lng === null) return;
      mapaUbicaciones.set(idsUsuarios[indice], {
        lat,
        lng,
        fecha: ultima.fecha_hora,
      });
    });
    setUltimasUbicaciones(mapaUbicaciones);

    const fallos = [resSolicitudes, resUsuarios, resAlertas].filter(
      (resultado) => resultado.status === 'rejected'
    );
    setError(fallos.length ? mensajeError(fallos[0].reason) : '');
    setActualizado(new Date());
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 20000);
    return () => clearInterval(intervalo);
  }, [cargar]);

  const usuariosPorId = useMemo(
    () => new Map(usuarios.map((usuario) => [Number(usuario._id), usuario])),
    [usuarios]
  );

  const socorristas = useMemo(() => usuarios.filter(esSocorrista), [usuarios]);

  const visibles = useMemo(
    () =>
      solicitudes.filter((sos) => (verTodas ? true : ESTADOS_ACTIVOS.has(sos.estado_solicitud))),
    [solicitudes, verTodas]
  );

  // Agrupamos por persona: varias SOS de la misma persona comparten un solo
  // marcador (la ubicación más reciente enviada desde el teléfono).
  const personas = useMemo(() => {
    const grupos = new Map();

    for (const sos of visibles) {
      const usuarioId = Number(sos.usuario_id);
      if (!usuarioId) continue;

      const fecha = new Date(sos.fecha_hora || 0).getTime();
      const grupo = grupos.get(usuarioId) || {
        usuarioId,
        sos: [],
        ultimaSos: sos,
        fechaUltima: Number.NEGATIVE_INFINITY,
      };

      grupo.sos.push(sos);
      if (fecha > grupo.fechaUltima) {
        grupo.ultimaSos = sos;
        grupo.fechaUltima = fecha;
      }
      grupos.set(usuarioId, grupo);
    }

    return [...grupos.values()]
      .map((grupo) => {
        const usuario = usuariosPorId.get(grupo.usuarioId);
        const ultimaSos = grupo.ultimaSos;
        const ubicacion = ultimasUbicaciones.get(grupo.usuarioId);
        const coordsSos = coordenadasSos(ultimaSos);
        const coords = ubicacion
          ? { lat: ubicacion.lat, lng: ubicacion.lng }
          : coordsSos;
        const fechaUbicacion = ubicacion?.fecha ? new Date(ubicacion.fecha).getTime() : 0;
        const fecha = Math.max(fechaUbicacion || 0, grupo.fechaUltima) || null;

        return {
          usuarioId: grupo.usuarioId,
          nombre: `${
            usuario?.nombres || ultimaSos.usuario?.nombres || 'Usuario'
          } ${usuario?.apellidos || ultimaSos.usuario?.apellidos || ''}`.trim(),
          telefono: usuario?.telefono || ultimaSos.usuario?.telefono || null,
          sos: grupo.sos,
          ultimaSos,
          coords,
          actualizado: fecha,
        };
      })
      .sort((a, b) => (b.actualizado || 0) - (a.actualizado || 0));
  }, [visibles, usuariosPorId, ultimasUbicaciones]);

  const conUbicacion = useMemo(() => personas.filter((persona) => persona.coords), [personas]);
  const sinUbicacion = useMemo(() => personas.filter((persona) => !persona.coords), [personas]);

  const alertasConUbicacion = useMemo(
    () =>
      alertas
        .filter((alerta) => Array.isArray(alerta.zona_afectada?.coordinates))
        .map((alerta) => {
          const [lng, lat] = alerta.zona_afectada.coordinates;
          return { alerta, lat, lng };
        })
        .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)),
    [alertas]
  );

  const mensajeUbicacion = (persona) => {
    const coords = persona.coords;
    return encodeURIComponent(
      `${codigoSos(persona.ultimaSos._id)} · ${persona.nombre}. Ubicación: ${enlaceGoogleMaps(
        coords.lat,
        coords.lng
      )}\nIndicaciones: ${enlaceIndicaciones(coords.lat, coords.lng)}`
    );
  };

  const copiarCoordenadas = async (persona) => {
    try {
      await navigator.clipboard.writeText(
        `${persona.coords.lat}, ${persona.coords.lng}`
      );
      setCopiada(persona.usuarioId);
      window.setTimeout(() => setCopiada(null), 2000);
    } catch {
      setError('No se pudieron copiar las coordenadas.');
    }
  };

  const enfocar = (persona) => {
    setSeleccionada(persona.usuarioId);
    setFoco({ ...persona.coords, marca: Date.now() });
  };

  const cambiarFiltro = (todas) => {
    setVerTodas(todas);
    setAjuste((valor) => valor + 1);
  };

  if (cargando) {
    return <div className="mt-10 text-center text-gray-500">Cargando mapa...</div>;
  }

  const totalSosActivas = solicitudes.filter((sos) =>
    ESTADOS_ACTIVOS.has(sos.estado_solicitud)
  ).length;

  return (
    <div>
      {error && <div className="mensaje-error mb-4">{error}</div>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => cambiarFiltro(false)}
            className={`chip-filtro ${!verTodas ? 'chip-filtro-activo' : ''}`}
          >
            Emergencias activas ({totalSosActivas})
          </button>
          <button
            onClick={() => cambiarFiltro(true)}
            className={`chip-filtro ${verTodas ? 'chip-filtro-activo' : ''}`}
          >
            Todas ({solicitudes.length})
          </button>
          <label className="ml-2 inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-600">
            <input
              type="checkbox"
              checked={verAlertas}
              onChange={(evento) => setVerAlertas(evento.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            Mostrar alertas ({alertasConUbicacion.length})
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-gray-500">
            {actualizado
              ? `Actualizado: ${actualizado.toLocaleTimeString('es-CO')} · cada 20 s`
              : 'Cargando...'}
          </p>
          <button onClick={() => setAjuste((valor) => valor + 1)} className="boton-secundario">
            <Icono nombre="mapa" className="w-3.5 h-3.5" />
            Centrar
          </button>
          <button onClick={cargar} className="boton-secundario">
            <Icono nombre="actualizar" className="w-3.5 h-3.5" />
            Recargar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="contenedor-mapa relative">
            <MapContainer center={CENTRO_CAUCA} zoom={12} scrollWheelZoom className="mapa-leaflet">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <AjustarVista
                puntos={conUbicacion.map((persona) => persona.coords)}
                foco={foco}
                ajuste={ajuste}
              />

              {conUbicacion.map((persona) => {
                const { ultimaSos, coords } = persona;
                const socorrista = ultimaSos.socorrista_id
                  ? usuariosPorId.get(Number(ultimaSos.socorrista_id))
                  : null;
                const whatsapp = telefonoWhatsApp(socorrista?.telefono);
                const destino = whatsapp ? `https://wa.me/${whatsapp}` : 'https://wa.me/';
                const varias = persona.sos.length > 1;

                return (
                  <Marker
                    key={`persona-${persona.usuarioId}`}
                    position={[coords.lat, coords.lng]}
                    icon={iconoSos(ultimaSos.nivel_prioridad)}
                    zIndexOffset={seleccionada === persona.usuarioId ? 1000 : 0}
                    eventHandlers={{ click: () => setSeleccionada(persona.usuarioId) }}
                  >
                    {/* El nombre aparece solo al pasar el cursor sobre el marcador. */}
                    <Tooltip direction="top" offset={[0, -18]} className="etiqueta-mapa">
                      {nombreCorto(persona.nombre)}
                      {varias ? ` (${persona.sos.length})` : ''}
                    </Tooltip>

                    <Popup>
                      <b>{persona.nombre}</b>
                      <br />
                      {codigoSos(ultimaSos._id)}
                      {varias ? ` · ${persona.sos.length} SOS de esta persona` : ''}
                      <br />
                      {ultimaSos.tipo_ayuda || 'Emergencia'} ·{' '}
                      {ultimaSos.nivel_prioridad || 'Baja'}
                      <br />
                      Estado: {ultimaSos.estado_solicitud}
                      <br />
                      Socorrista:{' '}
                      {socorrista
                        ? `${socorrista.nombres} ${socorrista.apellidos}`
                        : 'Sin asignar'}
                      <br />
                      <span style={{ color: '#64748b' }}>
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} ·{' '}
                        {fechaHoraCorta(persona.actualizado)}
                      </span>
                      {varias && (
                        <>
                          <br />
                          <span style={{ color: '#64748b' }}>
                            También: {persona.sos
                              .filter((sos) => sos._id !== ultimaSos._id)
                              .map((sos) => codigoSos(sos._id))
                              .join(', ')}
                          </span>
                        </>
                      )}
                      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        <a
                          href={enlaceGoogleMaps(coords.lat, coords.lng)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontWeight: 700, color: '#2563eb' }}
                        >
                          Google Maps
                        </a>
                        <a
                          href={enlaceIndicaciones(coords.lat, coords.lng)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontWeight: 700, color: '#2563eb' }}
                        >
                          Indicaciones
                        </a>
                        <a
                          href={`${destino}?text=${mensajeUbicacion(persona)}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontWeight: 700, color: '#15803d' }}
                        >
                          Enviar ubicación
                        </a>
                      </span>
                    </Popup>
                  </Marker>
                );
              })}

              {verAlertas &&
                alertasConUbicacion.map(({ alerta, lat, lng }) => (
                  <Marker key={`alerta-${alerta._id}`} position={[lat, lng]} icon={iconoAlerta}>
                    <Popup>
                      <b>{alerta.tipo_alerta || 'Alerta'}</b>
                      <br />
                      Severidad: {alerta.nivel_severidad || 'Informativa'}
                      <br />
                      {alerta.mensaje || 'Sin mensaje'}
                      <br />
                      <span style={{ color: '#64748b' }}>Fuente: {alerta.fuente || '—'}</span>
                      {alerta.url_oficial && (
                        <>
                          <br />
                          <a
                            href={alerta.url_oficial}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontWeight: 700, color: '#2563eb' }}
                          >
                            Ver fuente oficial
                          </a>
                        </>
                      )}
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg bg-white/95 p-3 text-[11px] shadow-lg ring-1 ring-black/5">
              <p className="mb-1 font-bold text-gray-700">Convenciones</p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="leyenda-punto bg-red-600" /> Prioridad crítica
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="leyenda-punto bg-orange-500" /> Prioridad alta
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="leyenda-punto bg-yellow-500" /> Prioridad media
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <span className="leyenda-punto bg-violet-600" /> Alerta del sistema
              </p>
              <p className="mt-2 border-t border-gray-200 pt-2 text-[10px] text-gray-500">
                Un marcador por persona · última ubicación enviada por el teléfono.
                <br />
                Pasa el cursor sobre un marcador para ver el nombre.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="capa-mapa">
            <div className="mb-3 flex items-center justify-between">
              <div className="cabecera-tarjeta mb-0">
                <span className="icono-tarjeta bg-red-100 text-red-700">
                  <Icono nombre="ubicacion" className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Personas en el mapa</h3>
                  <p className="text-[11px] text-gray-500">
                    {conUbicacion.length} con ubicación · {sinUbicacion.length} sin ubicación ·{' '}
                    {visibles.length} SOS
                  </p>
                </div>
              </div>
            </div>

            <div className="flex max-h-[560px] flex-col gap-2 overflow-y-auto pr-1">
              {conUbicacion.map((persona) => {
                const { ultimaSos, coords } = persona;
                const socorrista = ultimaSos.socorrista_id
                  ? usuariosPorId.get(Number(ultimaSos.socorrista_id))
                  : null;
                const whatsapp = telefonoWhatsApp(socorrista?.telefono);
                const destino = whatsapp ? `https://wa.me/${whatsapp}` : 'https://wa.me/';
                const activa = seleccionada === persona.usuarioId;
                const varias = persona.sos.length > 1;

                return (
                  <div
                    key={persona.usuarioId}
                    className={`item-mapa ${activa ? 'border-blue-300 bg-blue-50/60' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => enfocar(persona)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-gray-800">
                          {persona.nombre}
                          {varias && (
                            <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                              {persona.sos.length} SOS
                            </span>
                          )}
                        </p>
                        <span
                          className={
                            CLASE_PRIORIDAD[ultimaSos.nivel_prioridad] || 'etiqueta-sos-baja'
                          }
                        >
                          {ultimaSos.nivel_prioridad || 'Baja'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {codigoSos(ultimaSos._id)} · {ultimaSos.estado_solicitud} ·{' '}
                        {ultimaSos.tipo_ayuda || 'Emergencia'}
                        {socorrista ? ` · ${socorrista.nombres}` : ' · sin asignar'}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} ·{' '}
                        {fechaHoraCorta(persona.actualizado)}
                      </p>
                    </button>

                    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
                      <a
                        href={enlaceGoogleMaps(coords.lat, coords.lng)}
                        target="_blank"
                        rel="noreferrer"
                        className="boton-contorno boton-mini"
                      >
                        <Icono nombre="mapa" className="w-3 h-3" />
                        Google Maps
                      </a>
                      <a
                        href={enlaceIndicaciones(coords.lat, coords.lng)}
                        target="_blank"
                        rel="noreferrer"
                        className="boton-contorno boton-mini"
                      >
                        <Icono nombre="flecha" className="w-3 h-3" />
                        Indicaciones
                      </a>
                      <a
                        href={`${destino}?text=${mensajeUbicacion(persona)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="boton-whatsapp boton-mini"
                      >
                        <Icono nombre="whatsapp" className="w-3 h-3" />
                        {socorrista ? 'Enviar al socorrista' : 'Compartir'}
                      </a>
                      <button
                        type="button"
                        onClick={() => copiarCoordenadas(persona)}
                        className="boton-contorno boton-mini"
                      >
                        <Icono nombre="check" className="w-3 h-3" />
                        {copiada === persona.usuarioId ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {conUbicacion.length === 0 && (
                <p className="py-4 text-center text-xs text-gray-500">
                  No hay personas con coordenadas para este filtro.
                </p>
              )}
            </div>
          </div>

          {sinUbicacion.length > 0 && (
            <div className="capa-mapa">
              <p className="mb-2 text-xs font-bold text-gray-700">Personas sin ubicación</p>
              <div className="flex flex-col gap-1.5">
                {sinUbicacion.map((persona) => {
                  const whatsapp = telefonoWhatsApp(persona.telefono);
                  const varias = persona.sos.length > 1;
                  return (
                    <div
                      key={persona.usuarioId}
                      className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-2 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-gray-700">
                          {persona.nombre}
                          {varias ? ` · ${persona.sos.length} SOS` : ''}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {codigoSos(persona.ultimaSos._id)} · {persona.ultimaSos.estado_solicitud}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {persona.telefono && (
                          <a
                            href={`tel:${persona.telefono}`}
                            className="boton-contorno boton-icono"
                            title="Llamar"
                          >
                            <Icono nombre="telefono" className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {whatsapp && (
                          <a
                            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                              `Hola, te contactamos desde el centro de control de Cauca Resiliente por tu ${codigoSos(
                                persona.ultimaSos._id
                              )}. ¿Podrías compartirnos tu ubicación exacta?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="boton-whatsapp boton-icono"
                            title="Pedir ubicación por WhatsApp"
                          >
                            <Icono nombre="whatsapp" className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="capa-mapa">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-700">Socorristas</p>
              <span className="text-[10px] text-gray-400">
                {socorristas.length} registrado{socorristas.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {socorristas.map((socorrista) => (
                <span
                  key={socorrista._id}
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {socorrista.nombres} {socorrista.apellidos}
                  {socorrista.estado_operativo ? ` · ${socorrista.estado_operativo}` : ''}
                </span>
              ))}
              {socorristas.length === 0 && (
                <p className="text-[11px] text-gray-500">No hay socorristas registrados.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
