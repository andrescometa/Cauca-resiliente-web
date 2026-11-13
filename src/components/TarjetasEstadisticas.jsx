import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TarjetasEstadisticas() {
  const [stats, setStats] = useState({
    usuarios: 0,
    solicitudes: 0,
    zonas: 0,
    socorristas: 0
  });

  useEffect(() => {
    // 1. Traer Usuarios (para contar total y socorristas)
    axios.get('http://localhost:3000/api/usuarios/todos')
      .then(res => {
        const todosLosUsuarios = res.data;
        const socorristas = todosLosUsuarios.filter(u => u.rol_id === 3).length;
        
        setStats(prev => ({ 
          ...prev, 
          usuarios: todosLosUsuarios.length,
          socorristas: socorristas
        }));
      })
      .catch(err => console.log("Error usuarios:", err));

    // 2. Traer Solicitudes SOS (para contar las activas)
    axios.get('http://localhost:3000/api/solicitudes')
      .then(res => {
        // Ojo: recordamos que las solicitudes vienen dentro de res.data.solicitudes
        const todas = res.data.solicitudes;
        const activas = todas.filter(s => s.estado_solicitud !== 'Atendido' && s.estado_solicitud !== 'Finalizado').length;
        setStats(prev => ({ ...prev, solicitudes: activas }));
      })
      .catch(err => console.log("Error solicitudes:", err));

    // 3. Traer Zonas de Riesgo
    axios.get('http://localhost:3000/api/zonas-riesgo')
      .then(res => {
        // Dependiendo de cómo esté tu API, puede que devuelva un array directo o un objeto. 
        // Si te da error, revisa si es res.data o res.data.zonas
        const zonas = Array.isArray(res.data) ? res.data : (res.data.zonas || []);
        setStats(prev => ({ ...prev, zonas: zonas.length }));
      })
      .catch(err => console.log("Error zonas de riesgo:", err));
  }, []);

  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      
      {/* Tarjeta 1: Usuarios */}
      <div className="tarjeta-estadistica flex-row items-center justify-between">
        <div>
          <p className="texto-estadistica">Total de usuarios</p>
          <p className="numero-estadistica">{stats.usuarios}</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-xl">👥</div>
      </div>

      {/* Tarjeta 2: Solicitudes SOS Activas */}
      <div className="tarjeta-estadistica flex-row items-center justify-between">
        <div>
          <p className="texto-estadistica">Solicitudes SOS activas</p>
          <p className="numero-estadistica text-red-600">{stats.solicitudes}</p>
        </div>
        <div className="bg-red-100 p-3 rounded-full text-red-600 text-xl">⚠️</div>
      </div>

      {/* Tarjeta 3: Zonas de Riesgo */}
      <div className="tarjeta-estadistica flex-row items-center justify-between">
        <div>
          <p className="texto-estadistica">Zonas de riesgo</p>
          <p className="numero-estadistica text-orange-600">{stats.zonas}</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full text-orange-600 text-xl">⛰️</div>
      </div>

      {/* Tarjeta 4: Socorristas Activos */}
      <div className="tarjeta-estadistica flex-row items-center justify-between">
        <div>
          <p className="texto-estadistica">Socorristas activos</p>
          <p className="numero-estadistica text-green-600">{stats.socorristas}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full text-green-600 text-xl">🛡️</div>
      </div>

    </div>
  );
}