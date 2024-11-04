# APP Web de Tareas - Equipo SIGMA

## Índice
1. [Descripción](#descripción)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Instalación](#instalación)
4. [Uso](#uso)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Principales Rutas y Endpoints](#principales-rutas-y-endpoints)

## Descripción
Aplicación web para la gestión de tareas personales, desarrollada con el objetivo de facilitar la organización mediante una interfaz intuitiva y funcionalidades avanzadas como un calendario interactivo, filtros, exportación de datos, y un perfil de usuario editable.

## Tecnologías Utilizadas
- **Backend**: Python, Flask, SQLAlchemy
- **Frontend**: JavaScript, Axios, Bootstrap
- **Base de Datos**: SQLite
- **Otras Librerías**: Werkzeug para encriptado, Datetime para fechas, FullCalendar para la vista de calendario

## Instalación
1. **Clonar el Repositorio**
   ```bash
   git clone https://github.com/Nexeus-Big-Data-Campus/becarios-sept-2024-sigma
   cd BECARIOS-SEPT-2024-SIGMA
2. **Configuración del Entorno Virtual**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\Activate
3. **Instalación de dependencias**
    ```bash
    pip install -r requirements.txt
4. **Configuración de la base de datos""
    ```bash
    python main.py

## Uso
1. **Inicio**: Ejecuta el servidor con:
    ```bash
    python main.py
2. **Acceso a la Aplicación**: Ingresa a [http://127.0.0.1:5000](http://127.0.0.1:5000) en el navegador.
3. **Navegación Básica**:
   - **Inicio de sesión/Registro**: Crear cuenta o iniciar sesión.
   - **Gestión de Tareas**: Crear, editar, eliminar y ver tareas en lista o calendario.
   - **Exportación**: Exportar tareas a JSON o Excel desde la página principal.

## Estructura del Proyecto
\```plaintext
BECARIOS-SEPT-2024-SIGMA/
├── backend/
│   ├── __init__.py              # Inicializa el backend y blueprints
│   ├── app/                     # Configuración general, modelos y rutas
│   ├── export/                  # Rutas para exportar datos
│   ├── task/                    # Funciones y rutas CRUD de tareas
│   ├── users/                   # Rutas de autenticación y perfil
├── database/
│   ├── dbsigma.db               # Base de datos SQLite
├── frontend/
│   ├── static/                  # Archivos estáticos (CSS y JavaScript)
│   ├── templates/               # Plantillas HTML (login, registro, calendario, etc.)
├── tests/                       # Pruebas unitarias
├── main.py                      # Archivo principal para ejecutar la app
├── README.md                    # Información del proyecto
├── requirements.txt             # Lista de dependencias
\```

## Principales Rutas y Endpoints
- **GET /**: Página de inicio de sesión.
- **POST /login**: Validación de credenciales.
- **GET /tasks**: Página principal con lista de tareas.
- **GET /calendar**: Vista de calendario interactivo.
- **POST /add-task**: Crear nueva tarea.
- **GET /export-json**: Exportación de tareas en formato JSON.
- **GET /export-excel**: Exportación de tareas en formato Excel.




