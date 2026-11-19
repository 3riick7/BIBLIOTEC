# BiblioTec

Sistema web de gestión de biblioteca desarrollado con Node.js y Express.
Permite administrar libros, socios, préstamos y reportes, con búsqueda de socios y control de atrasos.

## Instalación

```
npm install
copy .env.example .env      (en Linux/Mac: cp .env.example .env)
npm start
```

Abrir http://localhost:3000

## Estructura

- `config/` configuración general
- `routes/` rutas de la API
- `controllers/` reciben las peticiones
- `models/` acceso a los datos (archivos JSON en `data/`)
- `services/` reglas de negocio de los préstamos
- `middleware/` registro de peticiones y manejo de errores
- `helpers/` funciones de apoyo
- `public/` interfaz web

## Módulo de reportes

`GET /api/reportes/resumen` devuelve el total de libros y ejemplares, socios,
préstamos activos, préstamos atrasados y el libro más prestado.
La interfaz muestra este resumen en la sección Reportes.

## Catálogo con portadas y categorías

Cada libro tiene una categoría (Novela, Cuento, Poesía, Infantil, Historia, Ciencia u Otros)
y una portada. Si no se sube una imagen, la interfaz genera una portada con el color de su categoría.

- `GET /api/libros?categoria=Novela` filtra por categoría.
- `GET /api/libros/categorias` lista las categorías y cuántos libros tiene cada una.
- `POST /api/libros/:id/portada` recibe `{ "imagen": "data:image/png;base64,..." }` (PNG, JPG o WEBP, máx. 2 MB).
  Las imágenes se guardan en `public/portadas/`, que no se sube al repositorio.

## Multas e historial de socios

Al devolver un libro después de su fecha límite se registra una multa de `MULTA_POR_DIA` soles
por cada día de atraso (1.00 por defecto, configurable en `.env`). Un socio con multas pendientes
no puede pedir nuevos préstamos hasta pagarlas.

- `GET /api/multas` lista las multas (pendientes, pagadas y en curso) con sus totales.
- `PUT /api/multas/:idPrestamo/pagar` registra el pago de una multa.
- `GET /api/socios/:id/historial` devuelve todos los préstamos de un socio y su deuda pendiente.
