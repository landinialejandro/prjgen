const msg = new Msglog()
const modules = [
    "js/alert.js",
    "js/starter.helpers.js",
    "js/starter.project.js",
    "js/starter.ws.js",
    "js/starter.debug.js",
    "js/edit.text.button.js",
    "js/add.new.properties.js",
    "js/keyboard.input.js",
    "js/validate.control.js",
    "js/hbs.js",
    "js/starter.js"
];

(async function initializeApp() {
    try {
        // Cargar todos los módulos necesarios en paralelo
        await Promise.all(modules.map(LoadModule));

        // Obtener la configuración de la aplicación
        const settings = await get_settings();
        const version = settings.version || "0.0.0";
        const release = settings.release || "bad file";
        const text = `${version} - ${release}`;

        // Mostrar información de la versión al usuario
        msg.info(`Versión: ${text}`);
        $(".starter-version").html(text);
    } catch (error) {
        // Registrar el error y notificar al usuario
        console.error("Error al inicializar la aplicación:", error);
        msg.error("Ocurrió un problema al iniciar la aplicación. Por favor, inténtalo de nuevo más tarde.");
    } finally {
        // Ocultar el preloader siempre, incluso si ocurrió un error
        hidePreloader();
    }
})();
