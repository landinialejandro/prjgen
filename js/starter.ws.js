var loadedWS = false;
const ws = () => $("#ws_tree")

const get_workspace = () => get_data({ url: "settings/workspace.json" })
const get_ws_selectedNodeId = () => ws().jstree().get_selected(true)[0].id
const get_ws_selectedNodeText = () => ws().jstree().get_selected(true)[0].text
const get_ws_lastProject = async () => await get_workspace().then(({ id }) => id)

//Tree del work space, arma el listado de archivos y carpetas en el menú de la izquierda
async function constructWSTree() {
    try {
        itemSelected = $(".project-page")
        data = await get_data({ url: "starter.php", data: { operation: "get_node", id: "#", folder: "projects" } })
        // types = await getTypes();
        ws().jstree({ core: { data } })
            .on("loaded.jstree", (e, data) => {
                get_ws_lastProject()
                    .then(id => {
                        setBreadCrum(itemSelected.text().trim())
                        msg.info("load last project..." + id)
                        if (id && id !== "" && id !== "undefined") {
                            ws().jstree("select_node", id, true);
                            loadProject("projects/" + id)
                            setTitleFileSelected(id)
                        }
                    })
            })
            .on("rename_node.jstree", function (e, data) {
                renamimg(data)
            })
            .on("select_node.jstree", (n, { node: { text, type, id }, event }, e) => {
                if (type === "file" && typeof event !== "undefined" && type !== "contextmenu") {
                    var active = itemSelected.hasClass("active")
                    if (id !== loadedWS || !active) {
                        Container(false)
                        url = itemSelected.attr("href")
                        loadPage(url)
                            .then(() => {
                                setBreadCrum(itemSelected.text().trim())
                                loadedWS = id;
                                loadProject("projects/" + id)

                                msg.info("saving workspace.json")
                                const data = {
                                    operation: "save_file",
                                    type: "json",
                                    id: "workspace.json", //nombre del archivo a modificar
                                    content: JSON.stringify({ id, }),
                                    folder: "settings",
                                }
                                get_data({
                                    url: "starter.php", data,
                                })
                                    .then((res) => {
                                        msg.info("saved file: " + res.id)
                                        Container()
                                    })
                            })

                    }
                }
            })
    } catch (err) {
        Container()
        console.log(err)
        return msg.danger(err.message);
    }
}

const renamimg = (data) => {
    let options = {}
    if (data.node.type === "file") {
        msg.danger("renaming...")
        options.id = data.old
        options.text = data.text
        options.operation = "rename_node"
    }
    if (options.text != "") {
        get_data({ url: "starter.php", data: options })
            .then(({ id }) => msg.info("file renamed to: " + id))
    }
}