# BiblioTec

Sistema web de gestión de biblioteca desarrollado con Node.js y Express.
Permite administrar libros, socios, préstamos y reportes.

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
