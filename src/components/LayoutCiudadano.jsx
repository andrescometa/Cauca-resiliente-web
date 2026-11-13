import { useState } from 'react';
import InicioCiudadano from '../pages/InicioCiudadano';
import DatosCiudadano from '../pages/DatosCiudadano'; // NUEVO
import AcercaDe from '../pages/AcercaDe'; // NUEVO

export default function LayoutCiudadano({ usuario, cerrarSesion }) {
  const [pantallaActual, setPantallaActual] = useState('inicio');

  const iniciales = usuario.nombres.charAt(0) + (usuario.apellidos ? usuario.apellidos.charAt(0) : '');

  return (
    <div className="pantalla-completa">
      
      <aside className="barra-lateral-admin">
        <div>
          <div className="logo-universidad-caja">
            <div className="logo-cuadro-amarillo">UA</div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white">CAUCA<br/>RESILIENTE</h1>
              <p className="text-[10px] text-gray-400">Portal Ciudadano</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-2 px-4">
            <button onClick={() => setPantallaActual('inicio')} className={`boton-menu-lateral ${pantallaActual === 'inicio' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>
              Mi Estado
            </button>
            <button onClick={() => setPantallaActual('datos')} className={`boton-menu-lateral ${pantallaActual === 'datos' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>
              Mis Datos
            </button>
            <button onClick={() => setPantallaActual('acerca')} className={`boton-menu-lateral ${pantallaActual === 'acerca' ? 'boton-menu-lateral-activo' : 'boton-menu-lateral-inactivo'}`}>
              Acerca de
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700 text-sm">
          <button onClick={cerrarSesion} className="bg-gray-800 text-white text-xs p-2 mb-3 rounded w-full hover:bg-gray-700 font-bold transition">
            Cerrar Sesión
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
              {iniciales}
            </div>
            <div>
              <p className="font-bold text-white">{usuario.nombres} {usuario.apellidos}</p>
              <p className="text-gray-400 text-xs">Ciudadano</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="cabecera-superior bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {pantallaActual === 'inicio' ? 'Mi Estado de Seguridad' : 
               pantallaActual === 'datos' ? 'Mi Información Personal' : 
               'Acerca de Cauca Resiliente'}
            </h2>
            <p className="text-sm text-gray-500">Protege tu vida y la de tu familia</p>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 border border-green-200">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span> GPS Activo
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {pantallaActual === 'inicio' && <InicioCiudadano usuario={usuario} />}
          {pantallaActual === 'datos' && <DatosCiudadano usuario={usuario} />}
          {pantallaActual === 'acerca' && <AcercaDe />}
        </div>
      </main>
    </div>
  );
}