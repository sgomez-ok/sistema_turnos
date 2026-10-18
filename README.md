# Sistema de Gestión de Turnos - Backend (FastAPI + SQLite) y Frontend (HTML/CSS/JS)

Aplicación web completa para la gestión de turnos que integra una API RESTful desarrollada en Python con FastAPI y SQLite, conectada a una interfaz web interactiva desarrollada en HTML, CSS y JavaScript.

El sistema incluye validaciones avanzadas de reglas de negocio en el backend para prevenir la superposición de horarios al crear o modificar reservas, además de validaciones de entrada en el cliente web.

## Características

- Backend modular con separación clara entre rutas (main.py) y capa de persistencia (database.py).
- Frontend web interactivo para el registro, visualización, modificación y cancelación de turnos en tiempo real.
- Configuración de CORS para permitir la comunicación entre el cliente web y la API local.
- CRUD completo de turnos:
  - Crear turno con validación de horario disponible.
  - Listar todos los turnos registrados.
  - Consultar detalle de turno por ID.
  - Modificar turno asegurando que el nuevo horario esté libre o pertenezca al mismo registro.
  - Eliminar turno por ID.
- Esquema de validación de datos con Pydantic.
- Consultas SQL parametrizadas para evitar ataques de inyección SQL.
- Manejo de excepciones y respuestas HTTP estandarizadas (200, 400, 404, 500).

## Tecnologías Utilizadas

### Backend
- Python 3
- FastAPI
- Uvicorn
- SQLite3
- Pydantic

### Frontend
- HTML5
- CSS3
- JavaScript (Fetch API)

## Estructura del Proyecto

sistema_turnos/
├── frontend/
│   ├── css/
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   ├── pages.css
│   │   ├── responsive.css
│   │   └── tokens.css
│   ├── js/
│   │   ├── api.js
│   │   ├── components.js
│   │   ├── configuracion.js
│   │   ├── crear-turno.js
│   │   ├── dashboard.js
│   │   ├── detalle-turno.js
│   │   ├── editar-turno.js
│   │   ├── navigation.js
│   │   ├── turnos.js
│   │   └── utils.js
│   ├── pages/
│   │   ├── configuracion.html
│   │   ├── crear-turno.html
│   │   ├── detalle-turno.html
│   │   ├── editar-turno.html
│   │   └── turnos.html
│   └── index.html
├── venv/
├── database.py
├── main.py
├── README.md
└── turnos.db
