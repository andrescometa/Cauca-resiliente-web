import { useEffect, useMemo, useState } from 'react';
import {
  api,
  esSocorrista,
  leerSesion,
  mensajeError,
  nombreRol,
  ROLES,
  rolVisible,
} from '../api';
import Icono from '../components/Icono';

const fechaCorta = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? '—' : fecha.toLocaleDateString('es-CO');
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const miId = Number(leerSesion()?.usuario?.id);

  const cargarUsuarios = async () => {
    try {
      const respuesta = await api.get('/api/usuarios/todos');
      const datos = Array.isArray(respuesta.data) ? respuesta.data : [];
      // Los socorristas tienen su propia sección.
      const sinSocorristas = datos.filter((usuario) => !esSocorrista(usuario));
      setUsuarios(sinSocorristas);
      setSeleccionadoId((actual) => actual ?? sinSocorristas[0]?._id ?? null);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: mensajeError(error) });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const seleccionado = useMemo(
    () => usuarios.find((usuario) => usuario._id === seleccionadoId) || null,
    [usuarios, seleccionadoId]
  );

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      if (filtroRol !== 'todos' && rolVisible(usuario) !== Number(filtroRol)) return false;
      if (!texto) return true;
      return [usuario.nombres, usuario.apellidos, usuario.email, usuario.identificacion]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(texto));
    });
  }, [usuarios, busqueda, filtroRol]);

  const conteoPorRol = useMemo(() => {
    const conteo = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const usuario of usuarios) {
      const rol = rolVisible(usuario);
      if (conteo[rol] !== undefined) conteo[rol] += 1;
    }
    return conteo;
  }, [usuarios]);

  const cambiarRol = async (usuario, nuevoRol) => {
    const rolId = Number(nuevoRol);
    if (rolId === rolVisible(usuario)) return;

    if (Number(usuario._id) === miId) {
      const confirmar = window.confirm(
        'Estás cambiando tu propio rol. Si dejas de ser administrador perderás el acceso a este panel. ¿Deseas continuar?'
      );
      if (!confirmar) return;
    }

    setGuardando(usuario._id);
    setMensaje(null);
    try {
      const respuesta = await api.put(`/api/usuarios/${usuario._id}/rol`, { rol_id: rolId });
      const actualizado = respuesta.data?.usuario;
      setMensaje({
        tipo: 'ok',
        texto: `${usuario.nombres} ahora tiene el rol ${nombreRol(rolId)}.`,
      });

      if (rolId === 3) {
        // Al ser socorrista pasa a la sección de Socorristas.
        setUsuarios((prev) => prev.filter((item) => item._id !== usuario._id));
      } else {
        setUsuarios((prev) =>
          prev.map((item) =>
            item._id === usuario._id ? { ...item, ...(actualizado || {}), rol_id: rolId } : item
          )
        );
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: mensajeError(error) });
    } finally {
      setGuardando(null);
    }
  };

  if (cargando) {
    return <div className="mt-10 text-center text-gray-500">Cargando usuarios...</div>;
  }

  return (
    <div>
      {mensaje && (
        <div className={`${mensaje.tipo === 'ok' ? 'mensaje-ok' : 'mensaje-error'} mb-4`}>
          {mensaje.texto}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroRol('todos')}
            className={`chip-filtro ${filtroRol === 'todos' ? 'chip-filtro-activo' : ''}`}
          >
            Todos ({usuarios.length})
          </button>
          {ROLES.filter((rol) => rol.id !== 3).map((rol) => (
            <button
              key={rol.id}
              onClick={() => setFiltroRol(String(rol.id))}
              className={`chip-filtro ${filtroRol === String(rol.id) ? 'chip-filtro-activo' : ''}`}
            >
              {rol.nombre} ({conteoPorRol[rol.id]})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Icono
              nombre="buscar"
              className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Buscar nombre, correo o documento..."
              className="campo-busqueda w-72 pl-9"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
          <button onClick={cargarUsuarios} className="boton-secundario">
            <Icono nombre="actualizar" className="w-3.5 h-3.5" />
            Recargar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="contenedor-tabla-usuarios flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="icono-tarjeta bg-slate-100 text-slate-700">
              <Icono nombre="usuarios" className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-gray-800">Usuarios registrados</h3>
            <span className="ml-auto text-xs font-medium text-gray-400">
              Los socorristas están en su propia sección
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="tabla-usuarios-cabecera">
                  <th className="celda-tabla-usuarios">Nombre completo</th>
                  <th className="celda-tabla-usuarios">Correo</th>
                  <th className="celda-tabla-usuarios">Documento</th>
                  <th className="celda-tabla-usuarios">Rol actual</th>
                  <th className="celda-tabla-usuarios">Cambiar rol</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr
                    key={usuario._id}
                    className={`fila-usuario-tabla ${
                      seleccionadoId === usuario._id ? 'fila-usuario-seleccionada' : ''
                    }`}
                    onClick={() => setSeleccionadoId(usuario._id)}
                  >
                    <td className="celda-tabla-usuarios font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="avatar-usuario-iniciales h-9 w-9 text-sm">
                          {(usuario.nombres || 'U').charAt(0).toUpperCase()}
                          {(usuario.apellidos || '').charAt(0).toUpperCase()}
                        </div>
                        <span>
                          {usuario.nombres} {usuario.apellidos}
                        </span>
                      </div>
                    </td>
                    <td className="celda-tabla-usuarios text-gray-600">{usuario.email}</td>
                    <td className="celda-tabla-usuarios text-gray-600">
                      {usuario.identificacion || '—'}
                    </td>
                    <td className="celda-tabla-usuarios">
                      <span
                        className={`etiqueta-rol-usuario ${
                          rolVisible(usuario) === 4
                            ? 'bg-amber-100 text-amber-800'
                            : rolVisible(usuario) === 2
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {nombreRol(rolVisible(usuario))}
                      </span>
                    </td>
                    <td className="celda-tabla-usuarios">
                      <select
                        value={rolVisible(usuario)}
                        disabled={guardando === usuario._id}
                        onChange={(evento) => cambiarRol(usuario, evento.target.value)}
                        onClick={(evento) => evento.stopPropagation()}
                        className="block w-full rounded-md border border-gray-300 bg-gray-50 p-1 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {ROLES.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {usuariosFiltrados.length === 0 && (
            <p className="mt-4 text-center text-gray-500">
              No se encontraron usuarios con ese filtro.
            </p>
          )}
        </div>

        <div className="panel-detalle-usuario w-full xl:w-80">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Ficha del usuario</h3>

          {seleccionado ? (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="avatar-usuario-iniciales">
                  {(seleccionado.nombres || 'U').charAt(0).toUpperCase()}
                  {(seleccionado.apellidos || '').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {seleccionado.nombres} {seleccionado.apellidos}
                  </p>
                  <span className="etiqueta-sos-baja">{nombreRol(rolVisible(seleccionado))}</span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="titulo-seccion-detalle">Información personal</p>
                  <p className="fila-dato-usuario">
                    <span className="text-gray-600">Correo</span>
                    <span className="text-right font-medium break-all">{seleccionado.email}</span>
                  </p>
                  <p className="fila-dato-usuario">
                    <span className="text-gray-600">Documento</span>
                    <span className="font-medium">{seleccionado.identificacion || 'No registra'}</span>
                  </p>
                  <p className="fila-dato-usuario">
                    <span className="text-gray-600">Teléfono</span>
                    <span className="font-medium">{seleccionado.telefono || 'No registra'}</span>
                  </p>
                  <p className="fila-dato-usuario">
                    <span className="text-gray-600">Ciudad</span>
                    <span className="font-medium">{seleccionado.ciudad || 'No registra'}</span>
                  </p>
                  <p className="fila-dato-usuario">
                    <span className="text-gray-600">Registro</span>
                    <span className="font-medium">{fechaCorta(seleccionado.fecha_registro)}</span>
                  </p>
                </div>

                <div>
                  <p className="titulo-seccion-detalle">Información médica</p>
                  <p className="fila-dato-usuario">
                    <span className="text-gray-600">Tipo de sangre</span>
                    <span className="font-bold text-red-600">
                      {seleccionado.tipo_sangre || 'No registra'}
                    </span>
                  </p>
                  <p className="fila-dato-usuario">
                    <span className="text-gray-600">Alergias</span>
                    <span className="font-medium">
                      {seleccionado.alergias?.join(', ') || 'Ninguna'}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="titulo-seccion-detalle">Estado operativo</p>
                  <span
                    className={
                      String(seleccionado.estado_operativo || '').toLowerCase() === 'disponible'
                        ? 'insignia-disponible'
                        : 'insignia-ocupado'
                    }
                  >
                    {seleccionado.estado_operativo || 'Sin estado'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Selecciona un usuario de la tabla.</p>
          )}
        </div>
      </div>
    </div>
  );
}
