# Mr. Sushi - Frontend Cliente

Frontend de una interfaz tipo tienda para Mr. Sushi. El proyecto muestra una pagina principal con barra de navegacion, selector de ubicacion, carrito, banner promocional, seccion de puntos Neki y tarjetas de promociones.

## Tecnologias usadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React para iconos

## Avance actual

- Navbar con logo, accesos principales, login, buscador, categorias y carrito.
- Banner principal con imagen promocional y efecto parallax en escritorio.
- Banner de Neki Puntos con boton para unirse.
- Grid de promociones con imagen, descuento, descripcion, precio actual, precio anterior y boton para agregar.
- Boton flotante de WhatsApp.

## Estructura principal

```text
src/
  components/
    HeroBanner.tsx
    Navbar.tsx
    PointsBanner.tsx
    Promotions.tsx
  images/
  assets/
  App.tsx
  main.tsx
  index.css
```

## Instalacion

Instalar dependencias:

```bash
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Generar version de produccion:

```bash
npm run build
```

Previsualizar la version generada:

```bash
npm run preview
```

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo con Vite.
- `npm run build`: compila TypeScript y genera los archivos finales en `dist`.
- `npm run lint`: ejecuta ESLint para revisar el codigo.
- `npm run preview`: levanta una vista previa de la version compilada.

## Pendientes sugeridos

- Conectar los botones de navegacion con rutas reales.
- Agregar funcionalidad al carrito.
- Configurar el enlace real de WhatsApp.
- Reemplazar las imagenes externas de promociones por imagenes definitivas del negocio.
- Mejorar la adaptacion responsive segun las pantallas objetivo.
