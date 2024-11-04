from flask import Flask
from backend import create_app
from backend.app.config import Base, engine
from backend.app.routes import app_bp
from backend.app.create_test_data import create_test_data


app = create_app()

if __name__ == "__main__":

    # Función que crea registros de prueba en la base de datos si esta está vacía
    create_test_data()

    app.run(debug=True)