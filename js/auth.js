/**
 * Clase que maneja toda la lógica de autenticación
 * Registro, login y validación de formularios
 */
class AuthManager {
    /**
     * Constructor de AuthManager
     * @param {HotelApp} hotelApp - Referencia a la instancia principal de la aplicación
     */
    constructor(hotelApp) {
        this.hotelApp = hotelApp;  // Referencia a la aplicación principal
        this.setupEventListeners(); // Configurar eventos de formularios
    }

    /**
     * Configura todos los eventos de los formularios de autenticación
     * - Formulario de login
     * - Formulario de registro
     * - Enlaces para alternar entre login y registro
     */
    setupEventListeners() {
        const initEvents = () => {
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
                
            }

            const registerForm = document.getElementById('register-form');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }

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
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initEvents);
        } else {
            setTimeout(initEvents, 100);
        }
    }

    /**
     * Maneja el proceso de login del usuario
     * - Valida que los campos no estén vacíos
     * - Valida el formato del email
     * - Intenta autenticar al usuario
     * - Maneja diferentes tipos de errores (email no encontrado, contraseña incorrecta)
     */
    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Validar campos vacíos
        if (!email || !password) {
            alert('Por favor completa todos los campos');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingresa un email válido');
            return;
        }

        // Intentar login
        const result = this.hotelApp.login(email, password);
        
        if (result.success) {
            document.getElementById('login-form').reset();
        } else {
            // Manejar diferentes tipos de errores
            switch (result.error) {
                case 'email_not_found':
                    alert('Este email no está registrado. Por favor regístrate primero.');
                    // Ofrecer registro automático
                    setTimeout(() => {
                        if (confirm('¿Deseas registrarte ahora?')) {
                            this.hotelApp.hideModals();
                            this.hotelApp.showModal('register-modal');
                            const registerEmail = document.getElementById('register-email');
                            if (registerEmail) registerEmail.value = email;
                        }
                    }, 100);
                    break;
                case 'wrong_password':
                    alert('La contraseña es incorrecta. Por favor verifica tu contraseña.');
                    break;
                default:
                    alert('Error al iniciar sesión. Por favor intenta de nuevo.');
            }
        }
    }

    /**
     * Maneja el proceso de registro de nuevos usuarios
     * - Valida que todos los campos estén completos
     * - Valida formato de email, teléfono y contraseña
     * - Verifica que el email no esté ya registrado
     * - Crea el nuevo usuario en el sistema
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

        if (!Object.values(formData).every(value => value && value.length > 0)) {
            alert('Por favor completa todos los campos');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Por favor ingresa un email válido');
            return;
        }

        if (formData.password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formData.name.split(' ').length < 2) {
            alert('Por favor ingresa tu nombre completo');
            return;
        }

        const phoneRegex = /^[\d\s\+\-()]+$/;
        if (!phoneRegex.test(formData.phone)) {
            alert('Por favor ingresa un número de teléfono válido');
            return;
        }

        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
            alert('Este email ya está registrado. Por favor inicia sesión.');
            setTimeout(() => {
                if (confirm('¿Deseas ir a iniciar sesión?')) {
                    this.hotelApp.hideModals();
                    this.hotelApp.showModal('login-modal');
                    const loginEmail = document.getElementById('login-email');
                    if (loginEmail) loginEmail.value = formData.email;
                }
            }, 100);
            return;
        }

        if (this.hotelApp.register(formData)) {
            document.getElementById('register-form').reset();
        }
    }
}

// Inicializa el gestor de autenticación después de que HotelApp esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.hotelApp) {
            window.authManager = new AuthManager(window.hotelApp);
        }
    }, 100);
});