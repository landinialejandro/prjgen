/**
 * simple get file with a promise. use $.get jquery
 * @param {Element} url file name to gete data 
 * @returns {String} promise data
 */
function get_file(url) {
    const promise = new Promise(function(resolve, reject) {
        if (url) {
            $.get(url)
                .done(function(data) {
                    resolve(data);
                });
        }
        if (!url) {
            reject(new Error('Not exist file'));
        }
    });
    return promise;
}

/**
 * simple primise get file with a promise. use $.get jquery like ajax whit command selector 
 * @param {String} url to file, starter.php default
 * @param {Element} data object data { operation: "test", id: "#", text: "test ajax works" }
 * @returns {String} promise data
 */
function get_data(url = "starter.php", data = {
    operation: "test",
    id: "#",
    text: "test ajax works"
}) {
    const promise = new Promise(function(resolve, reject) {
        if (data && url) {
            $.get(url, data)
                .done(function(res) {
                    resolve(res.content);
                });
        }
        if (!data || !url) {
            reject(new Error('url/data needed'));
        }
    });
    return promise;
}

/**
 * save a file with ajax 
 * @param {String} url to file to save
 * @param {Element} data object json data
 * @param {String} folder to file
 */
function save_file(url, data, folder = 'projects') {
    $.ajax({
        type: "POST",
        url: "starter.php",
        data: {
            'operation': 'save_file',
            'type': 'json',
            'id': url,
            'text': JSON.stringify(data),
            folder: folder
        },
        dataType: "json",
        success: function(res) {
            if (res == undefined) {
                alert("Error: unexpected response");
            } else {
                console.log("%c saved file: " + "%c" + res.id, "background: white; color: green");
            }
        },
        error: function(res) {
            if (res == undefined) {
                alert("Error: undefined");
            } else {
                alert("Error: " + res.responseText);
            }
        },
        complete: function() {
            Container();
        }
    }).always(function() {
        $('#ws_tree').jstree(true).refresh();
    });
}

function LoadModule(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false
    });
}

function hidePreloader() {
    var preloaderFadeOutTime = 500;
    var preloader = $('.spinner-wrapper');
    setTimeout(() => {
        preloader.fadeOut(preloaderFadeOutTime);
    }, 500);
}

/**
 * get date for last starter commit
 */
async function getVersion() {
    options = {
        operation: "version",
        id: "#",
        text: ".starter-version"
    };
    var version = await get_data("starter.php", options);
    console.log("%c version: " + "%c" + version[3]+", "+version[5], "background: white; color: green");
    $(options.text).html(version[3]);
}