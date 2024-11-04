from flask import Flask, url_for
import os
from backend.app import config as db
from backend.app.config import Base, engine
from backend.app.routes import app_bp
from backend.users.routes import user_bp
from backend.task.routes import task_bp
from backend.export.routes import export_bp 
from backend.app.models import Task # Importar la clase Task para que se cree la tabla ¡¡¡¡importante!!!



def create_app():
    # Crear la aplicación Flask y especificar el directorio de templates
    app = Flask(__name__, 
                template_folder=os.path.abspath('frontend/templates'), 
                static_folder=os.path.abspath('frontend/static'))
    
    app.secret_key = '12345aA'  
    app.config.from_object('backend.app.config')  # Cargar configuración
    
    # Reseteamos la base de datos si existe
    # Base.metadata.drop_all(bind=db.engine, checkfirst=True)
    Base.metadata.create_all(engine)
    
    app.register_blueprint(app_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(export_bp)

    return app