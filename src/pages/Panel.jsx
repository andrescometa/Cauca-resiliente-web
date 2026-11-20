import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  activasPorSocorrista,
  api,
  disponibleParaAsignar,
  esAdmin,
  esSocorrista,
  estadoRescate,
  mensajeError,
  rolVisible,
} from '../api';
import TarjetasEstadisticas from '../components/TarjetasEstadisticas';
import PanelEmergencias from '../components/PanelEmergencias';
import Icono from '../components/Icono';

const ESTADOS_ACTIVOS = new Set(['Pendiente', 'En proceso', 'En camino', 'En el sitio']);

const formatearHora = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};

const CLASE_SEVERIDAD = {
  Crítica: 'etiqueta-sos-critica',
  Urgente: 'etiqueta-sos-alta',
  Preventiva: 'etiqueta-sos-media',
  Informativa: 'etiqueta-sos-baja',
};

export default function Panel({ irA }) {
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizado, setActualizado] = useState(null);

  const cargar = useCallback(async () => {
    const [resUsuarios, resSolicitudes, resAlertas] = await Promise.allSettled([
      api.get('/api/usuarios/todos'),
      api.get('/api/solicitudes'),
      api.get('/api/alerts'),
    ]);

    if (resUsuarios.status === 'fulfilled') setUsuarios(resUsuarios.value.data || []);
    if (resSolicitudes.status === 'fulfilled') {
      setSolicitudes(resSolicitudes.value.data?.solicitudes || []);
    }
    if (resAlertas.status === 'fulfilled') {
      const datos = resAlertas.value.data;
      setAlertas(Array.isArray(datos) ? datos : datos?.alertas || []);
    }

    const fallos = [resUsuarios, resSolicitudes, resAlertas].filter((r) => r.status === 'rejected');
    setError(fallos.length ? mensajeError(fallos[0].reason) : '');
    setActualizado(new Date());
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [cargar]);

  const usuariosPorId = useMemo(
    () => new Map(usuarios.map((usuario) => [Number(usuario._id), usuario])),
    [usuarios]
  );

  const resumen = useMemo(() => {
    const socorristas = usuarios.filter(esSocorrista);
    const asignadasPorSocorrista = activasPorSocorrista(solicitudes);
    const activas = solicitudes.filter((sos) => ESTADOS_ACTIVOS.has(sos.estado_solicitud));
    const pendientes = solicitudes.filter((sos) => sos.estado_solicitud === 'Pendiente');
    const enCamino = solicitudes.filter((sos) =>
      ['En proceso', 'En camino'].includes(sos.estado_solicitud)
    );
    const atendidas = solicitudes.filter((sos) =>
      ['Atendido', 'Finalizado'].includes(sos.estado_solicitud)
    );
    const alertasActivas = alertas.filter((alerta) => alerta.activa !== false);
    const disponibles = socorristas.filter((usuario) =>
      disponibleParaAsignar(asignadasPorSocorrista, usuario)
    );
    const ciudadanos = usuarios.filter((usuario) => rolVisible(usuario) === 1);
    const admins = usuarios.filter(esAdmin);
    const conUbicacion = activas.filter(
      (sos) => Number.isFinite(Number(sos.latitud)) && Number.isFinite(Number(sos.longitud))
    );

    return {
      socorristas,
      asignadasPorSocorrista,
      activas,
      pendientes,
      enCamino,
      atendidas,
      alertasActivas,
      disponibles,
      ciudadanos,
      admins,
      conUbicacion,
    };
  }, [usuarios, solicitudes, alertas]);

  const emergenciasRecientes = useMemo(
    () =>
      [...resumen.activas]
        .sort((a, b) => new Date(b.fecha_hora || 0) - new Date(a.fecha_hora || 0))
        .slice(0, 5),
    [resumen.activas]
  );

  const alertasRecientes = useMemo(
    () =>
      [...alertas]
        .sort((a, b) => new Date(b.fecha_emision || 0) - new Date(a.fecha_emision || 0))
        .slice(0, 5),
    [alertas]
  );

  const tarjetas = [
    {
      etiqueta: 'Usuarios',
      valor: usuarios.length,
      cargando,
      color: 'text-gray-800',
      icono: 'usuarios',
      fondoIcono: 'bg-slate-100 text-slate-700',
      detalle: `${resumen.ciudadanos.length} ciudadanos · ${resumen.admins.length} administradores`,
      onClick: () => irA('usuarios'),
    },
    {
      etiqueta: 'Socorristas',
      valor: resumen.socorristas.length,
      cargando,
      color: 'text-green-600',
      icono: 'socorrista',
      fondoIcono: 'bg-green-100 text-green-700',
      detalle: `${resumen.disponibles.length} disponibles`,
      onClick: () => irA('socorristas'),
    },
    {
      etiqueta: 'SOS activas',
      valor: resumen.activas.length,
      cargando,
      color: 'text-red-600',
      icono: 'solicitudes',
      fondoIcono: 'bg-red-100 text-red-700',
      detalle: `${resumen.conUbicacion.length} con ubicación`,
      onClick: () => irA('solicitudes'),
    },
    {
      etiqueta: 'Pendientes',
      valor: resumen.pendientes.length,
      cargando,
      color: 'text-orange-600',
      icono: 'reloj',
      fondoIcono: 'bg-orange-100 text-orange-700',
      detalle: 'Sin socorrista',
      onClick: () => irA('solicitudes'),
    },
    {
      etiqueta: 'En camino',
      valor: resumen.enCamino.length,
      cargando,
      color: 'text-blue-600',
      icono: 'ambulancia',
      fondoIcono: 'bg-blue-100 text-blue-700',
      detalle: 'Rescates en curso',
      onClick: () => irA('solicitudes'),
    },
    {
      etiqueta: 'Alertas activas',
      valor: resumen.alertasActivas.length,
      cargando,
      color: 'text-purple-600',
      icono: 'alertas',
      fondoIcono: 'bg-purple-100 text-purple-700',
      detalle: `${alertas.length} en total`,
      onClick: () => irA('alertas'),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {actualizado
            ? `Actualizado: ${actualizado.toLocaleTimeString('es-CO')}`
            : 'Cargando datos...'}
          <span className="text-gray-400"> · se refresca cada 30 s</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => irA('mapa')} className="boton-primario">
            <Icono nombre="mapa" className="w-4 h-4" />
            Ver mapa de emergencias
          </button>
          <button onClick={cargar} className="boton-secundario">
            <Icono nombre="actualizar" className="w-3.5 h-3.5" />
            Actualizar ahora
          </button>
        </div>
      </div>

      {error && <div className="mensaje-error mb-4">{error}</div>}

      <TarjetasEstadisticas tarjetas={tarjetas} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PanelEmergencias
            solicitudes={emergenciasRecientes}
            usuariosPorId={usuariosPorId}
            onVerTodas={() => irA('solicitudes')}
          />
        </div>

        <div className="tarjeta-panel">
          <div className="mb-4 flex items-center justify-between">
            <div className="cabecera-tarjeta mb-0">
              <span className="icono-tarjeta bg-green-100 text-green-700">
                <Icono nombre="socorrista" className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-gray-800">Socorristas</h3>
            </div>
            <button onClick={() => irA('socorristas')} className="enlace-sutil">
              Gestionar
              <Icono nombre="flecha" className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {resumen.socorristas.length > 0 ? (
              resumen.socorristas.map((socorrista) => {
                const asignadas =
                  resumen.asignadasPorSocorrista.get(Number(socorrista._id)) || [];
                const ocupado = asignadas.length > 0;
                const textoEstado = ocupado
                  ? estadoRescate(asignadas)
                  : String(socorrista.estado_operativo || '').trim() || 'Disponible';
                const disponible = disponibleParaAsignar(
                  resumen.asignadasPorSocorrista,
                  socorrista
                );
                return (
                  <button
                    key={socorrista._id}
                    onClick={() => irA('socorristas')}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 p-3 text-left transition hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {socorrista.nombres} {socorrista.apellidos}
                      </p>
                      <p className="truncate text-xs text-gray-500">{socorrista.email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={disponible ? 'insignia-disponible' : 'insignia-ocupado'}>
                        {textoEstado}
                      </span>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {asignadas.length
                          ? `${asignadas.length} rescate${asignadas.length === 1 ? '' : 's'} activo${
                              asignadas.length === 1 ? '' : 's'
                            }`
                          : 'Sin rescates activos'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">Aún no hay socorristas registrados.</p>
            )}
          </div>
        </div>
      </div>

      <div className="tarjeta-panel mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="cabecera-tarjeta mb-0">
            <span className="icono-tarjeta bg-purple-100 text-purple-700">
              <Icono nombre="alertas" className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-gray-800">Últimas alertas</h3>
          </div>
          <button onClick={() => irA('alertas')} className="enlace-sutil">
            Ver todas
            <Icono nombre="flecha" className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="tabla-sos-cabecera">
                <th className="p-3">Tipo</th>
                <th className="p-3">Severidad</th>
                <th className="p-3">Fuente</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {alertasRecientes.map((alerta) => (
                <tr
                  key={alerta._id}
                  className="fila-sos-tabla cursor-pointer"
                  onClick={() => irA('mapa')}
                >
                  <td className="p-3 font-medium text-gray-800">{alerta.tipo_alerta || 'Alerta'}</td>
                  <td className="p-3">
                    <span
                      className={CLASE_SEVERIDAD[alerta.nivel_severidad] || 'etiqueta-sos-baja'}
                    >
                      {alerta.nivel_severidad || 'Informativa'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{alerta.fuente || '—'}</td>
                  <td className="p-3 text-gray-500">{formatearHora(alerta.fecha_emision)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {alertasRecientes.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">No hay alertas registradas.</p>
        )}
      </div>
    </div>
  );
}
