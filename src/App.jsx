import { useState } from 'react';
import Login from './pages/Login';
import Panel from './pages/Panel';
import Usuarios from './pages/Usuarios';
import Socorristas from './pages/Socorristas';
import Solicitudes from './pages/Solicitudes';
import Mapa from './pages/Mapa';
import Alertas from './pages/Alertas';
import Icono from './components/Icono';
import { borrarSesion, leerSesion, nombreRolUsuario } from './api';

const MENU = [
  { id: 'panel', nombre: 'Panel principal', icono: 'panel' },
  { id: 'usuarios', nombre: 'Usuarios', icono: 'usuarios' },
  { id: 'socorristas', nombre: 'Socorristas', icono: 'socorrista' },
  { id: 'solicitudes', nombre: 'Solicitudes SOS', icono: 'solicitudes' },
  { id: 'mapa', nombre: 'Mapa', icono: 'mapa' },
  { id: 'alertas', nombre: 'Alertas', icono: 'alertas' },
];

const TITULOS = {
  panel: {
    titulo: 'Panel principal',
    descripcion: 'Resumen operativo en tiempo real',
  },
  usuarios: {
    titulo: 'Gestión de usuarios',
    descripcion: 'Ciudadanos y administradores',
  },
  socorristas: {
    titulo: 'Socorristas',
    descripcion: 'Personal de rescate, disponibilidad y emergencias asignadas',
  },
  solicitudes: {
    titulo: 'Solicitudes SOS',
    descripcion: 'Emergencias recibidas y asignación de rescates',
  },
  mapa: {
    titulo: 'Mapa de emergencias',
    descripcion: 'Ubicaciones reportadas por latitud y longitud',
  },
  alertas: {
    titulo: 'Alertas del sistema',
    descripcion: 'Alertas activas y expiradas',
  },
};

function App() {
  const [sesion, setSesion] = useState(() => leerSesion());
  const [pantallaActual, setPantallaActual] = useState('panel');

  const iniciarSesion = (nuevaSesion) => {
    setSesion(nuevaSesion);
    setPantallaActual('panel');
  };

  const cerrarSesion = () => {
    borrarSesion();
    setSesion(null);
    setPantallaActual('panel');
  };

  if (!sesion) {
    return <Login alIniciarSesion={iniciarSesion} />;
  }

  const usuario = sesion.usuario;
  const { titulo, descripcion } = TITULOS[pantallaActual] || TITULOS.panel;

  return (
    <div className="pantalla-completa">
      <aside className="barra-lateral-admin">
        <div>
          <div className="logo-universidad-caja">
            <div className="logo-cuadro-amarillo">UA</div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white">
                CAUCA
                <br />
                RESILIENTE
              </h1>
              <p className="text-[10px] text-gray-400">Uniautónoma del Cauca</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1.5 px-3" aria-label="Menú principal">
            {MENU.map((item) => {
              const activo = pantallaActual === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPantallaActual(item.id)}
                  aria-current={activo ? 'page' : undefined}
                  className={`boton-menu-lateral flex items-center gap-3 ${
                    activo ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'
                  }`}
                >
                  <Icono
                    nombre={item.icono}
                    className={`w-5 h-5 shrink-0 ${activo ? 'text-[#0f172a]' : 'text-gray-400'}`}
                  />
                  <span>{item.nombre}</span>
                  {activo && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0f172a]" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700 text-sm">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-800/60 p-3">
            <div className="w-9 h-9 shrink-0 bg-[#facc15] rounded-full flex items-center justify-center text-[#0f172a] font-black">
              {(usuario?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-white">{usuario?.name || 'Administrador'}</p>
              <p className="truncate text-xs text-gray-400">
                {nombreRolUsuario(usuario) || 'Administrador'}
              </p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2 text-xs font-bold text-white transition hover:bg-gray-700"
          >
            <Icono nombre="salir" className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="cabecera-superior">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{titulo}</h2>
            <p className="text-sm text-gray-500">{descripcion}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-gray-800">{usuario?.name || 'Administrador'}</p>
              <p className="text-xs text-gray-500">{usuario?.email}</p>
            </div>
            <div className="avatar-usuario-iniciales">
              {(usuario?.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
          {pantallaActual === 'panel' && <Panel irA={setPantallaActual} />}
          {pantallaActual === 'usuarios' && <Usuarios />}
          {pantallaActual === 'socorristas' && <Socorristas irA={setPantallaActual} />}
          {pantallaActual === 'solicitudes' && <Solicitudes irA={setPantallaActual} />}
          {pantallaActual === 'mapa' && <Mapa irA={setPantallaActual} />}
          {pantallaActual === 'alertas' && <Alertas />}
        </div>
      </main>
    </div>
  );
}

export default App;
