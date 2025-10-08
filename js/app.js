/**
 * Clase principal de la aplicación del hotel
 * Maneja toda la lógica central del sistema de reservas
 */
class HotelApp {
    constructor() {
        this.currentUser = null;    // Usuario actualmente logueado
        this.rooms = [];           // Array de habitaciones disponibles
        this.reservations = [];    // Array de todas las reservas
        this.init();               // Inicializar la aplicación
    }

    /**
     * Inicializa la aplicación cargando datos y configurando eventos
     */
    init() {
        this.loadData();              // Cargar datos del localStorage
        this.setupEventListeners();   // Configurar eventos del DOM
        this.checkAuthStatus();       // Verificar estado de autenticación
    }

    /**
     * Carga todos los datos del localStorage
     * Si no hay habitaciones, inicializa las habitaciones por defecto
     */
    loadData() {
        this.rooms = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
        this.reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
        
        // Si no hay habitaciones, crear las habitaciones por defecto
        if (this.rooms.length === 0) {
            this.initializeDefaultRooms();
        }
    }

    /**
     * Inicializa las habitaciones por defecto del hotel
     * Crea 6 tipos de habitaciones con diferentes precios y características
     */
    initializeDefaultRooms() {
        this.rooms = [
            { id: 1, name: "Habitación Deluxe", description: "Amplia habitación con vista al jardín", price: 250000, maxGuests: 2, beds: 1, available: true, image: "images/suit1.jpg", features: ["WiFi gratuito", "Minibar", "TV 55\"", "Aire acondicionado", "Baño privado"] },
            { id: 2, name: "Suite Ejecutiva", description: "Suite de lujo con sala de estar separada", price: 450000, maxGuests: 4, beds: 2, available: true, image: "images/suit2.jpg", features: ["WiFi gratuito", "Minibar", "TV 65\"", "Jacuzzi", "Sala de estar", "Vista panorámica"] },
            { id: 3, name: "Habitación Familiar", description: "Perfecta para familias con niños", price: 350000, maxGuests: 6, beds: 3, available: true, image: "images/suit3.jpg", features: ["WiFi gratuito", "Minibar", "TV 50\"", "Aire acondicionado", "Cuna disponible", "Área de juegos"] },
            { id: 4, name: "Habitación Estándar", description: "Cómoda habitación con todas las comodidades", price: 180000, maxGuests: 2, beds: 1, available: true, image: "images/suit4.jpg", features: ["WiFi gratuito", "TV 43\"", "Aire acondicionado", "Baño privado", "Vista al jardín"] },
            { id: 5, name: "Suite Presidencial", description: "La máxima expresión de lujo y comodidad", price: 750000, maxGuests: 4, beds: 1, available: true, image: "images/suit5.jpg", features: ["WiFi gratuito", "Minibar premium", "TV 75\"", "Jacuzzi privado", "Terraza privada", "Servicio de mayordomo", "Vista panorámica"] },
            { id: 6, name: "Habitación Superior", description: "Elegante habitación con acabados de lujo", price: 320000, maxGuests: 3, beds: 2, available: true, image: "images/suit6.jpg", features: ["WiFi gratuito", "Minibar", "TV 50\"", "Aire acondicionado", "Baño privado", "Balcón privado"] }
        ];
        this.initializeDefaultAdmin();  // Crear usuario administrador por defecto
        this.saveData();               // Guardar datos en localStorage
    }

    initializeDefaultAdmin() {
        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        const adminExists = users.find(u => u.role === 'admin');
        
        if (!adminExists) {
            const adminUser = {
                id: 1,
                idNumber: '12345678',
                name: 'Administrador Hotel',
                nationality: 'Colombiana',
                email: 'admin@hotel.com',
                phone: '+57 316 6365 224',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            users.unshift(adminUser);
            localStorage.setItem('hotel_users', JSON.stringify(users));
        }
    }

    /**
     * Guarda todos los datos en localStorage para persistencia
     */
    saveData() {
        localStorage.setItem('hotel_rooms', JSON.stringify(this.rooms));
        localStorage.setItem('hotel_reservations', JSON.stringify(this.reservations));
        if (this.currentUser) {
            localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        }
    }

    setupEventListeners() {
        const initEvents = () => {
            const navToggle = document.getElementById('nav-toggle');
            const navMenu = document.getElementById('nav-menu');
            
            if (navToggle && navMenu) {
                navToggle.addEventListener('click', () => {
                    navMenu.classList.toggle('active');
                    navToggle.classList.toggle('active');
                });
            }

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (navMenu) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                    }
                });
            });

            this.setupModalEvents();
            this.setupAuthButtons();
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initEvents);
        } else {
            setTimeout(initEvents, 100);
        }
    }

    setupModalEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close')) {
                this.hideModals();
            }
        });
    }

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

    checkAuthStatus() {
        if (this.currentUser) {
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (this.currentUser) {
            if (loginBtn) {
                loginBtn.textContent = `Hola, ${this.currentUser.name.split(' ')[0]}`;
                const dashboardPath = window.location.pathname.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
                loginBtn.href = dashboardPath;
                
                loginBtn.onclick = (e) => {
                    e.preventDefault();
                    if (this.currentUser && this.currentUser.id) {
                        window.location.href = dashboardPath;
                    } else {
                        alert('Error: Sesión no válida. Por favor, inicia sesión nuevamente.');
                        this.logout();
                    }
                };
            }
            if (registerBtn) {
                registerBtn.style.display = 'none';
            }
            this.addLogoutButton();
            this.addAdminLink();
        } else {
            if (loginBtn) {
                loginBtn.textContent = 'Iniciar Sesión';
                loginBtn.href = '#';
                loginBtn.onclick = null;
                this.setupAuthButtons();
            }
            if (registerBtn) {
                registerBtn.style.display = 'block';
                registerBtn.href = '#';
            }
            this.removeLogoutButton();
            const adminLink = document.getElementById('admin-link');
            if (adminLink) {
                adminLink.remove();
            }
        }

        if (window.bookingManager && window.bookingManager.updateSearchLoginNotice) {
            window.bookingManager.updateSearchLoginNotice();
        }
    }

    addLogoutButton() {
        if (document.getElementById('logout-btn')) return;

        const loginBtn = document.getElementById('login-btn');
        if (!loginBtn) return;

        const logoutBtn = document.createElement('a');
        logoutBtn.id = 'logout-btn';
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link logout-link';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
        loginBtn.parentNode.insertBefore(logoutBtn, loginBtn.nextSibling);
        
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    removeLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    }

    addAdminLink() {
        if (document.getElementById('admin-link') || !this.currentUser || this.currentUser.role !== 'admin') return;

        const loginBtn = document.getElementById('login-btn');
        if (!loginBtn) return;

        const adminLink = document.createElement('a');
        adminLink.id = 'admin-link';
        adminLink.href = '#';
        adminLink.className = 'nav-link admin-link';
        adminLink.innerHTML = '<i class="fas fa-cog"></i> Administración';
        loginBtn.parentNode.insertBefore(adminLink, loginBtn.nextSibling);
        
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            const adminPath = window.location.pathname.includes('/pages/') ? 'admin.html' : 'pages/admin.html';
            window.location.href = adminPath;
        });
    }


    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

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
            return 'Fecha inválida';
        }
    }

    calculateTotalPrice(roomPrice, nights) {
        return roomPrice * nights;
    }

    calculateNights(checkIn, checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) return 0;
            
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return nights > 0 ? nights : 0;
    }

    checkRoomAvailability(roomId, checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) return false;
        
        return !this.reservations.some(reservation => {
            if (reservation.roomId !== roomId || reservation.status === 'cancelled') return false;
            const resCheckIn = new Date(reservation.checkIn);
            const resCheckOut = new Date(reservation.checkOut);
            return (checkInDate < resCheckOut && checkOutDate > resCheckIn);
        });
    }

    getAvailableRooms(checkIn, checkOut, guests) {
        if (!checkIn || !checkOut || !guests) return [];
        const guestsNum = parseInt(guests, 10);
        if (isNaN(guestsNum) || guestsNum < 1) return [];
        
        return this.rooms.filter(room => 
            room.maxGuests >= guestsNum && 
            (room.available !== false) && 
            this.checkRoomAvailability(room.id, checkIn, checkOut)
        );
    }

    /**
     * Autentica a un usuario con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Object} - Objeto con success: boolean y error opcional
     */
    login(email, password) {
        if (!email || !password) return { success: false, error: 'empty_fields' };

        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) return { success: false, error: 'email_not_found' };
        if (user.password !== password) return { success: false, error: 'wrong_password' };
        
        // Establecer usuario actual
        this.currentUser = {
            id: user.id, 
            name: user.name, 
            email: user.email,
            phone: user.phone, 
            nationality: user.nationality, 
            idNumber: user.idNumber,
            role: user.role || 'user',
            createdAt: user.createdAt
        };
            
        this.saveData();
        this.updateAuthUI();
        this.hideModals();
        alert(`¡Bienvenido, ${user.name.split(' ')[0]}!`);
        return { success: true };
    }

    register(userData) {
        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        
        if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            alert('Ya existe un usuario con este email. Por favor inicia sesión.');
            return false;
        }

        const newUser = {
                id: Date.now(), 
                idNumber: userData.idNumber,
                name: userData.name,
                nationality: userData.nationality,
                email: userData.email.toLowerCase(),
                phone: userData.phone,
                password: userData.password,
                role: 'user',
                createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('hotel_users', JSON.stringify(users));

        this.currentUser = {
                id: newUser.id, 
                name: newUser.name, 
                email: newUser.email,
                phone: newUser.phone, 
                nationality: newUser.nationality, 
                idNumber: newUser.idNumber,
                role: newUser.role,
                createdAt: newUser.createdAt
            };
            
        this.saveData();
        this.updateAuthUI();
        this.hideModals();
        alert(`¡Registro exitoso! Bienvenido, ${userData.name.split(' ')[0]}!`);
        return true;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        this.updateAuthUI();
        alert('Sesión cerrada exitosamente');
        
        setTimeout(() => {
            if (window.location.pathname.includes('pages/')) {
                window.location.href = '../index.html';
            }
        }, 1500);
    }

    /**
     * Crea una nueva reserva para el usuario actual
     * @param {number} roomId - ID de la habitación
     * @param {string} checkIn - Fecha de entrada (YYYY-MM-DD)
     * @param {string} checkOut - Fecha de salida (YYYY-MM-DD)
     * @param {number} guests - Número de huéspedes
     * @param {string} notes - Notas adicionales (opcional)
     * @returns {Object|false} - Objeto de reserva o false si falla
     */
    createReservation(roomId, checkIn, checkOut, guests, notes = '') {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room || !this.currentUser) return false;

        const nights = this.calculateNights(checkIn, checkOut);
        const reservation = {
            id: Date.now(), 
            roomId, 
            userId: this.currentUser.id, 
            checkIn, 
            checkOut, 
            guests, 
            totalPrice: this.calculateTotalPrice(room.price, nights), 
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
        const newTotalPrice = this.calculateTotalPrice(room.price, nights);

        reservation.checkIn = newCheckIn;
        reservation.checkOut = newCheckOut;
        reservation.guests = newGuests;
        reservation.notes = newNotes;
        reservation.totalPrice = newTotalPrice;
        reservation.modifiedAt = new Date().toISOString();

        this.saveData();
        return reservation;
    }

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

document.addEventListener('DOMContentLoaded', () => {
    window.hotelApp = new HotelApp();
});