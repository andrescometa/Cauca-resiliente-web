import { useEffect, useMemo, useState } from 'react';
import {
  api,
  enlaceGoogleMaps,
  esSocorrista,
  mensajeError,
} from '../api';
import Icono from '../components/Icono';

const CLASE_PRIORIDAD = {
  Crítica: 'etiqueta-sos-critica',
  Alta: 'etiqueta-sos-alta',
  Media: 'etiqueta-sos-media',
  Baja: 'etiqueta-sos-baja',
};

const CLASE_ESTADO = {
  Pendiente: 'estado-pendiente',
  'En proceso': 'estado-camino',
  'En camino': 'estado-camino',
  'En el sitio': 'estado-sitio',
  Atendido: 'estado-cerrado',
  Finalizado: 'estado-cerrado',
  Cancelado: 'estado-cancelado',
};

const FILTROS = [
  { id: 'activas', nombre: 'Activas' },
  { id: 'Pendiente', nombre: 'Pendientes' },
  { id: 'En camino', nombre: 'En camino' },
  { id: 'En el sitio', nombre: 'En el sitio' },
  { id: 'cerradas', nombre: 'Cerradas' },
  { id: 'todas', nombre: 'Todas' },
];

const fechaHora = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? '—'
    : fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};

const codigoSos = (id) => `SOS-${String(id).padStart(4, '0')}`;

export default function Solicitudes({ irA }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('activas');
  const [seleccionSocorrista, setSeleccionSocorrista] = useState({});
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const cargar = async () => {
    const [resSolicitudes, resUsuarios] = await Promise.allSettled([
      api.get('/api/solicitudes'),
      api.get('/api/usuarios/todos'),
    ]);

    if (resSolicitudes.status === 'fulfilled') {
      setSolicitudes(resSolicitudes.value.data?.solicitudes || []);
    }
    if (resUsuarios.status === 'fulfilled') {
      setUsuarios(resUsuarios.value.data || []);
    }

    const fallos = [resSolicitudes, resUsuarios].filter((r) => r.status === 'rejected');
    if (fallos.length) setMensaje({ tipo: 'error', texto: mensajeError(fallos[0].reason) });
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const usuariosPorId = useMemo(
    () => new Map(usuarios.map((usuario) => [Number(usuario._id), usuario])),
    [usuarios]
  );

  const socorristas = useMemo(() => usuarios.filter(esSocorrista), [usuarios]);

  const solicitudesFiltradas = useMemo(() => {
    if (filtro === 'todas') return solicitudes;
    if (filtro === 'activas') {
      return solicitudes.filter((sos) =>
        ['Pendiente', 'En proceso', 'En camino', 'En el sitio'].includes(sos.estado_solicitud)
      );
    }
    if (filtro === 'cerradas') {
      return solicitudes.filter((sos) =>
        ['Atendido', 'Finalizado', 'Cancelado'].includes(sos.estado_solicitud)
      );
    }
    return solicitudes.filter((sos) => sos.estado_solicitud === filtro);
  }, [solicitudes, filtro]);

  const asignar = async (sos) => {
    const socorristaId = Number(seleccionSocorrista[sos._id]);
    if (!socorristaId) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un socorrista antes de asignar.' });
      return;
    }

    setGuardando(sos._id);
    setMensaje(null);

    try {
      try {
        await api.post('/api/asignaciones', {
          solicitud_id: sos._id,
          socorrista_usuario_id: socorristaId,
        });
      } catch (error) {
        const detalle = String(error?.response?.data?.mensaje || '').toLowerCase();
        // Si la solicitud ya tenía una asignación activa seguimos actualizando
        // el socorrista y el estado de la solicitud.
        if (!detalle.includes('asignación activa')) throw error;
      }

      await api.put(`/api/solicitudes/${sos._id}`, {
        socorrista_id: socorristaId,
        estado_solicitud: 'En camino',
      });

      const socorrista = usuariosPorId.get(socorristaId);
      setMensaje({
        tipo: 'ok',
        texto: `${codigoSos(sos._id)} asignada a ${
          socorrista ? `${socorrista.nombres} ${socorrista.apellidos}` : 'un socorrista'
        }.`,
      });
      await cargar();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: mensajeError(error) });
    } finally {
      setGuardando(null);
    }
  };

  const cambiarEstado = async (sos, nuevoEstado) => {
    setGuardando(sos._id);
    setMensaje(null);

    try {
      if (nuevoEstado === 'En el sitio' || nuevoEstado === 'Finalizado') {
        const seguimiento = await api.get(`/api/asignaciones/solicitud/${sos._id}`);
        const asignacion = seguimiento.data?.asignacion;

        if (asignacion?._id) {
          await api.put(`/api/asignaciones/${asignacion._id}`, { estado_atencion: nuevoEstado });
        }
      }

      await api.put(`/api/solicitudes/${sos._id}`, { estado_solicitud: nuevoEstado });

      setMensaje({ tipo: 'ok', texto: `${codigoSos(sos._id)} actualizada a "${nuevoEstado}".` });
      await cargar();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: mensajeError(error) });
    } finally {
      setGuardando(null);
    }
  };

  if (cargando) {
    return <div className="mt-10 text-center text-gray-500">Cargando solicitudes SOS...</div>;
  }

  return (
    <div>
      {mensaje && (
        <div className={`${mensaje.tipo === 'ok' ? 'mensaje-ok' : 'mensaje-error'} mb-4`}>
          {mensaje.texto}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((opcion) => (
            <button
              key={opcion.id}
              onClick={() => setFiltro(opcion.id)}
              className={`chip-filtro ${filtro === opcion.id ? 'chip-filtro-activo' : ''}`}
            >
              {opcion.nombre}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => irA('mapa')} className="boton-primario">
            <Icono nombre="mapa" className="w-4 h-4" />
            Ver mapa
          </button>
          <button onClick={cargar} className="boton-secundario">
            <Icono nombre="actualizar" className="w-3.5 h-3.5" />
            Recargar
          </button>
        </div>
      </div>

      <div className="contenedor-tabla-sos">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="icono-tarjeta bg-red-100 text-red-700">
              <Icono nombre="solicitudes" className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-gray-800">Emergencias recibidas</h3>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="tabla-sos-cabecera">
                <th className="p-3">Código</th>
                <th className="p-3">Ciudadano</th>
                <th className="p-3">Tipo de ayuda</th>
                <th className="p-3">Prioridad</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Socorrista</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.map((sos) => {
                const socorristaAsignado = sos.socorrista_id
                  ? usuariosPorId.get(Number(sos.socorrista_id))
                  : null;
                const cerrada = ['Atendido', 'Finalizado', 'Cancelado'].includes(
                  sos.estado_solicitud
                );
                const ocupado = guardando === sos._id;
                const tieneUbicacion =
                  Number.isFinite(Number(sos.latitud)) && Number.isFinite(Number(sos.longitud));

                return (
                  <tr key={sos._id} className="fila-sos-tabla align-top">
                    <td className="whitespace-nowrap p-3 font-bold text-[#0f172a]">
                      {codigoSos(sos._id)}
                    </td>

                    <td className="p-3">
                      <p className="font-medium text-gray-800">
                        {sos.usuario?.nombres || 'Usuario'} {sos.usuario?.apellidos || ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sos.usuario?.telefono || 'Sin teléfono'}
                      </p>
                      {tieneUbicacion && (
                        <a
                          href={enlaceGoogleMaps(sos.latitud, sos.longitud)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          <Icono nombre="ubicacion" className="w-3 h-3" />
                          Ver ubicación
                        </a>
                      )}
                    </td>

                    <td className="p-3">
                      <p className="font-medium text-gray-800">{sos.tipo_ayuda || 'No especificado'}</p>
                      <p className="max-w-[220px] truncate text-xs text-gray-500">
                        {sos.descripcion_emergencia || 'Sin descripción'}
                      </p>
                    </td>

                    <td className="p-3">
                      <span className={CLASE_PRIORIDAD[sos.nivel_prioridad] || 'etiqueta-sos-baja'}>
                        {sos.nivel_prioridad || 'Baja'}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`etiqueta-estado-sos ${
                          CLASE_ESTADO[sos.estado_solicitud] || ''
                        }`}
                      >
                        {sos.estado_solicitud || 'Pendiente'}
                      </span>
                    </td>

                    <td className="p-3">
                      {socorristaAsignado ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {socorristaAsignado.nombres} {socorristaAsignado.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">
                            {socorristaAsignado.telefono || ''}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sin asignar</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap p-3 text-xs text-gray-500">
                      {fechaHora(sos.fecha_hora)}
                    </td>

                    <td className="p-3">
                      {cerrada ? (
                        <span className="text-xs text-gray-400">Cerrada</span>
                      ) : !sos.socorrista_id ? (
                        <div className="flex min-w-[190px] flex-col gap-2">
                          <select
                            className="campo-select text-xs"
                            value={seleccionSocorrista[sos._id] || ''}
                            disabled={ocupado || socorristas.length === 0}
                            onChange={(evento) =>
                              setSeleccionSocorrista((prev) => ({
                                ...prev,
                                [sos._id]: evento.target.value,
                              }))
                            }
                          >
                            <option value="">
                              {socorristas.length === 0
                                ? 'No hay socorristas'
                                : 'Seleccionar socorrista...'}
                            </option>
                            {socorristas.map((socorrista) => (
                              <option key={socorrista._id} value={socorrista._id}>
                                {socorrista.nombres} {socorrista.apellidos}
                                {socorrista.estado_operativo
                                  ? ` (${socorrista.estado_operativo})`
                                  : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => asignar(sos)}
                            disabled={ocupado || !seleccionSocorrista[sos._id]}
                            className="boton-asignar-rescate inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Icono nombre="socorrista" className="w-3.5 h-3.5" />
                            {ocupado ? 'Asignando...' : 'Asignar rescate'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex min-w-[150px] flex-col gap-2">
                          <button
                            onClick={() => cambiarEstado(sos, 'En el sitio')}
                            disabled={ocupado || sos.estado_solicitud === 'En el sitio'}
                            className="boton-secundario disabled:opacity-50"
                          >
                            En el sitio
                          </button>
                          <button
                            onClick={() => cambiarEstado(sos, 'Finalizado')}
                            disabled={ocupado}
                            className="boton-exito inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Icono nombre="check" className="w-3.5 h-3.5" />
                            Finalizar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {solicitudesFiltradas.length === 0 && (
          <p className="mt-4 text-center text-gray-500">No hay solicitudes con ese filtro.</p>
        )}
      </div>
    </div>
  );
}
