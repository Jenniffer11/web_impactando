document.addEventListener("DOMContentLoaded", () => {


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxhsqnsENZztW1RpJ3A4XdSkYDTq6Z-oCLFuuDCv6un9mderLcVveD-rMt2kaMlFQqUMw/exec";


/* =========================================================
   MENÚ MÓVIL
   ========================================================= */

const navOverlay = document.getElementById("navOverlay");
const navOpenButton = document.getElementById("navOpenButton");
const navCloseButton = document.getElementById("navCloseButton");
const navCloseLinks = Array.from(
    document.querySelectorAll(".nav-close-link")
);

const setOverlayState = (isOpen) => {
    if (!navOverlay) return;

    navOverlay.classList.toggle("hidden", !isOpen);
    navOverlay.setAttribute("aria-hidden", String(!isOpen));

    document.body.style.overflow = isOpen ? "hidden" : "";
};

if (navOpenButton) {
    navOpenButton.addEventListener("click", () => {
        setOverlayState(true);
    });
}

if (navCloseButton) {
    navCloseButton.addEventListener("click", () => {
        setOverlayState(false);
    });
}

navCloseLinks.forEach((link) => {
    link.addEventListener("click", () => {
        setOverlayState(false);
    });
});

window.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        navOverlay &&
        !navOverlay.classList.contains("hidden")
    ) {
        setOverlayState(false);
    }
});


/* =========================================================
   SISTEMA DE MENSAJES
   ========================================================= */

function getStatusElement(form) {
    return form.querySelector(".form-status");
}

function showStatus(form, message, type = "success") {
    const status = getStatusElement(form);

    if (!status) return;

    status.textContent = message;

    status.classList.remove(
        "text-[#10B981]",
        "text-[#EF4444]",
        "text-green-600",
        "text-red-600"
    );

    if (type === "success") {
        status.classList.add("text-[#10B981]");
    } else {
        status.classList.add("text-[#EF4444]");
    }
}


/* =========================================================
   BOTÓN DE ENVÍO
   ========================================================= */

function setButtonState(form, loading) {
    const button = form.querySelector(
        'button[type="submit"]'
    );

    if (!button) return;

    if (loading) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.innerHTML;
        }

        button.disabled = true;

        button.innerHTML =
            '<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...';

        button.style.opacity = "0.7";

    } else {
        button.disabled = false;

        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }

        button.style.opacity = "";
    }
}


/* =========================================================
   ENVIAR DATOS A GOOGLE SHEETS
   ========================================================= */

async function sendToGoogleSheets(form, formType) {

    const formData = new FormData(form);

    const data = {
        formType: formType
    };

    formData.forEach((value, key) => {
        data[key] = value;
    });


    /* ---------------------------------------------------------
       CRUZADAS
       --------------------------------------------------------- */

    if (formType === "cruzadas") {

        const crusadeNameField =
            document.getElementById("crusadeNameField");

        if (crusadeNameField) {
            data.crusadeName =
                crusadeNameField.value || "";
        }
    }


    /* ---------------------------------------------------------
       ENVÍO
       --------------------------------------------------------- */

    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
    });

    /*
     * Apps Script responde correctamente con no-cors,
     * pero el navegador no permite leer esa respuesta.
     *
     * Si fetch no lanza un error, consideramos que
     * la solicitud fue enviada.
     */

    return response;
}


/* =========================================================
   PROCESADOR GENERAL DE FORMULARIOS
   ========================================================= */

async function processForm(form, formType) {

    if (!form) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    setButtonState(form, true);

    showStatus(
        form,
        "Enviando información...",
        "success"
    );

    try {

        await sendToGoogleSheets(
            form,
            formType
        );

        /*
         * IMPORTANTE:
         * limpiamos completamente el formulario
         * después del envío.
         */

        form.reset();

        /*
         * Dejamos el mensaje en el mismo formulario.
         * No hacemos scroll.
         * No cambiamos de página.
         */

        showStatus(
            form,
            "✓ Enviado correctamente.",
            "success"
        );

    } catch (error) {

        console.error(
            "Error enviando formulario:",
            error
        );

        showStatus(
            form,
            "No se pudo enviar la información. Inténtalo nuevamente.",
            "error"
        );

    } finally {

        setButtonState(form, false);
    }
}


/* =========================================================
   PETICIONES / ORACIÓN
   ========================================================= */

const bookingForm =
    document.getElementById("bookingForm");

const overlayBookingForm =
    document.getElementById("overlayBookingForm");


if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            processForm(
                bookingForm,
                "peticiones"
            );
        }
    );
}


if (overlayBookingForm) {

    overlayBookingForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            processForm(
                overlayBookingForm,
                "peticiones"
            );
        }
    );
}


/* =========================================================
   FORMULARIO MÓVIL DE PETICIONES
   ========================================================= */

const mobileBookButton =
    document.getElementById("mobileBookButton");

const bookingOverlay =
    document.getElementById("bookingOverlay");

const closeBookingOverlay =
    document.getElementById("closeBookingOverlay");


function openBookingOverlay() {

    if (!bookingOverlay) return;

    bookingOverlay.classList.add("is-open");

    bookingOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";

    const firstInput =
        bookingOverlay.querySelector(
            'input[name="name"]'
        );

    if (firstInput) {
        firstInput.focus();
    }
}


function closeBookingOverlayFn() {

    if (!bookingOverlay) return;

    bookingOverlay.classList.remove(
        "is-open"
    );

    bookingOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";
}


if (mobileBookButton) {

    mobileBookButton.addEventListener(
        "click",
        openBookingOverlay
    );
}


if (closeBookingOverlay) {

    closeBookingOverlay.addEventListener(
        "click",
        closeBookingOverlayFn
    );
}


if (bookingOverlay) {

    bookingOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === bookingOverlay
            ) {
                closeBookingOverlayFn();
            }
        }
    );
}


/* =========================================================
   BAUTIZOS
   ========================================================= */

const bautizosForm =
    document.getElementById("bautizosForm");

if (bautizosForm) {

    bautizosForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            processForm(
                bautizosForm,
                "bautizos"
            );
        }
    );
}


/* =========================================================
   CRUZADAS
   ========================================================= */

window.registerCrusade =
    function (locationName) {

        const titleElement =
            document.getElementById(
                "crusadeModalTitle"
            );

        const hiddenField =
            document.getElementById(
                "crusadeNameField"
            );

        if (titleElement) {

            titleElement.textContent =
                "Cruzada en " + locationName;
        }

        if (hiddenField) {

            hiddenField.value =
                locationName;
        }

        const modal =
            document.getElementById(
                "crusadeModal"
            );

        if (modal) {

            modal.showModal();
        }
    };


const crusadeForm =
    document.getElementById("crusadeForm");

if (crusadeForm) {

    crusadeForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            processForm(
                crusadeForm,
                "cruzadas"
            );
        }
    );
}


/* =========================================================
   DONACIONES
   ========================================================= */

const donationForm =
    document.getElementById("donationForm");

if (donationForm) {

    donationForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            processForm(
                donationForm,
                "donaciones"
            );
        }
    );
}


/* =========================================================
   UNIRSE A LA FAMILIA / CONSOLIDACIÓN
   ========================================================= */

const joinForm =
    document.getElementById("joinForm");

if (joinForm) {

    joinForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            processForm(
                joinForm,
                "consolidacion"
            );
        }
    );
}


/* =========================================================
   CERRAR MODALES CON ESC
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") return;

        closeBookingOverlayFn();

        const joinModal =
            document.getElementById(
                "joinModal"
            );

        const donationModal =
            document.getElementById(
                "donationModal"
            );

        const crusadeModal =
            document.getElementById(
                "crusadeModal"
            );

        if (joinModal && joinModal.open) {
            joinModal.close();
        }

        if (donationModal && donationModal.open) {
            donationModal.close();
        }

        if (crusadeModal && crusadeModal.open) {
            crusadeModal.close();
        }
    }
);


/* =========================================================
   SCROLL SUAVE
   ========================================================= */

document
    .querySelectorAll('a[href^="#"]')
    .forEach((anchor) => {

        anchor.addEventListener(
            "click",
            (event) => {

                const targetId =
                    anchor.getAttribute(
                        "href"
                    );

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }

                const targetElement =
                    document.querySelector(
                        targetId
                    );

                if (!targetElement) {
                    return;
                }

                event.preventDefault();

                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        );
    });
  })
