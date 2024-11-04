// Función para abrir el modal de agregar tarea
function openAddTaskModal() {
    loadCategories(false);
    // Limpia el formulario
    document.getElementById('addTaskForm').reset();
    // Abre el modal
    var addTaskModal = new bootstrap.Modal(document.getElementById('addTaskModal'),{
        backdrop: 'static', // Impedir cierre al hacer clic fuera
        keyboard: false     // Impedir cierre con tecla Esc
    });
    addTaskModal.show();
}

// Función para cargar los datos de la tarea en el modal de edición
function openEditTaskModal(taskId, title, notes, category, priority, status, startDate, endDate) {
    loadCategories(true);
    //Asignar valores a los campos del modal de edición
    document.getElementById('editTaskId').value = taskId;
    document.getElementById('editTaskTitle').value = title;
    document.getElementById('editTaskNotes').value = notes;
    document.getElementById('editTaskCategory').value = category;
     // Establecer el valor seleccionado para la prioridad
     let priorityField = document.getElementById('editTaskPriority');
     if (priorityField) {
         for (let i = 0; i < priorityField.options.length; i++) {
             if (priorityField.options[i].textContent === priority) {
                 priorityField.selectedIndex = i;
                 break;
             }
         }
     }
 
     // Establecer el valor seleccionado para el estado
     let statusField = document.getElementById('editTaskStatus');
     if (statusField) {
         for (let i = 0; i < statusField.options.length; i++) {
             if (statusField.options[i].textContent === status) {
                 statusField.selectedIndex = i;
                 break;
             }
         }
     }
    
    // Establecer las fechas correctamente en formato 'YYYY-MM-DDTHH:MM'
    document.getElementById('editTaskStartDate').value = formatDateTimeForInput(startDate);
    document.getElementById('editTaskEndDate').value = formatDateTimeForInput(endDate); 
    // Abre el modal
    var editTaskModal = new bootstrap.Modal(document.getElementById('editTaskModal'),{
        backdrop: 'static', // Impedir cierre al hacer clic fuera
        keyboard: false     // Impedir cierre con tecla Esc
    });
    editTaskModal.show();
    }

// Función para abrir el modal de eliminar tarea
function openDeleteTaskModal() {         
    
    var deleteModal = new bootstrap.Modal(document.getElementById('deleteTaskModal'), {
        backdrop: 'static',
        keyboard: false
    });
    deleteModal.show();
    }

// Abre un modal para mostrar los detalles de una tarea específica.
function openTaskDetailsModal(id_task, title, notes, priority, status, start_date, end_date) {
    document.getElementById('taskDetailTitle').textContent = title;
    document.getElementById('taskDetailNotes').textContent = notes;
    document.getElementById('taskDetailPriority').textContent = priority;
    document.getElementById('taskDetailStatus').textContent = status;
    document.getElementById('taskDetailStartDate').textContent = formatDate(start_date);
    document.getElementById('taskDetailEndDate').textContent = formatDate(end_date);

    // Mostrar el modal
    var taskDetailsModal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
    taskDetailsModal.show();
}

function deleteCategory(categoryId) {
    categoryToDelete = categoryId; // Guarda la categoría a eliminar
    const modal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
    modal.show(); // Muestra el modal
}

// Abrir el modal de filtros
function openFilterModal() {
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'),
    {
        backdrop: 'static', // Impedir cierre al hacer clic fuera
        keyboard: false     // Impedir cierre con tecla Esc
    });
    filterModal.show();
}

// Modal de cambiar de contraseña página de info
function changePasswordModal() {
    const changePasswordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    changePasswordModal.show();
}

// Abrir el modal para editar un usuario
function editarDatosModal() {
    const editarDatosModal = new bootstrap.Modal(document.getElementById('editarDatosModal'));
    editarDatosModal.show(); 
}