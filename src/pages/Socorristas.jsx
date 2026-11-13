import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Socorristas() {
  const [socorristas, setSocorristas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/usuarios/todos')
      .then((respuesta) => {
        // EL FILTRO MÁGICO: Solo dejamos pasar a los que tienen rol_id === 3
        const soloSocorristas = respuesta.data.filter(user => user.rol_id === 3);
        setSocorristas(soloSocorristas);
        if (soloSocorristas.length > 0) setSeleccionado(soloSocorristas[0]);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al traer socorristas:", error);
        setCargando(false);
      });
  }, []);

  if (cargando) return <div className="text-center mt-10 text-gray-500">Cargando personal de socorro...</div>;

  return (
    <div className="flex gap-6 h-full">
      
      {/* TABLA DE SOCORRISTAS */}
      <div className="contenedor-tabla-usuarios flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Personal de Socorro Activo</h3>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
            {socorristas.length} Registrados
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="tabla-usuarios-cabecera">
                <th className="celda-tabla-usuarios">Nombre Completo</th>
                <th className="celda-tabla-usuarios">Documento</th>
                <th className="celda-tabla-usuarios">Ciudad Base</th>
                <th className="celda-tabla-usuarios">Estado</th>
              </tr>
            </thead>
            <tbody>
              {socorristas.map((user) => (
                <tr 
                  key={user._id} 
                  className={`fila-usuario-tabla ${seleccionado?._id === user._id ? 'fila-usuario-seleccionada' : ''}`}
                  onClick={() => setSeleccionado(user)}
                >
                  <td className="celda-tabla-usuarios font-medium text-gray-800">{user.nombres} {user.apellidos}</td>
                  <td className="celda-tabla-usuarios text-gray-600">{user.identificacion}</td>
                  <td className="celda-tabla-usuarios text-gray-600">{user.ciudad || 'Popayán'}</td>
                  <td className="celda-tabla-usuarios">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                      Disponible
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {socorristas.length === 0 && (
            <p className="text-gray-500 text-center mt-6">No hay socorristas registrados. Ve a la pestaña "Usuarios" para ascender a alguien.</p>
          )}
        </div>
      </div>

      {/* PANEL DE DETALLE DEL SOCORRISTA */}
      <div className="panel-detalle-usuario">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Perfil del Rescatista</h3>
        
        {seleccionado ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="avatar-usuario-iniciales bg-red-600">
                {seleccionado.nombres.charAt(0)}{seleccionado.apellidos.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800">{seleccionado.nombres} {seleccionado.apellidos}</p>
                <span className="text-xs font-bold text-red-600 uppercase">Socorrista</span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="titulo-seccion-detalle">Contacto</p>
                <p className="fila-dato-usuario"><span className="text-gray-600">Teléfono</span> <span className="font-medium">{seleccionado.telefono || 'No registra'}</span></p>
                <p className="fila-dato-usuario"><span className="text-gray-600">Correo</span> <span className="font-medium text-xs">{seleccionado.email}</span></p>
              </div>

              <div>
                <p className="titulo-seccion-detalle">Información Médica</p>
                <p className="fila-dato-usuario"><span className="text-gray-600">Tipo de sangre</span> <span className="font-bold text-red-600">{seleccionado.tipo_sangre || 'No registra'}</span></p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Selecciona un socorrista de la tabla.</p>
        )}
      </div>
    </div>
  );
}