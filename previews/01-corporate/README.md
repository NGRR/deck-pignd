# deck-uikit

Presentacion web estatica basada en UIkit para visualizar laminas del estudio.

## Edicion online (navegador)

La aplicacion incluye modos de edicion online con persistencia local y remota opcional:

- `Editar texto`: abre un editor simple de la lamina actual (campos de texto, listas y bloques comunes).
- `Editar`: abre el editor JSON avanzado del deck completo.
- `Aplicar`: valida y aplica cambios, guardandolos en `localStorage`.
- `Guardar`: regraba el estado actual en `localStorage`.
- `Restaurar`: vuelve al deck original del codigo y borra cambios locales.
- `Exportar`: descarga un `deck-export.json` con el estado actual.
- `Importar`: carga un JSON exportado previamente.

Sin configuracion adicional, la persistencia es local al navegador/dispositivo.

## Guardado compartido (Supabase)

Para que los cambios se compartan con todos los usuarios del sitio:

1. Crear tabla en Supabase:

```sql
create table if not exists public.deck_state (
	id text primary key,
	deck jsonb not null,
	updated_at timestamptz not null default now()
);

create or replace function public.touch_deck_state_updated_at()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_deck_state_updated_at on public.deck_state;
create trigger trg_touch_deck_state_updated_at
before update on public.deck_state
for each row execute function public.touch_deck_state_updated_at();
```

2. Activar RLS y politicas (segun tu nivel de seguridad):

```sql
alter table public.deck_state enable row level security;

create policy "allow read deck_state"
on public.deck_state
for select
to anon
using (true);

create policy "allow write deck_state"
on public.deck_state
for insert
to anon
with check (id = 'main');

create policy "allow update deck_state"
on public.deck_state
for update
to anon
using (id = 'main')
with check (id = 'main');
```

3. Crear `assets/js/remote-config.js` usando el ejemplo `assets/js/remote-config.example.js` y definir:
- `supabaseUrl`
- `supabaseAnonKey`
- `rowId` (por defecto `main`)

4. Desplegar en GitHub Pages.

Cuando esta configurado, la app carga primero el deck remoto y el boton `Guardar` sincroniza cambios para todos.

## Desarrollo local

```powershell
docker compose up -d
```

Abrir en `http://localhost:8081`.

## Publicacion en GitHub Pages

Este repositorio incluye workflow de GitHub Actions para desplegar automaticamente en GitHub Pages al hacer push a `main`.
