// Función para mostrar/ocultar contraseñas
document.getElementById('toggleCurrentPassword').addEventListener('click', function() {
    const passwordField = document.getElementById('currentPassword');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

document.getElementById('toggleNewPassword').addEventListener('click', function() {
    const passwordField = document.getElementById('newPassword');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const passwordField = document.getElementById('confirmPassword');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

// Funcionalidad para manejar el formulario de cambio de contraseña
document.getElementById('submitPasswordForm').addEventListener('click', async function() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    try {
        const response = await axios.post('/change_password', {
            currentPassword: currentPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword
        });

        if (response.data.success) {
            // Mostrar mensaje de éxito
            showMessage('Contraseña actualizada con éxito', 'success');
            
            // Resetear el formulario
            document.getElementById('changePasswordForm').reset();

            // Cerrar el modal después de 2 segundos (opcional)
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                modal.hide();
            }, 2000); // Puedes ajustar el tiempo si lo deseas

        } else {
            // Mostrar mensaje de error
            showMessage(response.data.message, 'danger');
        }
    } catch (error) {
        // Mostrar mensaje de error en caso de fallo de Axios
        showMessage('Hubo un error al actualizar la contraseña', 'danger');
    }
});

// Función para mostrar mensajes de éxito o error
function showMessage(message, type) {
    const responseMessage = document.getElementById('responseMessage');
    responseMessage.className = `alert alert-${type}`;
    responseMessage.textContent = message;
    responseMessage.classList.remove('d-none');

    // Opción: Ocultar mensaje automáticamente después de 3 segundos
    setTimeout(() => {
        responseMessage.classList.add('d-none');
    }, 3000);
}
