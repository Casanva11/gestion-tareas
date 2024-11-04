from flask import Blueprint, render_template, request, jsonify, flash, session, redirect, url_for
from backend.app import config as db
from backend.app.models import User
from werkzeug.security import check_password_hash, generate_password_hash
from backend.task.routes import task_bp
from backend.app.models import Task, Category, User, Status, Prioritys
import re


# Crear un Blueprint para los usuarios
user_bp = Blueprint('users', __name__)


# Ruta para cargar la página de inicio
@user_bp.route('/login', methods=['POST'])
def login():
    # Obtener las credenciales del formulario
    username = request.form['username'].strip()
    password = request.form['password'].strip()

    # Buscar al usuario en la base de datos por nombre de usuario
    user = db.session.query(User).filter(User.nickname == username).first()    
    
    # Verificar si el usuario existe y la contraseña es correcta
    if user and check_password_hash(user.password, password):  # Aquí se utiliza check_password_hash
        session['user_id'] = user.id_user
        flash('Has iniciado sesión exitosamente.', 'success')  
        # Redirigir a la función de get_all_task
        return redirect(url_for('task.get_all_task'))  # "task" es el blueprint para la gestión de tareas    
    
    else:
        flash("Credenciales incorrectas. Inténtalo de nuevo.", 'danger')
        return redirect(url_for('main.home_login'))  # vuelve a cargar la página login 

# Ruta para registrar un usuario        
@user_bp.route('/user_register', methods=['GET', 'POST'])
def user_register():
    if request.method == 'POST':
        # Recoge los datos del formulario
        name = request.form.get('name')
        last_name = request.form.get('last_name')
        email = request.form.get('email')
        confirm_email = request.form.get('confirm_email')  # Recoge el campo de confirmación de email
        phone = request.form.get('phone')
        nickname = request.form.get('nickname')
        password = request.form.get('password')

        # Verifica que los emails coincidan
        if email != confirm_email:
            flash(('confirm_email', 'Los correos electrónicos no coinciden. Por favor, inténtalo de nuevo.'), 'danger')
            return redirect(url_for('users.user_register'))

        # Validación de la contraseña
        password_pattern = r'^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$'
        if not re.match(password_pattern, password):
            flash(('password', 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.'), 'danger')
            return redirect(url_for('users.user_register'))

        # Encripta la contraseña si cumple los requisitos
        password_hashed = generate_password_hash(password)

        # Comprueba si el nickname o el email ya están registrados en la db
        user_exist = db.session.query(User).filter(User.nickname == nickname, User.email == email).first()

        error = False
        if user_exist:
            if user_exist.nickname == nickname:
                flash(('nickname', 'Este nickname ya está en uso. Inténtelo con otro.'), 'danger')
                error = True
            if user_exist.email == email:
                flash(('email', 'Este email ya está en uso. Inténtelo con otro.'), 'danger')
                error = True

        # Si hay algún error, vuelve a cargar el formulario
        if error:
            return redirect(url_for('users.user_register'))

        # Si no hay errores, crea un nuevo usuario
        new_user = User(
            name=name,
            last_name=last_name,
            email=email,
            phone=phone,
            nickname=nickname,
            password=password_hashed
        )
        db.session.add(new_user)
        db.session.commit()

         # Invoca la función first_category pasando el nickname del usuario registrado 
        first_category(new_user.nickname)

        flash('Te has registrado correctamente.', 'success')
        return redirect(url_for('main.home_login'))
    
    return render_template("sign_in.html")

def first_category(nickname):
    # Buscar al usuario en la base de datos por el nickname
    user = db.session.query(User).filter_by(nickname = nickname).first()    
    # Comprueba si el usuario tiene alguna categoría ya registrada
    category_exist = db.session.query(Category).filter_by(id_user = user.id_user).first()
    
    # Si no tiene ninguna categoría registrada se crea la categoría inicial
    if category_exist == None:
        first_category = Category(name_category="Sin categoría",
                                  id_user=user.id_user)
        db.session.add(first_category)
        db.session.commit()
        print("Categoría inicial({}) creada satisfactoriamente para {} {}".format(first_category.name_category,
                                                                                  user.name,
                                                                                  user.last_name))

    return user_register

# Ruta para cambiar la contraseña
@user_bp.route('/user_register', methods=['POST', 'GET'])
def new_password(id_user):
    user = db.session.query(User).filter_by(id_user=id_user).first() #Busco un usuario en la tabla User en base a id_user
    user.password = generate_password_hash("Nueva contraseña", method='scrypt', salt_length=16) #Canvio el valor de password
    db.session.commit()

    return print("Actualización de contraseña exitosa") #Sustituir por un menssaje flash e indicar la pagina a la que hay que retornar

# Ruta para cargar los datos del usuario
@user_bp.route('/info')
def info():
    # Obtener el id_user de la sesión
    user_id = session.get('user_id')

    if user_id:
        # Buscar el usuario en la base de datos
        user = db.session.query(User).filter_by(id_user=int(user_id)).first()
        return render_template('info.html', user=user)
    else:
        flash("Debes iniciar sesión para acceder a esta página.", "warning")
        return redirect(url_for('main.home_login'))  # Redirige si no hay sesión activa


# Ruta para cambiar de contraseña en el modal de "cambiar contraseña" de info
@user_bp.route('/change_password', methods=['POST'])
def change_password():
    if request.method == 'POST':
        current_password = request.json.get('currentPassword')
        new_password = request.json.get('newPassword')
        confirm_password = request.json.get('confirmPassword')

        # Obtener el usuario actual
        user_id = session.get('user_id')
        user = db.session.query(User).filter(User.id_user==user_id).first()

        if not user:
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404

        # Valida que la contraseña actual sea correcta
        if not check_password_hash(user.password, current_password):
            return jsonify({'success': False, 'message': 'La contraseña actual es incorrecta'}), 400

        # Valida que la nueva contraseña y la confirmación coincidan
        if new_password != confirm_password:
            return jsonify({'success': False, 'message': 'Las nuevas contraseñas no coinciden'}), 400

        # Actualiza la nueva contraseña
        hashed_new_password = generate_password_hash(new_password)
        user.password = hashed_new_password
        db.session.commit()

        return jsonify({'success': True}), 200
    

# Ruta para editar los datos de un usuario
@user_bp.route('/edit-user', methods=['POST'])
def edit_user():
    if request.method == 'POST':
        id = session.get('user_id') 
        user = db.session.query(User).filter_by(id_user = id).first()

        # Cambia el valor de las variables por la información que proviene del formulario (a través del axios)
        user.name = request.json.get('name')
        user.last_name = request.json.get('lastname') 
        user.phone = request.json.get('phone')

        db.session.commit()

        return {'name': user.name,'last_name': user.last_name,'phone': user.phone}, 200



