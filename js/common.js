/**
 * simple get file with a promise. use $.get jquery
 * @param {Element} url file name to gete data
 * @returns {String} promise data
 */
let get_file = ({ url, data = {}, isJson = true }) => {
    return new Promise((resolve, reject) => {
        if (url) {
            MyFecth({ url, callback: (data) => resolve(data) }, isJson);
        } else {
            reject(new Error("Not exist file!!"));
        }
    });
};

/**
 * simple primise get file with a promise. use $.get jquery like ajax whit command selector
 * @param {String} url to file, starter.php default
 * @param {Element} data object data { operation: "test", id: "#", text: "test ajax works" }
 * @returns {String} promise data
 */
const get_data = ({ url, data = {}, isJson = true }) => {
    return new Promise(function (resolve, reject) {
        if (data && url) {
            MyFecth(
                {
                    url,
                    body: JSON.stringify(data),
                    callback: (data) => resolve(data),
                },
                isJson
            );
        } else {
            reject(new Error("url/data needed"));
        }
    });
};

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

/**
 * save a file with ajax
 * @param {String} url to file to save
 * @param {Element} data object json data
 * @param {String} folder to file
 */
function save_file(url, data, folder = "projects") {
    $.ajax({
        type: "POST",
        url: "starter.php",
        data: {
            operation: "save_file",
            type: "json",
            id: url,
            text: JSON.stringify(data),
            folder: folder,
        },
        dataType: "json",
        success: function (res) {
            if (res == undefined) {
                alert("Error: unexpected response");
            } else {
                msg.info("saved file: " + res.id);
            }
        },
        error: function (res) {
            if (res == undefined) {
                alert("Error: undefined");
            } else {
                alert("Error: " + res.responseText);
            }
        },
        complete: function () {
            Container();
        },
    });

    $("#ws_tree").jstree(true).refresh();
}

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
 * get date for last starter commit
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
