// Inicializa searchInput y suggestionsBox al principio del archivo
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');

// Verifica si existen en el DOM antes de continuar
if (searchInput && suggestionsBox) {
    // Event listener para ocultar la caja de sugerencias al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
} else {
    console.error("searchInput o suggestionsBox no están definidos en el DOM.");
}

// Función para seleccionar una tarea
function selectTask(row, taskId, taskTitle, taskNotes, taskStartDate, taskEndDate, taskCategory, taskPriority, taskStatus) {    
    // Deselecciona la fila previamente seleccionada
    const previouslySelected = document.querySelector('.table .table-primary');
    if (previouslySelected) {
        previouslySelected.classList.remove('table-primary');
    }

    // Marca la nueva fila como seleccionada
    row.classList.add('table-primary');
    selectedTaskId = taskId;
    selectedTaskTitle = taskTitle;
    selectedTaskNotes = taskNotes;
    selectedTaskStartDate = taskStartDate;
    selectedTaskEndDate = taskEndDate;
    selectedTaskCategory = taskCategory;
    selectedTaskPriority = taskPriority;
    selectedTaskStatus = taskStatus;


    // Habilitar botones de edición y eliminación
    document.getElementById('editTaskBtn').disabled = false;
    document.getElementById('deleteTaskBtn').disabled = false;
    // Habilitar botones de edición y eliminación
    document.getElementById('editTaskBtnSmall').disabled = false;
    document.getElementById('deleteTaskBtnSmall').disabled = false;
}

// Función que se ejecuta al hacer clic en el botón de editar tarea
function editSelectedTask() {
    if (selectedTaskId) {            
        openEditTaskModal(selectedTaskId,
            selectedTaskTitle, 
            selectedTaskNotes, 
            selectedTaskCategory,
            selectedTaskPriority, 
            selectedTaskStatus, 
            selectedTaskStartDate, 
            selectedTaskEndDate);
    }
}

/**
     * Asigna eventos de clic y doble clic a una fila de tareas.
     * El clic selecciona la tarea y el doble clic abre un modal con los detalles de la tarea.
     *
     * @param {HTMLElement} row - La fila de la tabla a la que se le asignarán los eventos.
     * @param {Object} task - El objeto de tarea que contiene la información de la tarea.
     * @param {Object} category - El objeto de categoría asociado a la tarea.
     */
function assignTaskRowEvents(row, task, category) {
    row.addEventListener('click', function() {
        selectTask(row, task.id_task, task.title, task.notes, task.start_date, task.end_date, category.name_category, task.id_priority, task.id_status);
    });

    row.addEventListener('dblclick', function() {
        openTaskDetailsModal(task.id_task, task.title, task.notes, task.priority.name_priority, task.status.name_status, task.start_date, task.end_date);
    });
}  


// Restaurar el nombre original si se hace blur (clic fuera del cuadro)
function restoreCategoryName(inputElement, originalName, categoryId) {
    const restoredCategoryHeader = document.createElement('h2');
    restoredCategoryHeader.classList.add('mt-5', 'mb-4', 'editable-category');
    restoredCategoryHeader.style.fontSize = '1.5rem';
    restoredCategoryHeader.textContent = originalName;
    restoredCategoryHeader.ondblclick = function() {
        editCategoryName(restoredCategoryHeader, categoryId);
    };
    inputElement.replaceWith(restoredCategoryHeader);
}

// Función que borra los filtros de filtrar tareas
function resetFilters() {
    // Desmarcar todos los checkboxes de prioridades
    const priorityCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="priority-"]');
    priorityCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Desmarcar todos los checkboxes de estados
    const statusCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="status-"]');
    statusCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Resetear las fechas
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
}

function loadCategories(add_edit) {
    axios.get('/all_categories') 
        .then(response => {
            const categories = response.data;
            const dataListEdit = document.getElementById('editCategoriesList');
            const dataListAdd = document.getElementById('categoriesList');
            
            // Limpiar opciones actuales dependiendo de add_edit
            if (add_edit) {
                dataListEdit.innerHTML = '';  // Limpiar opciones actuales para editar
                // Llenar el datalist con las categorías para editar
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name_category;  // Asigna el valor de la categoría
                    dataListEdit.appendChild(option); // Añadir la opción al datalist de editar
                });
            } else {
                dataListAdd.innerHTML = '';  // Limpiar opciones actuales para agregar
                // Llenar el datalist con las categorías para agregar
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name_category;  // Asigna el valor de la categoría
                    dataListAdd.appendChild(option); // Añadir la opción al datalist de agregar
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar las categorías:', error);
        });
}

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

                    // Solo proceder si hay coincidencias en el título o la nota
                    if (indexInTitle !== -1 || indexInNote !== -1) {
                        // Resaltar en el título
                        let titleContent = title;
                        if (indexInTitle !== -1) {
                            const highlightedTextTitle = title.substr(indexInTitle, query.length);
                            const remainingTextTitle = title.substr(indexInTitle + query.length);
                            titleContent = `${title.substr(0, indexInTitle)}<span class="highlight">${highlightedTextTitle}</span><span class="normal">${remainingTextTitle}</span>`;
                        }
                   
                        // Resaltar en la nota
                        let noteContent = note;                        
                        if (indexInNote !== -1) {
                            const highlightedTextNote = note.substr(indexInNote, query.length);
                            const remainingTextNote = note.substr(indexInNote + query.length);
                            noteContent = `${note.substr(0, indexInNote)}<span class="highlight">${highlightedTextNote}</span><span class="normal">${remainingTextNote}</span>`;    
                        }

                        // Crear HTML para la sugerencia con el texto resaltado
                        suggestion.innerHTML = `
                            <div>${titleContent}</div>
                            <div class="note"> - ${noteContent}</div>
                        `;

                        // Al hacer clic en una sugerencia, redirigir a una página de detalles
                        suggestion.addEventListener('click', function() {                            
                            const taskId = task.id_task;  // Obtener el ID de la tarea
                            window.location.href = `/task_details/${taskId}`;                     
                        });

                        suggestionBox.appendChild(suggestion);
                    }
                });

                // Verificar si no hay sugerencias
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
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

    const searchTerm = document.getElementById('searchInput').value; // Obtiene el término de búsqueda

    try {
        // Hacer la solicitud, pero no necesitas almacenar los resultados si solo rediriges
        const response = await axios.get(`/search_button?query=${encodeURIComponent(searchTerm)}`);
        
        // Redirigir a la página de búsqueda
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