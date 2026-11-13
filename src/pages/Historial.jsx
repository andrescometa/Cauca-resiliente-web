// ===== ARCHIVO: pages/Historial.jsx =====
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Historial() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/solicitudes')
      .then((res) => {
        const todas = res.data?.solicitudes || [];
        const terminadas = todas.filter(
          s => s.estado_solicitud === 'Atendido' || s.estado_solicitud === 'Finalizado'
        );
        setHistorial(terminadas);
        setCargando(false);
      })
      .catch(err => {
        console.log(err);
        setCargando(false);
      });
  }, []);

  if (cargando) return <div className="text-center mt-10 text-gray-500">Cargando historial...</div>;

  return (
    <div className="contenedor-tabla-sos">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Emergencias Atendidas</h3>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="tabla-sos-cabecera">
            <th className="p-3">Código SOS</th>
            <th className="p-3">Tipo de Ayuda</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Estado Final</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((sos) => (
            <tr key={sos._id} className="fila-sos-tabla">
              <td className="p-3 font-bold text-[#0f172a]">
                SOS-{sos._id ? String(sos._id).slice(-4).padStart(4, '0') : '0000'}
              </td>
              <td className="p-3 font-medium text-gray-800">{sos.tipo_ayuda}</td>
              <td className="p-3 text-gray-600 truncate max-w-[200px]">{sos.descripcion_emergencia}</td>
              <td className="p-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold">
                  {sos.estado_solicitud}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {historial.length === 0 && (
        <p className="text-center text-gray-500 mt-6">Aún no hay rescates en el historial.</p>
      )}
    </div>
  );
}