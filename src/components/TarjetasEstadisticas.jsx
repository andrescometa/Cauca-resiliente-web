import Icono from './Icono';

export default function TarjetasEstadisticas({ tarjetas = [] }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {tarjetas.map((tarjeta) => {
        const contenido = (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="texto-estadistica">{tarjeta.etiqueta}</p>
                <p className={`numero-estadistica ${tarjeta.color || 'text-gray-800'}`}>
                  {tarjeta.cargando ? '—' : tarjeta.valor}
                </p>
              </div>
              <span
                className={`icono-tarjeta ${
                  tarjeta.fondoIcono || 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icono nombre={tarjeta.icono || 'panel'} className="w-5 h-5" />
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-xs text-gray-400">{tarjeta.detalle || 'Ver detalle'}</p>
              {tarjeta.onClick && (
                <Icono nombre="flecha" className="w-4 h-4 text-gray-300 transition group-hover:text-gray-500" />
              )}
            </div>
          </>
        );

        if (tarjeta.onClick) {
          return (
            <button
              key={tarjeta.etiqueta}
              type="button"
              onClick={tarjeta.onClick}
              className="tarjeta-estadistica tarjeta-clicable group text-left"
            >
              {contenido}
            </button>
          );
        }

        return (
          <div key={tarjeta.etiqueta} className="tarjeta-estadistica">
            {contenido}
          </div>
        );
      })}
    </div>
  );
}
