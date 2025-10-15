// Web Components rendering into light DOM to preserve existing CSS/JS behavior

class SiteNavbar extends HTMLElement {
    connectedCallback() {
        const inPages = window.location.pathname.includes('/pages/');
        const base = inPages ? '../' : '';
        // Detect admin; redirect and/or hide navbar
        let isAdmin = false;
        try {
            const user = JSON.parse(localStorage.getItem('current_user') || 'null');
            isAdmin = !!(user && user.role === 'admin');
        } catch (_) {}

        if (isAdmin) {
            const onAdmin = window.location.pathname.endsWith('/admin.html') || window.location.pathname.endsWith('admin.html');
            if (!onAdmin) {
                // Redirect admins directly to the admin panel and avoid flashing the navbar
                window.location.href = inPages ? 'admin.html' : base + 'pages/admin.html';
            }
            // Do not render navbar for admins
            this.innerHTML = '';
            return;
        }
        this.innerHTML = `
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <h2>Hotel el Rincón del Carmen</h2>
            </div>
            <div class="nav-menu" id="nav-menu">
                <a href="${base}index.html" class="nav-link">Inicio</a>
                <a href="${base}pages/availability.html" class="nav-link">Reservas</a>
                <a href="${base}pages/reviews.html" class="nav-link">Reseñas</a>
                <a href="${base}pages/contact.html" class="nav-link">Contacto</a>
                <a href="#" class="nav-link" id="login-btn">Iniciar Sesión</a>
                <a href="#" class="nav-link" id="register-btn">Registrarse</a>
            </div>
            <div class="nav-toggle" id="nav-toggle">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>
        `;

        const markActive = () => {
            try {
                let currentPath = window.location.pathname;
                if (currentPath.endsWith('/')) currentPath += 'index.html';
                const links = this.querySelectorAll('.nav-menu .nav-link[href]');
                links.forEach(link => {
                    link.classList.remove('active');
                    const href = link.getAttribute('href');
                    if (!href || href === '#') return;
                    let linkPath = new URL(href, window.location.origin).pathname;
                    if (linkPath.endsWith('/')) linkPath += 'index.html';
                    if (linkPath === currentPath) {
                        link.classList.add('active');
                    }
                });
                const adminLink = this.querySelector('#admin-link');
                if (adminLink) {
                    const adminHref = adminLink.getAttribute('href');
                    if (adminHref) {
                        const adminPath = new URL(adminHref, window.location.origin).pathname;
                        if (adminPath === currentPath) adminLink.classList.add('active');
                    }
                }
            } catch (_) {}
        };

        markActive();
        setTimeout(markActive, 300);
    }
}

class HeroSection extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <section class="hero">
        <div class="hero-content">
            <h1 class="hero-title">Bienvenido a tu Refugio de Paz</h1>
            <p class="hero-subtitle">Descubre la magia del Hotel el Rincón del Carmen, donde la tranquilidad y el lujo se encuentran</p>
            <div class="hero-buttons">
                <a href="pages/availability.html" class="btn btn-primary">Reservar Ahora</a>
                <a href="#rooms" class="btn btn-secondary">Ver Habitaciones</a>
            </div>
        </div>
        <div class="hero-image">
            <img src="images/bienvenido-a-hotel-playa.jpg" alt="Hotel el Rincón del Carmen">
        </div>
    </section>
        `;
    }
}

class RoomsCarousel extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <section id="rooms" class="rooms-section">
        <div class="container">
            <h2 class="section-title">Nuestras Habitaciones</h2>
            <p class="section-subtitle">Espacios diseñados para tu máximo confort y relajación</p>
            <div class="rooms-carousel-css">
                <input type="radio" name="carousel" id="slide1" checked>
                <input type="radio" name="carousel" id="slide2">
                <input type="radio" name="carousel" id="slide3">
                <input type="radio" name="carousel" id="slide4">
                <input type="radio" name="carousel" id="slide5">
                <input type="radio" name="carousel" id="slide6">
                <div class="carousel-slides">
                    <div class="room-card">
                        <div class="room-image">
                            <img src="images/suit1.jpg" alt="Habitación Deluxe">
                        </div>
                        <div class="room-content">
                            <h3 class="room-title">Habitación Deluxe</h3>
                            <div class="room-price">$250.000 / noche</div>
                            <p>Amplia habitación con vista al jardín</p>
                            <ul class="room-features">
                                <li><i class="fas fa-check"></i>WiFi gratuito</li>
                                <li><i class="fas fa-check"></i>Minibar</li>
                                <li><i class="fas fa-check"></i>TV 55"</li>
                                <li><i class="fas fa-check"></i>Aire acondicionado</li>
                                <li><i class="fas fa-check"></i>Baño privado</li>
                            </ul>
                            <div class="room-info">
                                <small><i class="fas fa-bed"></i> 1 cama</small>
                                <small><i class="fas fa-users"></i> Hasta 2 personas</small>
                            </div>
                        </div>
                    </div>
                    <div class="room-card">
                        <div class="room-image">
                            <img src="images/suit2.jpg" alt="Suite Ejecutiva">
                        </div>
                        <div class="room-content">
                            <h3 class="room-title">Suite Ejecutiva</h3>
                            <div class="room-price">$450.000 / noche</div>
                            <p>Suite de lujo con sala de estar separada</p>
                            <ul class="room-features">
                                <li><i class="fas fa-check"></i>WiFi gratuito</li>
                                <li><i class="fas fa-check"></i>Minibar</li>
                                <li><i class="fas fa-check"></i>TV 65"</li>
                                <li><i class="fas fa-check"></i>Jacuzzi</li>
                                <li><i class="fas fa-check"></i>Sala de estar</li>
                                <li><i class="fas fa-check"></i>Vista panorámica</li>
                            </ul>
                            <div class="room-info">
                                <small><i class="fas fa-bed"></i> 2 camas</small>
                                <small><i class="fas fa-users"></i> Hasta 4 personas</small>
                            </div>
                        </div>
                    </div>
                    <div class="room-card">
                        <div class="room-image">
                            <img src="images/suit3.jpg" alt="Habitación Familiar">
                        </div>
                        <div class="room-content">
                            <h3 class="room-title">Habitación Familiar</h3>
                            <div class="room-price">$350.000 / noche</div>
                            <p>Perfecta para familias con niños</p>
                            <ul class="room-features">
                                <li><i class="fas fa-check"></i>WiFi gratuito</li>
                                <li><i class="fas fa-check"></i>Minibar</li>
                                <li><i class="fas fa-check"></i>TV 50"</li>
                                <li><i class="fas fa-check"></i>Aire acondicionado</li>
                                <li><i class="fas fa-check"></i>Cuna disponible</li>
                                <li><i class="fas fa-check"></i>Área de juegos</li>
                            </ul>
                            <div class="room-info">
                                <small><i class="fas fa-bed"></i> 3 camas</small>
                                <small><i class="fas fa-users"></i> Hasta 6 personas</small>
                            </div>
                        </div>
                    </div>
                    <div class="room-card">
                        <div class="room-image">
                            <img src="images/suit4.jpg" alt="Habitación Estándar">
                        </div>
                        <div class="room-content">
                            <h3 class="room-title">Habitación Estándar</h3>
                            <div class="room-price">$180.000 / noche</div>
                            <p>Cómoda habitación con todas las comodidades</p>
                            <ul class="room-features">
                                <li><i class="fas fa-check"></i>WiFi gratuito</li>
                                <li><i class="fas fa-check"></i>TV 43"</li>
                                <li><i class="fas fa-check"></i>Aire acondicionado</li>
                                <li><i class="fas fa-check"></i>Baño privado</li>
                                <li><i class="fas fa-check"></i>Vista al jardín</li>
                            </ul>
                            <div class="room-info">
                                <small><i class="fas fa-bed"></i> 1 cama</small>
                                <small><i class="fas fa-users"></i> Hasta 2 personas</small>
                            </div>
                        </div>
                    </div>
                    <div class="room-card">
                        <div class="room-image">
                            <img src="images/suit5.jpg" alt="Suite Presidencial">
                        </div>
                        <div class="room-content">
                            <h3 class="room-title">Suite Presidencial</h3>
                            <div class="room-price">$750.000 / noche</div>
                            <p>La máxima expresión de lujo y comodidad</p>
                            <ul class="room-features">
                                <li><i class="fas fa-check"></i>WiFi gratuito</li>
                                <li><i class="fas fa-check"></i>Minibar premium</li>
                                <li><i class="fas fa-check"></i>TV 75"</li>
                                <li><i class="fas fa-check"></i>Jacuzzi privado</li>
                                <li><i class="fas fa-check"></i>Terraza privada</li>
                                <li><i class="fas fa-check"></i>Servicio de mayordomo</li>
                                <li><i class="fas fa-check"></i>Vista panorámica</li>
                            </ul>
                            <div class="room-info">
                                <small><i class="fas fa-bed"></i> 1 cama</small>
                                <small><i class="fas fa-users"></i> Hasta 4 personas</small>
                            </div>
                        </div>
                    </div>
                    <div class="room-card">
                        <div class="room-image">
                            <img src="images/suit6.jpg" alt="Habitación Superior">
                        </div>
                        <div class="room-content">
                            <h3 class="room-title">Habitación Superior</h3>
                            <div class="room-price">$320.000 / noche</div>
                            <p>Elegante habitación con acabados de lujo</p>
                            <ul class="room-features">
                                <li><i class="fas fa-check"></i>WiFi gratuito</li>
                                <li><i class="fas fa-check"></i>Minibar</li>
                                <li><i class="fas fa-check"></i>TV 50"</li>
                                <li><i class="fas fa-check"></i>Aire acondicionado</li>
                                <li><i class="fas fa-check"></i>Baño privado</li>
                                <li><i class="fas fa-check"></i>Balcón privado</li>
                            </ul>
                            <div class="room-info">
                                <small><i class="fas fa-bed"></i> 2 camas</small>
                                <small><i class="fas fa-users"></i> Hasta 3 personas</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="carousel-nav">
                    <label for="slide1" class="nav-btn"></label>
                    <label for="slide2" class="nav-btn"></label>
                    <label for="slide3" class="nav-btn"></label>
                    <label for="slide4" class="nav-btn"></label>
                    <label for="slide5" class="nav-btn"></label>
                    <label for="slide6" class="nav-btn"></label>
                </div>
            </div>
        </div>
    </section>
        `;
    }
}

class HotelAreas extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <section class="areas-section">
        <div class="container">
            <h2 class="section-title">Nuestras Instalaciones</h2>
            <p class="section-subtitle">Descubre todos los espacios que tenemos para ti</p>
            <div class="areas-grid">
                <div class="area-card">
                    <div class="area-image">
                        <img src="images/restaurante.jpg" alt="Restaurante">
                    </div>
                    <div class="area-content">
                        <h3>Restaurante</h3>
                        <p>Disfruta de nuestra gastronomía local e internacional en un ambiente elegante y acogedor.</p>
                    </div>
                </div>
                <div class="area-card">
                    <div class="area-image">
                        <img src="images/spa.webp" alt="Spa & Bienestar">
                    </div>
                    <div class="area-content">
                        <h3>Spa & Bienestar</h3>
                        <p>Relájate y renueva tu energía con nuestros tratamientos de spa de clase mundial.</p>
                    </div>
                </div>
                <div class="area-card">
                    <div class="area-image">
                        <img src="images/piscina.jpg" alt="Piscina">
                    </div>
                    <div class="area-content">
                        <h3>Zonas Húmedas</h3>
                        <p>Refréscate en nuestras piscinas y disfruta de las áreas húmedas con vista panorámica.</p>
                    </div>
                </div>
                <div class="area-card">
                    <div class="area-image">
                        <img src="images/gimnasio.jpg" alt="Gimnasio">
                    </div>
                    <div class="area-content">
                        <h3>Gimnasio</h3>
                        <p>Mantén tu rutina de ejercicios en nuestro gimnasio completamente equipado.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
        `;
    }
}

class HotelServices extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <section class="services-section">
        <div class="container">
            <h2 class="section-title">Nuestros Servicios</h2>
            <p class="section-subtitle">Todo lo que necesitas para una estadía perfecta</p>
            <div class="services-grid">
                <div class="service-item">
                    <div class="service-icon">
                        <i class="fas fa-wifi"></i>
                    </div>
                    <h3>WiFi Gratuito</h3>
                    <p>Internet de alta velocidad en todas las áreas del hotel</p>
                </div>
                <div class="service-item">
                    <div class="service-icon">
                        <i class="fas fa-car"></i>
                    </div>
                    <h3>Estacionamiento</h3>
                    <p>Parqueadero seguro y gratuito para todos nuestros huéspedes</p>
                </div>
                <div class="service-item">
                    <div class="service-icon">
                        <i class="fas fa-concierge-bell"></i>
                    </div>
                    <h3>Servicio 24/7</h3>
                    <p>Nuestro equipo está disponible las 24 horas para asistirte</p>
                </div>
                <div class="service-item">
                    <div class="service-icon">
                        <i class="fas fa-utensils"></i>
                    </div>
                    <h3>Room Service</h3>
                    <p>Servicio a la habitación disponible durante todo el día</p>
                </div>
                <div class="service-item">
                    <div class="service-icon">
                        <i class="fas fa-plane"></i>
                    </div>
                    <h3>Traslados</h3>
                    <p>Servicio de traslado al aeropuerto y principales destinos</p>
                </div>
                <div class="service-item">
                    <div class="service-icon">
                        <i class="fas fa-baby"></i>
                    </div>
                    <h3>Servicios Familiares</h3>
                    <p>Actividades y servicios especiales para toda la familia</p>
                </div>
            </div>
        </div>
    </section>
        `;
    }
}

class HotelCta extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <section class="cta-section">
        <div class="container">
            <div class="cta-content">
                <h2>¿Listo para tu próxima escapada?</h2>
                <p>Reserva ahora y disfruta de una experiencia inolvidable en el Hotel el Rincón del Carmen</p>
                <a href="pages/availability.html" class="btn btn-primary btn-large">Reservar Mi Habitación</a>
            </div>
        </div>
    </section>
        `;
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        const inPages = window.location.pathname.includes('/pages/');
        const base = inPages ? '../' : '';
        this.innerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Hotel el Rincón del Carmen</h3>
                    <p>Tu refugio de paz y tranquilidad en el corazón de la ciudad.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Enlaces Rápidos</h4>
                    <ul>
                        <li><a href="${base}index.html">Inicio</a></li>
                        <li><a href="${base}pages/availability.html">Reservas</a></li>
                        <li><a href="${base}pages/reviews.html">Reseñas</a></li>
                        <li><a href="${base}pages/contact.html">Contacto</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contacto</h4>
                    <p><i class="fas fa-phone"></i> +57 316 6365 224</p>
                    <p><i class="fas fa-envelope"></i> juaquija22@gmail.com</p>
                    <p><i class="fas fa-map-marker-alt"></i> Bucaramanga</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Hotel el Rincón del Carmen. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
        `;
    }
}

class AuthModals extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <div id="login-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Iniciar Sesión</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="login-email">Email:</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Contraseña:</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
            </form>
            <p>¿No tienes cuenta? <a href="#" id="show-register">Regístrate aquí</a></p>
        </div>
    </div>
    <div id="register-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Registrarse</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="register-id">Número de Identificación:</label>
                    <input type="text" id="register-id" required>
                </div>
                <div class="form-group">
                    <label for="register-name">Nombre Completo:</label>
                    <input type="text" id="register-name" required>
                </div>
                <div class="form-group">
                    <label for="register-nationality">Nacionalidad:</label>
                    <input type="text" id="register-nationality" required>
                </div>
                <div class="form-group">
                    <label for="register-email">Email:</label>
                    <input type="email" id="register-email" required>
                </div>
                <div class="form-group">
                    <label for="register-phone">Teléfono:</label>
                    <input type="tel" id="register-phone" required>
                </div>
                <div class="form-group">
                    <label for="register-password">Contraseña:</label>
                    <input type="password" id="register-password" required>
                </div>
                <button type="submit" class="btn btn-primary">Registrarse</button>
            </form>
            <p>¿Ya tienes cuenta? <a href="#" id="show-login">Inicia sesión aquí</a></p>
        </div>
    </div>
        `;
    }
}

customElements.define('site-navbar', SiteNavbar);
customElements.define('hero-section', HeroSection);
customElements.define('rooms-carousel', RoomsCarousel);
customElements.define('hotel-areas', HotelAreas);
customElements.define('hotel-services', HotelServices);
customElements.define('hotel-cta', HotelCta);
customElements.define('site-footer', SiteFooter);
customElements.define('auth-modals', AuthModals);

class TestimonialsCarousel extends HTMLElement {
    connectedCallback() {
        this.defaultReviews = [
            { initials: 'LC', name: 'Laura C.', subtitle: 'Estadía en Suite Ejecutiva', rating: 5, text: '“Una experiencia inolvidable. El personal fue increíble y las instalaciones superaron nuestras expectativas.”' },
            { initials: 'JM', name: 'Julián M.', subtitle: 'Estadía en Habitación Deluxe', rating: 4, text: '“Excelente ubicación y habitaciones muy cómodas. El desayuno fue espectacular.”' },
            { initials: 'PG', name: 'Paula G.', subtitle: 'Estadía en Habitación Familiar', rating: 5, text: '“Ideal para familias. Mis hijos amaron la piscina y el área de juegos. ¡Volveremos!”' },
            { initials: 'RS', name: 'Rafael S.', subtitle: 'Estadía en Habitación Superior', rating: 4, text: '“Spa de primer nivel y atención 24/7 realmente útil. Muy recomendado.”' },
        ];

        this.render();
    }
    getAllReviews() {
        try {
            const stored = JSON.parse(localStorage.getItem('hotel_reviews') || '[]');
            const mapped = Array.isArray(stored) ? stored.map(r => ({
                initials: (r.userName || 'HU').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase(),
                name: r.userName || 'Huésped',
                subtitle: this.formatDate(r.createdAt),
                rating: Math.max(1, Math.min(5, parseInt(r.rating || 0, 10))),
                text: `“${this.escape(r.title)} - ${this.escape(r.text)}”`
            })) : [];
            return [...this.defaultReviews, ...mapped].slice(0, 8);
        } catch {
            return this.defaultReviews;
        }
    }

    render() {
        const reviews = this.getAllReviews();
        const inputs = reviews.map((_, idx) => `<input type="radio" name="t-carousel" id="t${idx+1}" ${idx===0?'checked':''}>`).join('');
        const slides = reviews.map(r => `
            <div class="testimonial-card">
                <div class="testimonial-stars">${this.renderStars(r.rating)}</div>
                <p class="testimonial-quote">${r.text}</p>
                <div class="testimonial-user">
                    <div class="avatar">${this.escape(r.initials)}</div>
                    <div>
                        <h4>${this.escape(r.name)}</h4>
                        <small>${this.escape(r.subtitle)}</small>
                    </div>
                </div>
            </div>
        `).join('');
        const nav = reviews.map((_, idx) => `<label for="t${idx+1}" class="nav-btn"></label>`).join('');

        this.innerHTML = `
    <section class="testimonials-section">
        <div class="container">
            <h2 class="section-title">Lo que dicen nuestros huéspedes</h2>
            <p class="section-subtitle">Experiencias reales que inspiran confianza</p>
            <div class="testimonials-carousel-css">
                ${inputs}
                <div class="testimonials-slides">${slides}</div>
                <div class="testimonials-nav">${nav}</div>
            </div>
        </div>
    </section>`;
    }

    refresh() { this.render(); }

    renderStars(n) {
        const count = Math.max(0, Math.min(5, parseInt(n || 0, 10)));
        return Array.from({length:5}, (_,i)=> i < count ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>').join('');
    }

    escape(text='') {
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    formatDate(date) {
        try { return new Date(date).toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' }); }
        catch { return ''; }
    }
}

customElements.define('testimonials-carousel', TestimonialsCarousel);


