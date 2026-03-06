# deck-uikit

Presentacion web estatica basada en UIkit para visualizar laminas del estudio.

## Edicion online (navegador)

La aplicacion incluye modos de edicion online con persistencia local:

- `Editar texto`: abre un editor simple de la lamina actual (campos de texto, listas y bloques comunes).
- `Editar`: abre el editor JSON avanzado del deck completo.
- `Aplicar`: valida y aplica cambios, guardandolos en `localStorage`.
- `Guardar`: regraba el estado actual en `localStorage`.
- `Restaurar`: vuelve al deck original del codigo y borra cambios locales.
- `Exportar`: descarga un `deck-export.json` con el estado actual.
- `Importar`: carga un JSON exportado previamente.

Nota: esta persistencia es local al navegador/dispositivo. Si necesitas edicion colaborativa o centralizada, el siguiente paso es conectar un backend (por ejemplo, Supabase o Firebase).

## Desarrollo local

```powershell
docker compose up -d
```

Abrir en `http://localhost:8081`.

## Publicacion en GitHub Pages

Este repositorio incluye workflow de GitHub Actions para desplegar automaticamente en GitHub Pages al hacer push a `main`.
