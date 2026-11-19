import Icono from './Icono';

const CLASE_PRIORIDAD = {
  Crítica: 'etiqueta-sos-critica',
  Alta: 'etiqueta-sos-alta',
  Media: 'etiqueta-sos-media',
  Baja: 'etiqueta-sos-baja',
};

const CLASE_BARRA = {
  Crítica: 'bg-red-500',
  Alta: 'bg-orange-400',
  Media: 'bg-yellow-400',
  Baja: 'bg-green-400',
};

export default function PanelEmergencias({ solicitudes = [], usuariosPorId = new Map(), onVerTodas }) {
  return (
    <div className="tarjeta-panel h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="cabecera-tarjeta mb-0">
          <span className="icono-tarjeta bg-red-100 text-red-700">
            <Icono nombre="solicitudes" className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-bold text-gray-800">Emergencias recientes</h3>
        </div>
        {onVerTodas && (
          <button onClick={onVerTodas} className="enlace-sutil">
            Ver todas
            <Icono nombre="flecha" className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {solicitudes.length > 0 ? (
          solicitudes.map((sos) => {
            const socorrista = sos.socorrista_id
              ? usuariosPorId.get(Number(sos.socorrista_id))
              : null;
            return (
              <button
                key={sos._id}
                type="button"
                onClick={onVerTodas}
                className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 text-left transition hover:bg-gray-50"
              >
                <div
                  className={`h-12 w-1.5 rounded-full ${
                    CLASE_BARRA[sos.nivel_prioridad] || 'bg-gray-300'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-800">
                      SOS-{String(sos._id).padStart(4, '0')}
                    </p>
                    <span className={CLASE_PRIORIDAD[sos.nivel_prioridad] || 'etiqueta-sos-baja'}>
                      {(sos.nivel_prioridad || 'Baja').toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-600">
                    {sos.tipo_ayuda} · {sos.usuario?.nombres || 'Usuario'}{' '}
                    {sos.usuario?.apellidos || ''}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {sos.estado_solicitud}
                    {socorrista ? ` · ${socorrista.nombres} asignado` : ' · sin asignar'}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">No hay emergencias recientes.</p>
        )}
      </div>
    </div>
  );
}
