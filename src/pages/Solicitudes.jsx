// ===== ARCHIVO: pages/Solicitudes.jsx =====
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarSolicitudes = () => {
    axios.get('http://localhost:3000/api/solicitudes')
      .then((respuesta) => {
        // Validación para evitar que el .map() explote si la API falla
        const datos = respuesta.data?.solicitudes || [];
        setSolicitudes(datos);
        setCargando(false);
      })
      .catch(err => {
        console.log("Error al cargar solicitudes:", err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const manejarAsignacion = async (id, nuevoEstado) => {
    try {
      await axios.put(`http://localhost:3000/api/solicitudes/${id}`, {
        estado_solicitud: nuevoEstado
      });
      cargarSolicitudes();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("No se pudo actualizar la solicitud");
    }
  };

  const obtenerClasePrioridad = (prioridad) => {
    switch(prioridad) {
      case 'Crítica': return 'etiqueta-sos-critica';
      case 'Alta': return 'etiqueta-sos-alta';
      case 'Media': return 'etiqueta-sos-media';
      default: return 'etiqueta-sos-baja';
    }
  };

  if (cargando) return <div className="text-center mt-10 text-gray-500">Cargando solicitudes SOS...</div>;

  return (
    <div className="contenedor-tabla-sos">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Emergencias recibidas</h3>
        <span className="text-sm font-medium text-red-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Actualización en tiempo real
        </span>
      </div>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="tabla-sos-cabecera">
            <th className="p-3">Código SOS</th>
            <th className="p-3">Tipo de Ayuda</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Prioridad</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Acción</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((sos) => (
            // Validación de que sos._id exista antes de hacer el .toString()
            <tr key={sos._id || Math.random()} className="fila-sos-tabla">
              <td className="p-3 font-bold text-[#0f172a]">
                SOS-{sos._id ? String(sos._id).slice(-4).padStart(4, '0') : '0000'}
              </td>
              <td className="p-3 font-medium text-gray-800">{sos.tipo_ayuda || 'No especificado'}</td>
              <td className="p-3 text-gray-600 truncate max-w-[200px]">{sos.descripcion_emergencia || 'Sin descripción'}</td>
              <td className="p-3">
                <span className={obtenerClasePrioridad(sos.nivel_prioridad)}>
                  {sos.nivel_prioridad || 'Baja'}
                </span>
              </td>
              <td className="p-3">
                <span className="etiqueta-estado-sos">
                  {sos.estado_solicitud || 'Pendiente'}
                </span>
              </td>
              <td className="p-3">
                {sos.estado_solicitud === 'Pendiente' ? (
                  <button 
                    onClick={() => manejarAsignacion(sos._id, 'En proceso')}
                    className="boton-asignar-rescate"
                  >
                    Asignar Rescate
                  </button>
                ) : (
                  <button 
                    onClick={() => manejarAsignacion(sos._id, 'Atendido')}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold hover:bg-green-200 transition"
                  >
                    Marcar Atendido
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {solicitudes.length === 0 && (
        <p className="text-gray-500 text-center mt-4">No hay solicitudes de emergencia activas.</p>
      )}
    </div>
  );
}