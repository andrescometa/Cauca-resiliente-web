import { useState, useEffect } from 'react';
import axios from 'axios';
import MapaEmergencias from '../components/MapaEmergencias';

export default function InicioSocorrista() {
  const [stats, setStats] = useState({ pendientes: 0, enCamino: 0, rescatados: 0 });
  const [solicitudesRecientes, setSolicitudesRecientes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/solicitudes')
      .then(res => {
        // AQUÍ ESTÁ EL ARREGLO: Extraemos la propiedad "solicitudes" de tu JSON
        const todas = res.data.solicitudes; 
        
        const pendientes = todas.filter(s => s.estado_solicitud === 'Pendiente').length;
        const enCamino = todas.filter(s => s.estado_solicitud === 'En proceso').length;
        const rescatados = todas.filter(s => s.estado_solicitud === 'Atendido' || s.estado_solicitud === 'Finalizado').length;

        setStats({ pendientes, enCamino, rescatados });
        
        // Tomamos las 3 más recientes
        setSolicitudesRecientes(todas.slice(0, 3));
      })
      .catch(err => console.log("Error al traer solicitudes:", err));
  }, []);

  return (
    <div>
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="tarjeta-estadistica flex-row items-center justify-between">
          <div>
            <p className="texto-estadistica">Solicitudes pendientes</p>
            <p className="numero-estadistica text-red-600">{stats.pendientes}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600 text-xl">⚠️</div>
        </div>

        <div className="tarjeta-estadistica flex-row items-center justify-between">
          <div>
            <p className="texto-estadistica">En camino</p>
            <p className="numero-estadistica text-orange-600">{stats.enCamino}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full text-orange-600 text-xl">🚑</div>
        </div>

        <div className="tarjeta-estadistica flex-row items-center justify-between">
          <div>
            <p className="texto-estadistica">Rescatados / Atendidos</p>
            <p className="numero-estadistica text-green-600">{stats.rescatados}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600 text-xl">✅</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 tarjeta-estadistica">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mapa de tu zona asignada</h3>
          <MapaEmergencias />
        </div>

        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h3>
          <div className="flex flex-col gap-3">
            {solicitudesRecientes.length > 0 ? solicitudesRecientes.map(sos => (
              <div key={sos._id} className="border-l-4 border-red-500 pl-3 py-1">
                <p className="text-sm font-bold text-gray-800">{sos.tipo_ayuda}</p>
                <p className="text-xs text-gray-500 truncate">{sos.descripcion_emergencia}</p>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No hay actividad reciente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}