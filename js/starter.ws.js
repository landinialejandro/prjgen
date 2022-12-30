var loadedWS = false;

async function constructWSTree() {
    try {
        const types = await get_file({ url: "settings/ws_types.json" });
        const ws = await get_file({ url: "settings/workspace.json" });
        const data = await get_data({ url: "starter.php", data: { operation: "get_node", id: "#" } });

        $("#ws_tree").jstree({
            core: {
                data,
                check_callback: function (o, n, p, i, m) {
                    if (m && m.dnd && m.pos !== "i") return false;
                    if (o === "move_node" || o === "copy_node" && this.get_node(n).parent === this.get_node(p).id) return false;
                    return true;
                },
            },
            sort: function (a, b) {
                return this.get_type(a) === this.get_type(b)
                    ? this.get_text(a) > this.get_text(b) ? 1 : -1
                    : this.get_type(a) >= this.get_type(b) ? 1 : -1;
            },
            contextmenu: {
                items: (node) => {
                    var tmp = $.jstree.defaults.contextmenu.items();
                    tmp.create = false
                    if (node.type !== "file") {
                        tmp.create = {
                            label: "New",
                            action: false,
                            submenu: {
                                create_folder: {
                                    label: "Folder",
                                    action: (node) => createNodeWs(node)
                                },
                                create_file: {
                                    label: "File",
                                    action: (node) => createNodeWs(node)
                                },
                            }
                        }
                    }
                    return tmp;
                },
            },
            types,
            unique: {
                duplicate: (name, counter) => name + " " + counter
            },
            plugins: ["state", "sort", "types", "contextmenu", "unique"],
        })
            .on("loaded.jstree", (e, data) => {
                if (ws.text && ws.text !== "" && ws.text !== "undefined") loadProject("projects/" + ws.text)
            })
            .on("select_node.jstree", (n, { node: { text, type }, event }, e) => {
                if (type === "file" && typeof event !== "undefined" && type !== "contextmenu") {
                    var active = $(".project-page").hasClass("active");
                    if (text !== loadedWS || !active) {
                        Container(false);
                        load_page($(".project-page"));
                        loadedWS = text;
                        loadProject("projects/" + text);
                        save_file("workspace.json", { text, }, "settings");
                    }
                }
            });
    } catch (err) {
        return msg.danger(err.message);
    }
}

const createNodeWs = ({ reference, type }) => {
    //TODO: agregar la opcion ajax para crear los elementos
    var inst = $.jstree.reference(reference);
    var obj = inst.get_node(reference);
    inst.create_node(
        obj,
        { type },
        "last",
        (new_node) => setTimeout(() => inst.edit(new_node), 0)
    );
}