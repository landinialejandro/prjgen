/**
 * simple primise get file with a promise. 
 * @param {String} url to file or ajax reponse
 * @param {Element} data object data { operation: "test", id: "#", text: "test ajax works" }
 * @returns {String} promise data
 */
const get_data = ({ url, data = {}, isJson = true, callback = null }) => {
    return new Promise(function (resolve, reject) {
        if (url) {
            MyFecth(
                {
                    url,
                    body: data ? JSON.stringify(data) : null,
                    callback: (data) => resolve(data),
                },
                isJson
            )
            if (typeof callback == "function") callback()
        } else {
            reject(new Error("url needed"))
        }
    })
}

const MyFecth = ({
    url = null,
    method = "POST", //default is GET
    body = null,
    callback,
},
    isJson = true
) => {
    fetch(url, {
        method,
        body,
        headers: { "X-Requested-With": "XMLHttpRequest" },
    })
    .then((response) => (isJson ? response.json() : response.text()))
    .then((response) => {
        if (typeof response !== "undefined" || !isJson) {
            isJson && console.log("RESPONSE: ", response);
            if (typeof callback == "function") callback(response);
        } else {
            console.log(response);
            errors = JSON.stringify(response, null, "\t");
        }
    })
    .catch((err) => console.log(err));
};

const LoadModule = (module) => {
    return new Promise((resolve, reject) => {
        msg.secondary(`loading: ${module}`)
        const script = document.createElement("script")
        script.type = "text/javascript"
        document.body.appendChild(script)
        script.onload = () => {
            msg.info(`Successfully loaded module: ${module}`)
            resolve(module)
        }
        script.onerror = () => reject(msg.danger(`Failed to load module: ${module}`))
        script.async = true
        script.src = module
    })
}

// filtra un objeto y devuelve objeto filtrado, se pasa el objeto a filtrar y el/los valor del key en array
//el objeto se convierte a array y se filtra. el metodo reduce crea el objeto de salida
const filteredObject = (obj, keys = []) => Object.keys(obj)
    .filter(key => keys.includes(key))
    .reduce((o, k) => {
        o[k] = obj[k]
        return o
    }, {})

class Msglog {
    Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timerProgressBar: true,
    })
    info_text = { style: "background: white; color: green", icon: "info", timer: 1000 }
    warning_text = { style: "background: yellow; color: blue", icon: "warning", timer: 2000 }
    danger_text = { style: "background: red; color: white", icon: "error", timer: 3000 }
    secondary_text = { style: "background: grey; color: black", icon: "question", timer: 2000 }
    secondary = (msg) => this.#msg(msg, this.secondary_text)
    danger = (msg) => this.#msg(msg, this.danger_text);
    warning = (msg) => this.#msg(msg, this.warning_text);
    info = (msg) => this.#msg(msg, this.info_text);
    #msg = (msg, { style, icon, timer }) => {
        this.Toast.fire({ icon, title: msg, timer })
        console.log(`%c ${msg}`, style)
    };
}


