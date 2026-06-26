# API Mr Sushi — Referencia HTTP

Documentación de todos los endpoints HTTP del backend serverless de Mr Sushi. Pensada para
integrar el frontend (web de clientes, app de trabajadores) **sin leer el código del backend**.

## Base URL

```
https://{api-id}.execute-api.us-east-1.amazonaws.com/dev
```

## Autenticación

La mayoría de endpoints protegidos usan un **JWT** (HS256, expira a las 24 h) que se envía en
el header:

```
Authorization: Bearer <jwt>
```

El token se obtiene en `POST /auth/login`. Sus claims son:

| Claim      | Significado                                                        |
|------------|-------------------------------------------------------------------|
| `sub`      | ID del usuario (se expone como `userId` en el contexto del request) |
| `role`     | Rol del usuario: `customer`, `cocinero`, `despachador`, `delivery`, `admin` |
| `tenantId` | Sede a la que pertenece el usuario. **Solo lo llevan los workers** (login con `role=worker`). Los clientes no tienen `tenantId`. |

Un Lambda Authorizer valida el token y propaga `userId`, `role` y `tenantId` a los handlers.
Si el token falta o es inválido, API Gateway responde **401/403** antes de llegar al handler.

> ⚠️ Como el `tenantId` solo viaja en tokens de worker, **todos los endpoints que dependen de
> `tenantId` (listar/obtener pedidos, avanzar paso, admin, dashboard) requieren un token de
> worker/admin**, no de cliente. El único dato de cliente que se usa es `userId` en
> `GET /orders?mine=true`.

### Formato de errores

Todos los errores devuelven JSON con esta forma y el código HTTP correspondiente:

```json
{ "error": "mensaje descriptivo" }
```

---

## Cómo consumirlo en el front (quickstart)

Todo es JSON sobre HTTPS con CORS abierto (`Access-Control-Allow-Origin: *`), así que se llama
directo desde el navegador. Patrón mínimo con `fetch`:

```js
const BASE = "https://{api-id}.execute-api.us-east-1.amazonaws.com/dev";

// Helper único: añade el Bearer token si existe y parsea el JSON.
async function api(method, path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}
```

### Flujo típico de la web de clientes

```js
// 1. Registro (opcional) y login
await api("POST", "/auth/register", { email, password, name });
const { token, userId } = await api("POST", "/auth/login", { email, password });
localStorage.setItem("token", token);
localStorage.setItem("userId", userId);

// 2. Mostrar el menú (público, no necesita token)
const productos = await api("GET", "/products");

// 3. Crear un pedido. tenantId (la sede elegida) es SIEMPRE obligatorio.
//    customerId solo si el cliente está logueado → así entra a su historial.
const { orderId } = await api("POST", "/orders", {
  tenantId: "miraflores",
  customerId: localStorage.getItem("userId") || undefined,
  customer: { name: "Ana Torres", address: "Av. Pardo 123" },
  items: [{ category: "Makis", price: 28.90, qty: 2 }],
});

// 4. Ver "mis pedidos" (requiere token de cliente; NO necesita tenantId)
const misPedidos = await api("GET", "/orders?mine=true"); // [] si no tiene ninguno
```

### Reglas que conviene tener presentes

- **Guarda el `token`** tras el login y mándalo en `Authorization: Bearer <token>` en todo
  endpoint protegido. Expira a las **24 h** → si recibes 401/403, vuelve a loguear.
- **Cliente vs worker** son dos tokens distintos: el de worker lleva `tenantId` (login con
  `role:"worker"`), el de cliente no. Con token de cliente solo se usa `/products`,
  `POST /orders` y `GET /orders?mine=true`.
- En `POST /orders`, **`tenantId` siempre** (la sede); **`customerId` solo si hay sesión**.
- Maneja errores leyendo `data.error` (ver [Formato de errores](#formato-de-errores)).

---

## Auth — `/auth/*`

### `POST /auth/register`

Registra un **cliente** nuevo (siempre con rol `customer`). Público.

**Request body**

| Campo      | Tipo   | Obligatorio | Notas                          |
|------------|--------|-------------|--------------------------------|
| `email`    | string | sí          | Se normaliza a minúsculas      |
| `password` | string | sí          |                                |
| `name`     | string | no          |                                |

**Responses**

| Código | Body                       | Cuándo                       |
|--------|----------------------------|------------------------------|
| 201    | `{ "userId": "<uuid>" }`   | Creado                       |
| 400    | `{ "error": "email and password required" }` | Falta email o password |
| 409    | `{ "error": "User already exists" }`         | El email ya existe     |

**Ejemplo**

```http
POST /auth/register
Content-Type: application/json

{ "email": "ana@example.com", "password": "secreta123", "name": "Ana Torres" }
```

```json
{ "userId": "8f2b1c4e-1234-4a9b-9c7e-aabbccddeeff" }
```

---

### `POST /auth/login`

Autentica un cliente o un worker y devuelve el JWT. Público.

**Request body**

| Campo      | Tipo   | Obligatorio | Notas                                                        |
|------------|--------|-------------|--------------------------------------------------------------|
| `email`    | string | sí          |                                                              |
| `password` | string | sí          |                                                              |
| `role`     | string | no          | `customer` (default) o `worker`. Indica dónde buscar el usuario. |
| `tenantId` | string | condicional | **Obligatorio si `role=worker`**: identifica la sede del worker. |

> Para clientes basta `email` + `password`. Para trabajadores (cocinero, despachador, delivery,
> admin) se envía `role=worker` y el `tenantId` de su sede; el rol real del token sale del
> registro del usuario en la base, no del body.

**Responses**

| Código | Body                                                  | Cuándo                          |
|--------|-------------------------------------------------------|---------------------------------|
| 200    | `{ "token": "<jwt>", "userId": "<uuid>", "role": "<role>" }` | OK                       |
| 400    | `{ "error": "email and password required" }`          | Falta email o password          |
| 400    | `{ "error": "tenantId required for workers" }`        | `role=worker` sin `tenantId`    |
| 401    | `{ "error": "Invalid credentials" }`                  | Usuario no existe o password mal |

**Ejemplo (worker)**

```http
POST /auth/login
Content-Type: application/json

{ "email": "chef@mrsushi.pe", "password": "cocina123", "role": "worker", "tenantId": "miraflores" }
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "1a2b3c4d-...",
  "role": "cocinero"
}
```

---

## Catálogo — `/products`

### `GET /products`

Lista todos los productos de la marca Mr Sushi. **Público** (lo usan tanto la web de clientes
como el simulador de Rappi).

**Request**: sin parámetros.

**Responses**

| Código | Body                | Cuándo |
|--------|---------------------|--------|
| 200    | Array de productos  | OK     |

La forma exacta de cada producto depende del seed del catálogo; cada ítem incluye al menos
`category` (categoría que determina la estación de cocina), precio y nombre. Ejemplo abreviado:

```json
[
  {
    "PK": "BRAND#mrsushi",
    "SK": "PRODUCT#maki-acevichado",
    "name": "Maki Acevichado",
    "category": "Makis",
    "price": "28.90"
  }
]
```

---

## Pedidos — `/orders/*`

### `POST /orders`

Crea un pedido. **Público** (no lleva authorizer): lo consume tanto el checkout de la web de
clientes como el webhook entrante del simulador de Rappi.

**Request body**

| Campo         | Tipo    | Obligatorio | Notas                                                                 |
|---------------|---------|-------------|-----------------------------------------------------------------------|
| `tenantId`    | string  | **siempre** | Sede que atiende el pedido. Si falta o está vacío → 400.              |
| `items`       | array   | **sí**      | Lista de ítems. Si está vacío → 400. Ver estructura abajo.           |
| `source`      | string  | no          | `web` (default) o `rappi`.                                            |
| `customer`    | object  | no          | Datos libres del cliente (ej. `name`, `address`). Se guarda tal cual. |
| `customerId`  | string  | no          | **Solo si el cliente está logueado.** Asocia el pedido a su cuenta para `GET /orders?mine=true`. No se verifica contra el JWT. |
| `externalRef` | string  | condicional | **Obligatorio si `source=rappi`** (id del pedido en Rappi). Ignorado en web. |

Estructura de cada ítem en `items` (los campos que el backend realmente usa):

| Campo      | Tipo   | Uso                                                              |
|------------|--------|-----------------------------------------------------------------|
| `category` | string | Determina la estación de cocina (fría/caliente). Recomendado.   |
| `price`    | number | Para calcular el `total`.                                       |
| `qty`      | number | Cantidad (default 1 si no se envía).                           |

> **`tenantId` es siempre obligatorio**, tanto en web (el cliente elige la sede) como en Rappi
> (el simulador la envía). **`customerId` es opcional** y solo aplica al checkout de clientes
> logueados.

**Responses**

| Código | Body                                                | Cuándo                          |
|--------|-----------------------------------------------------|---------------------------------|
| 201    | `{ "orderId": "<uuid>", "status": "recibido" }`     | Creado                          |
| 400    | `{ "error": "tenantId required" }`                  | Falta `tenantId`                |
| 400    | `{ "error": "items required" }`                     | `items` vacío                   |
| 400    | `{ "error": "externalRef required for rappi orders" }` | `source=rappi` sin `externalRef` |

Al crearse, el pedido emite un evento `PedidoCreado` que dispara el workflow (ver
[Flujo de un pedido](#flujo-de-un-pedido)).

**Ejemplo (web, cliente logueado)**

```http
POST /orders
Content-Type: application/json

{
  "tenantId": "miraflores",
  "customerId": "8f2b1c4e-1234-4a9b-9c7e-aabbccddeeff",
  "customer": { "name": "Ana Torres", "address": "Av. Pardo 123" },
  "items": [
    { "category": "Makis", "price": 28.90, "qty": 2 },
    { "category": "Bebidas", "price": 6.00, "qty": 1 }
  ]
}
```

```json
{ "orderId": "c0ffee00-dead-beef-cafe-000000000001", "status": "recibido" }
```

---

### `GET /orders`

Tiene **dos modos** según el query param `mine`:

- **`mine=true` — historial del cliente**: devuelve los pedidos del usuario autenticado,
  consultados por **cliente** (GSI1), no por sede. Usa el `userId` verificado del token; **no
  requiere `tenantId`**, así que sirve con un token de cliente normal y abarca pedidos de
  cualquier sede. Solo aparecen pedidos creados con `customerId` (los de invitado/Rappi no).
- **sin `mine` — cola de trabajo (worker)**: devuelve pedidos de la sede del token. **Requiere
  `tenantId`** (token de worker/admin). Opcionalmente filtra por `status`.

**Requiere auth** en ambos modos.

**Query params**

| Param    | Tipo   | Notas                                                                          |
|----------|--------|--------------------------------------------------------------------------------|
| `mine`   | bool   | `true` → historial del cliente (por `userId` del token, vía GSI1). Tiene prioridad sobre `status`. |
| `status` | string | Solo modo worker. Filtra por estado (cola FIFO por sede). Ej. `recibido`, `cocinando`, etc. |

En modo worker, sin `status` devuelve **todos** los pedidos del tenant (más recientes primero).
En modo cliente, ordenados por fecha descendente (más recientes primero).

**Responses**

| Código | Body              | Cuándo                          |
|--------|-------------------|---------------------------------|
| 200    | Array de pedidos (puede ser `[]` si el cliente no tiene pedidos) | OK |
| 401    | `{ "error": "token sin userId" }` | `mine=true` con un token sin `userId` |
| 403    | `{ "error": "tenantId missing from token" }` | Modo worker con token sin `tenantId` |

**Ejemplo (cliente, su historial)**

```http
GET /orders?mine=true
Authorization: Bearer <jwt-cliente>
```

```json
[
  { "PK": "TENANT#miraflores", "SK": "ORDER#c0ffee00-...", "status": "entregado", "total": "63.80", "createdAt": "2026-06-19T15:04:05.123456+00:00" }
]
```

**Ejemplo**

```http
GET /orders?status=recibido
Authorization: Bearer <jwt-worker>
```

```json
[
  {
    "PK": "TENANT#miraflores",
    "SK": "ORDER#c0ffee00-...",
    "status": "recibido",
    "source": "web",
    "total": "63.80",
    "items": [ { "category": "Makis", "price": "28.90", "qty": 2 } ],
    "customer": { "name": "Ana Torres", "address": "Av. Pardo 123" },
    "createdAt": "2026-06-19T15:04:05.123456+00:00",
    "tieneFria": true,
    "tieneCaliente": false,
    "steps": {},
    "currentStep": "..."
  }
]
```

---

### `GET /orders/{id}`

Obtiene un pedido por su ID, dentro del tenant del token. **Requiere auth** (worker/admin).

**Path params**: `id` — el `orderId`.

**Responses**

| Código | Body                                  | Cuándo                          |
|--------|---------------------------------------|---------------------------------|
| 200    | Objeto pedido (mismo shape que arriba) | OK                             |
| 400    | `{ "error": "Missing order id" }`     | Falta el id en la ruta          |
| 403    | `{ "error": "tenantId missing from token" }` | El token no trae `tenantId` |
| 404    | `{ "error": "Order not found" }`      | No existe en ese tenant         |

---

### `POST /orders/{id}/advance`

Avanza un paso del pedido. La usan los **trabajadores** para tomar y completar tickets.
**Requiere auth.** El rol permitido depende del `step` (ver tabla).

Es un endpoint en **dos fases** sobre el mismo `step`:
1. **Tomar el ticket** (primera llamada): reserva el paso para el worker (escritura condicional
   anti-race). Responde `phase: "taken"`.
2. **Marcar listo** (segunda llamada al mismo step): completa el paso y avanza el workflow.
   Responde `phase: "completed"`.

**Path params**: `id` — el `orderId`.

**Request body**

| Campo  | Tipo   | Obligatorio | Notas                            |
|--------|--------|-------------|----------------------------------|
| `step` | string | sí          | Paso a avanzar. Valores válidos abajo. |

**Roles permitidos por `step`** (de `common/authz.py`):

| `step`            | Roles permitidos          |
|-------------------|---------------------------|
| `cocina_fria`     | `cocinero`, `admin`       |
| `cocina_caliente` | `cocinero`, `admin`       |
| `empacar`         | `despachador`, `admin`    |
| `repartir`        | `delivery`, `admin`       |
| `entregar_rappi`  | `despachador`, `admin`    |

**Responses**

| Código | Body                                                       | Cuándo                                   |
|--------|------------------------------------------------------------|------------------------------------------|
| 200    | `{ "orderId": "<id>", "step": "<step>", "phase": "taken" }` | Ticket tomado (fase 1)                 |
| 200    | `{ "orderId": "<id>", "step": "<step>", "phase": "completed" }` | Paso completado (fase 2)           |
| 400    | `{ "error": "Missing order id" }`                          | Falta id en la ruta                      |
| 400    | `{ "error": "Missing step" }`                              | Falta `step` en el body                  |
| 400    | `{ "error": "No hay taskToken activo para el step '<step>'" }` | El step no está activo en el workflow |
| 403    | `{ "error": "tenantId missing from token" }`               | Token sin `tenantId`                     |
| 403    | `{ "error": "rol no autorizado para este paso" }`          | El rol no puede avanzar ese step         |
| 404    | `{ "error": "Order not found" }`                           | El pedido no existe en el tenant         |
| 409    | `{ "error": "Este ticket ya fue tomado por otro trabajador" }` | Otro worker ya tomó el ticket (fase 1) |

**Ejemplo (cocinero completa la cocina fría)**

```http
POST /orders/c0ffee00-.../advance
Authorization: Bearer <jwt-cocinero>
Content-Type: application/json

{ "step": "cocina_fria" }
```

```json
{ "orderId": "c0ffee00-...", "step": "cocina_fria", "phase": "taken" }
```

(segunda llamada idéntica)

```json
{ "orderId": "c0ffee00-...", "step": "cocina_fria", "phase": "completed" }
```

---

## Admin — `/admin/staff`

Gestión de trabajadores de una sede. **Solo rol `admin`.** El `tenantId` del staff creado sale
del token del admin.

### `POST /admin/staff`

Crea un trabajador en la sede del admin.

**Request body**

| Campo      | Tipo   | Obligatorio | Notas                                                      |
|------------|--------|-------------|------------------------------------------------------------|
| `name`     | string | sí          |                                                            |
| `email`    | string | sí          | Se normaliza a minúsculas                                  |
| `password` | string | sí          |                                                            |
| `role`     | string | sí          | Uno de: `cocinero`, `despachador`, `delivery`             |

**Responses**

| Código | Body                                  | Cuándo                          |
|--------|---------------------------------------|---------------------------------|
| 201    | `{ "userId": "<uuid>" }`              | Creado                          |
| 400    | `{ "error": "name, email and password required" }` | Falta algún campo  |
| 400    | `{ "error": "role must be one of: cocinero, delivery, despachador" }` | Rol inválido |
| 403    | `{ "error": "Forbidden" }`            | El token no es de admin         |
| 409    | `{ "error": "User already exists" }`  | El email ya existe en la sede   |

**Ejemplo**

```json
{ "name": "Luis Vega", "email": "luis@mrsushi.pe", "password": "pack123", "role": "despachador" }
```

```json
{ "userId": "5e6f7a8b-..." }
```

### `GET /admin/staff`

Lista los trabajadores de la sede del admin (sin el `passwordHash`).

**Responses**

| Código | Body              | Cuándo                  |
|--------|-------------------|-------------------------|
| 200    | Array de usuarios | OK                      |
| 403    | `{ "error": "Forbidden" }` | El token no es de admin |

```json
[
  { "userId": "5e6f7a8b-...", "name": "Luis Vega", "email": "luis@mrsushi.pe", "role": "despachador", "tenantId": "miraflores" }
]
```

---

## Dashboard — `/dashboard`

### `GET /dashboard`

Conteo de pedidos por estado en la sede. **Solo rol `admin`.**

**Request**: sin parámetros (el `tenantId` sale del token).

**Responses**

| Código | Body | Cuándo |
|--------|------|--------|
| 200    | `{ "porStatus": { ... }, "tenantId": "<sede>" }` | OK |
| 403    | `{ "error": "Admin only" }` | El token no es de admin |
| 403    | `{ "error": "tenantId missing from token" }` | Token sin `tenantId` |

```json
{
  "porStatus": {
    "recibido": 3,
    "cocinando": 2,
    "empacando": 1,
    "repartiendo": 0,
    "entregando_a_rappi": 1,
    "entregado": 12
  },
  "tenantId": "miraflores"
}
```

---

## Webhooks — `/webhooks/*`

### `POST /webhooks/rappi/delivered`

Webhook que **Rappi** invoca cuando confirma la entrega final de un pedido. **No usa JWT**:
se autentica con el header `x-api-key`.

**Headers**

| Header      | Notas                                         |
|-------------|-----------------------------------------------|
| `x-api-key` | Debe coincidir con `RAPPI_WEBHOOK_SECRET`. Si no, 401. |

**Request body**

| Campo     | Tipo   | Obligatorio | Notas                                      |
|-----------|--------|-------------|--------------------------------------------|
| `orderId` | string | sí          | Id de Rappi (= `externalRef` del pedido). Se busca por GSI3. |

**Responses**

| Código | Body                                  | Cuándo                          |
|--------|---------------------------------------|---------------------------------|
| 200    | `{ "message": "Delivery confirmed" }` | OK; cierra el paso `entregar_rappi` |
| 400    | `{ "error": "Missing orderId" }`      | Falta `orderId`                 |
| 400    | `{ "error": "No hay taskToken activo para el step 'entregar_rappi'" }` | El pedido no estaba esperando entrega |
| 401    | `{ "error": "Unauthorized" }`         | `x-api-key` inválido            |
| 404    | `{ "error": "Order not found" }`      | No hay pedido con ese `externalRef` |

```http
POST /webhooks/rappi/delivered
x-api-key: <RAPPI_WEBHOOK_SECRET>
Content-Type: application/json

{ "orderId": "rappi-9a8b7c6d5e" }
```

```json
{ "message": "Delivery confirmed" }
```

---

## Flujo de un pedido

`POST /orders` solo escribe el pedido (estado inicial `recibido`) y emite un evento
`PedidoCreado` a EventBridge. Una **regla de EventBridge** dispara una **Step Functions State
Machine** que orquesta el ciclo de vida usando el patrón *task token* (`waitForTaskToken`): en
cada paso el workflow se **pausa** y espera a que alguien lo reanude.

- Los pasos de cocina, empaque y reparto los reanudan los **trabajadores** vía
  `POST /orders/{id}/advance` (dos fases: *tomar* → *completar*).
- La entrega final de pedidos Rappi la reanuda el **webhook** `POST /webhooks/rappi/delivered`.
- Cada cambio de estado emite el evento `EstadoCambiado`; para pedidos `source=rappi` eso
  dispara una Lambda que notifica el nuevo estado al API de Rappi (`POST {RAPPI_API_URL}/orders/{ref}/status`).

### Pasos del workflow

1. **Cocinar** (Parallel): según los ítems del pedido se activan `cocina_fria` y/o
   `cocina_caliente`. Si el pedido no toca ninguna estación (solo bebidas/salsas/merch) pasa
   igual por un checkpoint de cocina fría. Ambas ramas deben completarse para continuar.
2. **Empacar** (`empacar`).
3. **Ramificación por origen**:
   - `source=web` → **Repartir** (`repartir`), reparto propio.
   - `source=rappi` → **Entregar a Rappi** (`entregar_rappi`), que se cierra con el webhook.
4. **Entregado** (estado final).

### Secuencia de estados

```
                                   ┌─ (web)   → repartiendo ─┐
recibido → cocinando → empacando ──┤                         ├─ entregado
                                   └─ (rappi) → entregando_a_rappi ─┘
```

> Nota sobre estados: `recibido` es el inicial. `cocinando`/`empacando`/`repartiendo`/
> `entregando_a_rappi` se ponen **al iniciar** cada paso; `entregado` se pone al completar el
> último paso (`repartir` o `entregar_rappi`).

---

## Notas de consistencia (`functions.yml` vs handlers)

Revisé las rutas declaradas contra los handlers. Hallazgos:

- **Todas las rutas de `functions.yml` tienen handler** y todos los handlers HTTP están
  enrutados. No hay rutas huérfanas.
- `taskHandler` y `notificarRappi` **no son endpoints HTTP** (los invoca la State Machine y
  EventBridge respectivamente); por eso no aparecen en esta referencia.
- ✅ **Historial de cliente resuelto**: `GET /orders?mine=true` consulta por `customerId`
  (= `userId` del token) vía GSI1 y **ya no exige `tenantId`**, así que funciona con un token de
  cliente normal y cubre pedidos de varias sedes. Los endpoints de cola de trabajo
  (`GET /orders` sin `mine`, `GET /orders/{id}`, `advance`, `/admin/staff`, `/dashboard`) sí
  siguen exigiendo `tenantId` (token de worker/admin), que es lo correcto para esas vistas.
- ⚠️ **`customerId` no se verifica contra el JWT** en `POST /orders` (es guest/Rappi friendly).
  El control real de "mis pedidos" vive en `GET /orders?mine=true`, que usa el `userId`
  verificado del token. El frontend no debe confiar en `customerId` como prueba de identidad.
