from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# El engine permite a SQLAlchemy comunicarse con la base de datos 
engine = create_engine('sqlite:///database/dbsigma.db',
                       connect_args={"check_same_thread": False}) # Permite hacer tareas en más de un hilo


# La sesión nos permite realizar transacciones (operaciones) dentro de nuestra DB
Session = sessionmaker(bind=engine) # Crea una clase temporal, para crear objetos de esa clase (la sesión)
session = Session()

# Esta variable se encargara de mapear y vincular cada clase de models a cada tabla
Base = declarative_base()