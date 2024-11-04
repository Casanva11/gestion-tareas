from flask import Blueprint, render_template, request, jsonify,session
from backend.app import config as db
from backend.app.models import User
from werkzeug.security import check_password_hash

# Crear un blueprint para las rutas del backend
app_bp = Blueprint('main', __name__)

# Ruta para Login, que renderiza el template 'login.html'
@app_bp.route('/')
def home_login():
    return render_template('login.html')