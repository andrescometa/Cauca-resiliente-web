import { useState } from 'react';
import InicioSocorrista from '../pages/InicioSocorrista';
import SolicitudesSocorrista from '../pages/SolicitudesSocorrista';
import MapaEmergencias from './MapaEmergencias';
import MiEquipo from '../pages/MiEquipo';
import Historial from '../pages/Historial';
import PerfilSocorrista from '../pages/PerfilSocorrista';
import AcercaDe from '../pages/AcercaDe';

export default function LayoutSocorrista({ usuario, cerrarSesion }) {
  const [pantallaActual, setPantallaActual] = useState('inicio');

  const iniciales = usuario.nombres.charAt(0) + (usuario.apellidos ? usuario.apellidos.charAt(0) : '');
  
  // Tomamos el estado directo del usuario
  const estadoActual = usuario.estado_operativo || 'Disponible';

  return (
    <div className="pantalla-completa">
      <aside className="barra-lateral-admin">
        <div>
          <div className="logo-universidad-caja">
            <div className="logo-cuadro-amarillo">CR</div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white">CAUCA<br/>RESILIENTE</h1>
              <p className="text-[10px] text-gray-400">Portal Socorrista</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-2 px-4">
            <button onClick={() => setPantallaActual('inicio')} className={`boton-menu-lateral ${pantallaActual === 'inicio' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Inicio</button>
            <button onClick={() => setPantallaActual('solicitudes')} className={`boton-menu-lateral ${pantallaActual === 'solicitudes' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Solicitudes SOS</button>
            <button onClick={() => setPantallaActual('mapa')} className={`boton-menu-lateral ${pantallaActual === 'mapa' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Mapa de Emergencia</button>
            <button onClick={() => setPantallaActual('equipo')} className={`boton-menu-lateral ${pantallaActual === 'equipo' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Mi Equipo</button>
            <button onClick={() => setPantallaActual('historial')} className={`boton-menu-lateral ${pantallaActual === 'historial' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Historial</button>
            <button onClick={() => setPantallaActual('perfil')} className={`boton-menu-lateral ${pantallaActual === 'perfil' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Mi Perfil</button>
            <button onClick={() => setPantallaActual('acerca')} className={`boton-menu-lateral ${pantallaActual === 'acerca' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>Acerca de</button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700 text-sm">
          <button onClick={cerrarSesion} className="bg-gray-800 text-white text-xs p-2 mb-3 rounded w-full hover:bg-gray-700 font-bold transition">Cerrar Sesión</button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">{iniciales}</div>
            <div>
              <p className="font-bold text-white">{usuario.nombres} {usuario.apellidos}</p>
              <p className="text-green-400 text-xs flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> En línea</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="cabecera-superior">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {pantallaActual === 'inicio' ? 'Panel de Control' : pantallaActual}
            </h2>
            <p className="text-sm text-gray-500">Portal del Socorrista</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* INDICADOR DE ESTADO (Ya no es un select) */}
            <div className={`font-bold px-4 py-2 rounded-lg text-sm border ${
              estadoActual === 'Disponible' ? 'bg-green-100 text-green-700 border-green-200' :
              estadoActual === 'En camino' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              estadoActual === 'Ocupado' ? 'bg-red-100 text-red-700 border-red-200' :
              'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              Estado: {estadoActual}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {pantallaActual === 'inicio' && <InicioSocorrista />}
          {pantallaActual === 'solicitudes' && <SolicitudesSocorrista usuario={usuario} />}
          {pantallaActual === 'mapa' && (
            <div className="tarjeta-estadistica">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Mapa de Emergencias en tu Zona</h3>
              <MapaEmergencias />
            </div>
          )}
          {pantallaActual === 'equipo' && <MiEquipo usuarioActual={usuario} />}
          {pantallaActual === 'historial' && <Historial />}
          {pantallaActual === 'perfil' && <PerfilSocorrista usuario={usuario} />}
          {pantallaActual === 'acerca' && <AcercaDe />}
        </div>
      </main>
    </div>
  );
}