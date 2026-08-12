/* =========================================================
   WELCOME SCREEN
   Impactando las Naciones - Casa de Dios
   ========================================================= */

(() => {

    const WELCOME_KEY =
        "impactando_naciones_welcome_seen_v2";

    const WELCOME_DURATION = 3000;


    /* =====================================================
       COMPROBAR SI YA SE MOSTRÓ
       ===================================================== */

    const alreadySeen =
        sessionStorage.getItem(WELCOME_KEY) === "true";


    /*
     * Esta clase se aplica inmediatamente.
     */
    if (alreadySeen) {

        document.documentElement.classList.add(
            "welcome-seen"
        );

        return;
    }


    /*
     * Primera entrada de esta sesión.
     */
    document.documentElement.classList.add(
        "welcome-active"
    );


    /* =====================================================
       CREAR PANTALLA
       ===================================================== */

    function createWelcomeScreen() {

        const screen =
            document.createElement("div");

        screen.id =
            "welcome-screen";

        screen.setAttribute(
            "aria-label",
            "Bienvenidos a Impactando las Naciones"
        );


        screen.innerHTML = `
            <div
                class="welcome-spark-field"
                id="welcomeSparkField">
            </div>

            <div class="welcome-content">

                <h1 class="welcome-title">
                    BIENVENIDOS
                </h1>

                <img
                    src="img/Logo.png"
                    alt="Impactando las Naciones - Casa de Dios"
                    class="welcome-logo"
                >

                <p class="welcome-subtitle">
                    Impactando las Naciones · Casa de Dios
                </p>

            </div>
        `;


        /*
         * Lo colocamos al principio del body.
         * Así queda por encima de todo.
         */
        document.body.prepend(screen);


        return screen;
    }


    /* =====================================================
       CREAR DESTELLOS
       ===================================================== */

    function createSparks(screen) {

        const field =
            screen.querySelector(
                "#welcomeSparkField"
            );

        if (!field) {
            return;
        }


        /* -----------------------------------------------
           CHISPAS
           ----------------------------------------------- */

        const sparkCount = 26;

        for (let i = 0; i < sparkCount; i++) {

            const spark =
                document.createElement("span");

            spark.className =
                "welcome-spark";


            const randomSize =
                Math.random();

            if (randomSize < 0.25) {
                spark.classList.add("small");
            }

            if (randomSize > 0.82) {
                spark.classList.add("large");
            }


            const angle =
                Math.random() * 360;

            const distance =
                170 +
                Math.random() * 230;

            const duration =
                2.2 +
                Math.random() * 2.2;

            const delay =
                Math.random() * 2.5;


            spark.style.setProperty(
                "--spark-angle",
                `${angle}deg`
            );

            spark.style.setProperty(
                "--spark-distance",
                `${distance}px`
            );

            spark.style.setProperty(
                "--spark-duration",
                `${duration}s`
            );

            spark.style.setProperty(
                "--spark-delay",
                `${delay}s`
            );


            field.appendChild(spark);
        }


        /* -----------------------------------------------
           DESTELLOS
           ----------------------------------------------- */

        const flashCount = 7;

        for (let i = 0; i < flashCount; i++) {

            const flash =
                document.createElement("span");

            flash.className =
                "welcome-flash";


            flash.style.left =
                `${25 + Math.random() * 50}%`;

            flash.style.top =
                `${20 + Math.random() * 60}%`;


            flash.style.setProperty(
                "--flash-angle",
                `${Math.random() * 360}deg`
            );

            flash.style.setProperty(
                "--flash-duration",
                `${2.2 + Math.random() * 1.8}s`
            );

            flash.style.setProperty(
                "--flash-delay",
                `${Math.random() * 3}s`
            );


            field.appendChild(flash);
        }
    }


    /* =====================================================
       FINALIZAR
       ===================================================== */

    function finishWelcome(screen) {

        /*
         * Guardamos ANTES de quitar la pantalla.
         * Así una actualización inmediatamente después
         * tampoco vuelve a activar la animación.
         */
        sessionStorage.setItem(
            WELCOME_KEY,
            "true"
        );


        screen.classList.add(
            "welcome-hidden"
        );


        /*
         * Liberar el contenido.
         */
        document.documentElement.classList.remove(
            "welcome-active"
        );


        /*
         * Después del fade eliminamos el elemento.
         */
        setTimeout(() => {

            screen.remove();

        }, 950);
    }


    /* =====================================================
       INICIALIZACIÓN
       ===================================================== */

    function init() {

        /*
         * El body ya existe cuando este script se ejecuta.
         */
        if (!document.body) {
            return;
        }


        const screen =
            createWelcomeScreen();


        createSparks(screen);


        /*
         * EXACTAMENTE 5 SEGUNDOS.
         */
        setTimeout(() => {

            finishWelcome(screen);

        }, WELCOME_DURATION);
    }


    /*
     * Ejecutar cuando el DOM esté listo.
     */
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );

    } else {

        init();
    }

})();