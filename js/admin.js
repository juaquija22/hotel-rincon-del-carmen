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
            case 'reviews': this.loadReviews(); break;
            case 'messages': this.loadMessages(); break;
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
                        ${reservation.checkedInAt ? `
                            <div class="detail-row">
                                <span class="label">Check-in:</span>
                                <span class="value">${new Date(reservation.checkedInAt).toLocaleString('es-ES')}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Atendido por:</span>
                                <span class="value">${this.currentUser?.name || 'Administrador'}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="reservation-actions">
                        <button class="btn btn-celeste" onclick="window.adminPanel.showModifyReservation(${reservation.id})">
                            <i class="fas fa-edit"></i> Modificar
                        </button>
                        ${reservation.status === 'confirmed' && !reservation.checkedInAt ? `
                            <button class="btn btn-success" onclick="window.adminPanel.showCheckIn(${reservation.id})">
                                <i class="fas fa-door-open"></i> Hacer Check-in
                            </button>
                        ` : ''}
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

    showCheckIn(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        const reservation = reservations.find(r => r.id === reservationId);
        const room = window.hotelApp.rooms.find(r => r.id === (reservation ? reservation.roomId : null));
        if (!reservation || !room) return alert('No se pudo cargar la reserva.');

        this._checkinReservationId = reservationId;

        const details = document.getElementById('admin-checkin-details');
        if (details) {
            details.innerHTML = `
                <div><strong>Reserva:</strong> #${reservation.id}</div>
                <div><strong>Habitación:</strong> ${room.name}</div>
                <div><strong>Huésped:</strong> ${reservation.userName || 'N/A'}</div>
                <div><strong>Fechas:</strong> ${new Date(reservation.checkIn).toLocaleDateString('es-ES')} - ${new Date(reservation.checkOut).toLocaleDateString('es-ES')}</div>
            `;
        }

        const timeInput = document.getElementById('admin-checkin-time');
        if (timeInput) {
            // Pre-cargar 14:00 por defecto
            timeInput.value = '14:00';
        }

        const modal = document.getElementById('admin-checkin-modal');
        if (modal) modal.style.display = 'block';

        const closeEls = modal ? modal.querySelectorAll('.close, #admin-cancel-checkin-btn') : [];
        closeEls.forEach(el => el.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        }, { once: true }));

        const form = document.getElementById('admin-checkin-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.submitCheckIn();
            };
        }
    }

    submitCheckIn() {
        const reservationId = this._checkinReservationId;
        if (!reservationId) return;

        const time = document.getElementById('admin-checkin-time').value;
        const doc = document.getElementById('admin-checkin-doc').value.trim();
        const notes = document.getElementById('admin-checkin-notes').value.trim();
        if (!time || !doc) {
            return alert('Por favor completa la hora de check-in y el documento verificado.');
        }

        const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        const reservation = reservations.find(r => r.id === reservationId);
        if (!reservation) return alert('No se encontró la reserva.');

        // Componer fecha-hora del check-in con la fecha de entrada
        try {
            const checkInDate = new Date(reservation.checkIn);
            const [hh, mm] = time.split(':').map(n => parseInt(n, 10));
            checkInDate.setHours(hh, mm || 0, 0, 0);
            reservation.checkedInAt = checkInDate.toISOString();
        } catch (_) {
            reservation.checkedInAt = new Date().toISOString();
        }
        reservation.checkedInBy = this.currentUser?.id;
        if (notes) {
            reservation.checkinNotes = notes;
        }
        reservation.checkinDoc = doc;

        localStorage.setItem('hotel_reservations', JSON.stringify(reservations));
        alert('Check-in registrado exitosamente');

        const modal = document.getElementById('admin-checkin-modal');
        if (modal) modal.style.display = 'none';

        this.loadReservations();
        this.loadOverview();
    }

    showModifyReservation(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        const reservation = reservations.find(r => r.id === reservationId);
        const room = window.hotelApp.rooms.find(r => r.id === (reservation ? reservation.roomId : null));
        if (!reservation || !room) return alert('No se pudo cargar la reserva.');

        this._editingReservationId = reservationId;

        const details = document.getElementById('admin-modify-details');
        if (details) {
            details.innerHTML = `
                <div><strong>Reserva:</strong> #${reservation.id}</div>
                <div><strong>Habitación:</strong> ${room.name}</div>
                <div><strong>Cliente:</strong> ${reservation.userName || 'N/A'} (${reservation.userEmail || ''})</div>
            `;
        }

        // Populate fields
        const checkInInput = document.getElementById('admin-modify-check-in');
        const checkOutInput = document.getElementById('admin-modify-check-out');
        const guestsSelect = document.getElementById('admin-modify-guests');
        const notesInput = document.getElementById('admin-modify-notes');

        const today = new Date().toISOString().split('T')[0];
        if (checkInInput) {
            checkInInput.min = today;
            checkInInput.value = reservation.checkIn;
        }
        if (checkOutInput) {
            checkOutInput.min = reservation.checkIn;
            checkOutInput.value = reservation.checkOut;
        }
        if (guestsSelect) {
            guestsSelect.innerHTML = Array.from({length: room.maxGuests}, (_,i)=>`<option value="${i+1}">${i+1} persona${i? 's':''}</option>`).join('');
            guestsSelect.value = String(reservation.guests);
        }
        if (notesInput) notesInput.value = reservation.notes || '';

        const setMinOut = () => {
            if (checkInInput && checkOutInput) {
                checkOutInput.min = checkInInput.value || today;
                if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
                    checkOutInput.value = '';
                }
            }
        };
        if (checkInInput) checkInInput.addEventListener('change', setMinOut, { once: true });

        const priceSummary = document.getElementById('admin-modify-price-summary');
        const updatePrice = () => {
            if (!checkInInput || !checkOutInput) return;
            const nights = window.hotelApp.calculateNights(checkInInput.value, checkOutInput.value);
            const total = window.hotelApp.calculateTotalPrice(room.price, nights);
            if (priceSummary) {
                priceSummary.innerHTML = nights > 0 ? `
                    <strong>Total:</strong> $${total.toLocaleString()}<br>
                    <small>$${room.price.toLocaleString()} × ${nights} noche${nights>1?'s':''}</small>
                ` : '<small>Selecciona fechas válidas.</small>';
            }
        };
        if (checkInInput) checkInInput.addEventListener('change', updatePrice);
        if (checkOutInput) checkOutInput.addEventListener('change', updatePrice);
        updatePrice();

        // Show modal
        const modal = document.getElementById('admin-modify-modal');
        if (modal) modal.style.display = 'block';

        const closeEls = modal ? modal.querySelectorAll('.close, #admin-cancel-modify-btn') : [];
        closeEls.forEach(el => el.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        }, { once: true }));

        const form = document.getElementById('admin-modify-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.submitModifyReservation();
            };
        }
    }

    submitModifyReservation() {
        const reservationId = this._editingReservationId;
        if (!reservationId) return;

        const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        const reservation = reservations.find(r => r.id === reservationId);
        const room = window.hotelApp.rooms.find(r => r.id === (reservation ? reservation.roomId : null));
        if (!reservation || !room) return alert('No se pudo modificar la reserva.');

        const checkIn = document.getElementById('admin-modify-check-in').value;
        const checkOut = document.getElementById('admin-modify-check-out').value;
        const guests = parseInt(document.getElementById('admin-modify-guests').value, 10);
        const notes = document.getElementById('admin-modify-notes').value.trim();

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date(); today.setHours(0,0,0,0);
        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkInDate < today || checkOutDate <= checkInDate) {
            return alert('Por favor ingresa fechas válidas.');
        }
        if (guests < 1 || guests > room.maxGuests) {
            return alert('Número de huéspedes inválido para esta habitación.');
        }

        // Availability excluding current reservation
        const isBusy = reservations.some(r => {
            if (r.id === reservation.id || r.roomId !== room.id || r.status === 'cancelled') return false;
            const resIn = new Date(r.checkIn);
            const resOut = new Date(r.checkOut);
            return (checkInDate < resOut && checkOutDate > resIn);
        });
        if (isBusy) return alert('La habitación no está disponible en esas fechas.');

        const nights = window.hotelApp.calculateNights(checkIn, checkOut);
        reservation.checkIn = checkIn;
        reservation.checkOut = checkOut;
        reservation.guests = guests;
        reservation.notes = notes;
        reservation.totalPrice = window.hotelApp.calculateTotalPrice(room.price, nights);
        reservation.modifiedAt = new Date().toISOString();

        localStorage.setItem('hotel_reservations', JSON.stringify(reservations));
        alert('Reserva modificada exitosamente');

        const modal = document.getElementById('admin-modify-modal');
        if (modal) modal.style.display = 'none';

        this.loadReservations();
        this.loadOverview();
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
     * Carga y muestra todas las reseñas de usuarios almacenadas en localStorage
     */
    loadReviews() {
        const reviews = JSON.parse(localStorage.getItem('hotel_reviews') || '[]');
        const container = document.getElementById('admin-reviews-grid');

        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-comments"></i>
                    <h3>No hay reseñas</h3>
                    <p>Aún no se han publicado reseñas</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reviews
            .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(r => `
                <div class="admin-reservation-card">
                    <div class="reservation-header">
                        <h3>${(r.userName || 'Huésped')}</h3>
                        <span class="status-badge status-confirmed">${(r.rating || 0)} ⭐</span>
                    </div>
                    <div class="reservation-details">
                        <div class="detail-row"><span class="label">Título:</span><span class="value">${this.escape(r.title)}</span></div>
                        <div class="detail-row"><span class="label">Reseña:</span><span class="value">${this.escape(r.text)}</span></div>
                        <div class="detail-row"><span class="label">Fecha:</span><span class="value">${new Date(r.createdAt).toLocaleDateString('es-ES', {year:'numeric', month:'long', day:'numeric'})}</span></div>
                    </div>
                </div>
            `).join('');
    }

    escape(text='') {
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
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

    /**
     * Carga y muestra mensajes de contacto guardados en localStorage
     */
    loadMessages() {
        const messages = JSON.parse(localStorage.getItem('hotel_messages') || '[]');
        const container = document.getElementById('admin-messages-grid');

        if (!messages || messages.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-inbox"></i>
                    <h3>No hay mensajes</h3>
                    <p>Cuando los usuarios envíen el formulario de contacto aparecerán aquí</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages
            .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(m => `
                <div class="admin-reservation-card">
                    <div class="reservation-header">
                        <h3>${(m.userName || 'Visitante')}</h3>
                        <span class="status-badge status-pending">${this.escape(m.subject)}</span>
                    </div>
                    <div class="reservation-details">
                        <div class="detail-row"><span class="label">Email:</span><span class="value">${this.escape(m.email)}</span></div>
                        ${m.phone ? `<div class="detail-row"><span class="label">Teléfono:</span><span class="value">${this.escape(m.phone)}</span></div>` : ''}
                        <div class="detail-row"><span class="label">Mensaje:</span><span class="value">${this.escape(m.message)}</span></div>
                        <div class="detail-row"><span class="label">Fecha:</span><span class="value">${new Date(m.createdAt).toLocaleDateString('es-ES', {year:'numeric', month:'long', day:'numeric'})}</span></div>
                    </div>
                </div>
            `).join('');
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