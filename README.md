<div align="center">
  <img src="src/assets/bank-logo.png" alt="ProjectBank Logo" width="220" style="margin-bottom: 8px"/>
  <br>
  <h1> ProjectBank — Banca Global</h1>
  <p>
    <strong>Sistema de gestión bancaria</strong> — Panel administrativo moderno para la administración de clientes, cuentas, transacciones y usuarios bancarios.
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react" alt="React 19"/>
    <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat&logo=vite" alt="Vite 8"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind CSS 4"/>
    <img src="https://img.shields.io/badge/Axios-1.17-5A29E4?style=flat&logo=axios" alt="Axios"/>
    <img src="https://img.shields.io/badge/React_Router-7.17-CA4245?style=flat&logo=reactrouter" alt="React Router 7"/>
  </p>
</div>

---

## Descripción general

**ProjectBank** es una aplicación frontend de panel de administración bancaria que permite gestionar de forma integral las operaciones de una entidad financiera. Desarrollada con **React 19** y **Vite 8**, consume una API REST backend desarrollada en **Java con Spring Boot** y cuenta con un sistema de autenticación JWT con control de acceso basado en roles (**ADMIN**, **ASESOR**, **AUDITOR**).

El proyecto está diseñado como un SPA (Single Page Application) con una interfaz moderna, responsive y optimizada para la gestión operativa del día a día bancario.

---

##  Captura general de la solución

> Las imágenes de assets se encuentran en `src/assets/` e incluyen recursos visuales para la página de inicio de sesión, dashboard y módulos del sistema.

| Sección | Descripción |
|---------|-------------|
 | **Login** | Pantalla dividida con imagen de fondo, formulario centrado y logo corporativo |
| **Dashboard** | Panel con métricas, servicios bancarios, transacciones recientes y noticias |
| **Clientes** | CRUD completo con tabla de datos, búsqueda y formulario en drawer lateral |
| **Cuentas** | Gestión de cuentas de ahorro y corriente con tarjetas visuales y controles de estado |
| **Transacciones** | Consignaciones, retiros, transferencias e historial con comprobante |
| **Usuarios** | Administración de usuarios del sistema con roles y estados (solo ADMIN) |

>  Las imágenes de preview real requieren ejecutar el proyecto o acceder al entorno desplegado.

---

##  Características principales

- **Autenticación JWT** — Inicio de sesión seguro con tokens almacenados en localStorage y renovación automática.
- **Control de acceso por roles** — Tres niveles de permiso (ADMIN, ASESOR, AUDITOR) que condicionan la visibilidad y acciones disponibles en cada módulo.
- **Gestión de clientes** — Alta, modificación, consulta y eliminación de clientes con validación de datos personales.
- **Administración de cuentas** — Creación de cuentas de ahorro y corriente con control de estado (activa/inactiva/cancelada) y exención de GMF.
- **Motor de transacciones** — Consignaciones, retiros y transferencias entre cuentas con registro automático de historial.
- **Historial de transacciones** — Consulta de movimientos por cuenta con saldo posterior y línea de tiempo.
- **Dashboard ejecutivo** — Métricas consolidadas (clientes, cuentas, transacciones) y acceso rápido a servicios.
- **Notificaciones toast** — Feedback visual en tiempo real para cada operación mediante `react-hot-toast`.
- **Drawers animados** — Formularios de creación y edición en paneles laterales con transiciones suaves.
- **Protección de rutas** — Redirección automática al login para usuarios no autenticados.
- **Responsive design** — Interfaz adaptable con sidebar colapsable y navegación móvil.
- **Persistencia de sesión** — Recuperación automática de sesión al recargar la página.

---

##  Tecnologías utilizadas

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [React](https://react.dev/) | ^19.2.6 | Librería principal de interfaz de usuario |
| [Vite](https://vitejs.dev/) | ^8.0.12 | Bundler y dev server ultrarrápido |
| [React Router](https://reactrouter.com/) | ^7.17.0 | Enrutamiento SPA con protección de rutas |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.3.0 | Framework CSS utility-first con configuración mediante `@theme` |
| [Axios](https://axios-http.com/) | ^1.17.0 | Cliente HTTP con interceptores para autenticación |
| [Lucide React](https://lucide.dev/) | ^1.17.0 | Sistema de iconos |
| [React Hot Toast](https://react-hot-toast.com/) | ^2.6.0 | Notificaciones toast |

### Herramientas de desarrollo

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| ESLint | ^10.3.0 | Linter con configuración flat |
| `@vitejs/plugin-react` | ^6.0.1 | Plugin de React con compilador Oxc |

### Backend (no incluido en este repositorio)

- Java + Spring Boot
- API REST desplegada en AWS EC2 (`http://54.226.164.38:8080`)

---

##  Arquitectura del frontend

El proyecto sigue una arquitectura modular basada en **features**, donde cada funcionalidad de negocio es un módulo independiente dentro de `src/modules/`.

```
src/
├── api/          → Capa de comunicación HTTP (servicios por entidad)
├── components/   → Componentes reutilizables (genéricos)
├── context/      → Estado global (autenticación)
├── modules/      → Módulos funcionales (por feature)
├── routes/       → Configuración de enrutamiento
├── assets/       → Recursos estáticos (imágenes)
└── styles/       → Estilos globales y tema (index.css)
```

### Flujo de datos

```
Usuario → React Component → Service (api/) → Axios Instance → Backend REST
                ↑                                      ↓
           AuthContext ← localStorage ← JWT Token ← Response
```

### Patrones utilizados

- **Context API** para estado global de autenticación.
- **Axios interceptors** para inyección automática del token JWT y manejo global de errores 401.
- **Drawer pattern** para formularios de creación/edición (evita navegación entre páginas).
- **Modal pattern** para confirmaciones destructivas (eliminación, cambios de estado).
- **Mounted ref pattern** para prevenir actualizaciones de estado en componentes desmontados.
- **Proxy de desarrollo** en Vite para evitar CORS durante el desarrollo local.

---

##  Estructura del proyecto

```
bancoFrontend/
├── .env                          # Variables de entorno (producción)
├── .env.development              # Variables de entorno (desarrollo)
├── .gitignore
├── eslint.config.js              # Configuración ESLint flat
├── index.html                    # Entry point HTML
├── package.json
├── vite.config.js                # Configuración de Vite + proxy
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
└── src/
    ├── main.jsx                  # Punto de entrada React
    ├── App.jsx                   # Componente raíz
    ├── index.css                 # Estilos globales + tema Tailwind
    │
    ├── api/
    │   ├── api.js                # Instancia Axios + interceptores
    │   ├── authService.js        # POST /auth/login
    │   ├── clienteService.js     # CRUD clientes
    │   ├── cuentaService.js      # CRUD cuentas + cambios de estado
    │   ├── transaccionService.js # Consignar, retirar, transferir, historial
    │   └── usuarioService.js     # CRUD usuarios + cambio de contraseña
    │
    ├── assets/                   # Imágenes (logos, fondos, servicios, noticias)
    │
    ├── components/               # Componentes reutilizables
    │   ├── AdminRoute.jsx        # Guard de ruta para administradores
    │   ├── EmptyState.jsx        # Estado vacío con icono y mensaje
    │   ├── LoadingSkeleton.jsx   # Esqueletos de carga (tabla/tarjeta)
    │   ├── ProtectedRoute.jsx    # Guard de ruta para usuarios autenticados
    │   └── StatusBadge.jsx       # Badges de estado y tipo de cuenta
    │
    ├── context/
    │   ├── AuthContext.jsx       # Provider de autenticación (login/logout/token)
    │   └── useAuth.js            # Hook personalizado para consumir AuthContext
    │
    ├── modules/
    │   ├── auth/
    │   │   └── Login.jsx         # Página de inicio de sesión
    │   ├── clientes/
    │   │   ├── ClientesPage.jsx  # Gestión de clientes (tabla + drawer)
    │   │   └── ClienteDrawer.jsx # Formulario de cliente en drawer lateral
    │   ├── cuentas/
    │   │   ├── CuentasPage.jsx   # Gestión de cuentas (tarjetas + acciones)
    │   │   └── CuentaDrawer.jsx  # Formulario de cuenta en drawer lateral
    │   ├── dashboard/
    │   │   └── DashboardHome.jsx # Panel principal con métricas y acceso rápido
    │   ├── error/
    │   │   └── NotFound.jsx      # Página 404
    │   ├── layout/
    │   │   ├── DashboardLayout.jsx # Layout principal (sidebar + navbar + outlet)
    │   │   ├── Sidebar.jsx       # Barra lateral de navegación
    │   │   └── TopNavbar.jsx     # Barra superior con breadcrumb y usuario
    │   ├── transacciones/
    │   │   └── TransaccionesPage.jsx # Consignar, retirar, transferir, historial
    │   └── usuarios/
    │       └── UsuariosPage.jsx  # Administración de usuarios del sistema
    │
    └── routes/
        └── AppRouter.jsx         # Configuración de rutas con BrowserRouter
```

---

##  Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** versión 18 o superior (recomendada 20 LTS)
- **npm** versión 9 o superior (incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

---

##  Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/bancoFrontend.git
cd bancoFrontend

# Instalar dependencias
npm install
```

---

##  Variables de entorno

El proyecto utiliza variables de entorno para configurar la URL de la API backend.

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base del backend REST | `http://localhost:8080` |

### Archivos de entorno

| Archivo | Propósito |
|---------|-----------|
| `.env` | Entorno de producción (apunta al servidor desplegado en AWS) |
| `.env.development` | Entorno de desarrollo (vacío → usa `localhost:8080`) |

> ** Importante:** El valor predeterminado cuando `VITE_API_URL` está vacío o no definido es `http://localhost:8080`. Esto permite que el proxy de desarrollo de Vite funcione correctamente durante el desarrollo local.

---

##  Ejecución local

```bash
# Desarrollo con recarga en caliente (hot reload)
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:5173`. Las peticiones a la API serán redirigidas automáticamente al backend mediante el proxy configurado en `vite.config.js`.

### Construcción para producción

```bash
# Generar build optimizado
npm run build

# Vista previa del build de producción
npm run preview
```

---

##  Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `vite` | Inicia el servidor de desarrollo con HMR en `http://localhost:5173` |
| `build` | `vite build` | Compila el proyecto para producción generando los archivos en `dist/` |
| `preview` | `vite preview` | Sirve el build de producción localmente para previsualización |
| `lint` | `eslint .` | Ejecuta el linter ESLint sobre todo el código fuente |

---

## 🔌 Integración con backend

El frontend se comunica con una **API REST** desarrollada en **Java con Spring Boot** alojada en un servidor **AWS EC2**.

### Configuración de conexión

La conexión se realiza a través de una **instancia de Axios** configurada en `src/api/api.js`:

- **Base URL:** Determinada por `VITE_API_URL` o `http://localhost:8080` por defecto.
- **Interceptor de petición:** Agrega automáticamente el header `Authorization: Bearer <token>` desde localStorage.
- **Interceptor de respuesta:** Detecta errores 401 y redirige al login automáticamente.

### Proxy de desarrollo

En `vite.config.js` están configuradas rutas de proxy para evitar problemas de CORS durante el desarrollo:

| Ruta proxy | Destino |
|------------|---------|
| `/auth/*` | `http://54.226.164.38:8080` |
| `/clientes/*` | `http://54.226.164.38:8080` |
| `/cuentas/*` | `http://54.226.164.38:8080` |
| `/transacciones/*` | `http://54.226.164.38:8080` |
| `/usuarios/*` | `http://54.226.164.38:8080` |

### Endpoints consumidos

| Método | Endpoint | Servicio | Descripción |
|--------|----------|----------|-------------|
| POST | `/auth/login` | `authService` | Autenticación de usuarios |
| GET | `/clientes` | `clienteService` | Listar clientes |
| GET | `/clientes/{id}` | `clienteService` | Obtener cliente por ID |
| POST | `/clientes` | `clienteService` | Crear cliente |
| PUT | `/clientes/{id}` | `clienteService` | Actualizar cliente |
| DELETE | `/clientes/{id}` | `clienteService` | Eliminar cliente |
| GET | `/cuentas` | `cuentaService` | Listar cuentas |
| GET | `/cuentas/cliente/{id}` | `cuentaService` | Cuentas por cliente |
| GET | `/cuentas/{numero}` | `cuentaService` | Cuenta por número |
| POST | `/cuentas` | `cuentaService` | Crear cuenta |
| PATCH | `/cuentas/{numero}/activar` | `cuentaService` | Activar cuenta |
| PATCH | `/cuentas/{numero}/inactivar` | `cuentaService` | Inactivar cuenta |
| PATCH | `/cuentas/{numero}/cancelar` | `cuentaService` | Cancelar cuenta |
| POST | `/transacciones/consignar` | `transaccionService` | Consignación |
| POST | `/transacciones/retirar` | `transaccionService` | Retiro |
| POST | `/transacciones/transferir` | `transaccionService` | Transferencia |
| GET | `/transacciones/cuenta/{numero}` | `transaccionService` | Historial por cuenta |
| GET | `/transacciones` | `transaccionService` | Todas las transacciones |
| GET | `/usuarios` | `usuarioService` | Listar usuarios |
| POST | `/usuarios` | `usuarioService` | Crear usuario |
| PUT | `/usuarios/{id}` | `usuarioService` | Actualizar usuario |
| DELETE | `/usuarios/{id}` | `usuarioService` | Eliminar usuario |
| PATCH | `/usuarios/{id}/password` | `usuarioService` | Cambiar contraseña |

---

##  Buenas prácticas implementadas

### Código y arquitectura

- **Separación de responsabilidades**: Capas claras entre servicios API, componentes de UI, contexto global y configuración.
- **Modularización por feature**: Cada funcionalidad de negocio es un módulo autocontenido.
- **Componentes reutilizables**: `StatusBadge`, `EmptyState`, `LoadingSkeleton` utilizados en múltiples módulos.
- **Custom hooks**: `useAuth` encapsula la lógica de autenticación.
- **Protección de rutas**: Componentes `ProtectedRoute` y `AdminRoute` para control de acceso declarativo.

### Seguridad

- **JWT en headers**: Token enviado mediante `Authorization: Bearer` en cada petición.
- **Manejo global de 401**: Interceptor de Axios que limpia sesión y redirige al login automáticamente.
- **Control de acceso por roles**: Renderizado condicional de UI basado en rol del usuario.
- **Protección contra actualizaciones en componentes desmontados**: Patrón `mountedRef` en todos los useEffect con operaciones asíncronas.

### UX / UI

- **Feedback visual inmediato**: Notificaciones toast para éxito/error en cada operación.
- **Estados de carga**: Skeleton loaders que indican carga sin saltos de layout.
- **Estados vacíos**: Componente `EmptyState` para cuando no hay datos que mostrar.
- **Confirmaciones destructivas**: Modales de confirmación antes de eliminar o cambiar estados críticos.
- **Accesibilidad**: Roles ARIA implícitos mediante elementos semánticos, contraste de colores adecuado.

### Desarrollo

- **Proxy de desarrollo**: Evita CORS y facilita el desarrollo local contra el backend remoto.
- **ESLint configuración flat**: Linting moderno con reglas para React Hooks y React Refresh.
- **Configuración de entorno**: Variables de entorno separadas para desarrollo y producción.

---

##  Mejoras futuras

- [ ] **Inferno de tipado con TypeScript** — Migrar el proyecto de JSX a TypeScript para mejorar la mantenibilidad y detección temprana de errores.
- [ ] **React Query (TanStack Query)** — La dependencia ya está instalada. Integrarla para reemplazar los `useEffect` + `useState` manuales por una capa de fetching con caché, revalidación y estados de carga/error automáticos.
- [ ] **React Hook Form** — También ya instalado. Integrarlo para centralizar la validación de formularios, reducir código boilerplate y mejorar el rendimiento de renders.
- [ ] **Pruebas automatizadas** — Agregar pruebas unitarias (Vitest + Testing Library) y pruebas end-to-end (Playwright o Cypress).
- [ ] **Modo oscuro** — Implementar un theme switcher usando Tailwind CSS y el contexto de tema.
- [ ] **Internacionalización (i18n)** — Soporte multi-idioma usando `react-i18next` o similar.
- [ ] **Paginación en tablas** — Las listas de clientes, cuentas y usuarios actualmente cargan todos los registros. Implementar paginación del lado del servidor.
- [ ] **Descarga de reportes** — Exportar datos de transacciones y clientes a PDF o Excel.
- [ ] **Manejo de errores global** — Implementar un Error Boundary y un sistema de logging de errores del lado del cliente.
- [ ] **CI/CD** — Pipeline de integración continua con pruebas automáticas y despliegue automatizado.

---

##  Autor

Desarrollado por [Daniel Felipe Ordoñez Amaya](https://github.com/ve312)

> Este proyecto fue desarrollado como parte de un portafolio profesional. Si tienes preguntas, sugerencias o deseas colaborar, no dudes en contactar.

