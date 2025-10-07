// Hotel App - Sistema Principal del Hotel
/**
 * Clase principal que gestiona toda la aplicación del hotel
 * Maneja habitaciones, reservas, usuarios y la interfaz
 */
class HotelApp {
    /**
     * Constructor: Inicializa las propiedades principales de la aplicación
     * - currentUser: Usuario actualmente logueado
     * - rooms: Lista de habitaciones del hotel
     * - reservations: Lista de todas las reservas
     */
    constructor() {
        this.currentUser = null;
        this.rooms = [];
        this.reservations = [];
        this.init();
    }

    /**
     * Inicializa la aplicación cuando se carga la página
     * Carga datos, configura eventos, carrusel y verifica autenticación
     */
    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    /**
     * Carga los datos guardados en el navegador (localStorage)
     * Si no hay habitaciones, crea las habitaciones por defecto
     */
    loadData() {
        // Cargar habitaciones, reservas y usuario actual desde localStorage
        this.rooms = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
        this.reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
        
        console.log('Datos cargados desde localStorage:');
        console.log('- Habitaciones:', this.rooms.length);
        console.log('- Reservas:', this.reservations.length);
        console.log('- Usuario actual:', this.currentUser ? this.currentUser.email : 'No autenticado');
        
        // Si no hay habitaciones, inicializar las habitaciones por defecto
        if (this.rooms.length === 0) {
            console.log('No hay habitaciones, inicializando habitaciones por defecto...');
            this.initializeDefaultRooms();
        }
    }

    /**
     * Crea las habitaciones iniciales del hotel con sus datos
     * Incluye nombre, precio, capacidad, imágenes y servicios
     */
    initializeDefaultRooms() {
        this.rooms = [
            {
                id: 1, name: "Habitación Deluxe", description: "Amplia habitación con vista al jardín",
                price: 250000, maxGuests: 2, beds: 1, available: true,
                image: "images/suit1.jpg",
                features: ["WiFi gratuito", "Minibar", "TV 55\"", "Aire acondicionado", "Baño privado"]
            },
            {
                id: 2, name: "Suite Ejecutiva", description: "Suite de lujo con sala de estar separada",
                price: 450000, maxGuests: 4, beds: 2, available: true,
                image: "images/suit2.jpg",
                features: ["WiFi gratuito", "Minibar", "TV 65\"", "Jacuzzi", "Sala de estar", "Vista panorámica"]
            },
            {
                id: 3, name: "Habitación Familiar", description: "Perfecta para familias con niños",
                price: 350000, maxGuests: 6, beds: 3, available: true,
                image: "images/suit3.jpg",
                features: ["WiFi gratuito", "Minibar", "TV 50\"", "Aire acondicionado", "Cuna disponible", "Área de juegos"]
            },
            {
                id: 4, name: "Habitación Estándar", description: "Cómoda habitación con todas las comodidades",
                price: 180000, maxGuests: 2, beds: 1, available: true,
                image: "images/suit4.jpg",
                features: ["WiFi gratuito", "TV 43\"", "Aire acondicionado", "Baño privado", "Vista al jardín"]
            },
            {
                id: 5, name: "Suite Presidencial", description: "La máxima expresión de lujo y comodidad",
                price: 750000, maxGuests: 4, beds: 1, available: true,
                image: "images/suit5.jpg",
                features: ["WiFi gratuito", "Minibar premium", "TV 75\"", "Jacuzzi privado", "Terraza privada", "Servicio de mayordomo", "Vista panorámica"]
            },
            {
                id: 6, name: "Habitación Superior", description: "Elegante habitación con acabados de lujo",
                price: 320000, maxGuests: 3, beds: 2, available: true,
                image: "images/suit6.jpg",
                features: ["WiFi gratuito", "Minibar", "TV 50\"", "Aire acondicionado", "Baño privado", "Balcón privado"]
            }
        ];
        this.saveData();
    }

    /**
     * Guarda los datos en el navegador para que persistan al recargar
     * Guarda: habitaciones, reservas y usuario actual
     */
    saveData() {
        localStorage.setItem('hotel_rooms', JSON.stringify(this.rooms));
        localStorage.setItem('hotel_reservations', JSON.stringify(this.reservations));
        if (this.currentUser) {
            localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        }
    }

    /**
     * Configura todos los eventos de la interfaz (clics, scroll, etc.)
     * Menú móvil, scroll suave, efectos del navbar, modales y botones de login
     */
    setupEventListeners() {
        setTimeout(() => {
            // Mobile navigation
            const navToggle = document.getElementById('nav-toggle');
            const navMenu = document.getElementById('nav-menu');
            
            if (navToggle && navMenu) {
                navToggle.addEventListener('click', () => {
                    navMenu.classList.toggle('active');
                    navToggle.classList.toggle('active');
                });
            }

            // Close mobile menu when clicking links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (navMenu) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                    }
                });
            });

            // Smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = anchor.getAttribute('href');
                    if (href && href !== '#') {
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                });
            });

            // Navbar scroll effect
            window.addEventListener('scroll', () => {
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    navbar.style.backgroundColor = window.scrollY > 100 ? 'rgba(255, 255, 255, 0.95)' : '#fff';
                    navbar.style.backdropFilter = window.scrollY > 100 ? 'blur(10px)' : 'none';
                }
            });

            // Modal events
            this.setupModalEvents();
            this.setupAuthButtons();
        }, 100);
    }

    /**
     * Configura los eventos para cerrar modales (ventanas emergentes)
     * Cierra al hacer clic fuera o en el botón de cerrar (X)
     */
    setupModalEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close')) {
                this.hideModals();
            }
        });
    }

    /**
     * Configura los botones de Iniciar Sesión y Registrarse
     * Abre los modales correspondientes al hacer clic
     */
    setupAuthButtons() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('login-modal');
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('register-modal');
            });
        }
    }

    /**
     * Verifica si hay un usuario logueado al cargar la página
     * Si hay usuario, actualiza la interfaz para mostrar su información
     */
    checkAuthStatus() {
        if (this.currentUser) {
            this.updateAuthUI();
        }
    }

    /**
     * Actualiza la interfaz según el estado de autenticación
     * Si hay usuario logueado: muestra su nombre y opción de cerrar sesión
     * Si no hay usuario: muestra botones de login y registro
     */
    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (this.currentUser) {
            if (loginBtn) {
                loginBtn.textContent = `Hola, ${this.currentUser.name.split(' ')[0]}`;
                
                // Detectar si estamos en la carpeta pages/ para usar la ruta correcta
                const currentPath = window.location.pathname;
                const isInPagesFolder = currentPath.includes('/pages/');
                const dashboardPath = isInPagesFolder ? 'dashboard.html' : 'pages/dashboard.html';
                loginBtn.href = dashboardPath;
                
                loginBtn.onclick = (e) => {
                    e.preventDefault();
                    // Verificar que el usuario esté autenticado antes de redirigir
                    if (this.currentUser && this.currentUser.id) {
                        window.location.href = dashboardPath;
                    } else {
                        this.showMessage('Error: Sesión no válida. Por favor, inicia sesión nuevamente.', 'error');
                        this.logout();
                    }
                };
            }
            if (registerBtn) {
                registerBtn.style.display = 'none';
            }
            
            // Add logout button
            this.addLogoutButton();
        } else {
            if (loginBtn) {
                loginBtn.textContent = 'Iniciar Sesión';
                loginBtn.href = '#';
                this.setupAuthButtons();
            }
            if (registerBtn) {
                registerBtn.style.display = 'block';
                registerBtn.href = '#';
            }
            
            // Remove logout button
            this.removeLogoutButton();
        }

        // Actualizar el aviso de login en la página de búsqueda
        if (window.bookingManager && window.bookingManager.updateSearchLoginNotice) {
            window.bookingManager.updateSearchLoginNotice();
        }
    }

    /**
     * Agrega el botón de "Cerrar Sesión" en el menú de navegación
     * Solo se muestra cuando hay un usuario logueado
     */
    addLogoutButton() {
        // Check if logout button already exists
        if (document.getElementById('logout-btn')) {
            return;
        }

        const loginBtn = document.getElementById('login-btn');
        if (!loginBtn) return;

        // Create logout button
        const logoutBtn = document.createElement('a');
        logoutBtn.id = 'logout-btn';
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link logout-link';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
        
        // Insert after login button
        loginBtn.parentNode.insertBefore(logoutBtn, loginBtn.nextSibling);
        
        // Add click event
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    /**
     * Elimina el botón de "Cerrar Sesión" del menú
     * Se usa cuando el usuario cierra sesión
     */
    removeLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    }

    /**
     * Muestra un modal (ventana emergente) por su ID
     * @param {string} modalId - El ID del modal a mostrar
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    /**
     * Cierra todos los modales abiertos
     */
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * Muestra un mensaje temporal en la pantalla
     * @param {string} message - El mensaje a mostrar
     * @param {string} type - Tipo de mensaje: 'success', 'error', 'info'
     */
    showMessage(message, type = 'info') {
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        document.body.insertBefore(messageDiv, document.body.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // ============= FUNCIONES DE UTILIDAD =============
    
    /**
     * Formatea una fecha para mostrarla en español
     * @param {string|Date} date - La fecha a formatear
     * @param {boolean} includeTime - Si debe incluir la hora
     * @returns {string} - Fecha formateada en español
     */
    formatDate(date, includeTime = false) {
        if (!date) return 'Fecha no disponible';
        try {
            const options = {
                year: 'numeric',
                month: includeTime ? 'short' : 'long',
                day: 'numeric'
            };
            
            if (includeTime) {
                options.hour = '2-digit';
                options.minute = '2-digit';
            }
            
            return new Date(date).toLocaleDateString('es-ES', options);
        } catch (error) {
            console.error('Error formatting date:', date, error);
            return 'Fecha inválida';
        }
    }

    /**
     * Calcula el precio total de una reserva
     * @param {number} roomPrice - Precio por noche de la habitación
     * @param {number} nights - Número de noches
     * @param {number} guests - Número de huéspedes (actualmente no afecta el precio)
     * @returns {number} - Precio total de la reserva
     */
    calculateTotalPrice(roomPrice, nights, guests) {
        return roomPrice * nights;
    }

    /**
     * Calcula el número de noches entre dos fechas
     * @param {string} checkIn - Fecha de entrada (formato: YYYY-MM-DD)
     * @param {string} checkOut - Fecha de salida (formato: YYYY-MM-DD)
     * @returns {number} - Número de noches
     */
    calculateNights(checkIn, checkOut) {
        try {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                console.error('Fechas inválidas en calculateNights');
                return 0;
            }
            
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            return nights > 0 ? nights : 0;
        } catch (error) {
            console.error('Error al calcular noches:', error);
            return 0;
        }
    }

    /**
     * Verifica si una habitación está disponible en fechas específicas
     * @param {number} roomId - ID de la habitación a verificar
     * @param {string} checkIn - Fecha de entrada
     * @param {string} checkOut - Fecha de salida
     * @returns {boolean} - true si está disponible, false si hay conflicto
     */
    checkRoomAvailability(roomId, checkIn, checkOut) {
        try {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
            // Validar fechas
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                console.error('Fechas inválidas en checkRoomAvailability');
                return false;
            }
            
            // Verificar si hay reservas que se solapen
            const hasConflict = this.reservations.some(reservation => {
                // Ignorar reservas de otras habitaciones o canceladas
            if (reservation.roomId !== roomId || reservation.status === 'cancelled') {
                return false;
            }
            
            const resCheckIn = new Date(reservation.checkIn);
            const resCheckOut = new Date(reservation.checkOut);
            
                // Verificar si hay solapamiento de fechas
                const overlaps = (checkInDate < resCheckOut && checkOutDate > resCheckIn);
                
                if (overlaps) {
                    console.log('Conflicto de reserva encontrado:', {
                        roomId,
                        requestedCheckIn: checkIn,
                        requestedCheckOut: checkOut,
                        existingCheckIn: reservation.checkIn,
                        existingCheckOut: reservation.checkOut
                    });
                }
                
                return overlaps;
            });
            
            // La habitación está disponible si NO hay conflictos
            return !hasConflict;
        } catch (error) {
            console.error('Error en checkRoomAvailability:', error);
            return false;
        }
    }

    /**
     * Busca y retorna todas las habitaciones disponibles según criterios
     * @param {string} checkIn - Fecha de entrada
     * @param {string} checkOut - Fecha de salida
     * @param {number} guests - Número de huéspedes
     * @returns {Array} - Lista de habitaciones disponibles
     */
    getAvailableRooms(checkIn, checkOut, guests) {
        // Validar parámetros
        if (!checkIn || !checkOut || !guests) {
            console.error('Parámetros inválidos en getAvailableRooms:', { checkIn, checkOut, guests });
            return [];
        }

        // Convertir guests a número si es string
        const guestsNum = typeof guests === 'string' ? parseInt(guests, 10) : guests;
        
        if (isNaN(guestsNum) || guestsNum < 1) {
            console.error('Número de huéspedes inválido:', guests);
            return [];
        }

        console.log('=== BÚSQUEDA DE HABITACIONES ===');
        console.log('Parámetros:', { checkIn, checkOut, guests: guestsNum });
        console.log('Total de habitaciones en sistema:', this.rooms.length);
        console.log('Habitaciones:', this.rooms);
        
        const availableRooms = this.rooms.filter(room => {
            // Verificar que la habitación tenga capacidad suficiente
            const hasCapacity = room.maxGuests >= guestsNum;
            
            // Verificar que la habitación esté marcada como disponible
            const isMarkedAvailable = room.available === true || room.available === undefined;
            
            // Verificar disponibilidad en las fechas
            const isAvailableInDates = this.checkRoomAvailability(room.id, checkIn, checkOut);
            
            console.log(`Habitación ${room.name}:`, {
                id: room.id,
                hasCapacity,
                isMarkedAvailable,
                isAvailableInDates,
                maxGuests: room.maxGuests,
                requested: guestsNum,
                available: room.available
            });
            
            return hasCapacity && isMarkedAvailable && isAvailableInDates;
        });

        console.log('Habitaciones disponibles encontradas:', availableRooms.length);
        console.log('Habitaciones disponibles:', availableRooms);
        console.log('=== FIN BÚSQUEDA ===');
        
        return availableRooms;
    }

    // ============= FUNCIONES DE AUTENTICACIÓN =============
    
    /**
     * Inicia sesión con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Object} - {success: boolean, error?: string}
     */
    login(email, password) {
        try {
            // Validar parámetros
            if (!email || !password) {
                return { success: false, error: 'empty_fields' };
            }

        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
            
            // Buscar usuario por email (case insensitive)
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
                console.log('Usuario no encontrado:', email);
            return { success: false, error: 'email_not_found' };
        }
        
            // Verificar contraseña
        if (user.password !== password) {
                console.log('Contraseña incorrecta para usuario:', email);
            return { success: false, error: 'wrong_password' };
        }
        
            // Login exitoso - crear sesión de usuario
        this.currentUser = {
                id: user.id, 
                name: user.name, 
                email: user.email,
                phone: user.phone, 
                nationality: user.nationality, 
                idNumber: user.idNumber,
                createdAt: user.createdAt
            };
            
        this.saveData();
        this.updateAuthUI();
        this.hideModals();
            this.showMessage(`¡Bienvenido, ${user.name.split(' ')[0]}!`, 'success');
            
            console.log('Login exitoso:', this.currentUser.email);
        return { success: true };
        } catch (error) {
            console.error('Error en el proceso de login:', error);
            return { success: false, error: 'login_error' };
        }
    }

    /**
     * Registra un nuevo usuario en el sistema
     * @param {Object} userData - Datos del usuario (nombre, email, teléfono, etc.)
     * @returns {boolean} - true si el registro fue exitoso, false si falló
     */
    register(userData) {
        try {
        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        
            // Verificar si el email ya está registrado (case insensitive)
            const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
            if (existingUser) {
                this.showMessage('Ya existe un usuario con este email. Por favor inicia sesión.', 'error');
            return false;
        }

            // Crear nuevo usuario
        const newUser = {
                id: Date.now(), 
                idNumber: userData.idNumber,
                name: userData.name,
                nationality: userData.nationality,
                email: userData.email.toLowerCase(), // Guardar email en minúsculas
                phone: userData.phone,
                password: userData.password,
                createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('hotel_users', JSON.stringify(users));

            // Crear sesión automáticamente después del registro
        this.currentUser = {
                id: newUser.id, 
                name: newUser.name, 
                email: newUser.email,
                phone: newUser.phone, 
                nationality: newUser.nationality, 
                idNumber: newUser.idNumber,
                createdAt: newUser.createdAt
            };
            
        this.saveData();
        this.updateAuthUI();
        this.hideModals();
            this.showMessage(`¡Registro exitoso! Bienvenido, ${userData.name.split(' ')[0]}!`, 'success');
            
            console.log('Usuario registrado exitosamente:', this.currentUser.email);
        return true;
        } catch (error) {
            console.error('Error en el proceso de registro:', error);
            this.showMessage('Error al registrar usuario. Por favor intenta de nuevo.', 'error');
            return false;
        }
    }

    /**
     * Cierra la sesión del usuario actual
     * Limpia los datos de sesión y redirige a la página principal
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        this.updateAuthUI();
        this.showMessage('Sesión cerrada exitosamente', 'success');
        
        // Redirect to home page if not already there
        setTimeout(() => {
            if (window.location.pathname.includes('pages/')) {
                window.location.href = '../index.html';
            }
        }, 1500);
    }

    // ============= FUNCIONES DE RESERVAS =============
    
    /**
     * Crea una nueva reserva en el sistema
     * @param {number} roomId - ID de la habitación a reservar
     * @param {string} checkIn - Fecha de entrada
     * @param {string} checkOut - Fecha de salida
     * @param {number} guests - Número de huéspedes
     * @param {string} notes - Notas adicionales (opcional)
     * @returns {Object|boolean} - Objeto de reserva si fue exitoso, false si falló
     */
    createReservation(roomId, checkIn, checkOut, guests, notes = '') {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room || !this.currentUser) {
            return false;
        }

        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const totalPrice = this.calculateTotalPrice(room.price, nights, guests);

        const reservation = {
            id: Date.now(), 
            roomId, 
            userId: this.currentUser.id,
            checkIn, 
            checkOut, 
            guests, 
            totalPrice, 
            notes,
            status: 'confirmed', 
            createdAt: new Date().toISOString(),
            roomName: room.name, 
            userName: this.currentUser.name, 
            userEmail: this.currentUser.email
        };

        this.reservations.push(reservation);
        this.saveData();
        return reservation;
    }

    /**
     * Cancela una reserva existente
     * @param {number} reservationId - ID de la reserva a cancelar
     * @returns {boolean} - true si se canceló exitosamente, false si no se encontró
     */
    cancelReservation(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = 'cancelled';
            reservation.cancelledAt = new Date().toISOString();
            this.saveData();
            return true;
        }
        return false;
    }

    /**
     * Modifica una reserva existente (cambiar fechas o número de huéspedes)
     * @param {number} reservationId - ID de la reserva a modificar
     * @param {string} newCheckIn - Nueva fecha de entrada
     * @param {string} newCheckOut - Nueva fecha de salida
     * @param {number} newGuests - Nuevo número de huéspedes
     * @param {string} newNotes - Nuevas notas adicionales
     * @returns {Object|boolean} - Reserva modificada si fue exitoso, false si falló
     */
    modifyReservation(reservationId, newCheckIn, newCheckOut, newGuests, newNotes = '') {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (!reservation) return false;

        const isAvailable = this.checkRoomAvailabilityForModification(
            reservation.roomId, newCheckIn, newCheckOut, reservationId
        );
        if (!isAvailable) return false;

        const room = this.rooms.find(r => r.id === reservation.roomId);
        if (!room) return false;

        const nights = Math.ceil((new Date(newCheckOut) - new Date(newCheckIn)) / (1000 * 60 * 60 * 24));
        const newTotalPrice = this.calculateTotalPrice(room.price, nights, newGuests);

        reservation.checkIn = newCheckIn;
        reservation.checkOut = newCheckOut;
        reservation.guests = newGuests;
        reservation.notes = newNotes;
        reservation.totalPrice = newTotalPrice;
        reservation.modifiedAt = new Date().toISOString();

        this.saveData();
        return reservation;
    }

    /**
     * Verifica disponibilidad para modificar una reserva (excluye la reserva actual)
     * @param {number} roomId - ID de la habitación
     * @param {string} checkIn - Nueva fecha de entrada
     * @param {string} checkOut - Nueva fecha de salida
     * @param {number} excludeReservationId - ID de la reserva a excluir de la verificación
     * @returns {boolean} - true si está disponible, false si hay conflicto
     */
    checkRoomAvailabilityForModification(roomId, checkIn, checkOut, excludeReservationId) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        return !this.reservations.some(reservation => {
            if (reservation.roomId !== roomId || 
                reservation.status === 'cancelled' || 
                reservation.id === excludeReservationId) {
                return false;
            }
            
            const resCheckIn = new Date(reservation.checkIn);
            const resCheckOut = new Date(reservation.checkOut);
            
            return (checkInDate < resCheckOut && checkOutDate > resCheckIn);
        });
    }
}

// ============= INICIALIZACIÓN DE LA APLICACIÓN =============

/**
 * Inicializa la aplicación cuando se carga completamente la página
 * Crea una instancia global de HotelApp accesible desde cualquier parte
 */
document.addEventListener('DOMContentLoaded', () => {
    window.hotelApp = new HotelApp();
});