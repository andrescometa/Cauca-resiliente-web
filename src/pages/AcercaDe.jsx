export default function AcercaDe() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      <div className="tarjeta-estadistica bg-gradient-to-r from-[#0f172a] to-gray-800 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#facc15] rounded-2xl flex items-center justify-center text-[#0f172a] font-black text-3xl shadow-lg">
            UA
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Cauca Resiliente</h2>
            <p className="text-gray-300 text-lg">Sistema móvil y web de apoyo para la localización y atención durante emergencias.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="tarjeta-estadistica">
          <h3 className="text-xl font-bold text-gray-800 mb-3">🎯 ¿Para qué sirve esta app?</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Cauca Resiliente nace como respuesta a la necesidad de optimizar la ayuda humanitaria en situaciones de desastre (terremotos, deslizamientos, erupciones volcánicas).
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-2">
            <li>Permite a los ciudadanos reportar su estado (A salvo, Atrapado, etc.).</li>
            <li>Envía alertas SOS con geolocalización GPS en tiempo real.</li>
            <li>Cruza información médica vital (alergias, tipo de sangre) para rescates seguros.</li>
            <li>Coordina a los organismos de socorro (Cruz Roja, Bomberos, Defensa Civil).</li>
          </ul>
        </div>

        <div className="tarjeta-estadistica">
          <h3 className="text-xl font-bold text-gray-800 mb-4">👨‍💻 Desarrolladores</h3>
          <p className="text-sm text-gray-500 mb-4">Proyecto académico desarrollado para la Universidad Autónoma del Cauca.</p>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">AC</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Andrés Felipe Cometa</p>
                <p className="text-xs text-gray-500">Desarrollador Full Stack</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">DV</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Didier Felipe Valencia</p>
                <p className="text-xs text-gray-500">Desarrollador Full Stack</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-4">Versión 1.0 · Popayán, Cauca · 2026</p>
    </div>
  );
}