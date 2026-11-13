// ===== ARCHIVO: pages/InicioCiudadano.jsx =====
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function InicioCiudadano({ usuario }) {
  const [estadoActual, setEstadoActual] = useState('A salvo');
  const [emergenciaActiva, setEmergenciaActiva] = useState(null);
  const [cargandoEstado, setCargandoEstado] = useState(true);
  const [mensaje, setMensaje] = useState('');
  
  // Estados para el modal rápido de peligro
  const [mostrarRiesgo, setMostrarRiesgo] = useState(false);
  const [tipoPeligro, setTipoPeligro] = useState('Derrumbe');

  const verificarEmergencia = () => {
    axios.get(`http://localhost:3000/api/solicitudes/activa/${usuario._id}`)
      .then(res => {
        setEmergenciaActiva(res.data.solicitud);
        setCargandoEstado(false);
      })
      .catch(() => {
        setEmergenciaActiva(null);
        setCargandoEstado(false);
      });
  };

  useEffect(() => {
    verificarEmergencia();
    const intervalo = setInterval(verificarEmergencia, 5000);
    return () => clearInterval(intervalo);
  }, [usuario._id]);

  // GUARDAR ESTADO "A SALVO"
  const marcarASalvo = async () => {
    setEstadoActual('A salvo');
    try {
      await axios.put(`http://localhost:3000/api/estados/${usuario._id}`, {
        estado: 'A salvo',
        mensaje_estado: 'El ciudadano ha confirmado que se encuentra bien.'
      });
    } catch (error) {
      console.error("Error al guardar", error);
    }
  };

  // CREAR ALERTA DE RIESGO (Naranja en el mapa)
  const crearAlertaRiesgo = async () => {
    setMostrarRiesgo(false);
    setEstadoActual('En riesgo');
    
    try {
      // 1. Guardamos el estado de seguridad
      await axios.put(`http://localhost:3000/api/estados/${usuario._id}`, {
        estado: 'En riesgo',
        mensaje_estado: `Reporta peligro: ${tipoPeligro}`
      });

      // 2. Creamos una solicitud SOS de prioridad ALTA para que aparezca a los socorristas
      await axios.post('http://localhost:3000/api/solicitudes', {
        usuario_id: usuario._id,
        tipo_ayuda: 'Apoyo Logístico', // Puedes ajustar esto
        descripcion_emergencia: `¡ALERTA DE RIESGO! El ciudadano reporta: ${tipoPeligro}`,
        nivel_prioridad: 'Alta'
      });

      verificarEmergencia();
    } catch (error) {
      alert("Error al enviar la alerta de riesgo");
    }
  };

  if (cargandoEstado) return <div className="text-center mt-10 text-gray-500">Cargando estado...</div>;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* COLUMNA IZQUIERDA: ESTADO */}
      <div className="tarjeta-estadistica">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Hola, {usuario.nombres}</h3>
        <p className="text-sm text-gray-500 mb-6">¿Cómo te encuentras el día de hoy?</p>
        
        <div className="flex flex-col gap-4">
          <button onClick={marcarASalvo} className={`p-4 rounded-xl border-2 font-bold flex items-center gap-3 transition ${estadoActual === 'A salvo' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
            <span className="text-2xl">✅</span> Estoy a salvo
          </button>
          
          <button onClick={() => setMostrarRiesgo(true)} className={`p-4 rounded-xl border-2 font-bold flex items-center gap-3 transition ${estadoActual === 'En riesgo' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
            <span className="text-2xl">⚠️</span> Estoy en riesgo
          </button>
        </div>

        {/* MENSAJE MOTIVACIONAL */}
        {estadoActual === 'A salvo' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            <p className="font-bold mb-1">🌟 ¡Qué buena noticia!</p>
            <p>Tu estado "A salvo" ya se refleja en el mapa. Tus familiares y los rescatistas saben que estás bien.</p>
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA: SOS Y EMERGENCIA */}
      <div className="tarjeta-estadistica bg-white flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
        
        {emergenciaActiva ? (
          <div className="p-4 w-full">
            <h3 className="text-2xl font-bold text-red-600 mb-2">🚨 Emergencia Activa</h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-left w-full">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Código de tu SOS</p>
              <p className="font-bold text-[#0f172a] text-2xl mb-4">SOS-{String(emergenciaActiva._id).padStart(4, '0')}</p>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Estado actual</p>
              <p className="font-bold text-orange-600 mb-4">{emergenciaActiva.estado_solicitud}</p>
              <p className="text-sm text-gray-600">Tu solicitud está en la lista de prioridades. Mantén la calma.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Necesitas Ayuda Urgente?</h3>
            <p className="text-sm text-gray-500 mb-6">Presiona el botón SOS. Tu ubicación GPS será enviada.</p>

            <button 
              onClick={() => {
                axios.post('http://localhost:3000/api/solicitudes', {
                  usuario_id: usuario._id, 
                  tipo_ayuda: 'Rescate',
                  descripcion_emergencia: mensaje || 'Emergencia reportada desde el portal web',
                  nivel_prioridad: 'Crítica'
                }).then(() => verificarEmergencia());
              }}
              className="w-40 h-40 mx-auto bg-red-600 text-white rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95 transition-all border-8 border-red-200"
            >
              <span className="text-4xl font-black tracking-widest mb-1">SOS</span>
              <span className="text-xs font-bold">PRESIONAR</span>
            </button>

            <div className="w-full mt-8">
              <input 
                type="text" 
                placeholder="Describe tu emergencia (opcional)..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* MODAL RÁPIDO DE RIESGO */}
      {mostrarRiesgo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">¿Qué tipo de peligro tienes?</h3>
            <select 
              value={tipoPeligro} 
              onChange={(e) => setTipoPeligro(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            >
              <option value="Derrumbe">Derrumbe / Deslizamiento</option>
              <option value="Inundación">Inundación</option>
              <option value="Incendio">Incendio</option>
              <option value="Falla Estructural">Falla Estructural</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setMostrarRiesgo(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-bold">Cancelar</button>
              <button onClick={crearAlertaRiesgo} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600">Notificar Peligro</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}