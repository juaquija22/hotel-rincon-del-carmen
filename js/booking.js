// Sistema de Reservas - Gestión de Búsqueda y Reservaciones
/**
 * Clase que maneja todo el sistema de reservas del hotel
 * Busca disponibilidad, crea reservas, modifica y cancela
 */
class BookingManager {
    /**
     * Constructor: Inicializa el gestor de reservas
     * @param {HotelApp} hotelApp - Referencia a la aplicación principal
     */
    constructor(hotelApp) {
        this.hotelApp = hotelApp;
        this.currentSearch = null; // Almacena los parámetros de búsqueda actual
        this.setupEventListeners();
    }

    /**
     * Configura todos los eventos de los formularios de búsqueda y reserva
     * Formularios: búsqueda, reserva, modificación, pestañas
     */
    setupEventListeners() {
        setTimeout(() => {
            // Check authentication status and show/hide login notice
            this.updateSearchLoginNotice();
            
            // Search form
            const searchForm = document.getElementById('search-form');
            if (searchForm) {
                searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSearch();
                });
            }

            // Sort controls
            const sortSelect = document.getElementById('sort-by');
            if (sortSelect) {
                sortSelect.addEventListener('change', () => {
                    this.sortResults();
                });
            }

            // Booking form
            const bookingForm = document.getElementById('booking-form');
            if (bookingForm) {
                bookingForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleBooking();
                });
            }

            // Cancel booking button
            const cancelBookingBtn = document.getElementById('cancel-booking-btn');
            if (cancelBookingBtn) {
                cancelBookingBtn.addEventListener('click', () => {
                    this.hotelApp.hideModals();
                });
            }

            // Set minimum dates
            this.setMinimumDates();
            this.setupTabs();
            this.setupModifyModalEvents();
            this.setupModifyModalFormEvents();
        }, 200);
    }

    /**
     * Configura eventos del formulario de modificación de reservas
     * Botones de cancelar y enviar modificación
     */
    setupModifyModalFormEvents() {
        const cancelBtn = document.getElementById('cancel-modify-btn');
        const modifyForm = document.getElementById('modify-form');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hotelApp.hideModals();
            });
        }

        if (modifyForm) {
            modifyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleModifyReservation();
            });
        }
    }

    /**
     * Configura las pestañas de navegación (Buscar / Mis Reservas)
     * Cambia entre la vista de búsqueda y la vista de reservas del usuario
     */
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const targetPanel = document.getElementById(`${targetTab}-tab`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
                
                // Load reservations if switching to my-reservations tab
                if (targetTab === 'my-reservations') {
                    this.loadUserReservations();
                }
            });
        });
    }

    /**
     * Establece fechas mínimas en los campos de fecha
     * No permite seleccionar fechas pasadas
     */
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

    /**
     * Maneja el formulario de búsqueda de habitaciones
     * Valida datos, verifica autenticación y ejecuta la búsqueda
     */
    handleSearch() {
        // Verificar que el usuario esté autenticado
        if (!this.hotelApp.currentUser) {
            this.hotelApp.showMessage('Debes iniciar sesión para buscar habitaciones disponibles', 'error');
            
            // Sugerir inicio de sesión
            setTimeout(() => {
                if (confirm('¿Deseas iniciar sesión ahora?')) {
                    this.hotelApp.showModal('login-modal');
                }
            }, 100);
            return;
        }

        const checkInInput = document.getElementById('check-in');
        const checkOutInput = document.getElementById('check-out');
        const guestsInput = document.getElementById('guests');

        // Validar que los elementos existan
        if (!checkInInput || !checkOutInput || !guestsInput) {
            this.hotelApp.showMessage('Error: No se pudieron encontrar los campos de búsqueda', 'error');
            return;
        }

        const checkIn = checkInInput.value.trim();
        const checkOut = checkOutInput.value.trim();
        const guestsValue = guestsInput.value;

        // Validar que todos los campos estén completos
        if (!checkIn || !checkOut || !guestsValue) {
            this.hotelApp.showMessage('Por favor completa todos los campos de búsqueda', 'error');
            return;
        }

        // Convertir guests a número
        const guests = parseInt(guestsValue, 10);
        
        // Validar que guests sea un número válido
        if (isNaN(guests) || guests < 1) {
            this.hotelApp.showMessage('Por favor selecciona un número válido de huéspedes', 'error');
            return;
        }

        // Validar fechas
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Validar que las fechas sean válidas
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            this.hotelApp.showMessage('Por favor ingresa fechas válidas', 'error');
            return;
        }

        // Validar que la fecha de entrada no sea en el pasado
        if (checkInDate < today) {
            this.hotelApp.showMessage('La fecha de entrada no puede ser en el pasado', 'error');
            return;
        }

        // Validar que la fecha de salida sea posterior a la de entrada
        if (checkOutDate <= checkInDate) {
            this.hotelApp.showMessage('La fecha de salida debe ser posterior a la fecha de entrada', 'error');
            return;
        }

        // Guardar los datos de búsqueda
        this.currentSearch = { 
            checkIn: checkIn, 
            checkOut: checkOut, 
            guests: guests 
        };

        console.log('Búsqueda iniciada con:', this.currentSearch);

        // Realizar la búsqueda
        this.searchAvailableRooms();
    }

    /**
     * Realiza la búsqueda de habitaciones disponibles
     * Muestra un loading y luego los resultados encontrados
     */
    searchAvailableRooms() {
        // Validar que currentSearch existe
        if (!this.currentSearch) {
            this.hotelApp.showMessage('Error: No hay datos de búsqueda', 'error');
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            try {
            const availableRooms = this.hotelApp.getAvailableRooms(
                this.currentSearch.checkIn,
                this.currentSearch.checkOut,
                this.currentSearch.guests
            );

                console.log('Habitaciones encontradas:', availableRooms.length);
            this.displayResults(availableRooms);
            } catch (error) {
                console.error('Error en la búsqueda:', error);
                this.hotelApp.showMessage('Error al buscar habitaciones. Por favor intenta de nuevo.', 'error');
                document.getElementById('loading').style.display = 'none';
            }
        }, 800);
    }

    /**
     * Muestra el indicador de carga mientras se buscan habitaciones
     */
    showLoading() {
        const loading = document.getElementById('loading');
        const resultsSection = document.getElementById('results-section');
        const noResults = document.getElementById('no-results');
        
        if (loading) loading.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
    }

    /**
     * Muestra los resultados de la búsqueda en pantalla
     * @param {Array} rooms - Lista de habitaciones encontradas
     */
    displayResults(rooms) {
        const loading = document.getElementById('loading');
        const noResults = document.getElementById('no-results');
        const resultsSection = document.getElementById('results-section');
        
        if (loading) loading.style.display = 'none';
        
        if (!rooms || rooms.length === 0) {
            console.warn('No se encontraron habitaciones disponibles');
            console.log('Parámetros de búsqueda:', this.currentSearch);
            console.log('Total de habitaciones en sistema:', this.hotelApp.rooms.length);
            
            if (noResults) {
                noResults.style.display = 'block';
                // Agregar información adicional de ayuda
                const existingHelp = noResults.querySelector('.search-help');
                if (!existingHelp) {
                    const helpDiv = document.createElement('div');
                    helpDiv.className = 'search-help';
                    helpDiv.style.marginTop = '1rem';
                    helpDiv.style.color = 'var(--text-light)';
                    helpDiv.innerHTML = `
                        <p><strong>Sugerencias:</strong></p>
                        <ul style="text-align: left; display: inline-block;">
                            <li>Intenta con menos huéspedes</li>
                            <li>Selecciona fechas diferentes</li>
                            <li>Verifica que las fechas sean futuras</li>
                        </ul>
                    `;
                    noResults.appendChild(helpDiv);
                }
            }
            if (resultsSection) resultsSection.style.display = 'none';
            return;
        }

        if (noResults) noResults.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'block';
        
        this.updateResultsCount(rooms.length);
        this.renderRooms(rooms);
    }

    /**
     * Actualiza el contador de resultados encontrados
     * @param {number} count - Número de habitaciones encontradas
     */
    updateResultsCount(count) {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `${count} habitación${count !== 1 ? 'es' : ''} encontrada${count !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Renderiza (dibuja) las tarjetas de habitaciones en la pantalla
     * Muestra imagen, precio, características y botón de reservar
     * @param {Array} rooms - Lista de habitaciones a mostrar
     */
    renderRooms(rooms) {
        const roomsGrid = document.getElementById('rooms-grid');
        if (!roomsGrid) {
            console.error('No se encontró el elemento rooms-grid');
            return;
        }

        // Validar que currentSearch existe
        if (!this.currentSearch) {
            console.error('No hay datos de búsqueda disponibles');
            this.hotelApp.showMessage('Error: No hay datos de búsqueda', 'error');
            return;
        }

        const nights = this.hotelApp.calculateNights(this.currentSearch.checkIn, this.currentSearch.checkOut);
        
        try {
        roomsGrid.innerHTML = rooms.map(room => {
                if (!room || !room.id) {
                    console.error('Habitación inválida:', room);
                    return '';
                }

            const totalPrice = this.hotelApp.calculateTotalPrice(room.price, nights, this.currentSearch.guests);
            
            // Ajustar ruta de imagen si estamos en una subcarpeta
            const imagePath = room.image ? (room.image.startsWith('images/') ? '../' + room.image : room.image) : 'https://via.placeholder.com/500x300';
            
            return `
                <div class="room-card-detailed">
                    <div class="room-image-large">
                            <img src="${imagePath}" alt="${room.name}">
                        <div class="room-badge">Disponible</div>
                    </div>
                    <div class="room-content-detailed">
                        <h3 class="room-title-large">${room.name}</h3>
                        <div class="room-price-large">$${room.price.toLocaleString()} / noche</div>
                        <p class="room-description">${room.description}</p>
                        
                        <div class="room-details">
                            <div class="detail-item">
                                <i class="fas fa-bed"></i>
                                <span>${room.beds} cama${room.beds > 1 ? 's' : ''}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-users"></i>
                                <span>Hasta ${room.maxGuests} personas</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${nights} noche${nights > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        
                        <div class="room-features-detailed">
                            <h4>Servicios incluidos:</h4>
                            <ul class="features-list">
                                ${room.features.map(feature => `<li><i class="fas fa-check"></i>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="booking-info">
                            <h4>Detalles de tu reserva:</h4>
                            <div class="booking-details">
                                <div class="booking-detail">
                                    <span>Entrada</span>
                                    <small>${this.hotelApp.formatDate(this.currentSearch.checkIn)}</small>
                                </div>
                                <div class="booking-detail">
                                    <span>Salida</span>
                                    <small>${this.hotelApp.formatDate(this.currentSearch.checkOut)}</small>
                                </div>
                                <div class="booking-detail">
                                    <span>Huéspedes</span>
                                    <small>${this.currentSearch.guests} persona${this.currentSearch.guests > 1 ? 's' : ''}</small>
                                </div>
                                <div class="booking-detail">
                                    <span>Noches</span>
                                    <small>${nights}</small>
                                </div>
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
                </div>
            `;
        }).join('');
            
            console.log('Habitaciones renderizadas exitosamente');
        } catch (error) {
            console.error('Error al renderizar habitaciones:', error);
            this.hotelApp.showMessage('Error al mostrar las habitaciones', 'error');
        }
    }

    sortResults() {
        const sortBy = document.getElementById('sort-by').value;
        const roomsGrid = document.getElementById('rooms-grid');
        if (!roomsGrid || !this.currentSearch) return;

        const roomCards = Array.from(roomsGrid.children);
        
        roomCards.sort((a, b) => {
            const roomA = this.extractRoomData(a);
            const roomB = this.extractRoomData(b);
            
            switch (sortBy) {
                case 'price-asc': return roomA.price - roomB.price;
                case 'price-desc': return roomB.price - roomA.price;
                case 'guests-desc': return roomB.maxGuests - roomA.maxGuests;
                case 'guests-asc': return roomA.maxGuests - roomB.maxGuests;
                case 'name': return roomA.name.localeCompare(roomB.name);
                default: return 0;
            }
        });
        
        roomCards.forEach(card => roomsGrid.appendChild(card));
    }

    extractRoomData(cardElement) {
        try {
            const titleEl = cardElement.querySelector('.room-title-large');
            const priceEl = cardElement.querySelector('.room-price-large');
            const guestsEl = cardElement.querySelector('.detail-item:nth-child(2) span');
            
            if (!titleEl || !priceEl || !guestsEl) {
                console.error('No se pudieron encontrar elementos en la tarjeta');
                return { name: '', price: 0, maxGuests: 0 };
            }
            
            const title = titleEl.textContent.trim();
            const priceText = priceEl.textContent;
            const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
            
            const guestsText = guestsEl.textContent;
            const guestsMatch = guestsText.match(/\d+/);
            const maxGuests = guestsMatch ? parseInt(guestsMatch[0]) : 0;
        
        return { name: title, price, maxGuests };
        } catch (error) {
            console.error('Error al extraer datos de la tarjeta:', error);
            return { name: '', price: 0, maxGuests: 0 };
        }
    }

    showBookingModal(roomId) {
        if (!this.hotelApp.currentUser) {
            this.hotelApp.showMessage('Debes iniciar sesión para hacer una reserva', 'error');
            this.hotelApp.showModal('login-modal');
            return;
        }

        const room = this.hotelApp.rooms.find(r => r.id === roomId);
        if (!room) {
            this.hotelApp.showMessage('Habitación no encontrada', 'error');
            return;
        }

        // Check availability again
        const isAvailable = this.hotelApp.checkRoomAvailability(
            roomId, this.currentSearch.checkIn, this.currentSearch.checkOut
        );

        if (!isAvailable) {
            this.hotelApp.showMessage('Esta habitación ya no está disponible para las fechas seleccionadas', 'error');
            this.searchAvailableRooms();
            return;
        }

        this.selectedRoomId = roomId;
        const nights = this.hotelApp.calculateNights(this.currentSearch.checkIn, this.currentSearch.checkOut);
        const totalPrice = this.hotelApp.calculateTotalPrice(room.price, nights, this.currentSearch.guests);

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
            this.hotelApp.showMessage('Debes iniciar sesión para hacer una reserva', 'error');
            return;
        }

        const notes = document.getElementById('booking-notes').value;
        const roomId = this.selectedRoomId;
        
        if (!roomId) {
            this.hotelApp.showMessage('Error: No se pudo identificar la habitación', 'error');
            return;
        }

        const room = this.hotelApp.rooms.find(r => r.id === roomId);
        if (!room) {
            this.hotelApp.showMessage('Habitación no encontrada', 'error');
            return;
        }

        // Final availability check
        const isAvailable = this.hotelApp.checkRoomAvailability(
            roomId, this.currentSearch.checkIn, this.currentSearch.checkOut
        );

        if (!isAvailable) {
            this.hotelApp.showMessage('Esta habitación ya no está disponible', 'error');
            this.hotelApp.hideModals();
            this.searchAvailableRooms();
            return;
        }

        // Create reservation
        const reservation = this.hotelApp.createReservation(
            roomId, this.currentSearch.checkIn, this.currentSearch.checkOut, 
            this.currentSearch.guests, notes
        );

        if (reservation) {
        this.hotelApp.hideModals();
        this.hotelApp.showMessage(`¡Reserva confirmada! Tu número de reserva es: ${reservation.id}`, 'success');
        document.getElementById('booking-form').reset();
        this.searchAvailableRooms();
        
            // Switch to my reservations tab
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

        // Reload reservations from localStorage to ensure we have the latest data
        this.hotelApp.reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
        
        const userReservations = this.hotelApp.reservations.filter(
            reservation => reservation.userId === this.hotelApp.currentUser.id
        );
        

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

        // Sort reservations by creation date (newest first)
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
                        ${reservation.status === 'confirmed' ? `
                            <button class="btn btn-primary modify-reservation-btn" data-reservation-id="${reservation.id}">
                                <i class="fas fa-edit"></i> Modificar
                            </button>
                            <button class="btn btn-danger cancel-reservation-btn" data-reservation-id="${reservation.id}">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to action buttons
        this.setupReservationActionButtons();
    }

    setupReservationActionButtons() {
        // Cancel buttons
        const cancelButtons = document.querySelectorAll('.cancel-reservation-btn');
        cancelButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const reservationId = parseInt(this.getAttribute('data-reservation-id'));
                if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                    if (window.hotelApp.cancelReservation(reservationId)) {
                        window.hotelApp.showMessage('Reserva cancelada exitosamente', 'success');
                        window.bookingManager.loadUserReservations();
                    } else {
                        window.hotelApp.showMessage('Error al cancelar la reserva', 'error');
                    }
                }
            });
        });

        // Modify buttons
        const modifyButtons = document.querySelectorAll('.modify-reservation-btn');
        modifyButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const reservationId = parseInt(this.getAttribute('data-reservation-id'));
                window.bookingManager.showModifyModal(reservationId);
            });
        });
    }

    showModifyModal(reservationId) {
        const reservation = this.hotelApp.reservations.find(r => r.id === reservationId);
        if (!reservation) {
            this.hotelApp.showMessage('Reserva no encontrada', 'error');
            return;
        }

        const room = this.hotelApp.rooms.find(r => r.id === reservation.roomId);
        if (!room) {
            this.hotelApp.showMessage('Habitación no encontrada', 'error');
            return;
        }

        this.modifyingReservationId = reservationId;

        // Populate modal with current reservation data
        this.populateModifyModal(reservation, room);
        this.hotelApp.showModal('modify-modal');
    }

    setupModifyModalEvents() {
        const modal = document.getElementById('modify-modal');
        if (!modal) return;

        const checkInInput = modal.querySelector('#modify-check-in');
        const checkOutInput = modal.querySelector('#modify-check-out');
        const guestsSelect = modal.querySelector('#modify-guests');

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        checkInInput.min = today;

        // Handle check-in date change
        checkInInput.addEventListener('change', () => {
            checkOutInput.min = checkInInput.value;
            if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
                checkOutInput.value = '';
            }
            this.updateModifyPriceSummary();
        });

        // Handle check-out date change
        checkOutInput.addEventListener('change', () => {
            this.updateModifyPriceSummary();
        });

        // Handle guests change
        guestsSelect.addEventListener('change', () => {
            this.updateModifyPriceSummary();
        });
    }

    populateModifyModal(reservation, room) {
        // Populate reservation details
        const detailsDiv = document.getElementById('modify-reservation-details');
        detailsDiv.innerHTML = `
            <div style="background-color: var(--bg-light); padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Reserva Actual</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div><strong>Habitación:</strong><br>${room.name}</div>
                    <div><strong>Fecha de Entrada:</strong><br>${this.hotelApp.formatDate(reservation.checkIn)}</div>
                    <div><strong>Fecha de Salida:</strong><br>${this.hotelApp.formatDate(reservation.checkOut)}</div>
                    <div><strong>Huéspedes:</strong><br>${reservation.guests} persona${reservation.guests > 1 ? 's' : ''}</div>
                </div>
            </div>
        `;

        // Populate form fields
        document.getElementById('modify-check-in').value = reservation.checkIn;
        document.getElementById('modify-check-out').value = reservation.checkOut;
        document.getElementById('modify-guests').value = reservation.guests;
        document.getElementById('modify-notes').value = reservation.notes || '';

        // Update price summary
        this.updateModifyPriceSummary();
    }

    updateModifyPriceSummary() {
        const checkIn = document.getElementById('modify-check-in').value;
        const checkOut = document.getElementById('modify-check-out').value;
        const guests = parseInt(document.getElementById('modify-guests').value);

        if (!checkIn || !checkOut || !guests) {
            document.getElementById('modify-price-summary').innerHTML = '';
            return;
        }

        const reservation = this.hotelApp.reservations.find(r => r.id === this.modifyingReservationId);
        const room = this.hotelApp.rooms.find(r => r.id === reservation.roomId);
        
        const nights = this.hotelApp.calculateNights(checkIn, checkOut);
        const totalPrice = this.hotelApp.calculateTotalPrice(room.price, nights, guests);

        document.getElementById('modify-price-summary').innerHTML = `
            <div style="background-color: var(--primary-color); color: white; padding: 1rem; border-radius: var(--border-radius); text-align: center; margin: 1rem 0;">
                <h3 style="color: white; margin: 0;">Nuevo Total: $${totalPrice.toLocaleString()}</h3>
                <small>$${room.price.toLocaleString()} × ${nights} noche${nights > 1 ? 's' : ''}</small>
            </div>
        `;
    }

    handleModifyReservation() {
        if (!this.modifyingReservationId) {
            this.hotelApp.showMessage('Error: No se pudo identificar la reserva', 'error');
            return;
        }

        const checkIn = document.getElementById('modify-check-in').value;
        const checkOut = document.getElementById('modify-check-out').value;
        const guests = parseInt(document.getElementById('modify-guests').value);
        const notes = document.getElementById('modify-notes').value;

        if (!checkIn || !checkOut || !guests) {
            this.hotelApp.showMessage('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        if (new Date(checkIn) >= new Date(checkOut)) {
            this.hotelApp.showMessage('La fecha de salida debe ser posterior a la fecha de entrada', 'error');
            return;
        }

        // Check if new dates are available
        const reservation = this.hotelApp.reservations.find(r => r.id === this.modifyingReservationId);
        const isAvailable = this.hotelApp.checkRoomAvailabilityForModification(
            reservation.roomId, checkIn, checkOut, this.modifyingReservationId
        );

        if (!isAvailable) {
            this.hotelApp.showMessage('La habitación no está disponible para las nuevas fechas seleccionadas', 'error');
            return;
        }

        // Modify reservation
        const modifiedReservation = this.hotelApp.modifyReservation(
            this.modifyingReservationId, checkIn, checkOut, guests, notes
        );

        if (modifiedReservation) {
            this.hotelApp.hideModals();
            this.hotelApp.showMessage('¡Reserva modificada exitosamente!', 'success');
            this.loadUserReservations();
        } else {
            this.hotelApp.showMessage('Error al modificar la reserva', 'error');
        }
    }

    updateSearchLoginNotice() {
        const loginNotice = document.getElementById('search-login-notice');
        if (!loginNotice) return;

        // Mostrar u ocultar el aviso según el estado de autenticación
        if (!this.hotelApp.currentUser) {
            loginNotice.style.display = 'block';
        } else {
            loginNotice.style.display = 'none';
        }
    }
}

// Initialize BookingManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.hotelApp) {
            window.bookingManager = new BookingManager(window.hotelApp);
        } else {
            // Wait for hotelApp to be initialized
            const checkHotelApp = setInterval(() => {
                if (window.hotelApp) {
                    window.bookingManager = new BookingManager(window.hotelApp);
                    clearInterval(checkHotelApp);
                }
            }, 100);
        }
    }, 500);
});