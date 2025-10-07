// Sistema de Autenticación - Gestión de Login y Registro
/**
 * Clase que maneja toda la autenticación de usuarios
 * Controla el inicio de sesión, registro y validaciones
 */
class AuthManager {
    /**
     * Constructor: Inicializa el gestor de autenticación
     * @param {HotelApp} hotelApp - Referencia a la aplicación principal
     */
    constructor(hotelApp) {
        this.hotelApp = hotelApp;
        this.setupEventListeners();
    }

    /**
     * Configura los eventos de los formularios de login y registro
     * También maneja el cambio entre modales
     */
    setupEventListeners() {
        setTimeout(() => {
            // Login form
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
                
                // Clear errors when user starts typing
                const loginEmail = document.getElementById('login-email');
                const loginPassword = document.getElementById('login-password');
                
                if (loginEmail) {
                    loginEmail.addEventListener('input', () => {
                        this.clearFieldError('login-email');
                    });
                }
                
                if (loginPassword) {
                    loginPassword.addEventListener('input', () => {
                        this.clearFieldError('login-password');
                    });
                }
            }

            // Register form
            const registerForm = document.getElementById('register-form');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }

            // Modal switching
            const showRegister = document.getElementById('show-register');
            const showLogin = document.getElementById('show-login');
            
            if (showRegister) {
                showRegister.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hotelApp.hideModals();
                    this.hotelApp.showModal('register-modal');
                });
            }

            if (showLogin) {
                showLogin.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hotelApp.hideModals();
                    this.hotelApp.showModal('login-modal');
                });
            }
        }, 200);
    }

    /**
     * Maneja el proceso de inicio de sesión
     * Valida email y contraseña, muestra mensajes de error apropiados
     */
    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Validar que los campos no estén vacíos
        if (!email || !password) {
            this.hotelApp.showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.hotelApp.showMessage('Por favor ingresa un email válido', 'error');
            this.highlightField('login-email');
            return;
        }

        // Verificar primero si el usuario está registrado
        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!userExists) {
            this.hotelApp.showMessage('Este email no está registrado. Por favor regístrate primero.', 'error');
            this.highlightField('login-email');
            
            // Sugerir registro
            setTimeout(() => {
                if (confirm('¿Deseas registrarte ahora?')) {
                    this.hotelApp.hideModals();
                    this.hotelApp.showModal('register-modal');
                    // Pre-llenar el email en el formulario de registro
                    const registerEmail = document.getElementById('register-email');
                    if (registerEmail) {
                        registerEmail.value = email;
                    }
                }
            }, 100);
            return;
        }

        // Intentar login
        const result = this.hotelApp.login(email, password);
        
        if (result.success) {
            document.getElementById('login-form').reset();
        } else {
            // Show specific error messages
            switch (result.error) {
                case 'email_not_found':
                    this.hotelApp.showMessage('Este email no está registrado. Por favor regístrate primero.', 'error');
                    this.highlightField('login-email');
                    break;
                case 'wrong_password':
                    this.hotelApp.showMessage('La contraseña es incorrecta. Por favor verifica tu contraseña.', 'error');
                    this.highlightField('login-password');
                    break;
                default:
                    this.hotelApp.showMessage('Error al iniciar sesión. Por favor intenta de nuevo.', 'error');
            }
        }
    }

    /**
     * Resalta un campo del formulario con error (borde rojo)
     * @param {string} fieldId - ID del campo a resaltar
     */
    highlightField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            // Add error class for styling
            field.classList.add('error');
            
            // Focus on the field to help user
            field.focus();
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                field.classList.remove('error');
            }, 3000);
        }
    }

    /**
     * Quita el resaltado de error de un campo
     * @param {string} fieldId - ID del campo
     */
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('error');
        }
    }

    /**
     * Maneja el proceso de registro de nuevos usuarios
     * Valida todos los campos y crea el usuario en el sistema
     */
    handleRegister() {
        const formData = {
            idNumber: document.getElementById('register-id').value.trim(),
            name: document.getElementById('register-name').value.trim(),
            nationality: document.getElementById('register-nationality').value.trim(),
            email: document.getElementById('register-email').value.trim(),
            phone: document.getElementById('register-phone').value.trim(),
            password: document.getElementById('register-password').value
        };

        // Validar campos vacíos
        if (!Object.values(formData).every(value => value && value.length > 0)) {
            this.hotelApp.showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            this.hotelApp.showMessage('Por favor ingresa un email válido', 'error');
            return;
        }

        // Validar longitud mínima de contraseña
        if (formData.password.length < 6) {
            this.hotelApp.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        // Validar que el nombre tenga al menos 2 palabras
        if (formData.name.split(' ').length < 2) {
            this.hotelApp.showMessage('Por favor ingresa tu nombre completo', 'error');
            return;
        }

        // Validar número de teléfono (solo números, espacios, + y -)
        const phoneRegex = /^[\d\s\+\-()]+$/;
        if (!phoneRegex.test(formData.phone)) {
            this.hotelApp.showMessage('Por favor ingresa un número de teléfono válido', 'error');
            return;
        }

        // Verificar si el email ya está registrado
        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
            this.hotelApp.showMessage('Este email ya está registrado. Por favor inicia sesión.', 'error');
            
            // Sugerir login
            setTimeout(() => {
                if (confirm('¿Deseas ir a iniciar sesión?')) {
                    this.hotelApp.hideModals();
                    this.hotelApp.showModal('login-modal');
                    // Pre-llenar el email en el formulario de login
                    const loginEmail = document.getElementById('login-email');
                    if (loginEmail) {
                        loginEmail.value = formData.email;
                    }
                }
            }, 100);
            return;
        }

        // Intentar registrar
        if (this.hotelApp.register(formData)) {
            document.getElementById('register-form').reset();
        }
    }
}

// ============= INICIALIZACIÓN DEL GESTOR DE AUTENTICACIÓN =============

/**
 * Inicializa el gestor de autenticación cuando la página esté lista
 * Se ejecuta después de que HotelApp esté disponible
 */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.hotelApp) {
            window.authManager = new AuthManager(window.hotelApp);
        }
    }, 100);
});