document.addEventListener('DOMContentLoaded', function() {
    // Función para cargar categorías
    function loadCategories(addEdit) {
        axios.get('/all_categories')
            .then(response => {
                const categories = response.data;
                const dataListEdit = document.getElementById('editCategoriesList');
                const dataListAdd = document.getElementById('categoriesList');
                
                if (addEdit) {
                    dataListEdit.innerHTML = '';  
                    categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.name_category;
                        dataListEdit.appendChild(option);
                    });
                } else {
                    dataListAdd.innerHTML = '';  
                    categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.name_category;
                        dataListAdd.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error al cargar las categorías:', error);
            });
    }

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'es',  // Establecer el idioma en español
        buttonText: {
            today: 'Hoy'  // Cambiar el texto del botón "Today" a "Hoy"
        },
        initialView: 'dayGridMonth',
        events: [],  // Inicialmente vacío, se llenará más tarde

       
        // Evento al hacer clic en un día
        dateClick: function(info) {
            loadCategories(false);

            // Agregar hora predeterminada para que el formato sea compatible
            const dateWithTime = `${info.dateStr}T08:00`;  // Añadimos 00:00 como hora predeterminada
        
            document.getElementById('newTaskStartDate').value = dateWithTime;
            var taskModal = new bootstrap.Modal(document.getElementById('addTaskModal'));
            taskModal.show();
        },

        // Evento al hacer clic en una tarea
        eventClick: function(info) {
            loadCategories(true);
            const taskId = info.event.id;  // Asegúrate de tener un id único para la tarea
            axios.get(`/api_tasks/${taskId}`)
                .then(response => {
                    const task = response.data;

                    // Llenar el modal con la información de la tarea
                    document.getElementById('editTaskTitle').value = task.title;
                    document.getElementById('editTaskNotes').value = task.notes || '';
                    document.getElementById('editTaskStartDate').value = task.start_date;  // Formato YYYY-MM-DD
                    document.getElementById('editTaskEndDate').value = task.end_date || '';
                    document.getElementById('editTaskCategory').value = task.category.name_category;  // Cambia esto para mostrar el nombre
                    document.getElementById('editTaskStatus').value = task.id_status || '';
                    document.getElementById('editTaskPriority').value = task.id_priority || '';

                    // Asignar el ID de la tarea al campo oculto
                    document.getElementById('editTaskId').value = task.id_task;

                    // Mostrar el modal de edición
                    var taskEditModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
                    taskEditModal.show();
                })
                .catch(error => {
                    console.error('Error al cargar los detalles de la tarea:', error);
                });
        }
    });

    // Renderiza el calendario inicialmente
    calendar.render();

    // Función para obtener las tareas y añadirlas al calendario
    function loadTasks() {
        axios.get('/api_tasks')
            .then(response => {
                const tasks = response.data;  // Tareas obtenidas
                calendar.removeAllEvents();  // Limpiar eventos anteriores
                tasks.forEach(task => {
                    calendar.addEvent({
                        id: task.id_task,
                        title: task.title,
                        start: task.start  // Asegúrate de que el formato sea correcto
                    });
                });
                calendar.render();  // Renderiza el calendario con los nuevos eventos
            })
            .catch(error => {
                console.error('Error al cargar las tareas:', error);
            });
    }

    // Llamar a la función para cargar las tareas
    loadTasks();
    // Llamar a la función para cargar las categorías al inicio
    // loadCategories(false);


    // Manejo del clic en el botón de guardar para tareas nuevas
    document.getElementById('addTaskForm').addEventListener('submit', function(event) {
        event.preventDefault();  // Evitar el envío del formulario de manera estándar
        // Deshabilitar el botón de envío para evitar múltiples solicitudes
        const submitButton = document.querySelector('#addTaskForm button[type="submit"]');
        submitButton.disabled = true;
        
        const newTask = {
            title: document.getElementById('newTaskTitle').value,
            notes: document.getElementById('newTaskNotes').value,
            startDate: document.getElementById('newTaskStartDate').value,
            endDate: document.getElementById('newTaskEndDate').value,
            category: document.getElementById('newTaskCategory').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value
        };

        // Crear un archivo JSON con los datos
        const jsonTask = JSON.stringify(newTask);

        // Llamar a la ruta para guardar la tarea
        axios.post('/add-task', jsonTask, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            // Cerrar el modal
            var taskModal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
            taskModal.hide();

            // Recargar las tareas en el calendario
            loadTasks();

            // Limpiar el formulario y habilitar el botón
            document.getElementById('addTaskForm').reset();
            submitButton.disabled = false;
        })
        .catch(error => {
            console.error('Error al guardar la tarea:', error);

            // Vuelve a habilitar el botón si hay un error
            submitButton.disabled = false;
        });
    });

    // Manejo del clic en el botón de guardar para editar tareas
    document.getElementById('editTaskForm').addEventListener('submit', function(event) {
        event.preventDefault();  // Evitar el envío del formulario
        // Obtener el ID de la tarea
        const taskId = document.getElementById('editTaskId').value;

        // Crear el objeto con los datos actualizados de la tarea
        const updatedTask = {
            taskId: taskId,  // Incluye el ID de la tarea
            title: document.getElementById('editTaskTitle').value,
            notes: document.getElementById('editTaskNotes').value,
            category: document.getElementById('editTaskCategory').value,  // Cambié esto para que coincida con tu backend
            priority: document.getElementById('editTaskPriority').value,
            status: document.getElementById('editTaskStatus').value,
            startDate: document.getElementById('editTaskStartDate').value,
            endDate: document.getElementById('editTaskEndDate').value
        };

        // Crear un archivo JSON con los datos
        const jsonTask = JSON.stringify(updatedTask);

        // Llamar a la ruta para actualizar la tarea
        axios.post('/api_tasks/edit', jsonTask, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            // Cerrar el modal
            var taskEditModal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            taskEditModal.hide(); 
            // Recargar las tareas en el calendario
            loadTasks();           
            // Limpiar el formulario después de guardar
            document.getElementById('editTaskForm').reset();           
        })
        .catch(error => {
            console.error('Error al guardar la tarea:', error.response ? error.response.data : error);  // Muestra el error completo
        });
    });

    // Manejo del clic en el botón de eliminar tarea (del modal de edición de tareas)
    document.getElementById('deleteTaskButton').addEventListener('click', function() {
        // Obtener el ID de la tarea
        const taskId = document.getElementById('editTaskId').value;
       
        // Verifica que taskId no esté vacío
        if (!taskId) {
            console.error("ID de la tarea no encontrado.");
            return;
        }

        // Guardar el ID de la tarea en el modal de confirmación
        document.getElementById('deleteTaskModal').setAttribute('data-task-id', taskId);
    });

    // Manejo del clic en el botón "Aceptar" del modal de confirmación
    document.getElementById('confirmDeleteButton').addEventListener('click', function() {
        // Obtener el ID de la tarea del modal de confirmación
        const taskId = document.getElementById('deleteTaskModal').getAttribute('data-task-id');

        // Verifica que taskId no esté vacío
        if (!taskId) {
            console.error("ID de la tarea no encontrado.");
            return;
        }

        // Enviar solicitud DELETE a la ruta para eliminar la tarea
        axios.delete('/delete-task', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: { taskId: taskId }  // Enviar el ID de la tarea en el cuerpo de la solicitud
        })
        .then(response => {
            // Cerrar ambos modales
            var deleteTaskModal = bootstrap.Modal.getInstance(document.getElementById('deleteTaskModal'));
            deleteTaskModal.hide();
            
            var taskEditModal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            taskEditModal.hide();

            // Recargar las tareas en el calendario
            loadTasks();
        })
        .catch(error => {
            console.error('Error al eliminar la tarea:', error.response ? error.response.data : error);
        });
    });
    // Función para cargar en el buscador resultados de tareas
    document.getElementById('searchInput').addEventListener('input', function() {
        const query = this.value;
        const suggestionBox = document.getElementById('suggestions');

        if (query === '') {
            suggestionBox.innerHTML = '';  // Limpiar sugerencias cuando el input esté vacío
            suggestionBox.style.display = 'none'; // Ocultar caja de sugerencias cuando no haya texto
        } else {
            axios.get(`/search_tasks?query=${query}`)
                .then(function(response) {
                    const results = response.data;
                    suggestionBox.innerHTML = '';  // Limpiar las sugerencias anteriores

                    if (results.length > 0) {
                        suggestionBox.style.display = 'block';  // Mostrar la caja de sugerencias si hay resultados
                    } else {
                        suggestionBox.style.display = 'none';  // Ocultar si no hay resultados
                    }

                    results.forEach(task => {
                        const suggestion = document.createElement('div');
                        suggestion.className = 'suggestion-item';

                        const title = task.title || ''; // Asegúrate de que title y note existan
                        const note = task.notes || '';   // Usa un valor por defecto si no existe

                        // Buscar índice de coincidencia en el título y la nota
                        const indexInTitle = title.toLowerCase().indexOf(query.toLowerCase());
                        const indexInNote = note.toLowerCase().indexOf(query.toLowerCase());

                        if (indexInTitle !== -1 || indexInNote !== -1) {
                            let titleContent = title;
                            if (indexInTitle !== -1) {
                                const highlightedTextTitle = title.substr(indexInTitle, query.length);
                                const remainingTextTitle = title.substr(indexInTitle + query.length);
                                titleContent = `${title.substr(0, indexInTitle)}<span class="highlight">${highlightedTextTitle}</span><span class="normal">${remainingTextTitle}</span>`;
                            }
                        
                            let noteContent = note;                        
                            if (indexInNote !== -1) {
                                const highlightedTextNote = note.substr(indexInNote, query.length);
                                const remainingTextNote = note.substr(indexInNote + query.length);
                                noteContent = `${note.substr(0, indexInNote)}<span class="highlight">${highlightedTextNote}</span><span class="normal">${remainingTextNote}</span>`;    
                            }

                            suggestion.innerHTML = `
                                <div>${titleContent}</div>
                                <div class="note"> - ${noteContent}</div>
                            `;

                            suggestion.addEventListener('click', function() {                            
                                const taskId = task.id_task;
                                window.location.href = `/task_details/${taskId}`;                     
                            });

                            suggestionBox.appendChild(suggestion);
                        }
                    });

                    if (suggestionBox.innerHTML === '') {
                        suggestionBox.innerHTML = '<div class="no-suggestions">No se encontraron coincidencias.</div>';
                    }
                })
                .catch(function(error) {
                    console.error('Error fetching suggestions:', error);
                });
        }
    });

    async function handleSearch(event) {
        event.preventDefault();
        const searchTerm = document.getElementById('searchInput').value;

        try {
            const response = await axios.get(`/search_button?query=${encodeURIComponent(searchTerm)}`);
            window.location.href = `/search_button?query=${encodeURIComponent(searchTerm)}`;
        } catch (error) {
            console.error('Error al buscar tareas:', error);
        }
    }

    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
            suggestionsBox.style.display = 'none';
        }
    });


});
