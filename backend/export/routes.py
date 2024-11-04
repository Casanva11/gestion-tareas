from flask import Blueprint, redirect, url_for, session, flash
from backend.app import config as db
from backend.app.models import Task, User, Category, Status, Prioritys
from openpyxl import Workbook
import json
from io import BytesIO
from flask import send_file

# Crea un blueprint para las exportaciones
export_bp = Blueprint('export', __name__)

# Ruta para exportar las tareas de un usuario en formato excel
@export_bp.route('/export-excel')
def export_excel():
    # Almacena el id del usuario en sesión en la variable
    id_user = session.get('user_id')
    # Almacena el usuario en la variable, lo usará para definir el nombre del archivo y la hoja excel
    user = db.session.query(User).filter_by(id_user=id_user).first()
    # Consulta (en base al id del usuario) y almacena todas las tareas del usuario en sesión
    user_tasks = db.session.query(Task).filter_by(id_user=id_user).all()
    # Crea dos listas de momento vacías 
    list_task = []
    current_task = []
    # Este bucle crea la lista de listas con la información de las tareas
    for task in user_tasks:
        current_task.append(task.title)
        current_task.append(task.notes)
        current_task.append(task.start_date)
        current_task.append(task.end_date)
        # Añade el nombre de la categoría
        current_category = db.session.query(Category).filter_by(id_category=task.id_category).first()
        current_task.append(current_category.name_category)
        # Añade el nombre del estatus
        current_status = db.session.query(Status).filter_by(id_status=task.id_status).first()
        current_task.append(current_status.name_status)
        # Añade el nombre de la prioridad
        current_priority = db.session.query(Prioritys).filter_by(id_priority=task.id_priority).first()
        current_task.append(current_priority.name_priority)

        list_task.append(current_task)
        current_task = []

    # Crea un archivo Excel en memoria
    wb = Workbook()
    ws = wb.active
    ws.title = "Tareas de {} {}".format(user.name, user.last_name)

    # Añade la cabecera y los datos
    ws.append(['TÍTULO', 'NOTAS', 'FECHA DE INICIO', 'FECHA FINAL', 'CATEGORÍA', 'ESTATUS', 'PRIORIDAD'])
    for row in list_task:
        ws.append(row)

    # Define la anchura de las columnas
    for col in ['A', 'B', 'C', 'D', 'E', 'F', 'G']:
        ws.column_dimensions[col].width = 20

    # Guarda el archivo en memoria en lugar de en el sistema de archivos
    output = BytesIO()
    wb.save(output)
    output.seek(0)

    # Envía el archivo al navegador para que el usuario pueda elegir dónde guardarlo
    filename = 'Tareas_de_{}_{}.xlsx'.format(user.name, user.last_name)
    return send_file(output, as_attachment=True, download_name=filename, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


# Ruta para exportar las tareas de un usuario en formato json
@export_bp.route('/export-json')
def export_json():
    # Almacena el id del usuario en sesión en la variable
    id_user = session.get('user_id')
    # Almacena el usuario en la variable, lo usará para definir el nombre del archivo
    user = db.session.query(User).filter_by(id_user=id_user).first()
    # Consulta (en base al id del usuario) y almacena todas las tareas del usuario en sesión
    user_tasks = db.session.query(Task).filter_by(id_user=id_user).all()
    # Crea una lista para almacenar las tareas en formato JSON
    list_tasks = []

    # Este bucle estructura cada tarea como un diccionario JSON
    for task in user_tasks:
        current_category = db.session.query(Category).filter_by(id_category=task.id_category).first()
        current_status = db.session.query(Status).filter_by(id_status=task.id_status).first()
        current_priority = db.session.query(Prioritys).filter_by(id_priority=task.id_priority).first()

        current_task = {
            'Título': str(task.title),
            'Notas': str(task.notes),
            'Fecha de inicio': str(task.start_date),
            'Fecha final': str(task.end_date),
            'Categoría': str(current_category.name_category),
            'Estatus': str(current_status.name_status),
            'Prioridad': str(current_priority.name_priority)
        }
        list_tasks.append(current_task)

    # Crea un diccionario con las tareas
    dicc_task = {'Tareas': list_tasks}

    # Convierte el diccionario de tareas a JSON en memoria
    output = BytesIO()
    output.write(json.dumps(dicc_task, ensure_ascii=False, indent=4).encode('utf-8'))
    output.seek(0)

    # Envía el archivo JSON al navegador para que el usuario pueda elegir dónde guardarlo
    filename = 'Tareas_de_{}_{}.json'.format(user.name, user.last_name)
    return send_file(output, as_attachment=True, download_name=filename, mimetype='application/json')