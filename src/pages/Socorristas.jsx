import { useEffect, useMemo, useState } from 'react';
import {
  activasPorSocorrista,
  api,
  disponibleParaAsignar,
  esSocorrista,
  estadoRescate,
  mensajeError,
  nombreRol,
  ROLES_ASIGNABLES,
  rolVisible,
  telefonoWhatsApp,
} from '../api';
import Icono from '../components/Icono';

export default function Socorristas({ irA }) {
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const cargar = async () => {
    const [resUsuarios, resSolicitudes] = await Promise.allSettled([
      api.get('/api/usuarios/todos'),
      api.get('/api/solicitudes'),
    ]);

    if (resUsuarios.status === 'fulfilled') {
      setUsuarios((resUsuarios.value.data || []).filter(esSocorrista));
    }
    if (resSolicitudes.status === 'fulfilled') {
      setSolicitudes(resSolicitudes.value.data?.solicitudes || []);
    }

    const fallos = [resUsuarios, resSolicitudes].filter((r) => r.status === 'rejected');
    if (fallos.length) setMensaje({ tipo: 'error', texto: mensajeError(fallos[0].reason) });
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const asignadasPorSocorrista = useMemo(
    () => activasPorSocorrista(solicitudes),
    [solicitudes]
  );

  const lista = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      if (!texto) return true;
      return [usuario.nombres, usuario.apellidos, usuario.email, usuario.telefono]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(texto));
    });
  }, [usuarios, busqueda]);

  const disponibles = usuarios.filter((usuario) =>
    disponibleParaAsignar(asignadasPorSocorrista, usuario)
  ).length;

  const enServicio = usuarios.filter(
    (usuario) => (asignadasPorSocorrista.get(Number(usuario._id)) || []).length > 0
  ).length;

  const cambiarRol = async (socorrista, nuevoRol) => {
    const rolId = Number(nuevoRol);
    if (rolId === rolVisible(socorrista)) return;

    const confirmar = window.confirm(
      `¿Cambiar el rol de ${socorrista.nombres} a ${nombreRol(rolId)}? Dejará de aparecer como socorrista.`
    );
    if (!confirmar) return;

    setGuardando(socorrista._id);
    setMensaje(null);
    try {
      await api.put(`/api/usuarios/${socorrista._id}/rol`, { rol_id: rolId });
      setMensaje({
        tipo: 'ok',
        texto: `${socorrista.nombres} ahora tiene el rol ${nombreRol(rolId)}.`,
      });
      setUsuarios((prev) => prev.filter((item) => item._id !== socorrista._id));
    } catch (error) {
      setMensaje({ tipo: 'error', texto: mensajeError(error) });
    } finally {
      setGuardando(null);
    }
  };

  if (cargando) {
    return <div className="mt-10 text-center text-gray-500">Cargando socorristas...</div>;
  }

  return (
    <div>
      {mensaje && (
        <div className={`${mensaje.tipo === 'ok' ? 'mensaje-ok' : 'mensaje-error'} mb-4`}>
          {mensaje.texto}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="tarjeta-panel flex items-center gap-3 px-4 py-3">
            <span className="icono-tarjeta bg-green-100 text-green-700">
              <Icono nombre="socorrista" className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-800">{usuarios.length}</p>
            </div>
          </div>
          <div className="tarjeta-panel flex items-center gap-3 px-4 py-3">
            <span className="icono-tarjeta bg-emerald-100 text-emerald-700">
              <Icono nombre="check" className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs text-gray-500">Disponibles</p>
              <p className="text-xl font-bold text-emerald-600">{disponibles}</p>
            </div>
          </div>
          <div className="tarjeta-panel flex items-center gap-3 px-4 py-3">
            <span className="icono-tarjeta bg-blue-100 text-blue-700">
              <Icono nombre="ambulancia" className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs text-gray-500">En servicio</p>
              <p className="text-xl font-bold text-blue-600">{enServicio}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Icono
              nombre="buscar"
              className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Buscar socorrista..."
              className="campo-busqueda w-64 pl-9"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
          <button onClick={cargar} className="boton-secundario">
            <Icono nombre="actualizar" className="w-3.5 h-3.5" />
            Recargar
          </button>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="tarjeta-panel text-center text-gray-500">
          <p>No hay socorristas registrados.</p>
          <button onClick={() => irA('usuarios')} className="boton-primario mt-3">
            <Icono nombre="usuarios" className="w-4 h-4" />
            Asignar rol de socorrista
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {lista.map((socorrista) => {
            const asignadas = asignadasPorSocorrista.get(Number(socorrista._id)) || [];
            const ocupado = asignadas.length > 0;
            const estadoActual = estadoRescate(asignadas);
            const estadoOperativo = String(socorrista.estado_operativo || '').trim();
            const disponible = disponibleParaAsignar(asignadasPorSocorrista, socorrista);
            const textoEstado = ocupado ? estadoActual : estadoOperativo || 'Disponible';
            const whatsapp = telefonoWhatsApp(socorrista.telefono);
            const mensajeWhatsApp = encodeURIComponent(
              `Hola ${socorrista.nombres || ''}, te contactamos desde el centro de control de Cauca Resiliente.`
            );

            return (
              <article key={socorrista._id} className="tarjeta-socorrista">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="avatar-socorrista">
                      {(socorrista.nombres || 'S').charAt(0).toUpperCase()}
                      {(socorrista.apellidos || '').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-800">
                        {socorrista.nombres} {socorrista.apellidos}
                      </p>
                      <p className="truncate text-xs text-gray-500">{socorrista.email}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={disponible ? 'insignia-disponible' : 'insignia-ocupado'}>
                          {textoEstado}
                        </span>
                        <span
                          className={`text-[11px] ${
                            ocupado ? 'font-semibold text-orange-600' : 'text-gray-400'
                          }`}
                        >
                          {ocupado
                            ? `${asignadas.length} rescate${
                                asignadas.length === 1 ? '' : 's'
                              } activo${asignadas.length === 1 ? '' : 's'}`
                            : 'Sin rescates activos'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <select
                    value={rolVisible(socorrista)}
                    disabled={guardando === socorrista._id}
                    onChange={(evento) => cambiarRol(socorrista, evento.target.value)}
                    className="select-rol-mini"
                    title="Cambiar rol"
                  >
                    {ROLES_ASIGNABLES.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <p className="mini-dato">
                    <Icono nombre="telefono" className="w-3.5 h-3.5 shrink-0" />
                    {socorrista.telefono || 'Sin teléfono'}
                  </p>
                  <p className="mini-dato">
                    <Icono nombre="ubicacion" className="w-3.5 h-3.5 shrink-0" />
                    {socorrista.ciudad || 'Sin ciudad'}
                  </p>
                  <p className="mini-dato">
                    <Icono nombre="corazon" className="w-3.5 h-3.5 shrink-0" />
                    {socorrista.tipo_sangre || 'Sin tipo de sangre'}
                  </p>
                  <p className="mini-dato">
                    <Icono nombre="campus" className="w-3.5 h-3.5 shrink-0" />
                    {socorrista.rol || 'Socorrista'}
                  </p>
                </div>

                {asignadas.length > 0 && (
                  <div className="lista-sos-asignadas">
                    {asignadas.map((sos) => (
                      <span key={sos._id} className="chip-sos">
                        SOS-{String(sos._id).padStart(4, '0')} · {sos.estado_solicitud}
                      </span>
                    ))}
                  </div>
                )}

                {asignadas.length > 1 && (
                  <p className="aviso-socorrista">
                    Tiene {asignadas.length} rescates activos por asignaciones anteriores. Finaliza
                    los demás para liberarlo.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {ocupado ? (
                    <span className="boton-socorrista-ocupado" title="Solo puede atender un rescate a la vez">
                      <Icono nombre="ambulancia" className="w-4 h-4" />
                      {estadoActual}
                    </span>
                  ) : (
                    <button onClick={() => irA('solicitudes')} className="boton-primario">
                      <Icono nombre="solicitudes" className="w-4 h-4" />
                      Asignar rescate
                    </button>
                  )}
                  {socorrista.telefono && (
                    <a href={`tel:${socorrista.telefono}`} className="boton-contorno">
                      <Icono nombre="telefono" className="w-4 h-4" />
                      Llamar
                    </a>
                  )}
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}?text=${mensajeWhatsApp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="boton-whatsapp"
                    >
                      <Icono nombre="whatsapp" className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
