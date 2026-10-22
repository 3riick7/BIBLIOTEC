# Guía de trabajo con Git en BiblioTec

## Ramas
- `main` contiene siempre la versión estable; no se hacen commits directos en ella.
- Cada cambio se hace en una rama propia, creada desde `main` actualizado:
  - `feature/<nombre>` para funciones nuevas (ej. `feature/reportes`).
  - `fix/<nombre>` para corregir errores (ej. `fix/devoluciones`).
  - `docs/<nombre>` para documentación.
- La rama se integra a `main` mediante un Pull Request y se elimina después del merge.

## Commits
- Un commit = un cambio lógico (no mezclar funciones distintas).
- Mensaje en español, en tercera persona y presente, que diga qué se hizo:
  `Agrega búsqueda de socios por nombre o DNI en la API`.
- Evitar mensajes vagos como `cambios`, `arreglos` o `avance`.
- Hacer commit cada vez que una parte funciona; hacer push al menos al terminar el día.

## Pull Requests
- Título corto y descripción de lo que cambia.
- Enlazar el issue con `Closes #n`.
- Antes de pedir el merge: `git pull origin main`, resolver conflictos y probar con `npm start`.

## Antes de subir cambios
1. `git status` para revisar qué se va a confirmar.
2. `npm run check` para verificar los archivos del proyecto.
3. Nunca subir `.env` ni `node_modules` (ya están en `.gitignore`).
