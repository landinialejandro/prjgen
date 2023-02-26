var loadedDebug = false;

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
            .on("loaded.jstree", (e, data) => {
                // get_ws_lastProject().then(id => {
                //     msg.info("load last project..." + id)
                //     if (id && id !== "" && id !== "undefined") {
                //         ws().jstree("select_node", id, true);
                //         loadProject("projects/" + id)
                //     }
                // })
            })
            .on("rename_node.jstree", function (e, data) {
                // renamimg(data)
            })
            .on("select_node.jstree", (n, { node: { text, type, id }, event }, e) => {
                if (type === "file" && typeof event !== "undefined" && type !== "contextmenu") {
                    var active = $(".debug-page").hasClass("active")
                    if (id !== loadedDebug || !active) {
                        Container(false)
                        url = "settings/" + id
                        get_data({ url }).then((e) => {
                            console.log(e)
                            const formatted = JSON.stringify(e, null, 4);
                            const textarea = document.getElementById("codeJson")
                            textarea.value = formatted
                            console.log(formatted)
                            Container()
                        })
                    }
                }
            })
    } catch (err) {
        return msg.danger(err.message);
    }
}

// const renamimg = (data) => {
//     let options = {}
//     if (data.node.type = "file") {
//         msg.danger("renaming...")
//         options.id = data.old
//         options.text = data.text
//         options.operation = "rename_node"
//     }
//     if (options.text != "") {
//         get_data({ url: "starter.php", data: options })
//             .then(({ id }) => msg.info("file renamed to: " + id))
//     }
// }