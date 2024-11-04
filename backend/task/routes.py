from flask import Blueprint, render_template, request, jsonify, session, flash
from backend.app import config as db
from backend.app.models import User
from datetime import datetime, timedelta
from backend.app.models import Task, Category, User, Status, Prioritys
from backend.app.routes import app_bp
from sqlalchemy.orm import joinedload
from sqlalchemy import or_
from backend.task import functions_task as function
# Crear un Blueprint para las tareas
task_bp = Blueprint('task', __name__)

# # Ruta para obtener las tareas y cargar página inicial
@task_bp.route('/tasks', methods=['GET'])
def get_all_task():
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
        .order_by(Category.id_category.desc())  # Ordena las categorías por id_category de manera ascendente.
        .all()  # Ejecuta la consulta y devuelve todos los resultados como una lista.
        )
    
    priorities = db.session.query(Prioritys).all()   # Obtén las prioridades
    statuses = db.session.query(Status).all()      # Obtén los estados

    # Renderiza la plantilla 'home.html' y pasa la lista de categorías obtenida como contexto.
    return render_template('home.html', categories=categories, priorities=priorities, statuses=statuses)

# Ruta para cargar la página de calendario
@task_bp.route('/calendar', methods=['GET'])
def get_all_calendar():
    user_id = session.get('user_id')

    # Obtengo las categorías del usuario
    categories = (
        db.session.query(Category)
        .filter(Category.id_user == user_id)  # Filtra las categorías para el usuario actual
        .order_by(Category.id_category.desc())
        .all()
    )
    
    # Obtengo las prioridades y los estados
    priorities = db.session.query(Prioritys).all()  
    statuses = db.session.query(Status).all()
    
    # Renderizo la plantilla 'calendar.html' y paso categorías, prioridades y estados
    return render_template('calendar.html', categories=categories, priorities=priorities, statuses=statuses)


# Ruta para crear una tarea
@task_bp.route('/add-task', methods=['POST'])
def new_task():
    data = request.json  # Obtén los datos JSON de la solicitud
  
    # Extrae los datos del JSON
    title = data.get('title')
    notes = data.get('notes')
    category_name = data.get('category')  # Nombre de la categoría (puede ser el ID)
    priority = data.get('priority')
    status = data.get('status')
    start_date = data.get('startDate')  # Asegúrate de que coincida con el nombre en Axios
    end_date = data.get('endDate')

    # Convertir las fechas a datetime    
    start_date = function.startDate(start_date)
    end_date = function.endDate(end_date)

    # Obtén el id del usuario de la sesión
    user_id = session.get('user_id')

    # Verificar si la categoría ya existe para este usuario
    category = db.session.query(Category).filter(
        Category.name_category == category_name, 
        Category.id_user == user_id  # Añadir este filtro para que sea específico por usuario
    ).first()

    # Si la categoría no existe, crearla
    new_category = False
    if category is None:
        category = Category(name_category=category_name, id_user=user_id)  # Crea una nueva categoría para el usuario actual
        db.session.add(category)
        db.session.flush()  # Necesario para obtener el ID de la nueva categoría
        new_category = True

    # Crea una nueva tarea
    new_task = Task(
        title=title,
        notes=notes,
        id_category=category.id_category,  # Usa el ID de la categoría (ya sea nueva o existente)
        id_priority=priority,  # Asegúrate de que sea el ID de la prioridad
        id_status=status,      # Asegúrate de que sea el ID del estado
        start_date=start_date,
        end_date=end_date,
        id_user=user_id  # Obtiene el ID del usuario actual de la sesión
    )

    # Agrega la tarea a la base de datos
    db.session.add(new_task)

    try:
        db.session.commit()

        # Obtener las tareas de la categoría actualizada
        tasks = db.session.query(Task).filter(Task.id_category == category.id_category).all()

        # Obtener los nombres de prioridad y estado desde las tablas
        all_tasks_data = []
        for task in tasks:
            priority_name = db.session.query(Prioritys).filter(Prioritys.id_priority == task.id_priority).first().name_priority
            status_name = db.session.query(Status).filter(Status.id_status == task.id_status).first().name_status
            
            all_tasks_data.append({
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

        # Preparar la respuesta con la categoría y todas las tareas
        category_dict = {
            'id_category': category.id_category,
            'name_category': category.name_category,
            'tasks': all_tasks_data  # Pasar todas las tareas de la categoría
        }       

        message = 'Tarea creada con éxito.'
        #flash(message, 'success')  # Mensaje flash

        return jsonify({
            'category': category_dict,
            'new_category': new_category,
            'message': message
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error al crear la tarea."}), 500

    
# Ruta para actualizar una tarea
@task_bp.route('/edit-task', methods=['POST'])
def edit_task():
    data = request.json  # Obtener los datos del formulario

    task_id = data.get('taskId')
    title = data.get('title')
    notes = data.get('notes')
    category_name = data.get('category')
    priority = data.get('priority')
    status = data.get('status')
    start_date = data.get('startDate')
    end_date = data.get('endDate')

    # Convertir las fechas a datetime
    start_date = function.startDate(start_date)
    end_date = function.endDate(end_date)

    # Obtener el ID del usuario de la sesión
    user_id = session.get('user_id')

    # Buscar la tarea por ID
    task_to_edit = db.session.query(Task).filter(Task.id_task == task_id).first()

    if not task_to_edit:
        return jsonify({"message": "Tarea no encontrada."}), 404

    # Guardar el ID de la categoría anterior
    old_category_id = task_to_edit.id_category

    # Actualizar los campos de la tarea
    task_to_edit.title = title
    task_to_edit.notes = notes
    task_to_edit.id_priority = priority
    task_to_edit.id_status = status
    task_to_edit.start_date = start_date
    task_to_edit.end_date = end_date

    # Verificar si la nueva categoría ya existe para el usuario
    new_category = db.session.query(Category).filter(Category.name_category == category_name, Category.id_user == user_id).first()
    exist_category = True
    if new_category is None:
        exist_category = False
        # Si la categoría no existe, crearla
        new_category = Category(name_category=category_name, id_user=user_id)  # Crear una nueva categoría para el usuario actual
        db.session.add(new_category)
        db.session.commit()  # Guardar la nueva categoría
        task_to_edit.id_category = new_category.id_category
    else:
        # Asignar la nueva categoría a la tarea
        task_to_edit.id_category = new_category.id_category

    try:
        db.session.commit()  # Guardar cambios en la base de datos

        # Obtener la categoría anterior y la nueva para actualizar en la interfaz
        old_category = db.session.query(Category).filter(Category.id_category == old_category_id).first()
        new_tasks = db.session.query(Task).filter(Task.id_category == new_category.id_category).all()

        # Obtener las tareas de la categoría anterior
        old_tasks = db.session.query(Task).filter(Task.id_category == old_category_id).all()

        # Construir las respuestas para ambas categorías
        def category_dict(category, tasks):
            all_tasks_data = []
            for task in tasks:
                priority_name = db.session.query(Prioritys).filter(Prioritys.id_priority == task.id_priority).first().name_priority
                status_name = db.session.query(Status).filter(Status.id_status == task.id_status).first().name_status

                all_tasks_data.append({
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

            return {
                'id_category': category.id_category,
                'name_category': category.name_category,
                'tasks': all_tasks_data
            }

        old_category_dict = category_dict(old_category, old_tasks)
        new_category_dict = category_dict(new_category, new_tasks)

        return jsonify({
            'old_category': old_category_dict,
            'new_category': new_category_dict,
            'exist_category': exist_category
        }), 200

    except Exception as e:
        db.session.rollback()  # Revertir en caso de error
        return jsonify({"message": "Error al editar la tarea."}), 500


# Ruta para eliminar una tarea
@task_bp.route('/delete-task', methods=['DELETE'])
def delete_task():  
    task_id = request.json.get('taskId')  # Obtener el taskId del cuerpo de la solicitud
    
    if task_id:
        task = db.session.query(Task).filter(Task.id_task == task_id).first() # Buscar la tarea por ID
        id_category = task.id_category

        if task:  # Verifica que la tarea existe
            db.session.delete(task)           # Eliminar la tarea
            db.session.commit()               # Confirmar la transacción            


            category = db.session.query(Category).filter(Category.id_category == id_category).first()                      

            # Preparar los datos de la categoría con las tareas actualizadas            
            category_dict = {
                'id_category': category.id_category,
                'name_category': category.name_category,
                'tasks': []
            }
                
            for task in category.tasks:
                task_dict = {
                    'id_task': task.id_task,
                    'title': task.title,
                    'notes': task.notes,
                    'start_date': task.start_date.isoformat() if task.start_date else None,
                    'end_date': task.end_date.isoformat() if task.end_date else None,
                    'status': {
                        'id_status': task.status.id_status,
                        'name_status': task.status.name_status
                    },
                    'priority': {
                        'id_priority': task.priority.id_priority,
                        'name_priority': task.priority.name_priority
                    }
                }
                category_dict['tasks'].append(task_dict) 

            return jsonify(category_dict), 200
        else:
            return jsonify({'error': 'Tarea no encontrada'}), 404
    else:    
        return jsonify({'error': 'ID de tarea no proporcionado'}), 400

# Ruta para actualizar una tarea
@task_bp.route('/update_category', methods=['POST'])
def update_category():    
    data = request.get_json()
    id_category = data.get('id_category')
    name_category = data.get('name_category')

    category = db.session.query(Category).filter(Category.id_category == id_category).first()
    if category:
        category.name_category = name_category
        db.session.commit()  # Guardar cambios en la base de datos
        return jsonify(success=True)
    
    return jsonify(success=False)


# Busca las tareas que quiere sugerir para ir mostrando
@task_bp.route('/search_tasks', methods=['GET'])
def search_tasks():
    query = request.args.get('query', '')
    user_id = session.get('user_id')  # Obtener el ID del usuario conectado
    
    if query and user_id:
        # Busca tareas del usuario cuyo título o notas contengan la consulta (insensible a mayúsculas)
        tasks = db.session.query(Task).filter(
            Task.id_user == user_id,  # Filtra solo las tareas del usuario conectado
            or_(Task.title.ilike(f'%{query}%'), Task.notes.ilike(f'%{query}%'))
        ).all()
        
        # Convierte las tareas a JSON
        results = [
            {
                'id_task': task.id_task,
                'title': task.title,
                'notes': task.notes
            } 
            for task in tasks
        ]
       
        return jsonify(results)
    
    return jsonify([])  # Si no hay consulta o usuario, devuelve una lista vacía.



# Ruta para eliminar categoria de la lista
@task_bp.route('/delete_category', methods=['POST'])
def delete_category():
    id_category = request.json.get('id_category')
    # Obtengo todas la tareas de la categoria a eliminar
    category = db.session.query(Category).filter(Category.id_category == id_category).first()

    if category:
            # Eliminar las tareas asociadas a la categoría
            for task in category.tasks:
                db.session.delete(task)
                     
            db.session.delete(category)   # Eliminar la categoría
            db.session.commit()
            return jsonify(success=True)

    return jsonify(success=False)  # En caso de que la categoría no exista

# Ruta para obtener las prioridades
@task_bp.route('/get_priorities', methods=['GET'])
def get_priorities():
    priorities = db.session.query(Prioritys).all()  # Asumiendo que tienes un modelo Priority
    priorities_list = [{'id': priority.id_priority, 'name': priority.name_priority} for priority in priorities]
    return jsonify(priorities_list)

# Ruta para actualizar la prioridad de una tarea
@task_bp.route('/update_task_priority', methods=['POST'])
def update_task_priority():
    data = request.json
    task_id = data.get('id_task')
    new_priority_id = data.get('id_priority')

    task = db.session.query(Task).filter(Task.id_task == task_id).first()
    if task:
        task.id_priority = new_priority_id  # Actualiza la prioridad de la tarea
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False)

# Ruta para enviar las tareas de un usuario en un JSON
@task_bp.route('/api_tasks', methods=['GET'])
def get_tasks():
    user_id = session.get('user_id')
    if user_id is None:
        return jsonify({'error': 'User not logged in'}), 401
    
    tasks = db.session.query(Task).filter(Task.id_user==user_id).all()
    
    # Convertir tareas a un formato JSON compatible con FullCalendar
    task_list = []
    for task in tasks:
        if task.start_date:  # Asegurarse de que las fechas estén presentes
            task_list.append({
                'id_task': task.id_task,
                'title': task.title,
                'start': task.start_date.isoformat(),  # Convertir a ISO 8601
            })
    
    return jsonify(task_list)

# Función que hace el botón FILTRAR en Tareas
@task_bp.route('/filter_tasks', methods=['POST'])
def filter_tasks():
    data = request.json
    priorities = data.get('priorities', [])
    statuses = data.get('statuses', [])
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    user_id = session.get('user_id')

    # Filtrar las tareas según los parámetros recibidos
    taskFilter = db.session.query(Task).filter(Task.id_user == user_id)
    if priorities:
        taskFilter = taskFilter.filter(Task.id_priority.in_(priorities))      
    if statuses:
        taskFilter = taskFilter.filter(Task.id_status.in_(statuses))
    if start_date and end_date:
        start = datetime.fromisoformat(start_date).replace(hour=0, minute=0, second=0)
        end = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59)
        taskFilter = taskFilter.filter(Task.end_date.between(start, end))
    
    filtered_tasks = taskFilter.all()

    categories_dict = {} # Diccionario para agrupar las tareas por categoría  
    categories_list = function.json_filter(filtered_tasks,categories_dict)  

    # Enviar la respuesta con las categorías y sus tareas
    return jsonify({'success': True, 'categories': categories_list})


@task_bp.route('/all_categories', methods=['GET'])
def get_categories():
    user_id = session.get('user_id')    
    categories = db.session.query(Category).filter(Category.id_user==user_id).all()  # Obtener todas las categorías

    return jsonify([{'id_category': cat.id_category, 'name_category': cat.name_category} for cat in categories])


# Ruta para obtener los detalles de la tarea por id
# Ubicación --> Barra menu, es la acción cuando clicas en una sugerencia
@task_bp.route('/task_details/<int:task_id>', methods=['GET'])
def task_details(task_id): 
    # Filtrar las tareas según los parámetros recibidos
    taskFilter = db.session.query(Task).filter(Task.id_user == session.get('user_id') )
    if task_id:
        taskFilter = taskFilter.filter(Task.id_task==task_id)
  
    filtered_tasks = taskFilter.all()

    categories_dict = {} # Diccionario para agrupar las tareas por categoría    
    categories_list = function.convert_dic(filtered_tasks, categories_dict) # Convertir el diccionario a una lista de categorías
    priorities = db.session.query(Prioritys).all()   # Obtén las prioridades para mostralos
    statuses = db.session.query(Status).all()  # Obtén los estados para mostrarlos
       
    return render_template('home.html', categories=categories_list, priorities=priorities, statuses=statuses)



# Ruta para obtener las tareas y cargar página inicial
# Ubicación --> Barra menu en el boton de buscar
@task_bp.route('/search_button', methods=['GET'])
def search_tasks_button():
    query = request.args.get('query', '')  # Obtiene el término de búsqueda
 
    # Filtra las tareas según el usuario y el término de búsqueda
    filtered_tasks = db.session.query(Task).filter(
        Task.id_user == session.get('user_id') ,  # Filtra por usuario
        (Task.title.ilike(f'%{query}%')) |  # Busca en el título
        (Task.notes.ilike(f'%{query}%'))   # Busca en las notas
    ).all()
   
    categories_dict = {} # Diccionario para agrupar las tareas por categoría    
    categories_list = function.convert_dic(filtered_tasks, categories_dict) # Convertir el diccionario a una lista de categorías
    priorities = db.session.query(Prioritys).all()   # Obtén las prioridades para mostralos
    statuses = db.session.query(Status).all()  # Obtén los estados para mostrarlos
       
    return render_template('home.html', categories=categories_list, priorities=priorities, statuses=statuses)

# Ruta para enviar los datos de una tarea 
@task_bp.route('/api_tasks/<int:id_task>', methods=['GET'])
def get_task(id_task):
    task = db.session.query(Task).filter(Task.id_task == id_task).first()
    if task:
        response = {
            'id_task': task.id_task,
            'title': task.title,
            'notes': task.notes,
            'start_date': task.start_date.strftime('%Y-%m-%dT%H:%M') if task.start_date else None,
            'end_date': task.end_date.strftime('%Y-%m-%dT%H:%M') if task.end_date else None,
            'id_category': task.id_category,
            'category': {'name_category': task.category.name_category},  # Añade esto
            'id_status': task.id_status,
            'id_priority': task.id_priority
        }
        return jsonify(response), 200
    return jsonify({'message': 'Tarea no encontrada'}), 404

# Ruta para editar tareas del calendario
@task_bp.route('/api_tasks/edit', methods=['POST'])
def edit_tasks():
    data = request.json  # Obtener los datos del formulario

    task_id = data.get('taskId')
    title = data.get('title')
    notes = data.get('notes')
    category_name = data.get('category')
    priority = data.get('priority')
    status = data.get('status')
    start_date = data.get('startDate')
    end_date = data.get('endDate')

    # Convertir las fechas a datetime (asegúrate de que las funciones estén definidas)
    start_date = startDate(start_date)
    end_date = endDate(end_date)

    # Busca la tarea por ID
    task_to_edit = db.session.query(Task).filter(Task.id_task == task_id).first()

    if not task_to_edit:
        return jsonify({"message": "Tarea no encontrada."}), 404

    # Actualizar los campos de la tarea
    task_to_edit.title = title
    task_to_edit.notes = notes
    task_to_edit.id_priority = priority
    task_to_edit.id_status = status
    task_to_edit.start_date = start_date
    task_to_edit.end_date = end_date

    # Verificar si la nueva categoría ya existe
    new_category = db.session.query(Category).filter(Category.name_category == category_name).first()
    
    if new_category is None:
        # Si la categoría no existe, crearla
        new_category = Category(name_category=category_name, id_user=session.get('user_id'))
        db.session.add(new_category)
        db.session.commit()  # Guardar la nueva categoría
    # Asignar la nueva categoría a la tarea
    task_to_edit.id_category = new_category.id_category

    try:
        db.session.commit()  # Guardar cambios en la base de datos

        return jsonify({"message": "Tarea actualizada con éxito."}), 200

    except Exception as e:
        db.session.rollback()  # Revertir en caso de error
        return jsonify({"message": "Error al editar la tarea."}), 500

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
   
