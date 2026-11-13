import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Función para cargar los usuarios desde la API
  const cargarUsuarios = () => {
    axios.get('http://localhost:3000/api/usuarios/todos')
      .then((respuesta) => {
        setUsuarios(respuesta.data);
        if (respuesta.data.length > 0) setUsuarioSeleccionado(respuesta.data[0]);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al traer usuarios:", error);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Función para cambiar el rol
  const cambiarRol = async (id, nuevoRol) => {
    try {
      await axios.put(`http://localhost:3000/api/usuarios/${id}/rol`, {
        rol_id: Number(nuevoRol)
      });
      alert('Rol actualizado correctamente en la base de datos');
      cargarUsuarios(); // Recargamos la tabla para ver el cambio
    } catch (error) {
      console.error("Error al cambiar rol:", error);
      alert('Hubo un error al cambiar el rol');
    }
  };

  if (cargando) return <div className="text-center mt-10 text-gray-500">Cargando base de datos...</div>;

  return (
    <div className="flex gap-6 h-full">
      
      {/* TABLA DE USUARIOS */}
      <div className="contenedor-tabla-usuarios flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Gestión de Usuarios y Roles</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="tabla-usuarios-cabecera">
                <th className="celda-tabla-usuarios">Nombre Completo</th>
                <th className="celda-tabla-usuarios">Correo</th>
                <th className="celda-tabla-usuarios">Rol Actual</th>
                <th className="celda-tabla-usuarios">Cambiar Rol</th>
                <th className="celda-tabla-usuarios">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr 
                  key={user._id} 
                  className={`fila-usuario-tabla ${usuarioSeleccionado?._id === user._id ? 'fila-usuario-seleccionada' : ''}`}
                  onClick={() => setUsuarioSeleccionado(user)}
                >
                  <td className="celda-tabla-usuarios font-medium text-gray-800">{user.nombres} {user.apellidos}</td>
                  <td className="celda-tabla-usuarios text-gray-600">{user.email}</td>
                  <td className="celda-tabla-usuarios">
                    <span className="etiqueta-rol-usuario">
                      {user.rol_id === 1 ? 'Ciudadano' : user.rol_id === 2 ? 'Estudiante' : user.rol_id === 3 ? 'Socorrista' : 'Admin'}
                    </span>
                  </td>
                  <td className="celda-tabla-usuarios">
                    <select 
                      value={user.rol_id} 
                      onChange={(e) => cambiarRol(user._id, e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1"
                    >
                      <option value={1}>Ciudadano</option>
                      <option value={2}>Estudiante</option>
                      <option value={3}>Socorrista</option>
                      <option value={4}>Administrador</option>
                    </select>
                  </td>
                  <td className="celda-tabla-usuarios">
                    <button className="boton-ver-detalles-usuario">👁️ Ver ficha</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANEL DERECHO (DETALLE DEL USUARIO SELECCIONADO) */}
      <div className="panel-detalle-usuario">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ficha del Usuario</h3>
        
        {usuarioSeleccionado ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="avatar-usuario-iniciales">
                {usuarioSeleccionado.nombres.charAt(0)}{usuarioSeleccionado.apellidos.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800">{usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}</p>
                <span className="etiqueta-sos-baja">Activo</span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="titulo-seccion-detalle">Información Personal</p>
                <p className="fila-dato-usuario"><span className="text-gray-600">Documento</span> <span className="font-medium">{usuarioSeleccionado.identificacion}</span></p>
                <p className="fila-dato-usuario"><span className="text-gray-600">Teléfono</span> <span className="font-medium">{usuarioSeleccionado.telefono || 'No registra'}</span></p>
                <p className="fila-dato-usuario"><span className="text-gray-600">Ciudad</span> <span className="font-medium">{usuarioSeleccionado.ciudad || 'No registra'}</span></p>
              </div>

              <div>
                <p className="titulo-seccion-detalle">Información Médica</p>
                <p className="fila-dato-usuario"><span className="text-gray-600">Tipo de sangre</span> <span className="font-bold text-red-600">{usuarioSeleccionado.tipo_sangre || 'No registra'}</span></p>
                <p className="fila-dato-usuario"><span className="text-gray-600">Alergias</span> <span className="font-medium">{usuarioSeleccionado.alergias?.join(', ') || 'Ninguna'}</span></p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Selecciona un usuario de la tabla.</p>
        )}
      </div>
    </div>
  );
}