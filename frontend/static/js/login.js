// Escucha el evento 'submit' en el formulario con el ID 'loginForm'
document.getElementById('loginForm').addEventListener('submit', function(event) {
    // Prevenir el comportamiento por defecto del formulario (no recargar la página)
    event.preventDefault(); 

    // Obtiene el valor del campo de texto 'username'
    const username = document.getElementById('username').value;
    // Obtiene el valor del campo de texto 'password'
    const password = document.getElementById('password').value;

    // Envía una solicitud POST a la ruta '/login' con los datos del usuario
    axios.post('/login', {
        username: username, // Incluye el nombre de usuario
        password: password  // Incluye la contraseña
    })
    .then(response => {
        // Si la respuesta es exitosa, muestra el mensaje de éxito
        document.getElementById('message').innerText = response.data.message;
        
        // Muestra el mensaje flash en la interfaz de usuario utilizando la función showFlashMessage
        showFlashMessage(response.data.flash, 'success');

        // Redirige a la página de bienvenida
        window.location.href = `/tasks`;
        
    })
    .catch(error => {
        // Si ocurre un error (como credenciales inválidas), muestra el mensaje de error
        const message = error.response.data.message || 'Ocurrió un error.';
        // Mostrar el mensaje en la página
        showFlashMessage(message, 'danger');       
    });
});

// Función para mostrar el mensaje flash en la interfaz de usuario
function showFlashMessage(message, category) {
    // Obtiene el contenedor del mensaje en el HTML usando su ID
    const messageContainer = document.getElementById('message');
    
    // Inserta un nuevo elemento div dentro del contenedor
    // El div contiene el mensaje y se aplica una clase de alerta según la categoría
    messageContainer.innerHTML = `<div class="alert alert-${category}">${message}</div>`;
}