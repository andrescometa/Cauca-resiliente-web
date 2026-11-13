import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MiEquipo({ usuarioActual }) {
  const [compañeros, setCompañeros] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/usuarios/todos')
      .then((res) => {
        const equipo = res.data.filter(u => u.rol_id === 3 && u._id !== usuarioActual._id);
        setCompañeros(equipo);
      })
      .catch(err => console.log(err));
  }, [usuarioActual]);

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Disponible': return 'bg-green-100 text-green-700';
      case 'En camino': return 'bg-orange-100 text-orange-700';
      case 'En el sitio': return 'bg-blue-100 text-blue-700';
      case 'Ocupado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="tarjeta-estadistica">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Mi Equipo de Socorro</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compañeros.map((compañero) => (
            <div key={compañero._id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-gray-50 hover:bg-gray-100 transition shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg uppercase">
                  {compañero.nombres.charAt(0)}{compañero.apellidos.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-tight">{compañero.nombres} {compañero.apellidos}</p>
                  <p className="text-xs text-gray-500">{compañero.ciudad || 'Cauca'}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2 border-t pt-3">
                <span className="text-xs text-gray-400 font-bold uppercase">Estado</span>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${getColorEstado(compañero.estado_operativo || 'Disponible')}`}>
                  {compañero.estado_operativo || 'Disponible'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {compañeros.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No hay otros socorristas registrados en tu zona.</p>
        )}
      </div>
    </div>
  );
}