from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime
from backend.app.config import Base
from sqlalchemy.orm import relationship
from datetime import datetime

# -- unique=True -- asegura que los valores de la columna sean únicos en la tabla.
# -- nullable=False -- significa que el campo no puede estar vacio
# 'sqlite_autoincrement': True} Forzamos que en la tabla haya un valor autoincrementable (ID)

class Task(Base):
    __tablename__ = "task" # Minuscula y en singular
    __table_args__ = {'sqlite_autoincrement': True} # Forzamos que en la tabla haya un valor autoincrementable (ID)
    id_task = Column(Integer, primary_key=True)    
    title = Column(String(200), nullable=False)
    notes = Column(String(200))
    start_date = Column(DateTime, default=datetime.now()) # Creacion de un campo atuomatico que contenga la fecha de creacion (puede incluir la hora)
    end_date = Column(DateTime, nullable=True) 
    id_user = Column(Integer, ForeignKey('user.id_user'), nullable=False)
    id_category = Column(Integer, ForeignKey('category.id_category'), nullable=False)
    id_status = Column(Integer, ForeignKey('status.id_status'), nullable=False)
    id_priority = Column(Integer, ForeignKey('priority.id_priority'), nullable=False)

    # Relación inversa
    category = relationship('Category', back_populates='tasks')
    status = relationship("Status", backref="tasks")
    priority = relationship("Prioritys", backref="tasks")

    def __init__(self, title, notes, start_date, end_date, id_category, id_status, id_priority, id_user):
        self.title = title
        self.notes = notes
        self.start_date = start_date
        self.end_date = end_date
        self.id_category = id_category
        self.id_status = id_status
        self.id_priority = id_priority
        self.id_user = id_user

    def __str__(self):
        return "Title: {} - Notes: {} - Start Date: {}".format(self.title, self.notes, self.start_date)
    
    
class User(Base):
    __tablename__ = "user"
    __table_args__ = {'sqlite_autoincrement': True}
    id_user = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    last_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, unique=True)
    phone = Column(String(200))
    nickname = Column(String(200), nullable=False, unique=True)
    password = Column(String(200), nullable=False)

    def __init__(self, name, last_name, email, phone, nickname, password):
        self.name = name
        self.last_name = last_name
        self.email = email
        self.phone = phone
        self.nickname = nickname
        self.password = password

    def __str__(self):
        return "Name: {} -- Last name: {}".format(self.name, self.last_name)
  
  
class Status(Base):
    __tablename__ = "status"
    __table_args__ = {'sqlite_autoincrement': True} 
    id_status = Column(Integer, primary_key=True)
    name_status = Column(String(200), nullable=False, unique=True) 

    def __init__(self, name_status):
        self.name_status = name_status

    def __str__(self):
        return "Status {}: {}".format(self.id_status, self.name_status)
    
    
class Prioritys(Base):
    __tablename__ = "priority" 
    __table_args__ = {'sqlite_autoincrement': True} 
    id_priority = Column(Integer, primary_key=True)
    name_priority = Column(String(200), nullable=False, unique=True) 

    def __init__(self, name_priority):
        self.name_priority = name_priority

    def __str__(self):
        return "Priority {}: {}".format(self.id_priority, self.name_priority)
   
    
class Category(Base):
    __tablename__ = "category"
    __table_args__ = {'sqlite_autoincrement': True}
    id_category = Column(Integer, primary_key=True)
    name_category = Column(String(200), nullable=False) 
    id_user = Column(Integer, ForeignKey('user.id_user'), nullable=False)

    # Definición de la relación
    tasks = relationship('Task', back_populates='category')

    def __init__(self, name_category, id_user):
        self.name_category = name_category
        self.id_user = id_user

    def __str__(self):
        return "Category {}: {}".format(self.id_category, self.name_category)



    
    

    