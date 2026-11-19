# Cauca Resiliente — Panel Administrador (Web)

Aplicación web del **centro de control** de Cauca Resiliente. Permite monitorear y
gestionar las emergencias que los ciudadanos envían desde la app móvil.

> Esta web es **solo para administradores**. Los ciudadanos, estudiantes y socorristas
> usan la aplicación móvil.

## Secciones

| Sección | Para qué sirve |
|---|---|
| Panel principal | Resumen general y accesos rápidos. |
| Usuarios | Consulta de datos y cambio de rol. |
| Socorristas | Disponibilidad y contacto del personal de rescate. |
| Solicitudes SOS | Emergencias recibidas y asignación de rescates. |
| Mapa | Ubicaciones enviadas desde los teléfonos. |
| Alertas | Avisos oficiales (sismos, hidrológicas, orden público). |

## Requisitos

- Node.js 22 o superior.
- La API de Cauca Resiliente disponible (Railway o local).

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Por defecto la web apunta a `http://localhost:3000`. Para usar otra API, crea un
archivo `.env` en la raíz:

```
VITE_API_URL=http://localhost:3000
```

## Build de producción

```bash
npm run build      # genera la carpeta dist/
npm run preview    # sirve dist/ localmente para probar
```

## Despliegue

El proyecto se publica en **Netlify** conectado a este repositorio de GitHub:

- **Sitio:** https://cauca-resiliente.netlify.app
- **Rama de producción:** `main`
- **Build:** `npm run build`
- **Carpeta publicada:** `dist`
- **Auto-deploy:** cada `push` a `main` se publica automáticamente.

La configuración está versionada en `netlify.toml`, así que no hace falta repetirla en
el panel de Netlify.

### Variable de entorno en Netlify

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://cauca-resiliente-api-production.up.railway.app` |

> Sin esta variable la web intentaría conectarse a `localhost:3000` y no cargaría datos.
> Las variables de Vite se incrustan en el build: si la cambias, hay que relanzar el
> deploy (basta con un commit o "Trigger deploy" en Netlify).

## Estructura

```
src/
├── App.jsx              Estructura, menú y sesión
├── main.jsx             Punto de entrada
├── api.js               Cliente de la API, roles y sesión
├── css/styles.css       Estilos
├── components/          Componentes reutilizables
└── pages/               Login, Panel, Usuarios, Socorristas,
                         Solicitudes, Mapa y Alertas
```

## Nota sobre roles

La API maneja los roles `1 Ciudadano`, `2 Estudiante`, `3 Socorrista` y
`4 Administrador`. La web solo admite el ingreso de cuentas con rol **Administrador**.
