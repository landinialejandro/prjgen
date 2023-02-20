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

const MyFecth = (
    {
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
        msg.secondary("loading: " + module);
        const script = document.createElement("script");
        document.body.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        script.async = true;
        script.src = module;
    })
}

const hidePreloader = () => setTimeout(() => $(".spinner-wrapper").fadeOut(600), 500)

/**
 * get date for last starter version
 */
let getVersion = async () => {
    let data = {
        operation: "version",
        id: "#",
        text: ".starter-version",
    };
    const { content } = await get_data({ url: "starter.php", data })
    if (!content) {
        throw new error(`error to get version`);
    } else {
        return content;
    }
};

const filteredObject = (obj, keys = []) => Object.keys(obj)
    .filter(key => keys.includes(key))
    .reduce((o, k) => {
        o[k] = obj[k]
        return o
    }, {})

class Msglog {
    info_text = "background: white; color: green";
    warning_text = "background: yellow; color: blue";
    danger_text = "background: red; color: white";
    secondary_text = "background: grey; color: black";
    secondary = (msg) => this.#msg(msg, this.secondary_text);
    danger = (msg) => this.#msg(msg, this.danger_text);
    warning = (msg) => this.#msg(msg, this.warning_text);
    info = (msg) => this.#msg(msg, this.info_text);
    #msg = (msg, style) => console.log(`%c ${msg}`, style);
}
