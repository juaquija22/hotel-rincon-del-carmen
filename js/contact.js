document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const submitBtn = document.querySelector('.submit-btn');

    const saveMessage = (message) => {
        const key = 'hotel_messages';
        const messages = JSON.parse(localStorage.getItem(key) || '[]');
        messages.unshift(message);
        localStorage.setItem(key, JSON.stringify(messages.slice(0, 500)));
    };

    if (form && submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');

            if (!currentUser) {
                alert('Debes iniciar sesión para enviar un mensaje.');
                setTimeout(() => {
                    if (window.hotelApp && typeof window.hotelApp.showModal === 'function') {
                        window.hotelApp.showModal('login-modal');
                    }
                }, 100);
                return;
            }

            const data = {
                id: Date.now(),
                userId: currentUser.id,
                userName: currentUser.name,
                email: currentUser.email,
                phone: document.getElementById('contact-phone')?.value?.trim() || currentUser.phone || '',
                subject: document.getElementById('contact-subject')?.value || '',
                message: document.getElementById('contact-message')?.value?.trim() || '',
                createdAt: new Date().toISOString()
            };

            if (!data.subject || !data.message) {
                alert('Por favor completa el asunto y el mensaje.');
                return;
            }

            saveMessage(data);
            alert('¡Mensaje enviado! Nos pondremos en contacto contigo.');
            form.reset();
        });
    }
});


