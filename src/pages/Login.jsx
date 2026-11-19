import { useState } from 'react';
import { api, guardarSesion } from '../api';

export default function Login({ alIniciarSesion }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await api.post('/api/auth/login', { email, password });
      const { token, user } = respuesta.data;

      if (!token || !user) {
        setError('Respuesta inesperada del servidor.');
        return;
      }

      if (user.rol !== 'admin') {
        setError('Esta plataforma es exclusiva para administradores. Usa la app móvil para tu cuenta.');
        return;
      }

      guardarSesion(token, user);
      alIniciarSesion({ token, usuario: user });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 404) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError(err?.response?.data?.mensaje || 'No se pudo conectar con el servidor.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel de marca */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#facc15] rounded-xl flex items-center justify-center text-[#0f172a] font-black text-xl">
            UA
          </div>
          <div>
            <p className="font-bold leading-tight">CAUCA RESILIENTE</p>
            <p className="text-xs text-gray-400">Uniautónoma del Cauca</p>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-black leading-tight">
            Centro de control
            <br />
            <span className="text-[#facc15]">Cauca Resiliente</span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-md">
            Plataforma de administración para monitorear usuarios, emergencias y socorristas en
            tiempo real.
          </p>
        </div>

        <p className="text-xs text-gray-500">
          Acceso restringido · Solo cuentas con rol Administrador
        </p>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-[#facc15] rounded-xl flex items-center justify-center text-[#0f172a] font-black text-2xl mb-4 shadow-sm">
              UA
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Panel administrativo</h2>
            <p className="text-sm text-gray-500 mt-1">Inicia sesión con tu cuenta de administrador</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={manejarLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Correo electrónico</label>
              <input
                type="email"
                required
                placeholder="admin@uniautonoma.edu.co"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-[#0f172a] text-white font-bold py-3 rounded-lg mt-2 hover:bg-gray-800 transition disabled:opacity-50"
            >
              {cargando ? 'Validando permisos...' : 'Entrar al panel'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Los ciudadanos y socorristas usan la aplicación móvil.
          </p>
        </div>
      </div>
    </div>
  );
}
