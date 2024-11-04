from datetime import datetime, timedelta
from backend.app.models import Status, Prioritys, Category, User, Task
from backend.app import config as db

def create_test_data():
    # Inicia una nueva transacción. 
    # Si todas las operaciones dentro del bloque se completan sin errores, se confirman automáticamente. 
    # Si ocurre un error, todos los cambios se revertirán para mantener la integridad de la base de datos.
    with db.session.begin():
        # Consulta la tabla (que pongas dentro del parentesis) y cuenta el número de registros.
        # Si el conteo es 0, significa que la tabla está vacía.
        # Insertar registros de prueba en la tabla Status
        if db.session.query(Status).count() == 0:
            status1 = Status(name_status="Pendiente")
            status2 = Status(name_status="En proceso")
            status3 = Status(name_status="Completada")
            status4 = Status(name_status="Caducada")
            # Añade el objeto "Creado" a la sesión, marcándolo para ser guardado en la base de datos en el próximo commit.
            db.session.add(status1)
            db.session.add(status2)
            db.session.add(status3)
            db.session.add(status4)
        
        # Insertar registros de prueba en la tabla Prioritys
        if db.session.query(Prioritys).count() == 0:
            priority1 = Prioritys(name_priority="Alta")
            priority2 = Prioritys(name_priority="Media")
            priority3 = Prioritys(name_priority="Baja")
            db.session.add(priority1)
            db.session.add(priority2)
            db.session.add(priority3)

        # Commit de los cambios
        db.session.commit()
