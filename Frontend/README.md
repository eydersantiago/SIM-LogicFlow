# SIM LogicFlow - Frontend Skeleton

Esqueleto base del frontend del proyecto **SIM LogicFlow** construido con:

- React 19
- Vite 7
- TypeScript
- React Router
- Configuracion PWA (`vite-plugin-pwa`)

La estructura se definio a partir del documento:
`Informe Avance 1 Proyecto SIM LogicFlow v02032026.docx`.

## 1. Objetivo del esqueleto

Dejar una base navegable y escalable para los modulos principales del MVP:

- Autenticacion y control de acceso por rol.
- Programacion academica ATS.
- Gestion tecnica de mantenimientos.
- Consulta de agenda semanal/mensual.
- Reportes estadisticos.

## 2. Estructura principal

```text
src/
  app/
    guards/ProtectedRoute.tsx
    navigation.ts
    router.tsx
  components/
    layout/AppShell.tsx
  context/
    AuthContext.tsx
  domain/
    mockData.ts
    types.ts
  modules/
    academic/
      pages/CoursesPage.tsx
      pages/SchedulingPage.tsx
      restrictions/restrictionEngine.ts
    auth/pages/LoginPage.tsx
    common/pages/UnauthorizedPage.tsx
    consultation/pages/AgendaPage.tsx
    dashboard/pages/DashboardPage.tsx
    reports/pages/ReportsPage.tsx
    technical/pages/MaintenancePage.tsx
    users/pages/UsersPage.tsx
  services/
    api/client.ts
    api/endpoints.ts
```

## 3. Reglas ya contempladas en la base

En `restrictionEngine.ts` se dejo un motor inicial para validar:

- Limite de fatiga: maximo 6 horas diarias.
- Aforo por sala.
- Capacidad de posiciones de trabajo.
- Cruces horarios por sala.
- Bloqueo por ventana de mantenimiento.

## 4. Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## 5. Variables de entorno

Copiar `.env.example` a `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 6. Notas de integracion backend

- El cliente HTTP base esta en `src/services/api/client.ts`.
- Los endpoints base estan en `src/services/api/endpoints.ts`.
- Se debe conectar con Django REST Framework en la siguiente iteracion.

