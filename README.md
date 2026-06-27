# Mr. Sushi — Frontend Cliente

Aplicación web de pedidos para clientes de Mr. Sushi. Permite explorar promociones, personalizar productos, seleccionar un local, administrar el carrito y enviar pedidos al backend. Los usuarios registrados también pueden consultar el estado de sus pedidos.

## Funcionalidades actuales

- Página principal responsive con navbar, banner principal, Neki Puntos y promociones.
- Detalle de productos con selección de opciones y cantidades.
- Carrito persistente por usuario y local mediante `localStorage`.
- Selector de local con dirección, teléfono, horario y zona de cobertura.
- Checkout con datos del cliente y envío del pedido al backend.
- Registro, inicio y cierre de sesión.
- Historial y seguimiento del estado de pedidos para usuarios autenticados.
- Navegación entre inicio, locales y pedidos mediante la History API.
- Acceso flotante a WhatsApp.

## Tecnologías

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide React
- ESLint

## Requisitos

- Node.js compatible con Vite 8
- npm
- Una URL disponible del backend para utilizar autenticación, checkout e historial

## Instalación

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea el archivo de variables de entorno:

   ```bash
   Copy-Item .env.example .env
   ```

   En macOS o Linux:

   ```bash
   cp .env.example .env
   ```

3. Configura la URL base de la API en `.env`:

   ```env
   VITE_API_BASE_URL=https://{api-id}.execute-api.us-east-1.amazonaws.com/dev
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Integración con el backend

El frontend consume los siguientes endpoints a partir de `VITE_API_BASE_URL`:

| Método | Endpoint | Uso |
| --- | --- | --- |
| `POST` | `/auth/register` | Registrar un cliente |
| `POST` | `/auth/login` | Iniciar sesión y obtener el token |
| `POST` | `/orders` | Crear un pedido |
| `GET` | `/orders?mine=true` | Consultar los pedidos del usuario autenticado |

Las solicitudes de pedidos incluyen el local seleccionado, los datos de entrega, los productos y sus opciones. Cuando existe una sesión, el token se envía como `Bearer token`.

Sin `VITE_API_BASE_URL` la interfaz puede visualizarse y el carrito funciona localmente, pero no estarán disponibles la autenticación, el envío de pedidos ni el historial.

## Rutas

| Ruta | Vista |
| --- | --- |
| `/` | Inicio y promociones |
| `/locales` | Locales y cobertura |
| `/mis-pedidos` | Historial y seguimiento de pedidos |

La navegación se implementa en el cliente con la History API. Al desplegar la aplicación, el servidor debe redirigir estas rutas a `index.html`.

## Estructura principal

```text
src/
├── assets/                 # Recursos generales
├── components/
│   ├── AuthModal.tsx       # Registro e inicio de sesión
│   ├── CartDrawer.tsx      # Carrito y checkout
│   ├── LocationsCoverage.tsx
│   ├── Navbar.tsx
│   ├── OrderHistory.tsx    # Historial y seguimiento
│   ├── Promotions.tsx      # Catálogo y detalle de productos
│   └── TenantSelectorModal.tsx
├── context/
│   └── ShopContext.tsx     # Sesión, local seleccionado y carrito
├── data/
│   └── tenants.ts          # Información de locales
├── images/                 # Imágenes de productos y banners
├── lib/
│   ├── auth.ts             # Cliente de autenticación
│   └── orders.ts           # Cliente de pedidos
├── App.tsx                 # Vistas y navegación
├── index.css
└── main.tsx
```

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Vite en modo desarrollo |
| `npm run build` | Valida TypeScript y genera la aplicación en `dist/` |
| `npm run lint` | Analiza el código con ESLint |
| `npm run preview` | Sirve localmente la compilación de producción |

## Compilación de producción

```bash
npm run build
npm run preview
```

Los archivos generados quedan en `dist/`.
