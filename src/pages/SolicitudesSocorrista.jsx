// ===== ARCHIVO: pages/SolicitudesSocorrista.jsx =====
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SolicitudesSocorrista({ usuario }) {
  const [pendientes, setPendientes] = useState([]);
  const [miRescateActivo, setMiRescateActivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = () => {
    axios.get('http://localhost:3000/api/solicitudes')
      .then((respuesta) => {
        const todas = respuesta.data?.solicitudes || [];
        const soloPendientes = todas.filter(sos => sos.estado_solicitud === 'Pendiente');
        setPendientes(soloPendientes);

        // Buscamos si YO tengo alguna activa (incluyendo 'En el sitio')
        const activa = todas.find(sos => 
          ['En proceso', 'En camino', 'En el sitio'].includes(sos.estado_solicitud) && 
          String(sos.socorrista_id) === String(usuario._id)
        );
        setMiRescateActivo(activa || null);
        setCargando(false);
      })
      .catch(err => {
        console.log(err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarDatos();
    // Refrescar automáticamente cada 5 segundos por si entra una nueva alerta
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  const asignarmeEmergencia = async (idSolicitud) => {
    try {
      await axios.put(`http://localhost:3000/api/solicitudes/${idSolicitud}`, {
        estado_solicitud: 'En camino',
        socorrista_id: usuario._id
      });
      await axios.put(`http://localhost:3000/api/usuarios/${usuario._id}/estado`, {
        estado_operativo: 'En camino'
      });
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al asignarte la emergencia.");
    }
  };

  const llegarAlSitio = async (idSolicitud) => {
    try {
      await axios.put(`http://localhost:3000/api/solicitudes/${idSolicitud}`, {
        estado_solicitud: 'En el sitio'
      });
      await axios.put(`http://localhost:3000/api/usuarios/${usuario._id}/estado`, {
        estado_operativo: 'Ocupado'
      });
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Hubo un error.");
    }
  };

  const finalizarRescate = async (idSolicitud) => {
    try {
      await axios.put(`http://localhost:3000/api/solicitudes/${idSolicitud}`, {
        estado_solicitud: 'Atendido' // O 'Finalizado', como prefieras manejarlo
      });
      await axios.put(`http://localhost:3000/api/usuarios/${usuario._id}/estado`, {
        estado_operativo: 'Disponible'
      });
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al finalizar.");
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

  if (cargando) return <div className="text-center mt-10 text-gray-500">Buscando emergencias...</div>;

  return (
    <div className="flex flex-col gap-6">
      
      {/* PANEL DEL RESCATE ACTIVO */}
      {miRescateActivo && (
        <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-orange-800 mb-2 flex items-center gap-2">
            🚑 Tienes un rescate en curso
          </h3>
          <p className="text-gray-700 mb-4">
            Estás atendiendo <strong>SOS-{String(miRescateActivo._id).padStart(4, '0')}</strong>: {miRescateActivo.descripcion_emergencia}
          </p>
          <p className="text-sm font-bold text-orange-700 mb-4">Estado actual: {miRescateActivo.estado_solicitud}</p>

          <div className="flex gap-4">
            {miRescateActivo.estado_solicitud !== 'En el sitio' && (
              <button 
                onClick={() => llegarAlSitio(miRescateActivo._id)}
                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
              >
                📍 Marcar que he llegado al sitio
              </button>
            )}
            
            <button 
              onClick={() => finalizarRescate(miRescateActivo._id)}
              className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
            >
              ✅ Finalizar Rescate
            </button>
          </div>
        </div>
      )}

      {/* TABLA DE PENDIENTES */}
      <div className="contenedor-tabla-sos">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Alertas Disponibles</h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="tabla-sos-cabecera">
              <th className="p-3">Código SOS</th>
              <th className="p-3">Tipo de Ayuda</th>
              <th className="p-3">Descripción</th>
              <th className="p-3">Prioridad</th>
              <th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {pendientes.map((sos) => (
              <tr key={sos._id} className="fila-sos-tabla">
                <td className="p-3 font-bold text-[#0f172a]">
                  SOS-{String(sos._id).padStart(4, '0')}
                </td>
                <td className="p-3 font-medium text-gray-800">{sos.tipo_ayuda}</td>
                <td className="p-3 text-gray-600 truncate max-w-[200px]">{sos.descripcion_emergencia}</td>
                <td className="p-3">
                  <span className={obtenerClasePrioridad(sos.nivel_prioridad)}>
                    {sos.nivel_prioridad}
                  </span>
                </td>
                <td className="p-3">
                  <button 
                    onClick={() => asignarmeEmergencia(sos._id)}
                    className="bg-[#facc15] text-[#0f172a] px-4 py-2 rounded-md text-xs font-bold hover:bg-yellow-500 transition shadow"
                  >
                    Asignarme
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pendientes.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No hay alertas nuevas en este momento.</p>
        )}
      </div>
    </div>
  );
}