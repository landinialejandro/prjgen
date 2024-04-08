var loadedDebug = false;
var debugjson = null;
//click on update project
$(".card-starter").on("click", ".updatedebug", (e) => updateDebug())

const updateDebug = (json = null) => {
    if (json === null) json = debugjson
    var obj_node = debug().jstree().get_selected(true)[0].id
    msg.info("saving debug");
    //TODO: se puede controlar si el nombre es valido antes de pasarlo a la función
    const data = {
        operation: "save_file",
        type: "json",
        id: debug().jstree().get_selected(true)[0].id,
        text: debug().jstree().get_selected(true)[0].text,
        content: JSON.stringify(json),
        folder: "settings",
    }
    //save projet
    get_data({
        url: "starter.php", data, callback: () => ws().jstree(true).refresh(),
    })
    msg.info(`saving setting file...${obj_node}`)
}
async function constructDebugTree() {
    try {
        debug().jstree({
            core: {
                data: await get_data({ url: "starter.php", data: { operation: "get_node", id: "#", folder: "settings" } }),
                check_callback: function (o, n, p, i, m) {
                    if (m && m.dnd && m.pos !== "i") return false;
                    if (o === "move_node" || o === "copy_node" && this.get_node(n).parent === this.get_node(p).id) return false;
                    return true
                },
            },
            sort: function (a, b) {
                return this.get_type(a) === this.get_type(b)
                    ? this.get_text(a) > this.get_text(b) ? 1 : -1
                    : this.get_type(a) >= this.get_type(b) ? 1 : -1;
            },
            contextmenu: { items: (node) => contextMenu(node) },
            types: await get_ws_types(),
            unique: { duplicate: (name, counter) => name + " " + counter },
            plugins: ["state", "sort", "types", "contextmenu", "unique"],
        })
            .on("select_node.jstree", (n, { node: { text, type, id }, event }, e) => {
                if (type === "file" && typeof event !== "undefined" && type !== "contextmenu") {
                    var active = $(".debug-page").hasClass("active")
                    if (id !== loadedDebug || !active) {
                        Container(false)
                        url = $(".debug-page").attr("href")
                        loadPage(url).then(() => {
                            debugjson = null
                            settings = "settings/" + id
                            get_data({ url: settings }).then((e) => {
                                const textarea = document.getElementById("codeJson")
                                // textarea.textContent = ''
                                const options = {
                                    mode: 'tree',
                                    onChangeJSON: function (json) {
                                        debugjson = json
                                        console.log(json)
                                        updateDebug(json)
                                    }
                                }
                                const editor = new JSONEditor(textarea, options)
                                console.log(e)
                                editor.set(e)
                                Container()
                            })
                        })
                    }
                }
            })
    } catch (err) {
        return msg.danger(err.message);
    }
}