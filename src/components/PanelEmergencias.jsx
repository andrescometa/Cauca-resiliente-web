import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PanelEmergencias() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/solicitudes')
      .then(res => {
        // Tomamos solo las 4 más recientes para el panel
        setSolicitudes(res.data.slice(0, 4));
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Emergencias activas</h3>
        <a href="#" className="text-sm text-blue-600 hover:underline">Ver todas →</a>
      </div>

      <div className="flex flex-col gap-3">
        {solicitudes.length > 0 ? solicitudes.map(sos => (
          <div key={sos._id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
            <div className={`w-2 h-10 rounded-full ${sos.nivel_prioridad === 'Crítica' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-bold text-gray-800">SOS-{sos._id.toString().padStart(4, '0')}</p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${sos.nivel_prioridad === 'Crítica' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {sos.nivel_prioridad.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{sos.tipo_ayuda} - {sos.descripcion_emergencia}</p>
              <p className="text-[10px] text-gray-400 mt-1">Estado: {sos.estado_solicitud}</p>
            </div>
          </div>
        )) : (
          <p className="text-sm text-gray-500">No hay emergencias recientes.</p>
        )}
      </div>
    </div>
  );
}