from flask import Blueprint, render_template, request, jsonify, session, flash
from backend.app import config as db
from backend.app.models import User
from datetime import datetime, timedelta
from backend.app.models import Task, Category, User, Status, Prioritys
from backend.app.routes import app_bp
from sqlalchemy.orm import joinedload
from sqlalchemy import or_



# Funcion que devulve un diccionario con las tareas filtradas
def convert_dic(filtered_tasks, categories_dict):
  # Agrupar las tareas por categoría
    for task in filtered_tasks:
        category_id = task.id_category
        category = task.category  # Usamos la relación de SQLAlchemy para obtener la categoría
        
        if category_id not in categories_dict:
            # Si la categoría aún no está en el diccionario, la añadimos
            categories_dict[category_id] = {
                'id_category': category.id_category,
                'name_category': category.name_category,
                'tasks': []
            }
        
        # Agregar la tarea a la categoría correspondiente
        priority_name = db.session.query(Prioritys).filter(Prioritys.id_priority == task.id_priority).first().name_priority
        status_name = db.session.query(Status).filter(Status.id_status == task.id_status).first().name_status

        categories_dict[category_id]['tasks'].append({
            'id_task': task.id_task,
            'title': task.title,
            'notes': task.notes,
            'start_date': task.start_date,
            'end_date': task.end_date,
            'priority': {
                'id_priority': task.id_priority,
                'name_priority': priority_name
            },
            'status': {
                'id_status': task.id_status,
                'name_status': status_name
            }
        })

    return list(categories_dict.values())



# Ruta para establecer una fecha y hora iniciales en una tarea
def startDate(startDate):
     # Si la fecha de creación está vacía, establecer la fecha y hora actuales
    if not startDate:
        startDate = datetime.now()  # Usa la fecha y hora actuales       
    else:
        # Convertir el formato de la fecha
        startDate = datetime.strptime(startDate, '%Y-%m-%dT%H:%M') 
    return startDate

# Ruta para establecer una fecha y hora finales en una tarea
def endDate(endDate):
    # Si la fecha de creación está vacía, establecer la fecha y hora actuales
    if endDate:
       # Convertir el formato de la fech
       endDate = datetime.strptime(endDate, '%Y-%m-%dT%H:%M')
    else:
        endDate = None
    return endDate

def json_filter(filtered_tasks,categories_dict):
 # Agrupar las tareas por categoría
    for task in filtered_tasks:
        category_id = task.id_category
        category = task.category  # Usamos la relación de SQLAlchemy para obtener la categoría
        
        if category_id not in categories_dict:
            # Si la categoría aún no está en el diccionario, la añadimos
            categories_dict[category_id] = {
                'id_category': category.id_category,
                'name_category': category.name_category,
                'tasks': []
            }
        
        # Agregar la tarea a la categoría correspondiente
        priority_name = db.session.query(Prioritys).filter(Prioritys.id_priority == task.id_priority).first().name_priority
        status_name = db.session.query(Status).filter(Status.id_status == task.id_status).first().name_status

        categories_dict[category_id]['tasks'].append({
            'id_task': task.id_task,
            'title': task.title,
            'notes': task.notes,
            'start_date': task.start_date.isoformat() if task.start_date else None,
            'end_date': task.end_date.isoformat() if task.end_date else None,
            'priority': {
                'id_priority': task.id_priority,
                'name_priority': priority_name
            },
            'status': {
                'id_status': task.id_status,
                'name_status': status_name
            }
        })

    return list(categories_dict.values())




# Ruta para obtener la tarea de buscar *************** Preuba
def prueba(task_id):
    # Obtiene el ID del usuario actual de la sesión.
    user_id = session.get('user_id')   

    # Realiza una consulta a la base de datos para obtener todas las categorías del usuario,
    # junto con las tareas, estados y prioridades asociadas a esas tareas.
    categories = (
        db.session.query(Category)  # Inicia la consulta sobre el modelo Category.
        .outerjoin(Task)  # Realiza una unión externa (left join) con la tabla Task.
        .outerjoin(Status)  # Realiza una unión externa (left join) con la tabla Status.
        .outerjoin(Prioritys)  # Realiza una unión externa (left join) con la tabla Prioritys.
        .filter(Category.id_user == user_id)  # Filtra las categorías para que solo se incluyan las del usuario actual.
        .filter(Task.id_task == task_id)
        .all()  # Ejecuta la consulta y devuelve todos los resultados como una lista.
        )
           
    priorities = db.session.query(Prioritys).all()   # Obtén las prioridades
    statuses = db.session.query(Status).all()      # Obtén los estados

    # Renderiza la plantilla 'home.html' y pasa la lista de categorías obtenida como contexto.
    return "hola"
