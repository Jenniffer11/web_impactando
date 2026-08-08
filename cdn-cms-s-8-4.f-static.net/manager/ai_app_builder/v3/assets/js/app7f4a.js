// Explain: Studio interactions for booking forms, navigation, and scroll CTA
document.addEventListener('DOMContentLoaded', function() {
    var mobileBookButton = document.getElementById('mobileBookButton');
    var bookingOverlay = document.getElementById('bookingOverlay');
    var closeBookingOverlay = document.getElementById('closeBookingOverlay');
    var bookingForm = document.getElementById('bookingForm');
    var overlayBookingForm = document.getElementById('overlayBookingForm');

    // Navigation Overlay Elements
    var navOpenButton = document.getElementById('navOpenButton');
    var navCloseButton = document.getElementById('navCloseButton');
    var navOverlay = document.getElementById('navOverlay');
    var navCloseLinks = document.querySelectorAll('.nav-close-link');

    // Form Status Handlers
    function showStatus(formEl, type, message) {
        var key = formEl && formEl.id === 'overlayBookingForm' ? 'overlay' : 'booking';
        var status = document.querySelector('[data-form-status="' + key + '"]');
        if (!status) {
            return;
        }
        status.textContent = message;
        status.classList.remove('success', 'error');
        status.classList.add(type);
    }

    function setSubmitting(formEl, isSubmitting) {
        if (!formEl) {
            return;
        }
        var button = formEl.querySelector('button[type="submit"]');
        if (!button) {
            return;
        }
        button.disabled = isSubmitting;
        button.textContent = isSubmitting ? 'Enviando...' : 'Enviar Mensaje';
    }

    function submitBookingForm(formEl) {
        if (!formEl) {
            return;
        }
        if (!formEl.checkValidity()) {
            formEl.reportValidity();
            return;
        }
        if (!window.MessagesSystem || typeof window.MessagesSystem.submit !== 'function') {
            showStatus(formEl, 'error', 'El envío no está disponible temporalmente. Intenta nuevamente.');
            return;
        }

        setSubmitting(formEl, true);
        showStatus(formEl, 'success', 'Enviando tu mensaje...');

        var webhookUrl = 'https://hook.us2.make.com/m7xevvxsyww6kihhxy286elhyzbjel2e';
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: formEl.name.value,
                correo: formEl.email.value,
                peticion: formEl.message.value
            })
        }).catch(function(error) {
            console.error('Error enviando datos al webhook:', error);
        });

        window.MessagesSystem.submit([
            { label: 'Nombre', value: formEl.name.value, type: 'text' },
            { label: 'Correo', value: formEl.email.value, type: 'email' },
            { label: 'Petición', value: formEl.message.value, type: 'textarea' }
        ], formEl).then(function(response) {
            if (response && response.success) {
                formEl.reset();
                showStatus(formEl, 'success', '¡Gracias! Nos comunicaremos contigo pronto.');
            } else {
                showStatus(formEl, 'error', response && response.error ? response.error : 'Tu mensaje no pudo ser enviado. Intenta de nuevo.');
            }
        }).catch(function() {
            showStatus(formEl, 'error', 'Un problema de conexión impidió el envío. Intenta nuevamente.');
        }).finally(function() {
            setSubmitting(formEl, false);
        });
    }

    // Overlay controls for Booking
    function openBookingOverlay() {
        if (!bookingOverlay) {
            return;
        }
        bookingOverlay.classList.add('is-open');
        bookingOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var firstInput = bookingOverlay.querySelector('input[name="name"]');
        if (firstInput) {
            firstInput.focus();
        }
    }

    function closeBookingOverlayFn() {
        if (!bookingOverlay) {
            return;
        }
        bookingOverlay.classList.remove('is-open');
        bookingOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Overlay controls for Navigation
    function openNav() {
        if (!navOverlay) return;
        navOverlay.classList.remove('hidden');
        navOverlay.classList.add('flex');
        navOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        if (!navOverlay) return;
        navOverlay.classList.add('hidden');
        navOverlay.classList.remove('flex');
        navOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Global Exposition for Dynamically Created Listeners
    window.openBookingOverlay = openBookingOverlay;
    
    window.registerCrusade = function(locationName) {
        var titleElem = document.getElementById('crusadeModalTitle');
        var hiddenField = document.getElementById('crusadeNameField');
        if (titleElem) {
            titleElem.textContent = "Cruzada en " + locationName;
        }
        if (hiddenField) {
            hiddenField.value = locationName;
        }
        var modal = document.getElementById('crusadeModal');
        if (modal) {
            modal.showModal();
        }
    };

    window.processDonation = function(uid, btn) {
        if (!uid || !window.OrderSystem) {
            alert('El sistema de donaciones se está configurando. Por favor, realiza la siembra directamente a nuestra cuenta bancaria.');
            return;
        }
        var originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> PROCESANDO...';
        btn.disabled = true;
        
        window.OrderSystem.addToCart({ unique_id_txt: uid }, 1).then(function(r) {
            if (r.success) {
                window.OrderSystem.checkout({}).then(function(cr) {
                    if (!cr.success) {
                        alert(cr.error || 'Ocurrió un error en el pago.');
                        btn.innerHTML = originalHtml;
                        btn.disabled = false;
                    }
                });
            } else {
                alert(r.error || 'Error al conectar con la plataforma.');
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }).catch(function() {
             btn.innerHTML = originalHtml;
             btn.disabled = false;
        });
    };

    // Listener for Formulario Únete a la Familia (Acompañamiento)
    var joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var formEl = event.currentTarget;
            if (!formEl.checkValidity()) {
                formEl.reportValidity();
                return;
            }
            if (!window.MessagesSystem) return;

            var button = formEl.querySelector('button[type="submit"]');
            var originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

            var status = formEl.querySelector('[data-form-status="join"]');
            if(status) {
                status.textContent = 'Enviando...';
                status.className = 'form-status text-xs text-center min-h-[1rem]';
            }
            
            var phoneStr = (formEl.phoneCode ? formEl.phoneCode.value + ' ' : '') + formEl.phone.value;

            var joinWebhookUrl = 'https://hook.us2.make.com/bfc9dx7k41nxw3r5qd0ri025dw11thlu'; // URL actualizada confirmada
            fetch(joinWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formEl.firstName.value,
                    apellido: formEl.lastName.value,
                    telefono: phoneStr,
                    correo: formEl.email.value,
                    formulario: 'Acompañamiento y Consolidación'
                })
            }).catch(function(error) {
                console.error('Error enviando datos al webhook:', error);
            });

            window.MessagesSystem.submit([
                { label: 'Nombre', value: formEl.firstName.value, type: 'text' },
                { label: 'Apellido', value: formEl.lastName.value, type: 'text' },
                { label: 'Teléfono', value: phoneStr, type: 'tel' },
                { label: 'Email', value: formEl.email.value, type: 'email' },
                { label: 'Formulario', value: 'Acompañamiento y Consolidación', type: 'text' }
            ], formEl).then(function(r) {
                if (r && r.success) {
                    if(status) {
                        status.textContent = '¡Gracias! Nos pondremos en contacto contigo.';
                        status.classList.add('text-[#10B981]');
                    }
                    formEl.reset();
                    setTimeout(function() {
                        var modal = document.getElementById('joinModal');
                        if (modal) modal.close();
                        if(status) status.textContent = '';
                    }, 3000);
                } else {
                    if(status) {
                        status.textContent = r.error || 'Ocurrió un error. Intenta nuevamente.';
                        status.classList.add('text-[#EF4444]');
                    }
                }
            }).finally(function() {
                button.disabled = false;
                button.innerHTML = originalText;
            });
        });
    }

    // Listener for Formulario Donación
    var donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var formEl = event.currentTarget;
            if (!formEl.checkValidity()) {
                formEl.reportValidity();
                return;
            }
            if (!window.MessagesSystem) return;

            var button = formEl.querySelector('button[type="submit"]');
            var originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

            var status = formEl.querySelector('[data-form-status="donation"]');
            if(status) {
                status.textContent = 'Enviando...';
                status.className = 'form-status text-xs text-center min-h-[1rem] mt-2';
            }

            var donationWebhookUrl = 'https://hook.us2.make.com/d4un5ole4a0ek2ed81ano7nquisqoy94';
            fetch(donationWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formEl.fullName.value || 'Anónimo',
                    telefono: formEl.phone.value || 'No provisto',
                    banco: formEl.bank.value || 'No provisto',
                    monto: formEl.amount.value || 'No provisto',
                    formulario: 'Confirmación de Siembra'
                })
            }).catch(function(error) {
                console.error('Error enviando datos al webhook de donaciones:', error);
            });

            window.MessagesSystem.submit([
                { label: 'Nombre y Apellido', value: formEl.fullName.value || 'Anónimo', type: 'text' },
                { label: 'Teléfono', value: formEl.phone.value || 'No provisto', type: 'tel' },
                { label: 'Banco', value: formEl.bank.value || 'No provisto', type: 'select' },
                { label: 'Monto Donado', value: formEl.amount.value || 'No provisto', type: 'text' },
                { label: 'Formulario', value: 'Confirmación de Siembra', type: 'text' }
            ], formEl).then(function(r) {
                if (r && r.success) {
                    if(status) {
                        status.textContent = '¡Gracias! Hemos registrado tu donación y petición.';
                        status.classList.add('text-[#10B981]');
                    }
                    formEl.reset();
                    setTimeout(function() {
                        var modal = document.getElementById('donationModal');
                        if (modal) modal.close();
                        if(status) status.textContent = '';
                    }, 3000);
                } else {
                    if(status) {
                        status.textContent = r.error || 'Ocurrió un error. Intenta nuevamente.';
                        status.classList.add('text-[#EF4444]');
                    }
                }
            }).finally(function() {
                button.disabled = false;
                button.innerHTML = originalText;
            });
        });
    }

    // Listener for Formulario Registro Cruzada
    var crusadeForm = document.getElementById('crusadeForm');
    if (crusadeForm) {
        crusadeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var formEl = event.currentTarget;
            if (!formEl.checkValidity()) {
                formEl.reportValidity();
                return;
            }
            if (!window.MessagesSystem) return;

            var button = formEl.querySelector('button[type="submit"]');
            var originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

            var status = formEl.querySelector('[data-form-status="crusade"]');
            if(status) {
                status.textContent = 'Enviando...';
                status.className = 'form-status text-xs text-center min-h-[1rem] mt-2';
            }

            var crusadeWebhookUrl = 'https://hook.us2.make.com/fk6qlyxkr93wricesv2gpcfmti3uxrsu';
            fetch(crusadeWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cruzada: formEl.crusadeName.value,
                    nombre: formEl.firstName.value,
                    apellido: formEl.lastName.value,
                    personas: formEl.peopleCount.value,
                    telefono: formEl.phone.value,
                    correo: formEl.email.value,
                    ubicacion: formEl.location.value
                })
            }).catch(function(error) {
                console.error('Error enviando datos al webhook de cruzadas:', error);
            });

            window.MessagesSystem.submit([
                { label: 'Formulario', value: 'Registro de Asistencia a Cruzada', type: 'text' },
                { label: 'Cruzada de Interés', value: formEl.crusadeName.value, type: 'text' },
                { label: 'Nombre', value: formEl.firstName.value, type: 'text' },
                { label: 'Apellido', value: formEl.lastName.value, type: 'text' },
                { label: 'Total de personas', value: formEl.peopleCount.value, type: 'number' },
                { label: 'Teléfono', value: formEl.phone.value, type: 'tel' },
                { label: 'Email', value: formEl.email.value || 'No provisto', type: 'email' },
                { label: 'Ubicación/Procedencia', value: formEl.location.value || 'No provista', type: 'text' }
            ], formEl).then(function(r) {
                if (r && r.success) {
                    if(status) {
                        status.textContent = '¡Tu asistencia fue registrada! Nos vemos allí.';
                        status.classList.add('text-[#10B981]');
                    }
                    formEl.reset();
                    setTimeout(function() {
                        var modal = document.getElementById('crusadeModal');
                        if (modal) modal.close();
                        if(status) status.textContent = '';
                    }, 3000);
                } else {
                    if(status) {
                        status.textContent = r.error || 'Ocurrió un error. Intenta nuevamente.';
                        status.classList.add('text-[#EF4444]');
                    }
                }
            }).finally(function() {
                button.disabled = false;
                button.innerHTML = originalText;
            });
        });
    }

    // Listeners for Forms and Bookings
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitBookingForm(event.currentTarget);
        });
    }

    if (overlayBookingForm) {
        overlayBookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitBookingForm(event.currentTarget);
        });
    }

    if (mobileBookButton) {
        mobileBookButton.addEventListener('click', openBookingOverlay);
    }

    if (closeBookingOverlay) {
        closeBookingOverlay.addEventListener('click', closeBookingOverlayFn);
    }

    if (bookingOverlay) {
        bookingOverlay.addEventListener('click', function(event) {
            if (event.target === bookingOverlay) {
                closeBookingOverlayFn();
            }
        });
    }

    // Listeners for Navigation Menu
    if (navOpenButton) {
        navOpenButton.addEventListener('click', openNav);
    }

    if (navCloseButton) {
        navCloseButton.addEventListener('click', closeNav);
    }

    if (navCloseLinks) {
        navCloseLinks.forEach(function(link) {
            link.addEventListener('click', closeNav);
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeBookingOverlayFn();
            closeNav();
        }
    });

    // Listener for Formulario Bautizos
    var bautizosForm = document.getElementById('bautizosForm');
    if (bautizosForm) {
        bautizosForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var formEl = event.currentTarget;
            if (!formEl.checkValidity()) {
                formEl.reportValidity();
                return;
            }
            if (!window.MessagesSystem) return;

            var button = formEl.querySelector('button[type="submit"]');
            var originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Procesando...';

            var status = formEl.querySelector('[data-form-status="bautizos"]');
            if(status) {
                status.textContent = 'Enviando...';
                status.className = 'form-status text-xs text-center min-h-[1rem] mt-4 font-semibold';
            }

            var bautizosWebhookUrl = 'https://hook.us2.make.com/twh8ufpgejwghec1x8mzmmi89tkvkglb';
            fetch(bautizosWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formEl.fullName.value,
                    fecha_nacimiento: formEl.birthDate.value,
                    edad: formEl.age.value,
                    direccion: formEl.address.value,
                    telefono: formEl.phone.value,
                    correo: formEl.email.value,
                    formulario: 'Inscripción para Bautizos'
                })
            }).catch(function(error) {
                console.error('Error enviando datos al webhook de bautizos:', error);
            });

            window.MessagesSystem.submit([
                { label: 'Formulario', value: 'Inscripción para Bautizos', type: 'text' },
                { label: 'Nombres y Apellidos', value: formEl.fullName.value, type: 'text' },
                { label: 'Fecha de Nacimiento', value: formEl.birthDate.value, type: 'date' },
                { label: 'Edad', value: formEl.age.value, type: 'number' },
                { label: 'Dirección', value: formEl.address.value, type: 'text' },
                { label: 'Teléfono', value: formEl.phone.value, type: 'tel' },
                { label: 'Email', value: formEl.email.value, type: 'email' }
            ], formEl).then(function(r) {
                if (r && r.success) {
                    if(status) {
                        status.textContent = '¡Inscripción enviada exitosamente! Nos contactaremos pronto.';
                        status.classList.add('text-[#10B981]');
                    }
                    formEl.reset();
                } else {
                    if(status) {
                        status.textContent = r.error || 'Ocurrió un error. Intenta nuevamente.';
                        status.classList.add('text-[#EF4444]');
                    }
                }
            }).finally(function() {
                button.disabled = false;
                button.innerHTML = originalText;
            });
        });
    }

    // Desplazamiento suave para todos los enlaces internos (Smooth Scroll)
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId !== '#' && targetId !== '') {
                var targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});