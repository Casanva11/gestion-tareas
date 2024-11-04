//Funciones axuliares para el proyecto

// Ocultar el mensaje flash después de 3 segundos
setTimeout(() => {
    const flashMessage = document.getElementById('flash-message');
    if (flashMessage) {
        flashMessage.style.display = 'none';
    }
}, 3000);

/**
     * Formatea una cadena de fecha en un formato legible.
     * 
     * @param {string} dateString - La cadena de fecha a formatear.
     * @returns {string} - Devuelve la fecha formateada en el formato 'dd abr. yyyy, HH:mm' o 
     *                    'No especificado' si la cadena está vacía, 
     *                    o 'Fecha no establecida' si la fecha es inválida.
     */

function formatDate(dateString) {
    if (!dateString) return 'No especificado';

    // Convierte la cadena de fecha a un objeto Date
    const date = new Date(dateString);

    // Verifica si la fecha es válida
    if (isNaN(date.getTime())) {
        return 'Fecha no establecida';
    }
    
    // Formatea la fecha según tus requisitos
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    // Retorna la fecha formateada en el idioma español
    return date.toLocaleString('es-ES', options);
}

//Función para formatear la fecha en una lista 
function formatDate_list(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0'); // Día con dos dígitos
    const month = date.toLocaleString('default', { month: 'short' }); // Mes abreviado (Sep, Oct, etc.)
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0'); // Horas con dos dígitos
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutos con dos dígitos

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  }

// Función para formatear la fecha y la hora al formato 'YYYY-MM-DDTHH:MM'
  function formatDateTimeForInput(dateString) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) { // Comprueba si la fecha es válida
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return '';
}


 // Detectar clics fuera de las filas para deseleccionar la tarea
    // *******************Mirar************************
    // document.addEventListener('click', function(event) {
    //     const isClickInsideRow = event.target.closest('tr'); // Verifica si el clic fue en una fila de la tabla
    //     const isClickInsideTable = event.target.closest('table');   
    //     // Si el clic no es dentro de una fila de la tabla, deselecciona
    //     if (!isClickInsideRow && selectedTaskRow) {
    //         selectedTaskRow.classList.remove('table-primary');
    //         selectedTaskRow = null;
    //         selectedTaskId = null;

    //         // Deshabilitar botones de edición y eliminación
    //         document.getElementById('editTaskBtn').disabled = true;
    //         document.getElementById('deleteTaskBtn').disabled = true;
    // }});
