// ===== ARCHIVO: pages/Registro.jsx =====
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Registro({ alRegistrarse, irAlLogin }) {
  const [formulario, setFormulario] = useState({
    nombres: '', apellidos: '', 
    tipo_documento: 'CC', // <-- Valor por defecto
    identificacion: '', 
    email: '', password: '', telefono: '', rol_id: 1, 
    departamento_id: '', municipio_id: '', direccion: '',
    tipo_sangre: 'O+', alergias: '', discapacidades: '',
    contacto_emergencia: { nombre: '', telefono: '', parentesco: '' }
  });
  
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/ubicaciones/departamentos')
      .then(res => setDepartamentos(res.data))
      .catch(err => console.error("Error cargando departamentos", err));
  }, []);

  useEffect(() => {
    if (formulario.departamento_id) {
      axios.get(`http://localhost:3000/api/ubicaciones/municipios/${formulario.departamento_id}`)
        .then(res => setMunicipios(res.data))
        .catch(err => console.error(err));
    } else {
      setMunicipios([]);
    }
  }, [formulario.departamento_id]);

  const manejarCambio = (e) => {
    // Importante: Convertimos departamento y municipio a Número, el resto a texto
    const valor = (e.target.name === 'departamento_id' || e.target.name === 'municipio_id' || e.target.name === 'rol_id') 
      ? Number(e.target.value) 
      : e.target.value;
      
    setFormulario({ ...formulario, [e.target.name]: valor });
  };

  const manejarCambioContacto = (e) => {
    setFormulario({
      ...formulario,
      contacto_emergencia: { ...formulario.contacto_emergencia, [e.target.name]: e.target.value }
    });
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const datosAEnviar = {
        ...formulario,
        // Si está vacío, mandamos un array por defecto para que no falle
        alergias: formulario.alergias ? formulario.alergias.split(',').map(item => item.trim()) : ['Ninguna'],
        discapacidades: formulario.discapacidades ? formulario.discapacidades.split(',').map(item => item.trim()) : ['Ninguna']
      };

      await axios.post('http://localhost:3000/api/usuarios/registro', datosAEnviar);
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      alRegistrarse(); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.mensaje || 'Error de red');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#facc15] rounded-xl flex items-center justify-center text-[#0f172a] font-black text-2xl mb-4 shadow-sm">UA</div>
          <h2 className="text-2xl font-bold text-gray-800">Crear Cuenta</h2>
          <p className="text-sm text-gray-500 mt-1">Todos los campos son obligatorios</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={manejarRegistro} className="flex flex-col gap-4">
          
          {/* DATOS PERSONALES */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Nombres</label>
              <input type="text" name="nombres" required onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Apellidos</label>
              <input type="text" name="apellidos" required onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Tipo Documento</label>
              {/* AQUÍ ESTABA EL ERROR: Faltaba el onChange */}
              <select name="tipo_documento" required onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border bg-white">
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula de Extranjería</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Identificación</label>
              <input type="text" name="identificacion" required onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Correo</label>
              <input type="email" name="email" required onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Contraseña</label>
              <input type="password" name="password" required onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Teléfono</label>
              <input type="text" name="telefono" required onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Rol</label>
              <select name="rol_id" onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border bg-white">
                <option value={1}>Ciudadano</option>
                <option value={2}>Estudiante</option>
                <option value={3}>Socorrista</option>
              </select>
            </div>
          </div>

          {/* UBICACIÓN */}
          <div className="border-t pt-4 mt-2">
            <h4 className="text-md font-bold text-gray-800 mb-3">Ubicación</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Departamento</label>
                <select name="departamento_id" onChange={manejarCambio} required className="w-full px-3 py-2 rounded-lg border bg-white">
                  <option value="">Seleccione...</option>
                  {departamentos.map(dep => <option key={dep._id} value={dep._id}>{dep.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Municipio</label>
                <select name="municipio_id" onChange={manejarCambio} required disabled={!formulario.departamento_id} className="w-full px-3 py-2 rounded-lg border bg-white disabled:bg-gray-100">
                  <option value="">Seleccione...</option>
                  {municipios.map(mun => <option key={mun._id} value={mun._id}>{mun.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-sm font-bold text-gray-700 mb-1 block">Dirección (Opcional)</label>
              <input type="text" name="direccion" onChange={manejarCambio} placeholder="Ej: Calle 5 # 10-20" className="w-full px-3 py-2 rounded-lg border" />
            </div>
          </div>

          {/* INFORMACIÓN MÉDICA Y CONTACTO (Igual que antes) */}
          <div className="border-t pt-4 mt-2">
            <h4 className="text-md font-bold text-red-600 mb-3">Información Médica</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Tipo de Sangre</label>
                <select name="tipo_sangre" onChange={manejarCambio} className="w-full px-3 py-2 rounded-lg border bg-white font-bold text-red-600">
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
              <div className="col-span-2">
                <label className="text-sm font-bold text-gray-700 mb-1 block">Alergias (separadas por coma)</label>
                <input type="text" name="alergias" onChange={manejarCambio} placeholder="Ej: Penicilina (Si no tiene, escriba: Ninguna)" className="w-full px-3 py-2 rounded-lg border" />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <h4 className="text-md font-bold text-blue-600 mb-3">Contacto de Emergencia</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Nombre</label>
                <input type="text" name="nombre" required onChange={manejarCambioContacto} placeholder="Ej: Rosa" className="w-full px-3 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Teléfono</label>
                <input type="text" name="telefono" required onChange={manejarCambioContacto} className="w-full px-3 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Parentesco</label>
                <input type="text" name="parentesco" required onChange={manejarCambioContacto} placeholder="Ej: Madre" className="w-full px-3 py-2 rounded-lg border" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={cargando} className="w-full bg-[#0f172a] text-white font-bold py-3 rounded-lg mt-4 hover:bg-gray-800 disabled:opacity-50">
            {cargando ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={irAlLogin} className="text-[#0f172a] font-bold hover:underline">Inicia sesión aquí</button>
        </div>
      </div>
    </div>
  );
}