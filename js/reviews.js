class ReviewsManager {
    constructor(hotelApp) {
        this.hotelApp = hotelApp;
        this.reviewsKey = 'hotel_reviews';
        this.reviews = JSON.parse(localStorage.getItem(this.reviewsKey) || '[]');
        this.maxReviews = 200;
        this.setupEventListeners();
        this.renderReviews();
        this.updateLoginNotice();
    }

    setupEventListeners() {
        const init = () => {
            const form = document.getElementById('review-form');
            const ratingInput = document.getElementById('review-rating');
            const ratingStars = document.querySelectorAll('#rating-input i');

            if (ratingStars.length) {
                ratingStars.forEach(star => {
                    star.addEventListener('mouseenter', () => this.paintStars(parseInt(star.dataset.value, 10)));
                    star.addEventListener('mouseleave', () => this.paintStars(parseInt(ratingInput.value || '0', 10)));
                    star.addEventListener('click', () => {
                        const value = parseInt(star.dataset.value, 10);
                        ratingInput.value = value;
                        this.paintStars(value);
                    });
                });
            }

            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSubmit();
                });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            setTimeout(init, 100);
        }
    }

    updateLoginNotice() {
        const notice = document.getElementById('login-required-reviews');
        if (notice) {
            notice.style.display = this.hotelApp && this.hotelApp.currentUser ? 'none' : 'block';
        }
    }

    paintStars(value) {
        const ratingStars = document.querySelectorAll('#rating-input i');
        ratingStars.forEach(star => {
            const starValue = parseInt(star.dataset.value, 10);
            star.classList.toggle('fa-solid', starValue <= value);
            star.classList.toggle('fa-regular', starValue > value);
        });
    }

    handleSubmit() {
        if (!this.hotelApp || !this.hotelApp.currentUser) {
            alert('Debes iniciar sesión para publicar una reseña');
            this.hotelApp && this.hotelApp.showModal && this.hotelApp.showModal('login-modal');
            return;
        }

        const rating = parseInt(document.getElementById('review-rating').value, 10) || 0;
        const title = document.getElementById('review-title').value.trim();
        const text = document.getElementById('review-text').value.trim();

        if (rating < 1 || rating > 5) {
            alert('Por favor selecciona una calificación (1-5)');
            return;
        }
        if (!title || !text) {
            alert('Por favor completa el título y tu reseña');
            return;
        }

        const newReview = {
            id: Date.now(),
            userId: this.hotelApp.currentUser.id,
            userName: this.hotelApp.currentUser.name,
            rating,
            title,
            text,
            createdAt: new Date().toISOString()
        };

        this.reviews.unshift(newReview);
        if (this.reviews.length > this.maxReviews) this.reviews.pop();
        localStorage.setItem(this.reviewsKey, JSON.stringify(this.reviews));

        document.getElementById('review-form').reset();
        document.getElementById('review-rating').value = '0';
        this.paintStars(0);
        this.renderReviews();
        this.refreshCarousel();
        alert('¡Gracias por tu reseña!');
    }

    renderReviews() {
        const container = document.getElementById('reviews-container');
        const empty = document.getElementById('no-reviews');
        if (!container) return;

        if (!this.reviews || this.reviews.length === 0) {
            if (empty) empty.style.display = 'block';
            container.innerHTML = '';
            return;
        }

        if (empty) empty.style.display = 'none';

        container.innerHTML = this.reviews.map(r => {
            const stars = Array.from({ length: 5 }, (_, i) => i < r.rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>').join('');
            return `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-user"><i class="fas fa-user"></i> ${r.userName}</div>
                        <div class="review-rating">${stars}</div>
                    </div>
                    <h3 class="review-title">${this.escape(r.title)}</h3>
                    <p class="review-text">${this.escape(r.text)}</p>
                    <div class="review-date">${this.formatDate(r.createdAt)}</div>
                </div>
            `;
        }).join('');
    }

    escape(text) {
        return text
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    formatDate(date) {
        try {
            return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return '';
        }
    }

    refreshCarousel() {
        try {
            const carousel = document.querySelector('testimonials-carousel');
            if (carousel && typeof carousel.refresh === 'function') {
                carousel.refresh();
            }
        } catch (_) {}
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const init = () => {
        if (window.hotelApp) {
            window.reviewsManager = new ReviewsManager(window.hotelApp);
        } else {
            setTimeout(init, 100);
        }
    };
    setTimeout(init, 200);
});


