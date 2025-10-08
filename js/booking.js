class BookingManager {
    constructor(hotelApp) {
        this.hotelApp = hotelApp;
        this.currentSearch = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const initEvents = () => {
            this.updateSearchLoginNotice();
            
            const searchForm = document.getElementById('search-form');
            if (searchForm) {
                searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSearch();
                });
            }

            const bookingForm = document.getElementById('booking-form');
            if (bookingForm) {
                bookingForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleBooking();
                });
            }

            const cancelBookingBtn = document.getElementById('cancel-booking-btn');
            if (cancelBookingBtn) {
                cancelBookingBtn.addEventListener('click', () => this.hotelApp.hideModals());
            }

            this.setMinimumDates();
            this.setupTabs();
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initEvents);
        } else {
            setTimeout(initEvents, 100);
        }
    }

    // Modify modal form events removed - only admin can modify reservations

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                button.classList.add('active');
                const targetPanel = document.getElementById(`${targetTab}-tab`);
                if (targetPanel) targetPanel.classList.add('active');
                if (targetTab === 'my-reservations') this.loadUserReservations();
            });
        });
    }

    setMinimumDates() {
        const today = new Date().toISOString().split('T')[0];
        const checkInInput = document.getElementById('check-in');
        const checkOutInput = document.getElementById('check-out');
        
        if (checkInInput) {
            checkInInput.min = today;
            checkInInput.addEventListener('change', () => {
                if (checkOutInput) {
                    checkOutInput.min = checkInInput.value;
                    if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
                        checkOutInput.value = '';
                    }
                }
            });
        }
    }

    handleSearch() {
        if (!this.hotelApp.currentUser) {
            alert('Debes iniciar sesión para buscar habitaciones disponibles');
            setTimeout(() => confirm('¿Deseas iniciar sesión ahora?') && this.hotelApp.showModal('login-modal'), 100);
            return;
        }

        const inputs = ['check-in', 'check-out', 'guests'].map(id => document.getElementById(id));
        if (inputs.some(input => !input)) {
            alert('Error: No se pudieron encontrar los campos de búsqueda');
            return;
        }

        const [checkIn, checkOut, guests] = inputs.map(input => input.value.trim());
        if (!checkIn || !checkOut || !guests) {
            alert('Por favor completa todos los campos de búsqueda');
            return;
        }

        const guestsNum = parseInt(guests, 10);
        if (isNaN(guestsNum) || guestsNum < 1) {
            alert('Por favor selecciona un número válido de huéspedes');
            return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date().setHours(0, 0, 0, 0);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || 
            checkInDate < today || checkOutDate <= checkInDate) {
            alert('Por favor ingresa fechas válidas');
            return;
        }

        this.currentSearch = { checkIn, checkOut, guests: guestsNum };
        this.searchAvailableRooms();
    }

    searchAvailableRooms() {
        if (!this.currentSearch) {
            alert('Error: No hay datos de búsqueda');
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            const availableRooms = this.hotelApp.getAvailableRooms(
                this.currentSearch.checkIn,
                this.currentSearch.checkOut,
                this.currentSearch.guests
            );
            this.displayResults(availableRooms);
        }, 500);
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const resultsSection = document.getElementById('results-section');
        const noResults = document.getElementById('no-results');
        
        if (loading) loading.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
    }

    displayResults(rooms) {
        const elements = {
            loading: document.getElementById('loading'),
            noResults: document.getElementById('no-results'),
            resultsSection: document.getElementById('results-section')
        };
        
        if (elements.loading) elements.loading.style.display = 'none';
        
        if (!rooms || rooms.length === 0) {
            if (elements.noResults) {
                elements.noResults.style.display = 'block';
                if (!elements.noResults.querySelector('.search-help')) {
                    const helpDiv = document.createElement('div');
                    helpDiv.className = 'search-help';
                    helpDiv.style.cssText = 'margin-top: 1rem; color: var(--text-light);';
                    helpDiv.innerHTML = `
                        <p><strong>Sugerencias:</strong></p>
                        <ul style="text-align: left; display: inline-block;">
                            <li>Intenta con menos huéspedes</li>
                            <li>Selecciona fechas diferentes</li>
                            <li>Verifica que las fechas sean futuras</li>
                        </ul>
                    `;
                    elements.noResults.appendChild(helpDiv);
                }
            }
            if (elements.resultsSection) elements.resultsSection.style.display = 'none';
            return;
        }

        if (elements.noResults) elements.noResults.style.display = 'none';
        if (elements.resultsSection) elements.resultsSection.style.display = 'block';
        
        this.updateResultsCount(rooms.length);
        this.renderRooms(rooms);
    }

    updateResultsCount(count) {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `${count} habitación${count !== 1 ? 'es' : ''} encontrada${count !== 1 ? 's' : ''}`;
        }
    }

    renderRooms(rooms) {
        const roomsGrid = document.getElementById('rooms-grid');
        if (!roomsGrid || !this.currentSearch) return;

        const nights = this.hotelApp.calculateNights(this.currentSearch.checkIn, this.currentSearch.checkOut);
        
        roomsGrid.innerHTML = rooms.map(room => {
            if (!room || !room.id) return '';

            const totalPrice = this.hotelApp.calculateTotalPrice(room.price, nights);
            const imagePath = room.image ? (room.image.startsWith('images/') ? '../' + room.image : room.image) : 'https://via.placeholder.com/500x300';
            
            return `<div class="room-card-detailed">
                    <div class="room-image-large">
                            <img src="${imagePath}" alt="${room.name}">
                        <div class="room-badge">Disponible</div>
                    </div>
                    <div class="room-content-detailed">
                        <h3 class="room-title-large">${room.name}</h3>
                        <div class="room-price-large">$${room.price.toLocaleString()} / noche</div>
                        <p class="room-description">${room.description}</p>
                        <div class="room-details">
                        <div class="detail-item"><i class="fas fa-bed"></i><span>${room.beds} cama${room.beds > 1 ? 's' : ''}</span></div>
                        <div class="detail-item"><i class="fas fa-users"></i><span>Hasta ${room.maxGuests} personas</span></div>
                        <div class="detail-item"><i class="fas fa-calendar-alt"></i><span>${nights} noche${nights > 1 ? 's' : ''}</span></div>
                        </div>
                        <div class="room-features-detailed">
                            <h4>Servicios incluidos:</h4>
                        <ul class="features-list">${room.features.map(f => `<li><i class="fas fa-check"></i>${f}</li>`).join('')}</ul>
                        </div>
                        <div class="booking-info">
                            <h4>Detalles de tu reserva:</h4>
                            <div class="booking-details">
                            <div class="booking-detail"><span>Entrada</span><small>${this.hotelApp.formatDate(this.currentSearch.checkIn)}</small></div>
                            <div class="booking-detail"><span>Salida</span><small>${this.hotelApp.formatDate(this.currentSearch.checkOut)}</small></div>
                            <div class="booking-detail"><span>Huéspedes</span><small>${this.currentSearch.guests} persona${this.currentSearch.guests > 1 ? 's' : ''}</small></div>
                            <div class="booking-detail"><span>Noches</span><small>${nights}</small></div>
                        </div>
                    </div>
                        <div class="total-price">
                            <h3>Total: $${totalPrice.toLocaleString()}</h3>
                            <small>$${room.price.toLocaleString()} × ${nights} noche${nights > 1 ? 's' : ''}</small>
                        </div>
                        <button class="btn btn-primary book-btn" onclick="window.bookingManager.showBookingModal(${room.id})">
                            <i class="fas fa-calendar-check"></i> Reservar Ahora
                        </button>
                </div>
            </div>`;
        }).join('');
    }

    showBookingModal(roomId) {
        if (!this.hotelApp.currentUser) {
            alert('Debes iniciar sesión para hacer una reserva');
            this.hotelApp.showModal('login-modal');
            return;
        }

        const room = this.hotelApp.rooms.find(r => r.id === roomId);
        if (!room) {
            alert('Habitación no encontrada');
            return;
        }

        const isAvailable = this.hotelApp.checkRoomAvailability(roomId, this.currentSearch.checkIn, this.currentSearch.checkOut);

        if (!isAvailable) {
            alert('Esta habitación ya no está disponible para las fechas seleccionadas');
            this.searchAvailableRooms();
            return;
        }

        this.selectedRoomId = roomId;
        const nights = this.hotelApp.calculateNights(this.currentSearch.checkIn, this.currentSearch.checkOut);
        const totalPrice = this.hotelApp.calculateTotalPrice(room.price, nights);

        const bookingDetails = document.getElementById('booking-details');
        bookingDetails.innerHTML = `
            <div style="background-color: var(--bg-light); padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Resumen de Reserva</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div><strong>Habitación:</strong><br>${room.name}</div>
                    <div><strong>Fechas:</strong><br>${this.hotelApp.formatDate(this.currentSearch.checkIn)} - ${this.hotelApp.formatDate(this.currentSearch.checkOut)}</div>
                    <div><strong>Huéspedes:</strong><br>${this.currentSearch.guests} persona${this.currentSearch.guests > 1 ? 's' : ''}</div>
                    <div><strong>Noches:</strong><br>${nights}</div>
                </div>
                <div style="background-color: var(--primary-color); color: white; padding: 1rem; border-radius: var(--border-radius); text-align: center;">
                    <h3 style="color: white; margin: 0;">Total: $${totalPrice.toLocaleString()}</h3>
                </div>
            </div>
        `;

        this.hotelApp.showModal('booking-modal');
    }

    handleBooking() {
        if (!this.hotelApp.currentUser) {
            alert('Debes iniciar sesión para hacer una reserva');
            return;
        }

        const notes = document.getElementById('booking-notes').value;
        const roomId = this.selectedRoomId;
        
        if (!roomId) {
            alert('Error: No se pudo identificar la habitación');
            return;
        }

        const room = this.hotelApp.rooms.find(r => r.id === roomId);
        if (!room) {
            alert('Habitación no encontrada');
            return;
        }

        const isAvailable = this.hotelApp.checkRoomAvailability(roomId, this.currentSearch.checkIn, this.currentSearch.checkOut);

        if (!isAvailable) {
            alert('Esta habitación ya no está disponible');
            this.hotelApp.hideModals();
            this.searchAvailableRooms();
            return;
        }

        const reservation = this.hotelApp.createReservation(roomId, this.currentSearch.checkIn, this.currentSearch.checkOut, this.currentSearch.guests, notes);

        if (reservation) {
            this.hotelApp.hideModals();
            alert(`¡Reserva confirmada! Tu número de reserva es: ${reservation.id}`);
            document.getElementById('booking-form').reset();
            this.searchAvailableRooms();
        
        setTimeout(() => {
            const myReservationsTab = document.querySelector('[data-tab="my-reservations"]');
            if (myReservationsTab) myReservationsTab.click();
        }, 2000);
    }
    }

    loadUserReservations() {
        const loginRequired = document.getElementById('login-required');
        const reservationsList = document.getElementById('reservations-list');
        
        if (!this.hotelApp.currentUser) {
            if (loginRequired) loginRequired.style.display = 'block';
            if (reservationsList) reservationsList.style.display = 'none';
            return;
        }

        if (loginRequired) loginRequired.style.display = 'none';
        if (reservationsList) reservationsList.style.display = 'block';

        this.hotelApp.reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        const userReservations = this.hotelApp.reservations.filter(r => r.userId === this.hotelApp.currentUser.id);

        if (userReservations.length === 0) {
            reservationsList.innerHTML = `
                <div class="no-reservations">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No tienes reservas</h3>
                    <p>¡Haz tu primera reserva y disfruta de una estadía inolvidable!</p>
                    <button class="btn btn-primary" onclick="document.querySelector('[data-tab=&quot;search&quot;]').click()">
                        <i class="fas fa-search"></i> Buscar Habitaciones
                    </button>
                </div>
            `;
            return;
        }

        userReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        reservationsList.innerHTML = userReservations.map(reservation => {
            if (!reservation || !reservation.id) return '';

            const room = this.hotelApp.rooms.find(r => r.id === reservation.roomId);
            const statusClass = reservation.status === 'confirmed' ? 'status-confirmed' : 
                               reservation.status === 'cancelled' ? 'status-cancelled' : 'status-pending';
            
            const statusText = reservation.status === 'confirmed' ? 'Confirmada' : 
                              reservation.status === 'cancelled' ? 'Cancelada' : 'Pendiente';

            return `
                <div class="reservation-item">
                    <div class="reservation-header">
                        <div class="reservation-id">Reserva #${reservation.id}</div>
                        <span class="reservation-status ${statusClass}">${statusText}</span>
                    </div>
                    
                    <div class="reservation-details">
                        <div class="reservation-detail">
                            <span class="label">Habitación:</span>
                            <span class="value">${room ? room.name : 'N/A'}</span>
                        </div>
                        <div class="reservation-detail">
                            <span class="label">Fecha de Entrada:</span>
                            <span class="value">${this.hotelApp.formatDate(reservation.checkIn)}</span>
                        </div>
                        <div class="reservation-detail">
                            <span class="label">Fecha de Salida:</span>
                            <span class="value">${this.hotelApp.formatDate(reservation.checkOut)}</span>
                        </div>
                        <div class="reservation-detail">
                            <span class="label">Huéspedes:</span>
                            <span class="value">${reservation.guests} persona${reservation.guests > 1 ? 's' : ''}</span>
                        </div>
                        <div class="reservation-detail">
                            <span class="label">Fecha de Reserva:</span>
                            <span class="value">${this.hotelApp.formatDate(reservation.createdAt)}</span>
                        </div>
                        ${reservation.notes ? `
                            <div class="reservation-detail">
                                <span class="label">Notas:</span>
                                <span class="value">${reservation.notes}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="reservation-total">
                        <h3>Total: $${(reservation.totalPrice || 0).toLocaleString()}</h3>
                    </div>
                    <div class="reservation-actions">
                        <small class="admin-notice">Para modificar o cancelar reserva contactar con el administrador</small>
                    </div>
                </div>`;
        }).join('');
        
        this.setupReservationActionButtons();
    }

    setupReservationActionButtons() {
        // No action buttons needed for regular users
        // All reservation management is now handled by admin panel
    }

    // Reservation modification methods removed - only admin can modify reservations

    updateSearchLoginNotice() {
        const loginNotice = document.getElementById('search-login-notice');
        if (loginNotice) {
            loginNotice.style.display = this.hotelApp.currentUser ? 'none' : 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const initBooking = () => {
        if (window.hotelApp) {
            window.bookingManager = new BookingManager(window.hotelApp);
        } else {
            setTimeout(initBooking, 100);
        }
    };
    setTimeout(initBooking, 300);
});