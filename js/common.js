/**
 * Realiza una petición HTTP y devuelve una promesa que se resuelve con los datos de la respuesta.
 *
 * @param {Object} options - Opciones para la petición.
 * @param {string} options.url - La URL a la que se realizará la petición. **Obligatorio.**
 * @param {Object|string|null} [options.data=null] - Datos que se enviarán en el cuerpo de la petición.
 * @param {string|null} [options.method=null] - Método HTTP a utilizar (GET, POST, etc.). Si no se especifica, se usa "GET" si no hay datos y "POST" si hay datos.
 * @param {boolean} [options.isJson=true] - Indica si la respuesta debe ser tratada como JSON.
 * @param {Function} [options.callback=null] - Función opcional que se ejecutará después de recibir la respuesta.
 *
 * @returns {Promise<any>} - Una promesa que se resuelve con los datos de la respuesta o se rechaza con un error.
 */
const get_data = async ({ url, data = null, method = null, isJson = true, callback = null }) => {
    if (!url) {
        throw new Error("La URL es obligatoria.");
    }

    // Determinar el método HTTP si no se proporciona
    method = method || (data ? "POST" : "GET");

    try {
        const responseData = await MyFetch(
            {
                url,
                method,
                body: data,
            },
            isJson
        );

        // Ejecutar el callback si es una función
        if (typeof callback === "function") {
            callback(responseData);
        }

        return responseData;
    } catch (error) {
        // Manejo de errores
        console.error("Error en get_data:", error);
        throw error;
    }
};


/**
 * Realiza una petición HTTP utilizando la API Fetch y devuelve una promesa con los datos de la respuesta.
 *
 * @param {Object} config - Configuración de la petición.
 * @param {string} config.url - URL a la que se realizará la petición. **Obligatorio.**
 * @param {string} [config.method='GET'] - Método HTTP a utilizar (GET, POST, etc.).
 * @param {Object|string|null} [config.body=null] - Cuerpo de la solicitud, si es aplicable.
 * @param {boolean} [isJson=true] - Indica si la respuesta debe ser tratada como JSON.
 *
 * @returns {Promise<any>} - Una promesa que se resuelve con los datos de la respuesta o se rechaza con un error.
 *
 * @example
 * MyFetch(
 *   {
 *     url: 'https://api.example.com/data',
 *     method: 'POST',
 *     body: { key: 'value' },
 *   },
 *   true
 * )
 * .then((response) => {
 *   console.log('Respuesta:', response);
 * })
 * .catch((error) => {
 *   console.error('Error en la petición:', error);
 * });
 */
const MyFetch = async (
    { url = null, method = "GET", body = null },
    isJson = true
) => {
    if (!url) {
        throw new Error("La URL es obligatoria.");
    }

    const options = {
        method,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    };

    if (method !== "GET" && body) {
        if (isJson) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        } else {
            options.body = body;
        }
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            // Leer el cuerpo de la respuesta en caso de error
            const errorText = await response.text();
            throw new Error(`Error en la respuesta HTTP: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = isJson ? await response.json() : await response.text();
        return data; // Aquí devolvemos los datos
    } catch (err) {
        // Re-lanzamos el error para que pueda ser manejado por quien llama a la función
        throw err;
    }
};



/**
 * Carga dinámicamente un script JavaScript en la página.
 *
 * @param {string} moduleUrl - URL del módulo (script) que se va a cargar.
 *
 * @returns {Promise<string>} - Una promesa que se resuelve con la URL del módulo cargado
 *                              si la carga es exitosa, o se rechaza con un error si falla.
 *
 * @example
 * // Uso de LoadModule para cargar un script externo
 * LoadModule('https://example.com/script.js')
 *   .then((moduleUrl) => {
 *     console.log(`El módulo ${moduleUrl} se cargó correctamente.`);
 *   })
 *   .catch((error) => {
 *     console.error('Error al cargar el módulo:', error);
 *   });
 *
 * @description
 * La función verifica si el script ya está cargado para evitar cargas duplicadas.
 * Si el script no está presente, crea un elemento `<script>`, configura sus atributos
 * y lo añade al documento. Maneja los eventos `onload` y `onerror` para resolver o
 * rechazar la promesa según corresponda.
 *
 * También muestra mensajes al usuario utilizando las funciones `msg.info`, `msg.secondary`,
 * y `msg.danger` para informar sobre el estado de la carga del módulo.
 */
const LoadModule = (moduleUrl) => {
    return new Promise((resolve, reject) => {
        // Verificar si el script ya está cargado
        if (document.querySelector(`script[src="${moduleUrl}"]`)) {
            msg.info(`Módulo ya cargado: ${moduleUrl}`);
            return resolve(moduleUrl);
        }

        msg.secondary(`Cargando: ${moduleUrl}`);

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = moduleUrl;

        script.onload = () => {
            msg.info(`Módulo cargado exitosamente: ${moduleUrl}`);
            resolve(moduleUrl);

            // Limpiar manejadores de eventos
            script.onload = null;
            script.onerror = null;
        };

        script.onerror = () => {
            msg.danger(`Error al cargar el módulo: ${moduleUrl}`);
            reject(new Error(`No se pudo cargar el script ${moduleUrl}`));

            // Limpiar manejadores de eventos
            script.onload = null;
            script.onerror = null;
        };

        // Agregar el script al documento después de configurar todo
        document.body.appendChild(script);
    });
};


/**
 * Filtra un objeto y devuelve un nuevo objeto que solo contiene las propiedades especificadas.
 *
 * @param {Object} obj - El objeto original que se va a filtrar.
 * @param {Array<string>} keys - Un array de claves que se desean conservar en el objeto resultante.
 *
 * @returns {Object} - Un nuevo objeto que contiene solo las propiedades especificadas.
 *
 * @example
 * const original = { a: 1, b: 2, c: 3 };
 * const result = filteredObject(original, ['a', 'c']);
 * console.log(result); // { a: 1, c: 3 }
 */
const filteredObject = (obj, keys = []) => {
    if (typeof obj !== 'object' || obj === null) {
        throw new TypeError('El primer parámetro debe ser un objeto no nulo.');
    }
    if (!Array.isArray(keys)) {
        throw new TypeError('El segundo parámetro debe ser un array de claves.');
    }

    const keySet = new Set(keys);
    const result = {};

    for (const key of keySet) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = obj[key];
        }
    }

    return result;
};

/**
 * Clase Msglog para mostrar mensajes al usuario utilizando SweetAlert2 (si está disponible) y la consola del navegador.
 * Permite personalizar las configuraciones de los mensajes y de SweetAlert2.
 *
 * @class
 *
 * @param {Object} [options] - Opciones de personalización para la clase.
 * @param {Object} [options.swalOptions] - Opciones adicionales para configurar SweetAlert2.
 * @param {Object} [options.messageTypes] - Configuraciones personalizadas para los tipos de mensajes.
 * @param {boolean} [options.silent=false] - Si es true, no muestra advertencias en la consola si SweetAlert2 no está disponible.
 *
 * @example
 * // Crear una instancia de Msglog con opciones personalizadas
 * const msg = new Msglog({
 *   swalOptions: {
 *     position: 'bottom-end',
 *   },
 *   messageTypes: {
 *     success: { style: 'background: green; color: white', icon: 'success', timer: 2000 },
 *     info: { style: 'background: blue; color: white', icon: 'info', timer: 3000 },
 *   },
 *   silent: true,
 * });
 *
 * // Usar los métodos para mostrar mensajes
 * msg.info('Operación completada exitosamente.');
 * msg.success('Datos guardados correctamente.');
 * msg.warning('Esta acción puede tener consecuencias no deseadas.');
 * msg.danger('Error al procesar la solicitud.');
 * msg.secondary('Información adicional disponible en el panel.');
 */
class Msglog {
    /**
     * Constructor de la clase Msglog.
     *
     * @constructor
     * @param {Object} [options={}] - Opciones de personalización.
     * @param {Object} [options.swalOptions] - Opciones para configurar SweetAlert2.
     * @param {Object} [options.messageTypes] - Configuraciones personalizadas para los tipos de mensajes.
     * @param {boolean} [options.silent=false] - Si es true, no muestra advertencias si Swal no está disponible.
     */
    constructor(options = {}) {
        // Verificar si Swal está disponible
        this.isSwalAvailable = typeof Swal !== 'undefined';

        if (this.isSwalAvailable) {
            // Configuración base para SweetAlert2 con opciones personalizadas
            this.Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timerProgressBar: true,
                ...options.swalOptions, // Opciones adicionales para Swal
            });
        } else if (!options.silent) {
            console.warn('SweetAlert2 no está disponible. Los mensajes se mostrarán solo en la consola.');
        }

        // Configuraciones predeterminadas para los tipos de mensajes
        const defaultMessageTypes = {
            info: { style: 'background: white; color: green', icon: 'info', timer: 2000 },
            warning: { style: 'background: yellow; color: blue', icon: 'warning', timer: 3000 },
            danger: { style: 'background: red; color: white', icon: 'error', timer: 4000 },
            secondary: { style: 'background: grey; color: black', icon: 'question', timer: 2500 },
        };

        // Combinar configuraciones predeterminadas con las personalizadas
        this.messageTypes = { ...defaultMessageTypes, ...options.messageTypes };
    }

    /**
     * Muestra un mensaje informativo.
     * @param {string} msg - El mensaje a mostrar.
     */
    info(msg) {
        this._showMessage(msg, 'info');
    }

    /**
     * Muestra un mensaje de advertencia.
     * @param {string} msg - El mensaje a mostrar.
     */
    warning(msg) {
        this._showMessage(msg, 'warning');
    }

    /**
     * Muestra un mensaje de error.
     * @param {string} msg - El mensaje a mostrar.
     */
    danger(msg) {
        this._showMessage(msg, 'danger');
    }

    /**
     * Muestra un mensaje secundario.
     * @param {string} msg - El mensaje a mostrar.
     */
    secondary(msg) {
        this._showMessage(msg, 'secondary');
    }

    /**
     * Muestra un mensaje de éxito.
     * @param {string} msg - El mensaje a mostrar.
     */
    success(msg) {
        this._showMessage(msg, 'success');
    }

    /**
     * Método interno para mostrar mensajes utilizando SweetAlert2 (si está disponible) y la consola.
     * @param {string} msg - El mensaje a mostrar.
     * @param {string} type - El tipo de mensaje (por ejemplo, 'info', 'warning', 'danger', 'secondary', 'success').
     * @private
     */
    _showMessage(msg, type) {
        if (typeof msg !== 'string') {
            console.error('El mensaje debe ser una cadena de texto.');
            return;
        }

        const config = this.messageTypes[type];

        if (!config) {
            console.error(`Tipo de mensaje no soportado: ${type}`);
            return;
        }

        const { style, icon, timer } = config;

        // Mostrar mensaje con SweetAlert2 si está disponible
        if (this.isSwalAvailable) {
            this.Toast.fire({ icon, title: msg, timer });
        } else {
            // Mostrar mensaje en la consola si Swal no está disponible
            console.log(`Mensaje (${type}): ${msg}`);
        }

        // Mostrar mensaje en la consola con estilos
        console.log(`%c${msg}`, style);
    }
}

/**
 * `$$` es una función utilitaria para la manipulación del DOM que proporciona métodos sencillos
 * para interactuar con los elementos seleccionados mediante un selector CSS. Ofrece funcionalidades
 * similares a algunas de las que proporciona jQuery, pero utilizando JavaScript puro y sin dependencias
 * externas.
 *
 * @param {string} selector - Un selector CSS para seleccionar los elementos del DOM.
 *
 * @returns {Object} Un objeto con métodos para manipular los elementos seleccionados:
 *   - `html(content)`: Establece el contenido HTML de los elementos si se proporciona `content`, o devuelve
 *     el contenido HTML del primer elemento si no se proporciona `content`.
 *   - `text(content)`: Establece el contenido de texto de los elementos si se proporciona `content`, o devuelve
 *     el contenido de texto del primer elemento si no se proporciona `content`.
 *   - `css(property, value)`: Establece el valor de una propiedad CSS especificada en los elementos.
 *   - `on(eventType, handler)`: Añade un manejador de eventos a los elementos para un tipo de evento específico.
 *
 * @example
 * // Establecer el contenido HTML de todos los elementos con la clase 'starter-version'
 * $$('.starter-version').html('Versión 1.0.0');
 *
 * // Obtener el contenido HTML del primer elemento con la clase 'starter-version'
 * const version = $$('.starter-version').html();
 * console.log(version);
 *
 * // Establecer el contenido de texto de un elemento con el id 'titulo'
 * $$('#titulo').text('Bienvenido a mi sitio web');
 *
 * // Cambiar el color de texto de todos los elementos con la clase 'enlace' a azul
 * $$('.enlace').css('color', 'blue');
 *
 * // Añadir un evento click a todos los botones con la clase 'boton'
 * $$('.boton').on('click', function() {
 *     console.log('Botón clickeado');
 * });
 *
 * // Obtener el contenido de texto del primer elemento con la clase 'descripcion'
 * const descripcion = $$('.descripcion').text();
 * console.log(descripcion);
 */
const $$ = (selector) => {
    const elements = document.querySelectorAll(selector);
    return {
        html: (content) => {
            if (content !== undefined) {
                // Establecer el contenido HTML
                elements.forEach((element) => {
                    element.innerHTML = content;
                });
            } else {
                // Obtener el contenido HTML del primer elemento
                return elements[0]?.innerHTML;
            }
        },
        text: (content) => {
            if (content !== undefined) {
                // Establecer el contenido de texto
                elements.forEach((element) => {
                    element.textContent = content;
                });
            } else {
                // Obtener el contenido de texto del primer elemento
                return elements[0]?.textContent;
            }
        },
        css: (property, value) => {
            elements.forEach((element) => {
                element.style[property] = value;
            });
        },
        on: (eventType, handler) => {
            elements.forEach((element) => {
                element.addEventListener(eventType, handler);
            });
        },
        // Puedes añadir más métodos según tus necesidades
    };
};
