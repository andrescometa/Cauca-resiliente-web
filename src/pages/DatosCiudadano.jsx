import { useState } from 'react';

export default function DatosCiudadano({ usuario }) {
  const [editando, setEditando] = useState(false);
  
  // Nos aseguramos de leer los datos correctamente, incluso si vienen vacíos
  const [datos, setDatos] = useState({
    nombres: usuario.nombres || '',
    apellidos: usuario.apellidos || '',
    identificacion: usuario.identificacion || '',
    email: usuario.email || '',
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
    tipo_sangre: usuario.tipo_sangre || 'No registra',
    // Si alergias es un array, lo unimos con comas. Si no, lo dejamos vacío.
    alergias: Array.isArray(usuario.alergias) ? usuario.alergias.join(', ') : (usuario.alergias || ''),
    discapacidades: Array.isArray(usuario.discapacidades) ? usuario.discapacidades.join(', ') : (usuario.discapacidades || '')
  });

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const guardarCambios = () => {
    alert('Datos guardados exitosamente (Simulación).');
    setEditando(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="tarjeta-estadistica">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Información de Perfil</h3>
            <p className="text-sm text-gray-500">Estos datos son vitales para los organismos de socorro.</p>
          </div>
          {!editando ? (
            <button onClick={() => setEditando(true)} className="bg-[#0f172a] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition">
              ✏️ Editar Datos
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditando(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 transition">
                Cancelar
              </button>
              <button onClick={guardarCambios} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition">
                💾 Guardar Cambios
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Nombres</label>
            <input type="text" name="nombres" value={datos.nombres} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Apellidos</label>
            <input type="text" name="apellidos" value={datos.apellidos} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Identificación</label>
            <input type="text" name="identificacion" value={datos.identificacion} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Correo Electrónico</label>
            <input type="email" name="email" value={datos.email} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
            <input type="text" name="telefono" value={datos.telefono} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Dirección</label>
            <input type="text" name="direccion" value={datos.direccion} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h4 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            <span>🩸</span> Información Médica
          </h4>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Sangre</label>
              <select name="tipo_sangre" value={datos.tipo_sangre} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-bold text-red-600`}>
                <option value="No registra">No registra</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Alergias</label>
              <input type="text" name="alergias" value={datos.alergias} onChange={manejarCambio} disabled={!editando} placeholder="Ej: Penicilina, Maní" className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Discapacidades</label>
              <input type="text" name="discapacidades" value={datos.discapacidades} onChange={manejarCambio} disabled={!editando} placeholder="Ej: Visual, Motriz" className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}