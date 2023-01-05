var loadedWS = false;

async function constructWSTree() {
    try {
        $("#ws_tree").jstree({
            core: {
                data: await get_data({ url: "starter.php", data: { operation: "get_node", id: "#" } }),
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
            .on("loaded.jstree", async (e, data) => {
                get_workspace().then(({ text }) => {
                    if (text && text !== "" && text !== "undefined") loadProject("projects/" + text)
                })
            })
            .on("rename_node.jstree", function (e, data) {
                if (data.node.type === "#") {
                    alert("rename project file?");
                }
                renamimg(data)
            })
            .on("select_node.jstree", (n, { node: { text, type }, event }, e) => {
                if (type === "file" && typeof event !== "undefined" && type !== "contextmenu") {
                    var active = $(".project-page").hasClass("active");
                    if (text !== loadedWS || !active) {
                        Container(false);
                        url = $(".project-page").attr("href")
                        load_page(url).then(() => {
                            loadedWS = text;
                            loadProject("projects/" + text);
                            save_file("workspace.json", { text, }, "settings");
                        });
                    }
                }
            });
    } catch (err) {
        return msg.danger(err.message);
    }
}

const renamimg = (data) => {
    console.log(data);
    let options={}
    if (data.node.type = "file") {
        msg.danger("renaming    ")
        options.id = data.old
        options.text = data.text
        options.operation = "rename_node"
    }
    if (options.text != "") {
        get_data({ url: "starter.php", data: options })
            .then(({ content }) => {
                //newNode.children = content
                msg.info("file renamed")
            })
            .catch(error => { console.log(error) })
    }

}