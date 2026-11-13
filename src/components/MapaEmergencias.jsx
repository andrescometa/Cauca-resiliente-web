// ===== ARCHIVO: components/MapaEmergencias.jsx =====
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const iconoRojo = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const iconoNaranja = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const iconoVerde = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const iconoAzul = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });

export default function MapaEmergencias() {
  const posicionPopayan = [2.4448, -76.6147]; 
  const [puntos, setPuntos] = useState([]);

  useEffect(() => {
    const cargarPuntos = () => {
      axios.get('http://localhost:3000/api/map/points')
        .then(res => setPuntos(res.data))
        .catch(err => console.log("Error cargando mapa:", err));
    };
    cargarPuntos();
    // Actualiza el mapa cada 5 segundos para ver los cambios de color al instante
    const intervalo = setInterval(cargarPuntos, 5000); 
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer center={posicionPopayan} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {puntos.map((p) => {
          const posicion = [p.latitude, p.longitude]; 
          let icono = iconoVerde;
          if (p.type === 'socorrista') icono = iconoAzul;
          else if (p.color === 'red') icono = iconoRojo;
          else if (p.color === 'orange') icono = iconoNaranja;

          return (
            <Marker key={`user-${p.id}`} position={posicion} icon={icono}>
              <Popup>
                <div className="text-center">
                  <strong className="block text-sm">{p.name}</strong>
                  <span className="text-xs text-gray-500">Rol: {p.type === 'socorrista' ? 'Rescatista' : 'Ciudadano'}</span><br/>
                  <span className="text-xs font-bold mt-1 block">
                    {p.type === 'socorrista' ? '🚑 En servicio' : 
                     p.color === 'red' ? '🚨 Pidiendo Ayuda SOS' : 
                     p.color === 'orange' ? '⚠️ En Riesgo' : '✅ A Salvo'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}