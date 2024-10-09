const debug = () => $("#debug_tree")

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
//Tree settings, arma el listado de archivos y carpetas en el menú de la izquierda
async function constructDebugTree() {
    try {
        itemSelected = $(".debug-page")
        data = await get_data({ url: "starter.php", data: { operation: "get_node", id: "#", folder: "settings" } })
        // types = await getTypes();
        debug().jstree({ core: { data } })
            .on("select_node.jstree", (n, { node: { text, type, id }, event }, e) => {
                if (type === "file" && typeof event !== "undefined" && type !== "contextmenu") {
                    var active = itemSelected.hasClass("active")
                    if (id !== loadedDebug || !active) {
                        Container(false)
                        url = itemSelected.attr("href")
                        loadPage(url)
                            .then(() => {
                                setBreadCrum(itemSelected.text().trim())
                                debugjson = null
                                url = "settings/" + id
                                get_data({ url })
                                    .then((e) => {
                                        setTitleFileSelected(id)
                                        const JSONarea = document.getElementById("codeJson")
                                        // JSONarea.textContent = ''
                                        const options = {
                                            mode: 'tree',
                                            onChangeJSON: function (json) {
                                                debugjson = json
                                                console.log(json)
                                                updateDebug(json)
                                            }
                                        }
                                        const editor = new JSONEditor(JSONarea, options)
                                        console.log(e)
                                        editor.set(e)
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