import { useState } from 'react';

export default function PerfilSocorrista({ usuario }) {
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState({
    nombres: usuario.nombres || '',
    apellidos: usuario.apellidos || '',
    identificacion: usuario.identificacion || '',
    email: usuario.email || '',
    telefono: usuario.telefono || '',
    ciudad: usuario.ciudad || '',
    tipo_sangre: usuario.tipo_sangre || 'No registra',
  });

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="tarjeta-estadistica">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Mi Perfil de Socorrista</h3>
            <p className="text-sm text-gray-500">Información oficial registrada en el sistema.</p>
          </div>
          {!editando ? (
            <button onClick={() => setEditando(true)} className="bg-[#0f172a] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition">✏️ Editar Perfil</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditando(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 transition">Cancelar</button>
              <button onClick={() => { alert('Datos guardados (Simulación)'); setEditando(false); }} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition">💾 Guardar</button>
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
            <label className="text-xs font-bold text-gray-500 uppercase">Documento</label>
            <input type="text" name="identificacion" value={datos.identificacion} disabled className="w-full p-2 rounded-lg border border-transparent bg-gray-50 font-medium text-gray-800" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Correo (Institucional)</label>
            <input type="email" name="email" value={datos.email} disabled className="w-full p-2 rounded-lg border border-transparent bg-gray-50 font-medium text-gray-800" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
            <input type="text" name="telefono" value={datos.telefono} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Ciudad Base</label>
            <input type="text" name="ciudad" value={datos.ciudad} onChange={manejarCambio} disabled={!editando} className={`w-full p-2 rounded-lg border ${editando ? 'border-blue-400 bg-white' : 'border-transparent bg-gray-50'} font-medium text-gray-800`} />
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h4 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            <span>🩸</span> Información Médica (Para tu seguridad)
          </h4>
          <div className="grid grid-cols-2 gap-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}