<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Transporte Escolar Nobsa 2027

Portal de inscripciones al servicio de transporte escolar del municipio de Nobsa.

## Despliegue en Vercel

1. Cree una base de datos en MongoDB Atlas y configure su usuario y acceso de red.
2. En **Vercel > Project Settings > Environment Variables**, agregue:
   - `MONGODB_URI`: cadena de conexión de Atlas.
   - `MONGODB_DB`: nombre de la base de datos (por ejemplo, `feria_robotica_nobsa`).
   - `AUTH_SECRET`: secreto aleatorio largo para firmar las sesiones.
3. En **Settings > Build and Deployment**, use la raíz del proyecto y seleccione **Vite** como Framework Preset.
4. Vuelva a desplegar. La función `api/index.ts` atiende `/api/*` mediante una regla explícita de reescritura y Vercel sirve el frontend desde `dist`.

La consola del navegador muestra si `/api/health` pudo leer MongoDB. Un `404` para esa ruta indica que la función no quedó incluida en el despliegue.

En la primera conexión, el servidor migra `data/database.json` si está disponible; si no, inicializa los colegios, grados, paraderos y usuarios base.

## Desarrollo local

1. Ejecute `npm install`.
2. Configure las variables anteriores en `.env` (puede tomar `.env.example` como referencia).
3. Ejecute `npm run dev`.
