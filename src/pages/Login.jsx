import { useState } from 'react';
import axios from 'axios';

export default function Login({ alIniciarSesion, irAlRegistro }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await axios.post('http://localhost:3000/api/usuarios/login', {
        email: email,
        password: password
      });

      const { usuario } = respuesta.data;
      alIniciarSesion(usuario);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#facc15] rounded-xl flex items-center justify-center text-[#0f172a] font-black text-2xl mb-4 shadow-sm">
            UA
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
          <p className="text-sm text-gray-500 mt-1">Ingresa a tu cuenta de Cauca Resiliente</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={manejarLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Correo Electrónico</label>
            <input 
              type="email" 
              required
              placeholder="ejemplo@unicauca.edu.co"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Contraseña</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-[#0f172a] text-white font-bold py-3 rounded-lg mt-2 hover:bg-gray-800 transition disabled:opacity-50"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* BOTÓN PARA IR AL REGISTRO */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">¿No tienes cuenta?</p>
          <button onClick={irAlRegistro} className="text-[#0f172a] font-bold hover:underline mt-1 text-sm">
            Regístrate aquí
          </button>
        </div>

      </div>
    </div>
  );
}