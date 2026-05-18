# Calendario de Formaciones

Aplicación web para la gestión de formaciones y participantes con calendario integrado.

## Características

- 📅 Calendario interactivo con FullCalendar
- 👥 Gestión de participantes y listas de espera
- 🔐 Control de permisos (Admin/Usuario)
- 📊 Visualización de capacidad y confirmados
- 🎯 Sistema de prioridades

## Instalación

```bash
npm install
npm run dev
```

## Configuración

Antes de usar la aplicación, configura tus credenciales de Supabase en `src/App.jsx`:

```javascript
const supabase = createClient(
  "https://YOUR_URL.supabase.co",
  "YOUR_ANON_KEY"
);
```

## Base de datos

La aplicación requiere dos tablas en Supabase:

### Tabla: formaciones
- `id` (integer, primary key)
- `titulo` (text)
- `fecha` (date)
- `capacidad` (integer)
- `created_at` (timestamp)

### Tabla: inscripciones
- `id` (integer, primary key)
- `nombre` (text)
- `prioridad` (integer: 1-3)
- `estado` (text: 'confirmado' o 'espera')
- `formacion_id` (integer, foreign key)
- `creado_por` (text)
- `created_at` (timestamp)

## Uso

1. **Como Admin**: Crea nuevas formaciones, elimina participantes, libera plazas
2. **Como Usuario**: Se inscribe en formaciones (confirmado o en espera según capacidad)

## Tecnologías

- React 18
- Supabase (Backend)
- FullCalendar
- Vite
