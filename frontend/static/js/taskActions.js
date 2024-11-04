// Variable para almacenar el ID de la tarea seleccionada
    let selectedTaskId = null;
// Asocia el evento al formulario agrega tarea a la funcion createTask
    document.getElementById('addTaskForm').addEventListener('submit', createTask);
// Asocia el evento al formulario editar a la funcion editTask
    document.getElementById('editTaskForm').addEventListener('submit', editTask); 
// Asocia el evento al botón eliminar tarea a la funcion deleteTask
    document.getElementById('confirmDeleteCategory').addEventListener('click', confirmDeleteCategory); 
    async function createTask(event) {
        event.preventDefault(); // Previene el comportamiento predeterminado del formulario
    
        // Obtén los valores de los campos del formulario
        const taskData = {
            title: document.getElementById('newTaskTitle').value,
            notes: document.getElementById('newTaskNotes').value,
            category: document.getElementById('newTaskCategory').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            startDate: document.getElementById('newTaskStartDate').value,
            endDate: document.getElementById('newTaskEndDate').value,
        };
    
        try {
            // Envía una solicitud POST a tu endpoint
            const response = await axios.post('/add-task', taskData);
    
            // Maneja la respuesta (por ejemplo, muestra un mensaje de éxito)
            if (response.status === 200) {                           
                // Cierra el modal si la tarea fue creada con éxito              
                $('#addTaskModal').modal('hide');
    
                // Verifica si response.data.category existe
                if (response.data.category) {
    
                    // Si la categoría es nueva, añade la categoría
                    if (response.data.new_category) {
                        addNewCategory(response.data.category);
                    } else {
                        // Actualiza la categoría existente
                        updateCategory(response.data.category); 
                    }
                } else {
                    console.error('Error: response.data.category es null');
                }
            }
        } catch (error) {
            console.error('Error al crear la tarea:', error.message);
            alert('Hubo un problema al crear la tarea. Inténtalo de nuevo.');
        }
    }
    


// Función para enviar los datos del formulario y editar una tarea
    async function editTask(event) {
        event.preventDefault(); // Previene el comportamiento predeterminado del formulario
        // Obtén los valores de los campos del formulario
        const editTaskData = {
            taskId: document.getElementById('editTaskId').value,
            title: document.getElementById('editTaskTitle').value,
            notes: document.getElementById('editTaskNotes').value,
            category: document.getElementById('editTaskCategory').value,
            priority: document.getElementById('editTaskPriority').value,
            status: document.getElementById('editTaskStatus').value,
            startDate: document.getElementById('editTaskStartDate').value,
            endDate: document.getElementById('editTaskEndDate').value,
        };
        try {
            // Envía una solicitud POST a tu endpoint para editar la tarea
            const response = await axios.post('/edit-task', editTaskData);
            // Maneja la respuesta (por ejemplo, muestra un mensaje de éxito)
            if (response.status === 200) {                         
                $('#editTaskModal').modal('hide');  // Cierra el modal si la tarea fue editada con éxito   
                //updateCategory(response.data); // Actualizar la categoría en la interfaz
                const { old_category, new_category, exist_category } = response.data;

                // Actualizar la categoría antigua y nueva
                updateCategory(old_category);
                if (exist_category){
                    updateCategory(new_category);
                } // Actualizar las tareas de la categoría anterior
                else{
                    if (old_category.id_category !== new_category.id_category) {
                    // Si es una categoría nueva o diferente
                    addNewCategory(new_category);  // Actualizar las tareas de la nueva categoría
                }
            }

            }
        } catch (error) {
            console.error('Error al editar la tarea:', error);
            alert('Hubo un problema al editar la tarea. Inténtalo de nuevo.');
        }
    }

// Función para eliminar la tarea seleccionada
    async function deleteTask() {
        // Verifica si selectedTaskId contiene un valor
        if (selectedTaskId) {
            try {
                const response = await axios.delete('/delete-task', {
                    data: { taskId: selectedTaskId }
                });

                // Ocultar el modal     
                $('#deleteTaskModal').modal('hide');

                // Desactivar botones de eliminar y editar
                document.getElementById('editTaskBtn').disabled = true;
                document.getElementById('deleteTaskBtn').disabled = true;

                // Actualizar la categoría afectada
                updateCategory(response.data); // Pasamos la categoría actualizada
            } catch (error) {
                if (error.response) {
                    alert(error.response.data.error);
                } else {
                    alert('Ocurrió un error en la eliminación de la tarea.');
                }
            }
        }
    }

    function updateCategory(category) {
        // Selecciona el contenedor de la categoría afectada
        const categoryElement = document.getElementById(`category-${category.id_category}`);       
        
        if (categoryElement) {
            const taskList = categoryElement.querySelector('tbody'); // Selecciona el tbody de la categoría
            
            if (taskList) {
                // Vaciar las filas actuales
                while (taskList.firstChild) {
                    taskList.removeChild(taskList.firstChild); // Eliminar cada fila actual
                }
                
                if (category.tasks.length === 0) {
                    // Si no hay tareas, agregar una fila con el mensaje "No hay tareas disponibles"
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = `
                        <td colspan="5" style="text-align: center;">No hay tareas disponibles.</td>
                    `;
                    taskList.appendChild(emptyRow);
                } else {
                    // Iterar sobre las tareas actualizadas y añadirlas
                    category.tasks.forEach(function(task) {
                        const row = document.createElement('tr');
                        row.setAttribute('onclick', `selectTask(this, '${task.id_task}', '${task.title}', '${task.notes}', '${task.start_date}', '${task.end_date}', '${category.name_category}', '${task.id_priority}', '${task.id_status}')`);
                        row.setAttribute('ondblclick', `openTaskDetailsModal('${task.id_task}', '${task.title}', '${task.notes}', '${task.priority.name_priority}', '${task.status.name_status}', '${task.start_date}', '${task.end_date}')`);
                        
                        // Añadir las celdas de la tarea
                        row.innerHTML = `
                            <td title="Título de la tarea" style="width: 50%;">${task.title}</td>
                            <td class="d-none d-sm-table-cell" title="Fecha Inicio Tarea" style="width: 20%;">${task.start_date ? formatDate_list(task.start_date) : 'Fecha no establecida'}</td>
                            <td class="d-none d-sm-table-cell" title="Fecha Entrega Tarea" style="width: 20%;">${task.end_date ? formatDate_list(task.end_date) : 'Fecha no establecida'}</td>
                            <td class="d-none d-sm-table-cell" title="Prioridad" style="width: 15%;">${task.priority.name_priority}</td>
                            <td class="d-none d-sm-table-cell" title="Estado" style="width: 15%;">${task.status.name_status}</td>
                        `;
                        
                        taskList.appendChild(row); // Añadir la fila al tbody
                        assignTaskRowEvents(row, task, category); // Asignar eventos de clic y doble clic a la fila
                    });
                }
            } else {
                
                console.error("No se encontró el tbody para la categoría.");
            }
        } else {
            console.error('Elemento no encontrado');
        }
    }
    
// Función que añade una nueva categoría si no existe
function addNewCategory(category) {
    
    const categoriesContainer = document.getElementById('categoriesContainer');
    
    // Crea el contenedor de la categoría con el título y el icono de eliminar
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'd-flex justify-content-between align-items-center mt-5 mb-4';
    
    // Crea el título de la categoría
    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'mb-0';
    categoryTitle.style.fontSize = '1.5rem';
    if (category.name_category !== 'Sin categoría') {
        categoryTitle.setAttribute('ondblclick', `editCategoryName(this, '${category.id_category}')`);
        categoryTitle.setAttribute('title', 'Doble click para editar');
    }
    categoryTitle.innerHTML = category.name_category;
    
    // Crea el icono de la papelera para eliminar la categoría (solo si no es 'Sin categoría')
    if (category.name_category !== 'Sin categoría') {
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash-alt text-danger';
        deleteIcon.style.cursor = 'pointer';
        deleteIcon.setAttribute('onclick', `deleteCategory('${category.id_category}')`);
        
        // Añade el icono de eliminar al contenedor de la categoría
        categoryHeader.appendChild(deleteIcon);
    }
    
    // Añade el título al contenedor de la categoría
    categoryHeader.insertBefore(categoryTitle, categoryHeader.firstChild);
    
    // Añade el contenedor de la categoría al contenedor principal
    categoriesContainer.appendChild(categoryHeader);
    
    // Crea el contenedor para la tabla de tareas
    const newCategoryTable = document.createElement('table');
    newCategoryTable.className = 'table table-bordered';
    newCategoryTable.style.tableLayout = 'fixed';
    newCategoryTable.id = `category-${category.id_category}`;
    
    // Crea el tbody
    const taskList = document.createElement('tbody');
    
    // Añade las tareas de la nueva categoría
    category.tasks.forEach(task => {
        const row = document.createElement('tr');
        row.setAttribute('onclick', `selectTask(this, '${task.id_task}', '${task.title}', '${task.notes}', '${task.start_date}', '${task.end_date}', '${category.name_category}', '${task.id_priority}', '${task.id_status}')`);
        row.setAttribute('ondblclick', `openTaskDetailsModal('${task.id_task}', '${task.title}', '${task.notes}', '${task.priority.name_priority}', '${task.status.name_status}', '${task.start_date}', '${task.end_date}')`);
        
        // Crea las celdas de la tarea
        row.innerHTML = `
            <td title="Título de la tarea" style="width: 50%;">${task.title}</td>
            <td class="d-none d-sm-table-cell" title="Fecha Inicio Tarea" style="width: 20%;">${task.start_date ? formatDate_list(task.start_date) : 'Fecha no establecida'}</td>
            <td class="d-none d-sm-table-cell" title="Fecha Entrega Tarea" style="width: 20%;">${task.end_date ? formatDate_list(task.end_date) : 'Fecha no establecida'}</td>
            <td class="d-none d-sm-table-cell" title="Prioridad" style="width: 15%;">${task.priority.name_priority}</td>
            <td class="d-none d-sm-table-cell" title="Estado" style="width: 15%;">${task.status.name_status}</td>
        `;
        
        taskList.appendChild(row);
    });
    
    newCategoryTable.appendChild(taskList);
    categoriesContainer.appendChild(newCategoryTable);
}


//Función que modifica el nombre de una tarea
    async function editCategoryName(element, categoryId) {
        const originalName = element.innerText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalName;
        input.style.width = '100%';
    
        // Reemplaza el título por el input
        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
    
        input.addEventListener('blur', async () => {
            const newName = input.value.trim();
            if (newName !== originalName) {
                try {
                    // Enviar la solicitud para actualizar el nombre de la categoría
                    const response = await axios.post('/update_category', {
                        id_category: categoryId,
                        name_category: newName
                    });
    
                    if (response.data.success) {
                        // Actualizar el nombre en la interfaz
                        element.innerText = newName;
                    } else {
                        // Manejo de error, si fuera necesario
                        element.innerText = originalName; // Restablecer el nombre original
                        alert('Error al actualizar la categoría.');
                    }
                } catch (error) {
                    console.error('Error al actualizar la categoría:', error);
                    element.innerText = originalName; // Restablecer el nombre original
                }
            } else {
                element.innerText = originalName; // Si no hay cambio, restablecer
            }
        });
    
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                input.blur(); // Guardar al presionar Enter
            }
        });
    }

// Función elimina una categoría y las tareas que hay dentro
async function confirmDeleteCategory() {
    if (categoryToDelete) {
        try {
            const response = await axios.post('/delete_category', { id_category: categoryToDelete });
            
            if (response.data.success) {
                // Encuentra el contenedor principal de la categoría (el título de la categoría)
                const categoryTitleElement = document.querySelector(`#category-${categoryToDelete}`).previousElementSibling;
                
                // Encuentra la tabla de tareas de la categoría
                const categoryTableElement = document.getElementById(`category-${categoryToDelete}`);
                
                // Verifica que ambos elementos existan antes de intentar eliminarlos
                if (categoryTitleElement) {
                    categoryTitleElement.remove(); // Elimina el título de la categoría
                } else {
                    console.warn('El título de la categoría no se encontró.');
                }
                
                if (categoryTableElement) {
                    categoryTableElement.remove();  // Elimina la tabla de tareas de la categoría
                } else {
                    console.warn('La tabla de tareas de la categoría no se encontró.');
                }

                // Cierra el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal'));
                modal.hide();
            } else {
                alert('Error al eliminar la categoría.');
            }
        } catch (error) {
            console.error('Error al eliminar la categoría:', error.message);
        }
    }
}

// Función para filtrar tareas
function filterTasks() {
    const selectedPriorities = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .filter(input => input.id.startsWith('priority'))
        .map(input => input.value);

    const selectedStatuses = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .filter(input => input.id.startsWith('status'))
        .map(input => input.value);

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Aquí puedes realizar una petición al servidor con los filtros o filtrar directamente en el frontend
    axios.post('/filter_tasks', {
        priorities: selectedPriorities,
        statuses: selectedStatuses,
        start_date: startDate,
        end_date: endDate
    })
    .then(response => {
        if (response.data.success) {
            // Ocultar el modal                
            const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
            modal.hide();       
            
            // Actualizar el DOM con las tareas filtradas
            filtershowCategory(response.data.categories);
            
        } else {
            alert('Error al aplicar el filtro.');
        }
    })
    .catch(error => {
        console.error('Error al filtrar tareas:', error);
    });
};

// Función que muestra las categorías con las tareas filtradas
function filtershowCategory(categoriesData) {
    
    const categoriesContainer = document.getElementById('categoriesContainer');
    
    // Limpiar el contenedor de categorías antes de añadir nuevas
    while (categoriesContainer.firstChild) {
        categoriesContainer.removeChild(categoriesContainer.firstChild);
    }

    // Itera sobre cada categoría en el diccionario
    categoriesData.forEach(category => {
        // Crea el contenedor de la categoría con el título y el icono de eliminar
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'd-flex justify-content-between align-items-center mt-5 mb-4';
        
        // Crea el título de la categoría
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'mb-0';
        categoryTitle.style.fontSize = '1.5rem';
        if (category.name_category !== 'Sin categoría') {
            categoryTitle.setAttribute('ondblclick', `editCategoryName(this, '${category.id_category}')`);
            categoryTitle.setAttribute('title', 'Doble click para editar');
        }
        categoryTitle.innerHTML = category.name_category;

        // Crea el icono de la papelera para eliminar la categoría
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash-alt text-danger';
        deleteIcon.style.cursor = 'pointer';
        if (category.id_category != 1) { // No mostrar el icono para la categoría con id 1
            deleteIcon.setAttribute('onclick', `deleteCategory('${category.id_category}')`);
        } else {
            deleteIcon.style.display = 'none'; // Ocultar el icono si es la categoría no eliminable
        }
        
        // Añade el título y el icono al contenedor de la categoría
        categoryHeader.appendChild(categoryTitle);
        categoryHeader.appendChild(deleteIcon);
        
        // Añade el contenedor de la categoría al contenedor principal
        categoriesContainer.appendChild(categoryHeader);
        
        // Crea la tabla para las tareas de la categoría
        const newCategoryTable = document.createElement('table');
        newCategoryTable.className = 'table table-bordered';
        newCategoryTable.style.tableLayout = 'fixed';
        newCategoryTable.id = `category-${category.id_category}`;
        
        // Crea el tbody
        const taskList = document.createElement('tbody');
        
        // Asegúrate de que category.tasks sea un array
        if (Array.isArray(category.tasks) && category.tasks.length > 0) {
            // Añade las tareas de la nueva categoría
            category.tasks.forEach(task => {
                const row = document.createElement('tr');
                row.setAttribute('onclick', `selectTask(this, '${task.id_task}', '${task.title}', '${task.notes}', '${task.start_date}', '${task.end_date}', '${category.name_category}', '${task.id_priority}', '${task.id_status}')`);
                row.setAttribute('ondblclick', `openTaskDetailsModal('${task.id_task}', '${task.title}', '${task.notes}', '${task.priority.name_priority}', '${task.status.name_status}', '${task.start_date}', '${task.end_date}')`);
        
                row.innerHTML = `
                    <td title="Título de la tarea" style="width: 50%;">${task.title}</td>
                    <td class="d-none d-sm-table-cell" title="Fecha Inicio Tarea" style="width: 20%;">${task.start_date ? formatDate_list(task.start_date) : 'Fecha no establecida'}</td>
                    <td class="d-none d-sm-table-cell" title="Fecha Entrega Tarea" style="width: 20%;">${task.end_date ? formatDate_list(task.end_date) : 'Fecha no establecida'}</td>
                    <td class="d-none d-sm-table-cell" title="Prioridad" style="width: 15%;" onclick="editTaskPriority(this, '${task.id_task}', '${task.id_priority}')">${task.priority.name_priority}</td>
                    <td class="d-none d-sm-table-cell" title="Estado" style="width: 15%;">${task.status.name_status}</td>
                `;
        
                taskList.appendChild(row);
            });
        } else {
            // Si no hay tareas, añade un mensaje
            const noTasksRow = document.createElement('tr');
            noTasksRow.innerHTML = `<td colspan="5" style="text-align: center;">No hay tareas disponibles.</td>`;
            taskList.appendChild(noTasksRow);
        }

        newCategoryTable.appendChild(taskList);
        categoriesContainer.appendChild(newCategoryTable);
    });
}






