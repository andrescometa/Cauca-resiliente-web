import { useEffect, useMemo, useState } from 'react';
import { api, enlaceGoogleMaps, mensajeError } from '../api';
import Icono from '../components/Icono';

const CLASE_SEVERIDAD = {
  Crítica: 'etiqueta-sos-critica',
  Urgente: 'etiqueta-sos-alta',
  Preventiva: 'etiqueta-sos-media',
  Informativa: 'etiqueta-sos-baja',
};

const fechaHora = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? '—'
    : fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};

const coordenadasAlerta = (alerta) => {
  const coords = alerta?.zona_afectada?.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) return null;
  const [lng, lat] = coords;
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;
  return { lat, lng };
};

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('activas');
  const [busqueda, setBusqueda] = useState('');

  const cargar = async () => {
    try {
      const respuesta = await api.get('/api/alerts');
      const datos = Array.isArray(respuesta.data)
        ? respuesta.data
        : respuesta.data?.alertas || [];
      setAlertas(datos);
      setError('');
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const alertasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return alertas
      .filter((alerta) => {
        if (filtro === 'activas' && alerta.activa === false) return false;
        if (filtro === 'inactivas' && alerta.activa !== false) return false;
        if (!texto) return true;
        return [alerta.tipo_alerta, alerta.mensaje, alerta.fuente]
          .filter(Boolean)
          .some((valor) => String(valor).toLowerCase().includes(texto));
      })
      .sort((a, b) => new Date(b.fecha_emision || 0) - new Date(a.fecha_emision || 0));
  }, [alertas, filtro, busqueda]);

  const activas = alertas.filter((alerta) => alerta.activa !== false).length;

  if (cargando) {
    return <div className="mt-10 text-center text-gray-500">Cargando alertas...</div>;
  }

  return (
    <div>
      {error && <div className="mensaje-error mb-4">{error}</div>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltro('activas')}
            className={`chip-filtro ${filtro === 'activas' ? 'chip-filtro-activo' : ''}`}
          >
            Activas ({activas})
          </button>
          <button
            onClick={() => setFiltro('todas')}
            className={`chip-filtro ${filtro === 'todas' ? 'chip-filtro-activo' : ''}`}
          >
            Todas ({alertas.length})
          </button>
          <button
            onClick={() => setFiltro('inactivas')}
            className={`chip-filtro ${filtro === 'inactivas' ? 'chip-filtro-activo' : ''}`}
          >
            Expiradas ({alertas.length - activas})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Icono
              nombre="buscar"
              className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Buscar alerta..."
              className="campo-busqueda w-64 pl-9"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
          <button onClick={cargar} className="boton-secundario">
            <Icono nombre="actualizar" className="w-3.5 h-3.5" />
            Recargar
          </button>
        </div>
      </div>

      <div className="contenedor-tabla-sos">
        <div className="mb-4 flex items-center gap-2">
          <span className="icono-tarjeta bg-purple-100 text-purple-700">
            <Icono nombre="alertas" className="w-5 h-5" />
          </span>
          <h3 className="text-xl font-bold text-gray-800">Alertas del sistema</h3>
          <span className="ml-auto text-xs font-medium text-gray-400">
            {alertasFiltradas.length} visibles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="tabla-sos-cabecera">
                <th className="p-3">Tipo</th>
                <th className="p-3">Mensaje</th>
                <th className="p-3">Severidad</th>
                <th className="p-3">Fuente</th>
                <th className="p-3">Emitida</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {alertasFiltradas.map((alerta) => {
                const coords = coordenadasAlerta(alerta);
                return (
                  <tr key={alerta._id} className="fila-sos-tabla align-top">
                    <td className="whitespace-nowrap p-3 font-medium text-gray-800">
                      {alerta.tipo_alerta || 'Alerta'}
                    </td>
                    <td className="max-w-md p-3 text-gray-600">
                      <p className="line-clamp-3">{alerta.mensaje || 'Sin mensaje'}</p>
                      {alerta.url_oficial && (
                        <a
                          href={alerta.url_oficial}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Ver fuente oficial
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={CLASE_SEVERIDAD[alerta.nivel_severidad] || 'etiqueta-sos-baja'}
                      >
                        {alerta.nivel_severidad || 'Informativa'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3 text-gray-600">{alerta.fuente || '—'}</td>
                    <td className="whitespace-nowrap p-3 text-xs text-gray-500">
                      {fechaHora(alerta.fecha_emision)}
                    </td>
                    <td className="p-3">
                      <span className={alerta.activa === false ? 'estado-cerrado' : 'estado-activo'}>
                        {alerta.activa === false ? 'Expirada' : 'Activa'}
                      </span>
                    </td>
                    <td className="p-3">
                      {coords ? (
                        <a
                          href={enlaceGoogleMaps(coords.lat, coords.lng)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <Icono nombre="ubicacion" className="w-3.5 h-3.5" />
                          Ver mapa
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Sin ubicación</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {alertasFiltradas.length === 0 && (
          <p className="mt-4 text-center text-gray-500">No hay alertas con ese filtro.</p>
        )}
      </div>
    </div>
  );
}
