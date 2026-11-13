import { useState } from 'react';
import Login from './pages/Login';
import Registro from './pages/Registro'; // NUEVO
import Usuarios from './pages/Usuarios';
import Solicitudes from './pages/Solicitudes';
import MapaEmergencias from './components/MapaEmergencias';
import TarjetasEstadisticas from './components/TarjetasEstadisticas';
import PanelEmergencias from './components/PanelEmergencias';
import LayoutSocorrista from './components/LayoutSocorrista';
import LayoutCiudadano from './components/LayoutCiudadano';
import Socorristas from './pages/Socorristas';

function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [pantallaActual, setPantallaActual] = useState('panel');
  
  // NUEVO ESTADO: Para saber si mostramos el Login o el Registro
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const manejarInicioSesion = (usuario) => setUsuarioLogueado(usuario);
  
  const cerrarSesion = () => {
    setUsuarioLogueado(null);
    setPantallaActual('panel');
    setMostrarRegistro(false);
  };

  // ================= 1. SI NO HAY USUARIO, MUESTRA LOGIN O REGISTRO =================
  if (!usuarioLogueado) {
    if (mostrarRegistro) {
      return <Registro alRegistrarse={() => setMostrarRegistro(false)} irAlLogin={() => setMostrarRegistro(false)} />;
    } else {
      return <Login alIniciarSesion={manejarInicioSesion} irAlRegistro={() => setMostrarRegistro(true)} />;
    }
  }

    // ================= 2. LÓGICA DE ROLES =================
  if (usuarioLogueado.rol_id === 3) {
    return <LayoutSocorrista usuario={usuarioLogueado} cerrarSesion={cerrarSesion} />;
  }

  if (usuarioLogueado.rol_id === 1 || usuarioLogueado.rol_id === 2) {
    return <LayoutCiudadano usuario={usuarioLogueado} cerrarSesion={cerrarSesion} />;
  }

  // ================= 3. VISTA DEL ADMINISTRADOR =================
  return (
    <div className="pantalla-completa">
      <aside className="barra-lateral-admin">
        <div>
          <div className="logo-universidad-caja">
            <div className="logo-cuadro-amarillo">UA</div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white">CAUCA<br/>RESILIENTE</h1>
              <p className="text-[10px] text-gray-400">Uniautónoma del Cauca</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-2 px-4">
            <button onClick={() => setPantallaActual('panel')} className={`boton-menu-lateral ${pantallaActual === 'panel' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Panel Principal</button>
            <button onClick={() => setPantallaActual('usuarios')} className={`boton-menu-lateral ${pantallaActual === 'usuarios' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Usuarios</button>
            <button onClick={() => setPantallaActual('socorristas')} className={`boton-menu-lateral ${pantallaActual === 'socorristas' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Socorristas</button>
            <button onClick={() => setPantallaActual('solicitudes')} className={`boton-menu-lateral ${pantallaActual === 'solicitudes' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Solicitudes SOS</button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700 text-sm">
          <button onClick={cerrarSesion} className="bg-gray-800 text-white text-xs p-2 mb-3 rounded w-full hover:bg-gray-700 font-bold transition">Cerrar Sesión</button>
          <p className="font-bold text-white">{usuarioLogueado.nombres}</p>
          <p className="text-gray-400 text-xs">Administrador</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="cabecera-superior">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{pantallaActual === 'panel' ? 'Panel Principal' : pantallaActual}</h2>
            <p className="text-sm text-gray-500">Resumen operativo en tiempo real</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-500 w-64">Buscar en el sistema...</div>
            <div className="avatar-usuario-iniciales">{usuarioLogueado.nombres.charAt(0)}</div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {pantallaActual === 'panel' && (
            <div>
              <TarjetasEstadisticas />
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 tarjeta-estadistica">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Mapa general de emergencias · Popayán</h3>
                  <MapaEmergencias />
                </div>
                <div className="col-span-1"><PanelEmergencias /></div>
              </div>
            </div>
          )}
          {pantallaActual === 'usuarios' && <Usuarios />}
          {pantallaActual === 'solicitudes' && <Solicitudes />}
          {pantallaActual === 'socorristas' && <Socorristas />}
        </div>
      </main>
    </div>
  );
}

export default App;