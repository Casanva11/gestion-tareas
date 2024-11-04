import unittest
from flask import Flask, session
from werkzeug.security import generate_password_hash
from backend import db
from backend.users import user_bp  # Importa el blueprint de usuarios
from backend.app.models import User  # Asegúrate de importar tu modelo User

class UserViewsTestCase(unittest.TestCase):
    def setUp(self):
        # Configurar la aplicación para pruebas
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Usar una base de datos en memoria para pruebas
        self.app.register_blueprint(user_bp)
        self.client = self.app.test_client()

        # Crear todas las tablas en la base de datos
        with self.app.app_context():
            db.create_all()
            # Crear un usuario de prueba
            self.test_user = User(
                name='Test',
                last_name='User',
                email='test@example.com',
                phone='1234567890',
                nickname='testuser',
                password=generate_password_hash('password123')  # Encripta la contraseña
            )
            db.session.add(self.test_user)
            db.session.commit()

    def tearDown(self):
        # Limpiar la base de datos después de cada prueba
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_login_success(self):
        response = self.client.post('/login', data={
            'username': 'testuser',
            'password': 'password123'
        })
        with self.app.app_context():
            self.assertEqual(session['user_id'], self.test_user.id_user)  # Verifica que el ID del usuario se guardó en la sesión
        self.assertEqual(response.status_code, 302)  # Verifica que redirige correctamente

    def test_login_failure(self):
        response = self.client.post('/login', data={
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        with self.app.app_context():
            self.assertNotIn('user_id', session)  # Verifica que no se guarda el ID del usuario en la sesión
        self.assertEqual(response.status_code, 302)

    def test_user_register_success(self):
        response = self.client.post('/user_register', data={
            'name': 'New',
            'last_name': 'User',
            'email': 'newuser@example.com',
            'confirm_email': 'newuser@example.com',
            'phone': '0987654321',
            'nickname': 'newuser',
            'password': 'NewPassword123'
        })
        self.assertEqual(response.status_code, 302)  # Verifica que redirige correctamente
        with self.app.app_context():
            new_user = User.query.filter_by(nickname='newuser').first()
            self.assertIsNotNone(new_user)  # Verifica que el nuevo usuario se ha creado

    def test_user_register_email_mismatch(self):
        response = self.client.post('/user_register', data={
            'name': 'New',
            'last_name': 'User',
            'email': 'newuser@example.com',
            'confirm_email': 'different@example.com',  # Emails no coinciden
            'phone': '0987654321',
            'nickname': 'newuser',
            'password': 'NewPassword123'
        })
        self.assertEqual(response.status_code, 302)  # Verifica que redirige correctamente
        with self.app.app_context():
            new_user = User.query.filter_by(nickname='newuser').first()
            self.assertIsNone(new_user)  # Verifica que no se creó el nuevo usuario

if __name__ == '__main__':
    unittest.main()
