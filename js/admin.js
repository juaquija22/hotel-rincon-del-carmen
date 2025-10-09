/**
 * Clase que maneja todo el panel de administración
 * Gestión de reservas, habitaciones, usuarios y estadísticas
 */
class AdminPanel {
    /**
     * Constructor del Panel de Administración
     * Verifica acceso y configura el panel si el usuario es admin
     */
    constructor() {
        this.currentUser = null;    // Usuario administrador actual
        this.setupEventListeners(); // Configurar eventos del panel
        this.checkAdminAccess();    // Verificar acceso de administrador
    }

    /**
     * Configura los eventos de navegación del panel de administración
     * Permite cambiar entre las diferentes secciones (Overview, Reservas, Habitaciones, Usuarios)
     */
    setupEventListeners() {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
            });
        });

    }

    /**
     * Verifica que el usuario actual tenga permisos de administrador
     * - Comprueba si hay un usuario logueado
     * - Verifica que tenga rol 'admin'
     * - Carga los datos del panel si tiene acceso
     * - Muestra mensaje de acceso denegado si no es admin
     */
    checkAdminAccess() {
        const savedUser = localStorage.getItem('current_user');
        if (!savedUser) {
            this.showAccessDenied();
            return;
        }

        try {
            this.currentUser = JSON.parse(savedUser);
            if (this.currentUser?.role === 'admin') {
                // Cargar todos los datos del panel de administración
                this.loadOverview();
                this.loadReservations();
                this.loadRooms();
                this.loadUsers();
            } else {
                this.showAccessDenied();
            }
        } catch (error) {
            this.showAccessDenied();
        }
    }

    /**
     * Muestra un mensaje de acceso denegado
     * Se ejecuta cuando un usuario sin permisos intenta acceder al panel
     */
    showAccessDenied() {
        document.querySelector('.dashboard-main').innerHTML = `
            <div class="access-denied">
                <i class="fas fa-lock"></i>
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos de administrador para acceder a este panel.</p>
                <a href="../index.html" class="btn btn-primary">Volver al Inicio</a>
            </div>
        `;
    }

    /**
     * Cambia la sección visible del panel de administración
     * @param {string} sectionName - Nombre de la sección (overview, reservations, rooms, users)
     * Actualiza la UI y carga los datos correspondientes
     */
    showSection(sectionName) {
        document.querySelectorAll('.dashboard-section').forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.sidebar-nav a').forEach(link => link.classList.remove('active'));
        
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) targetSection.classList.add('active');
        
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        switch(sectionName) {
            case 'overview': this.loadOverview(); break;
            case 'reservations': this.loadReservations(); break;
            case 'rooms': this.loadRooms(); break;
            case 'users': this.loadUsers(); break;
        }
    }

    /**
     * Carga la vista general del dashboard (Overview)
     * Muestra estadísticas clave:
     * - Total de reservas
     * - Total de habitaciones
     * - Total de usuarios
     * - Ingresos totales (solo reservas confirmadas)
     * - Reservas recientes (últimas 5)
     */
    loadOverview() {
        const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        const rooms = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');

        document.getElementById('total-reservations').textContent = reservations.length;
        document.getElementById('total-rooms').textContent = rooms.length;
        document.getElementById('total-users').textContent = users.filter(u => u.role !== 'admin').length;
        
        const totalRevenue = reservations
            .filter(r => r.status === 'confirmed')
            .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toLocaleString()}`;

        this.loadRecentReservations();
    }

    /**
     * Carga y muestra las 5 reservas más recientes
     * Ordenadas por fecha de creación (más reciente primero)
     */
    loadRecentReservations() {
        const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        const recentReservations = reservations
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const container = document.getElementById('recent-reservations');
        if (recentReservations.length === 0) {
            container.innerHTML = '<p>No hay reservas recientes</p>';
            return;
        }

        container.innerHTML = recentReservations.map(reservation => {
            const room = window.hotelApp.rooms.find(r => r.id === reservation.roomId);
            const user = JSON.parse(localStorage.getItem('hotel_users') || '[]').find(u => u.id === reservation.userId);
            const statusClass = reservation.status === 'confirmed' ? 'status-confirmed' : 
                               reservation.status === 'cancelled' ? 'status-cancelled' : 'status-pending';
            const statusText = reservation.status === 'confirmed' ? 'Confirmada' : 
                              reservation.status === 'cancelled' ? 'Cancelada' : 'Pendiente';

            return `
                <div class="recent-reservation-item">
                    <div class="reservation-info">
                        <h4>Reserva #${reservation.id}</h4>
                        <p>${room?.name || 'N/A'} - ${user?.name || 'Usuario no encontrado'}</p>
                        <small>${new Date(reservation.createdAt).toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}</small>
                    </div>
                    <div class="reservation-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <span class="reservation-amount">$${reservation.totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Carga todas las reservas del sistema
     */
    loadReservations() {
        this.displayReservations(JSON.parse(localStorage.getItem('hotel_reservations') || '[]'));
    }

    /**
     * Muestra todas las reservas con detalles completos
     * @param {Array} reservations - Array de reservas a mostrar
     * Incluye información de:
     * - Cliente y contacto
     * - Habitación reservada
     * - Fechas y huéspedes
     * - Estado (confirmada/cancelada/pendiente)
     * - Acciones disponibles (cancelar, reactivar, eliminar)
     */
    displayReservations(reservations) {
        const rooms = window.hotelApp.rooms;
        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        const container = document.getElementById('admin-reservations-grid');
        
        if (reservations.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No hay reservas</h3>
                    <p>No se han encontrado reservas en el sistema</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reservations.map(reservation => {
            const room = rooms.find(r => r.id === reservation.roomId);
            const user = users.find(u => u.id === reservation.userId);
            const statusClass = reservation.status === 'confirmed' ? 'status-confirmed' : 
                               reservation.status === 'cancelled' ? 'status-cancelled' : 'status-pending';
            const statusText = reservation.status === 'confirmed' ? 'Confirmada' : 
                              reservation.status === 'cancelled' ? 'Cancelada' : 'Pendiente';

            return `
                <div class="admin-reservation-card">
                    <div class="reservation-header">
                        <h3>Reserva #${reservation.id}</h3>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="reservation-details">
                        <div class="detail-row">
                            <span class="label">Cliente:</span>
                            <span class="value">${user?.name || 'Usuario no encontrado'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Email:</span>
                            <span class="value">${user?.email || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Habitación:</span>
                            <span class="value">${room?.name || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Fechas:</span>
                            <span class="value">${new Date(reservation.checkIn).toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})} - ${new Date(reservation.checkOut).toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Huéspedes:</span>
                            <span class="value">${reservation.guests} persona${reservation.guests > 1 ? 's' : ''}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Total:</span>
                            <span class="value">$${reservation.totalPrice.toLocaleString()}</span>
                        </div>
                        ${reservation.notes ? `
                            <div class="detail-row">
                                <span class="label">Notas:</span>
                                <span class="value">${reservation.notes}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="reservation-actions">
                        ${reservation.status === 'confirmed' ? `
                            <button class="btn btn-warning" onclick="window.adminPanel.cancelReservation(${reservation.id})">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        ` : reservation.status === 'cancelled' ? `
                            <button class="btn btn-success" onclick="window.adminPanel.reactivateReservation(${reservation.id})">
                                <i class="fas fa-check"></i> Reactivar
                            </button>
                        ` : ''}
                        <button class="btn btn-danger" onclick="window.adminPanel.deleteReservation(${reservation.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Carga y muestra todas las habitaciones del hotel
     * Permite al admin:
     * - Ver detalles de cada habitación
     * - Activar/desactivar disponibilidad
     */
    loadRooms() {
        const rooms = window.hotelApp.rooms;
        const container = document.getElementById('admin-rooms-grid');

        container.innerHTML = rooms.map(room => `
            <div class="admin-room-card">
                <div class="room-header">
                    <h3>${room.name}</h3>
                    <span class="room-status ${room.available ? 'available' : 'unavailable'}">
                        ${room.available ? 'Disponible' : 'No Disponible'}
                    </span>
                </div>
                <div class="room-details">
                    <div class="detail-row">
                        <span class="label">Precio:</span>
                        <span class="value">$${room.price.toLocaleString()}/noche</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Capacidad:</span>
                        <span class="value">${room.maxGuests} personas</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Camas:</span>
                        <span class="value">${room.beds}</span>
                    </div>
                </div>
                <div class="room-actions">
                    <button class="btn btn-${room.available ? 'warning' : 'success'}" 
                            onclick="window.adminPanel.toggleRoomAvailability(${room.id})">
                        <i class="fas fa-${room.available ? 'pause' : 'play'}"></i> 
                        ${room.available ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Carga y muestra todos los usuarios registrados
     * Excluye usuarios con rol 'admin'
     * Muestra información completa y opción de eliminar
     */
    loadUsers() {
        const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
        const regularUsers = users.filter(u => u.role !== 'admin');
        const container = document.getElementById('admin-users-grid');

        if (regularUsers.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-users"></i>
                    <h3>No hay usuarios</h3>
                    <p>No se han encontrado usuarios registrados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = regularUsers.map(user => `
            <div class="admin-user-card">
                <div class="user-header">
                    <h3>${user.name}</h3>
                    <span class="user-role">Usuario</span>
                </div>
                <div class="user-details">
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">${user.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Teléfono:</span>
                        <span class="value">${user.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Nacionalidad:</span>
                        <span class="value">${user.nationality}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Registrado:</span>
                        <span class="value">${new Date(user.createdAt).toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-danger" onclick="window.adminPanel.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i> Eliminar Usuario
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Cancela una reserva existente (acción de administrador)
     * @param {number} reservationId - ID de la reserva a cancelar
     * Cambia el estado a 'cancelled' y registra la fecha de cancelación
     */
    cancelReservation(reservationId) {
        if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
            const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
            const reservation = reservations.find(r => r.id === reservationId);
            
            if (reservation) {
                reservation.status = 'cancelled';
                reservation.cancelledAt = new Date().toISOString();
                localStorage.setItem('hotel_reservations', JSON.stringify(reservations));
                alert('Reserva cancelada exitosamente');
                this.loadReservations();
                this.loadOverview();
            }
        }
    }

    /**
     * Reactiva una reserva previamente cancelada
     * @param {number} reservationId - ID de la reserva a reactivar
     * Cambia el estado de 'cancelled' a 'confirmed'
     */
    reactivateReservation(reservationId) {
        if (confirm('¿Estás seguro de que quieres reactivar esta reserva?')) {
            const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
            const reservation = reservations.find(r => r.id === reservationId);
            
            if (reservation) {
                reservation.status = 'confirmed';
                delete reservation.cancelledAt;
                localStorage.setItem('hotel_reservations', JSON.stringify(reservations));
                alert('Reserva reactivada exitosamente');
                this.loadReservations();
                this.loadOverview();
            }
        }
    }

    /**
     * Elimina permanentemente una reserva del sistema
     * @param {number} reservationId - ID de la reserva a eliminar
     * Esta acción NO se puede deshacer
     */
    deleteReservation(reservationId) {
        if (confirm('¿Estás seguro de que quieres eliminar permanentemente esta reserva? Esta acción no se puede deshacer.')) {
            const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
            const filteredReservations = reservations.filter(r => r.id !== reservationId);
            localStorage.setItem('hotel_reservations', JSON.stringify(filteredReservations));
            alert('Reserva eliminada exitosamente');
            this.loadReservations();
            this.loadOverview();
        }
    }

    /**
     * Activa o desactiva la disponibilidad de una habitación
     * @param {number} roomId - ID de la habitación
     * Útil para mantenimiento o eventos especiales
     */
    toggleRoomAvailability(roomId) {
        const room = window.hotelApp.rooms.find(r => r.id === roomId);
        if (room) {
            room.available = !room.available;
            window.hotelApp.saveData();
            alert(`Habitación ${room.available ? 'activada' : 'desactivada'} exitosamente`);
            this.loadRooms();
        }
    }

    /**
     * Elimina permanentemente un usuario del sistema
     * @param {number} userId - ID del usuario a eliminar
     * Esta acción NO se puede deshacer
     */
    deleteUser(userId) {
        if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
            const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
            const filteredUsers = users.filter(u => u.id !== userId);
            localStorage.setItem('hotel_users', JSON.stringify(filteredUsers));
            alert('Usuario eliminado exitosamente');
            this.loadUsers();
            this.loadOverview();
        }
    }
}

// Inicializa el panel de administración y configura el logout
document.addEventListener('DOMContentLoaded', () => {
    if (window.hotelApp) {
        window.adminPanel = new AdminPanel();
    }
    
    // Función para manejar el cierre de sesión del administrador
    const handleLogout = () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            if (window.hotelApp) {
                window.hotelApp.logout();
                setTimeout(() => window.location.href = '../index.html', 1000);
            }
        }
    };
    
    // Configurar botones de logout (panel admin y navbar)
    const logoutBtn = document.getElementById('admin-logout-btn');
    const navLogoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (navLogoutBtn) navLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
});