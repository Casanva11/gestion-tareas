// Función para enviar los datos del formulario y editar una tarea
async function editUser(event) {    
    // Obtén los valores de los campos del formulario
    const editUserData = {
        name: document.getElementById('nombre-editar').value,
        lastname: document.getElementById('apellidos-editar').value,
        email: document.getElementById('email-editar').value,
        phone: document.getElementById('telefono-editar').value,
        nickname: document.getElementById('username-editar').value,
    };
    try {
        // Envía una solicitud POST a tu endpoint para editar la tarea
        const response = await axios.post('/edit-user', editUserData);
        // Maneja la respuesta (por ejemplo, muestra un mensaje de éxito)
        if (response.status === 200) {                      
            $('#editarDatosModal').modal('hide') // Cerramos el Modal            
            actualizarCampos(response.data); // Llamar a la función para actualizar los campos con los nuevos datos
        }               
    } catch (error) {
        console.error('Error al editar la tarea:', error);
        alert('Hubo un problema al editar la tarea. Inténtalo de nuevo.');
    }
}

// Función para actualizar los campos en la página principal
function actualizarCampos(usuario) {
    document.getElementById('nombre').value = usuario.name;
    document.getElementById('apellidos').value = usuario.last_name;
    document.getElementById('telefono').value = usuario.phone;
}
