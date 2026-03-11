
# SimLogic Backend API

Backend desarrollado con **Django REST Framework** para la gestión de cursos de simulación aeronáutica.

---

## Tabla de contenidos

- [Instalación y ejecución](#instalación-y-ejecución)
- [Autenticación](#autenticación)
- [Roles de usuario](#roles-de-usuario)
- [Endpoints de Autenticación](#endpoints-de-autenticación)
- [Endpoints de Cursos](#endpoints-de-cursos)
- [Endpoints de Soporte Técnico](#endpoints-de-soporte-técnico)
- [Reglas de negocio](#reglas-de-negocio)
- [Flujo completo de ejemplo](#flujo-completo-de-ejemplo)

---

## Instalación y ejecución

```bash
# 1. Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Aplicar migraciones
python manage.py migrate

# 4. Crear superusuario (opcional)
python manage.py createsuperuser

# 5. Iniciar servidor
python manage.py runserver
```

El servidor queda disponible en `http://127.0.0.1:8000/`
Panel de administración: `http://127.0.0.1:8000/admin/`

---

## Autenticación

La API usa **JWT (JSON Web Tokens)**. Incluye el token en cada petición protegida:

```
Authorization: Bearer <access_token>
```

El token de acceso expira en **1 hora**. Usa el token de refresco para renovarlo sin volver a iniciar sesión.

---

## Roles de usuario

| Rol | Valor en API | Descripción |
|-----|-------------|-------------|
| Administrador | `ADMIN` | Acceso total al sistema |
| Coordinador Académico | `ACADEMIC_COORDINATOR` | Crea cursos y programa sesiones |
| Coordinador Técnico | `TECHNICAL_COORDINATOR` | Agenda mantenimientos a salas |
| Instructor | `INSTRUCTOR` | Consulta su horario asignado |
| Pseudopiloto | `PSEUDOPILOT` | Consulta su horario asignado |
| Estudiante | `STUDENT` | Consulta su horario asignado |

---

## Endpoints de Autenticación

Base URL: `/api/auth/`

---

### POST `/api/auth/register/`

Registra un nuevo usuario. No requiere autenticación.

**Body:**
```json
{
  "username": "jperez",
  "email": "jperez@empresa.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "STUDENT",
  "phone": "3001234567",
  "password": "MiClave123@",
  "password_confirm": "MiClave123@"
}
```

**Respuesta (201):**
```json
{
  "id": 2,
  "username": "jperez",
  "email": "jperez@empresa.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "STUDENT",
  "phone": "3001234567",
  "created_at": "2026-03-10T10:00:00Z",
  "is_active": true
}
```

---

### POST `/api/auth/login/`

Inicia sesión y obtiene los tokens JWT.

**Body:**
```json
{
  "username": "jperez",
  "password": "MiClave123@"
}
```

**Respuesta (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 2,
    "username": "jperez",
    "email": "jperez@empresa.com",
    "role": "STUDENT",
    "first_name": "Juan",
    "last_name": "Pérez"
  }
}
```

---

### POST `/api/auth/refresh/`

Renueva el token de acceso.

**Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Respuesta (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### GET `/api/auth/me/`

Retorna el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta (200):**
```json
{
  "id": 2,
  "username": "jperez",
  "email": "jperez@empresa.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "STUDENT",
  "phone": "3001234567",
  "created_at": "2026-03-10T10:00:00Z",
  "is_active": true
}
```

### PATCH `/api/auth/me/`

Actualiza datos del perfil. No permite cambiar `username` ni `role`.

**Body (campos opcionales):**
```json
{
  "first_name": "Juan Carlos",
  "phone": "3009876543"
}
```

---

## Endpoints de Cursos

Base URL: `/api/courses/`

---

### Simuladores

#### GET `/api/courses/simulators/`

Lista todos los simuladores. Requiere autenticación.

**Respuesta (200):**
```json
[
  { "id": 1, "name": "Simulador Indra 1", "brand": "INDRA", "is_active": true },
  { "id": 2, "name": "Simulador Thales 1", "brand": "THALES", "is_active": true }
]
```

#### POST `/api/courses/simulators/` — Solo ADMIN

**Body:**
```json
{
  "name": "Simulador Indra 1",
  "brand": "INDRA"
}
```

Valores válidos para `brand`: `INDRA`, `THALES`

#### GET/PUT/PATCH/DELETE `/api/courses/simulators/<id>/`

Escritura solo para **ADMIN**.

---

### Salas

Cada simulador tiene 3 salas: Radar, Aeródromo y Pseudopilotos.

#### GET `/api/courses/rooms/`

Lista todas las salas. Filtros disponibles:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `simulator` | ID del simulador | `?simulator=1` |
| `room_type` | Tipo de sala | `?room_type=RADAR` |
| `is_active` | Activa o no | `?is_active=true` |

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "simulator": 1,
    "simulator_name": "Simulador Indra 1",
    "name": "Sala Radar Indra",
    "room_type": "RADAR",
    "student_capacity": 10,
    "instructor_capacity": 5,
    "pseudopilot_capacity": 0,
    "is_active": true
  }
]
```

#### POST `/api/courses/rooms/` — Solo ADMIN

**Sala Radar (Indra):**
```json
{
  "simulator": 1,
  "name": "Sala Radar Indra",
  "room_type": "RADAR",
  "student_capacity": 10,
  "instructor_capacity": 5,
  "pseudopilot_capacity": 0
}
```

**Sala Aeródromo (Indra):**
```json
{
  "simulator": 1,
  "name": "Sala Aeródromo Indra",
  "room_type": "AERODROME",
  "student_capacity": 8,
  "instructor_capacity": 5,
  "pseudopilot_capacity": 0
}
```

**Sala Pseudopilotos (Indra):**
```json
{
  "simulator": 1,
  "name": "Sala Pseudopilotos Indra",
  "room_type": "PSEUDOPILOT",
  "student_capacity": 0,
  "instructor_capacity": 0,
  "pseudopilot_capacity": 10
}
```

Valores válidos para `room_type`: `RADAR`, `AERODROME`, `PSEUDOPILOT`

Solo puede existir una sala de cada tipo por simulador.

#### GET/PUT/PATCH/DELETE `/api/courses/rooms/<id>/`

Escritura solo para **ADMIN**.

---

### Cursos

#### GET `/api/courses/`

Lista todos los cursos. Filtros:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `course_type` | Tipo de curso | `?course_type=RADAR` |
| `is_active` | Activo o no | `?is_active=true` |

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "name": "Curso Radar Básico",
    "description": "Curso introductorio de radar",
    "course_type": "RADAR",
    "min_simulation_hours": 20,
    "is_active": true,
    "created_at": "2026-03-10T10:00:00Z",
    "updated_at": "2026-03-10T10:00:00Z",
    "max_students": 10,
    "max_instructors": 5,
    "max_pseudopilots": 5
  }
]
```

#### POST `/api/courses/` — ACADEMIC_COORDINATOR o ADMIN

**Body:**
```json
{
  "name": "Curso Radar Básico",
  "description": "Curso introductorio de radar",
  "course_type": "RADAR",
  "min_simulation_hours": 20
}
```

Valores válidos para `course_type`: `RADAR`, `AERODROME`

| Tipo de curso | Max estudiantes | Max instructores | Max pseudopilotos |
|---------------|----------------|-----------------|-------------------|
| `RADAR` | 10 | 5 | 5 |
| `AERODROME` | 8 | 2 | 2 |

#### GET/PUT/PATCH/DELETE `/api/courses/<id>/`

Escritura solo para **ACADEMIC_COORDINATOR** o **ADMIN**.

---

### Sesiones de Curso

Una sesión es la programación concreta de un curso: salas, fechas, horario y participantes.

#### GET `/api/courses/sessions/`

Lista todas las sesiones. Todos los usuarios autenticados pueden consultar. Filtros:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `course` | ID del curso | `?course=1` |
| `is_active` | Activa o no | `?is_active=true` |

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "course": 1,
    "course_detail": { "id": 1, "name": "Curso Radar Básico", "course_type": "RADAR" },
    "coordinator": 3,
    "coordinator_detail": {
      "id": 3, "username": "coord_academico",
      "full_name": "María González", "role": "ACADEMIC_COORDINATOR"
    },
    "main_room": 1,
    "main_room_detail": {
      "id": 1, "name": "Sala Radar Indra",
      "room_type": "RADAR", "simulator_name": "Simulador Indra 1"
    },
    "pseudopilot_room": 3,
    "pseudopilot_room_detail": {
      "id": 3, "name": "Sala Pseudopilotos Indra",
      "room_type": "PSEUDOPILOT", "simulator_name": "Simulador Indra 1"
    },
    "students": [4, 5],
    "students_detail": [
      { "id": 4, "username": "est1", "full_name": "Carlos Ruiz", "role": "STUDENT" }
    ],
    "instructors": [6],
    "instructors_detail": [
      { "id": 6, "username": "inst1", "full_name": "Pedro Mora", "role": "INSTRUCTOR" }
    ],
    "pseudopilots": [7],
    "pseudopilots_detail": [
      { "id": 7, "username": "pseudo1", "full_name": "Luis Vega", "role": "PSEUDOPILOT" }
    ],
    "start_date": "2026-03-20",
    "end_date": "2026-04-20",
    "schedule_time": "08:00:00",
    "daily_simulation_hours": 6,
    "is_active": true,
    "created_at": "2026-03-10T10:00:00Z",
    "updated_at": "2026-03-10T10:00:00Z"
  }
]
```

#### POST `/api/courses/sessions/` — ACADEMIC_COORDINATOR o ADMIN

El coordinador se asigna automáticamente al usuario autenticado.

**Body:**
```json
{
  "course": 1,
  "main_room": 1,
  "pseudopilot_room": 3,
  "students": [4, 5, 6],
  "instructors": [7, 8],
  "pseudopilots": [9, 10],
  "start_date": "2026-03-20",
  "end_date": "2026-04-20",
  "schedule_time": "08:00",
  "daily_simulation_hours": 6
}
```

**Validaciones:**

| Regla | Detalle |
|-------|---------|
| Fechas | `end_date >= start_date` |
| Horas diarias | `daily_simulation_hours <= 6` |
| Tipo de sala principal | `main_room.room_type` debe coincidir con `course.course_type` |
| Sala de pseudopilotos | `pseudopilot_room.room_type` debe ser `PSEUDOPILOT` |
| Mismo simulador | `main_room` y `pseudopilot_room` deben ser del mismo simulador |
| Mínimo participantes | Al menos 1 estudiante, 1 instructor y 1 pseudopiloto |
| Máximo participantes | Según tipo de curso (ver tabla) |
| Capacidad de sala | No exceder las capacidades definidas en las salas |
| Conflicto mantenimiento | La sala no puede tener mantenimiento PENDING o IN_PROGRESS en ese período |

#### GET/PUT/PATCH/DELETE `/api/courses/sessions/<id>/`

Escritura solo para **ACADEMIC_COORDINATOR** o **ADMIN**.

---

### GET `/api/courses/my-schedule/`

Retorna las sesiones donde el usuario está asignado como participante.

| Rol | Qué ve |
|-----|--------|
| `STUDENT` | Sesiones donde aparece como estudiante |
| `INSTRUCTOR` | Sesiones donde aparece como instructor |
| `PSEUDOPILOT` | Sesiones donde aparece como pseudopiloto |
| `ACADEMIC_COORDINATOR` / `TECHNICAL_COORDINATOR` / `ADMIN` | Error 403 |

**Headers:** `Authorization: Bearer <token>`

**Respuesta (200):** Lista de sesiones en el mismo formato que `/api/courses/sessions/`

---

## Endpoints de Soporte Técnico

Base URL: `/api/support/`

---

### Tipos de Mantenimiento

#### GET `/api/support/maintenance-types/`

Lista tipos de mantenimiento. Solo **TECHNICAL_COORDINATOR** o **ADMIN**.

Filtro: `?is_active=true`

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "name": "Limpieza general",
    "description": "Limpieza de equipos y sala",
    "is_active": true
  }
]
```

#### POST `/api/support/maintenance-types/` — Solo ADMIN

**Body:**
```json
{
  "name": "Limpieza general",
  "description": "Limpieza de equipos y sala"
}
```

#### GET/PUT/PATCH/DELETE `/api/support/maintenance-types/<id>/`

Lectura para **TECHNICAL_COORDINATOR** o **ADMIN**. Escritura solo **ADMIN**.

---

### Registros de Soporte

#### GET `/api/support/records/`

Lista registros de mantenimiento.

- **TECHNICAL_COORDINATOR**: ve solo sus propios registros
- **ADMIN**: ve todos

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "support_person": 9,
    "support_person_username": "coord_tecnico",
    "room": 1,
    "room_detail": {
      "id": 1, "name": "Sala Radar Indra",
      "room_type": "RADAR", "simulator_name": "Simulador Indra 1"
    },
    "maintenance_type": 1,
    "maintenance_type_name": "Limpieza general",
    "scheduled_date": "2026-03-15",
    "completed_date": null,
    "status": "PENDING",
    "notes": "Revisión mensual de equipos",
    "created_at": "2026-03-10T10:00:00Z",
    "updated_at": "2026-03-10T10:00:00Z"
  }
]
```

#### POST `/api/support/records/` — TECHNICAL_COORDINATOR o ADMIN

El coordinador técnico se asigna automáticamente. El admin debe incluir `support_person`.

**Body:**
```json
{
  "room": 1,
  "maintenance_type": 1,
  "scheduled_date": "2026-03-15",
  "status": "PENDING",
  "notes": "Revisión mensual de equipos"
}
```

Valores válidos para `status`: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**Validaciones:**

| Regla | Detalle |
|-------|---------|
| Conflicto sesión | La sala no puede tener una sesión activa en esa fecha |
| `completed_date` | Obligatorio si `status = COMPLETED` |
| Fechas | `completed_date >= scheduled_date` |
| Bloqueo de sala | Solo aplica para estados `PENDING` e `IN_PROGRESS` |

#### GET `/api/support/records/<id>/`

El coordinador técnico solo puede ver sus propios registros.

#### PUT/PATCH `/api/support/records/<id>/`

Actualiza un registro.

**Marcar en progreso:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Marcar como completado:**
```json
{
  "status": "COMPLETED",
  "completed_date": "2026-03-15"
}
```

#### DELETE `/api/support/records/<id>/` — Solo ADMIN

---

### GET `/api/support/my-records/`

Lista los registros del coordinador técnico autenticado. Solo **TECHNICAL_COORDINATOR**.

---

## Reglas de negocio

### Capacidades por simulador y sala

| Simulador | Sala | Estudiantes | Instructores | Pseudopilotos |
|-----------|------|-------------|--------------|---------------|
| Indra | Radar | 10 | 5 | — |
| Indra | Aeródromo | 8 | 5 | — |
| Indra | Pseudopilotos | — | — | 10 |
| Thales | Radar | 10 | 5 | — |
| Thales | Aeródromo | 8 | 5 | — |
| Thales | Pseudopilotos | — | — | 12 |

### Máximos por tipo de curso

| Tipo | Estudiantes | Instructores | Pseudopilotos |
|------|-------------|--------------|---------------|
| Radar | 10 | 5 | 5 |
| Aeródromo | 8 | 2 | 2 |

### Horas de simulación

- Máximo **6 horas diarias** para todos los cursos
- Cada curso define sus horas mínimas en `min_simulation_hours`

### Bloqueo de sala

- Sala con mantenimiento `PENDING` o `IN_PROGRESS` en un período → no se puede programar sesión
- Sala con sesión activa en una fecha → no se puede programar mantenimiento

---

## Flujo completo de ejemplo

### Paso 1 — Configuración inicial (Admin)

```
POST /api/auth/login/
Body: { "username": "admin", "password": "123" }

POST /api/courses/simulators/
Body: { "name": "Simulador Indra 1", "brand": "INDRA" }

POST /api/courses/simulators/
Body: { "name": "Simulador Thales 1", "brand": "THALES" }

POST /api/courses/rooms/
Body: { "simulator": 1, "name": "Sala Radar Indra", "room_type": "RADAR", "student_capacity": 10, "instructor_capacity": 5, "pseudopilot_capacity": 0 }

POST /api/courses/rooms/
Body: { "simulator": 1, "name": "Sala Aeródromo Indra", "room_type": "AERODROME", "student_capacity": 8, "instructor_capacity": 5, "pseudopilot_capacity": 0 }

POST /api/courses/rooms/
Body: { "simulator": 1, "name": "Sala Pseudopilotos Indra", "room_type": "PSEUDOPILOT", "student_capacity": 0, "instructor_capacity": 0, "pseudopilot_capacity": 10 }
```

### Paso 2 — Registrar usuarios

```
POST /api/auth/register/
Body: { "username": "coord_acad", "role": "ACADEMIC_COORDINATOR", "password": "Clave123@", "password_confirm": "Clave123@" }

POST /api/auth/register/
Body: { "username": "coord_tec", "role": "TECHNICAL_COORDINATOR", "password": "Clave123@", "password_confirm": "Clave123@" }

POST /api/auth/register/
Body: { "username": "inst1", "role": "INSTRUCTOR", "password": "Clave123@", "password_confirm": "Clave123@" }

POST /api/auth/register/
Body: { "username": "pseudo1", "role": "PSEUDOPILOT", "password": "Clave123@", "password_confirm": "Clave123@" }

POST /api/auth/register/
Body: { "username": "est1", "role": "STUDENT", "password": "Clave123@", "password_confirm": "Clave123@" }
```

### Paso 3 — Coordinador Académico crea y programa un curso

```
POST /api/auth/login/
Body: { "username": "coord_acad", "password": "Clave123@" }

POST /api/courses/
Body: { "name": "Radar Básico", "course_type": "RADAR", "min_simulation_hours": 20 }

POST /api/courses/sessions/
Body: {
  "course": 1,
  "main_room": 1,
  "pseudopilot_room": 3,
  "students": [5],
  "instructors": [3],
  "pseudopilots": [4],
  "start_date": "2026-04-01",
  "end_date": "2026-04-30",
  "schedule_time": "08:00",
  "daily_simulation_hours": 6
}
```

### Paso 4 — Coordinador Técnico agenda mantenimiento

```
POST /api/auth/login/
Body: { "username": "coord_tec", "password": "Clave123@" }

POST /api/support/records/
Body: { "room": 1, "maintenance_type": 1, "scheduled_date": "2026-05-10", "status": "PENDING", "notes": "Mantenimiento preventivo" }

PATCH /api/support/records/1/
Body: { "status": "IN_PROGRESS" }

PATCH /api/support/records/1/
Body: { "status": "COMPLETED", "completed_date": "2026-05-10" }

GET /api/support/my-records/
```

### Paso 5 — Participantes consultan su horario

```
POST /api/auth/login/
Body: { "username": "est1", "password": "Clave123@" }

GET /api/courses/my-schedule/
GET /api/auth/me/
```
