/**
* TODO:	lista de campos de una tabla en proceso
*/

/**
 * Load a project
 * @param {string} file name project to load
 */
function loadProject(file) {
    destroyProject();
    constructTree(file);
}

/**
 * udpdate user data in project tree
 */
function updateData() {
    msg.info("UpdateData");
    $(".form-node").each(function () {
        var $this = $(this);
        var obj_node = get_nodeById($this.data("nodeid"));
        console.log(obj_node);

        if (!$.isEmptyObject(obj_node)) {
            var data = obj_node.data;
            if (data != null) {
                var i = parseInt($this.data("index"));
                if (Array.isArray(data.properties) && i >= 0) {
                    data.properties[i].text = $this.val();
                } else if ($this.hasClass("custom-control-input")) {
                    data.options[i].checked = this.checked;
                } else {
                    if ($this.hasClass("node-icon")) {
                        obj_node.icon = $this.val();
                    } else {
                        data.text = $this.val();
                    }
                }
            }
            if ($this.hasClass("node-setting")) {
                var setting = $this.attr("name");
                obj_node[setting] = $this.val();
                //TODO: si cambia un setting habría que hacer un refresh del objeto tree.
            }
        }
    });
}

/**
 * save project data to file, get de file name from  name of root tree
 */
function saveProject() {
    msg.info("saving project");
    //TODO: se puede controlar si el nombre es valido antes de pasarlo a la función
    const data = {
        operation: "save_file",
        type: "json",
        id: get_ws_selectedNodeId(),
        text: get_ws_selectedNodeText(),
        content: JSON.stringify(get_json_node()),
        folder: "projects",
    }
    //save projet
    get_data({
        url: "starter.php", data, callback: () => ws().jstree(true).refresh(),
    })
}

async function constructTree(url) {
    const types = await get_prj_types()
    try {
        project().jstree({
            core: {
                data: await get_data({ url }),
                check_callback: (o, n, p, i, m) => {
                    const t = filteredObject(types, [n.type])
                    msg.secondary("check if can " + o + " by type");
                    if (m && m.dnd && m.pos !== "i") return false;
                    if (o === "move_node" || o === "copy_node") {
                        if (this.get_node(n).parent === this.get_node(p).id) return false;
                    }
                    if (o === "delete_node") {
                        if (!t[n.type].delete) {
                            msg.danger("ERROR! you can't delete: " + n.type)
                            return false;
                        } else {
                            return confirm("Are you sure you want to delete?");
                        }
                    }
                    if (o === "rename_node") {

                        if (!t[n.type].rename) {
                            msg.danger("ERROR! yo can't rename: " + n.type)
                            return false
                        }
                        if (n.type === "table") {
                            tables = typeList("#", "table").map(id => get_nodeName(id))
                            if (tables.includes(i)) {
                                msg.danger("ERROR! Nombre Duplicado: " + i)
                                return false
                            }
                        }
                    }
                    msg.info("you can " + o + " ");
                    return true;
                },
            },
            types,
            contextmenu: {
                items: (node) => contextMenu(node),
            },
            plugins: ["dnd", "search", "state", "types", "contextmenu", "unique"],
            search: {
                case_sensitive: false,
                show_only_matches: true,
            },
            error: function (err) {
                this.edit(JSON.parse(err.data).obj)
            },
        })
            .on("create_node.jstree", function (e, { instance, node }, pos, callback, loaded) {
                instance.set_id(node, node.id);
                //var json_selected = get_json_node(node.id);
                // crear los datos SQL, 
                //sql_CreateTable(node.id) //tiene que ser el nodo de la tabla
                updateTree();
            })
            .on("changed.jstree", function (e, { action, node }) {
                if (action === "select_node") {
                    fillForm(node.id);
                    //if (node.type === "table-settings" || node.type === "table") fieldList(node.id);
                }
            })
            .on("rename_node.jstree", function (e, { node }) {
                node.type === "#" && alert("rename project name?");
            })
            .on("loaded.jstree", function () {/*before load*/ })
            .on("delete_node.jstree", function () {  /*before delete*/ });
    } catch (err) {
        return msg.danger(err.message);
    }
}

async function fillForm(nodeid) {
    msg.info("Fill form START");
    const form = await get_data({ url: "templates/headerForm.hbs", isJson: false, });
    const form_group = await get_data({ url: "templates/form_group.hbs", isJson: false, });
    const form_properties = await get_data({ url: "templates/form_properties.hbs", isJson: false, });
    var json_selected = get_json_node(nodeid);
    var template = Handlebars.compile(form);
    getChildrenHelper(form_group);
    properties_template(form_properties);

    msg.warning("Object used to fill form: ");
    console.log(json_selected);
    $(".container-form").html(template(json_selected));

    validate_control();
    msg.info("Fill form END");
}

async function createNode({ reference }, new_node_type = "", position = "last") {
    var inst = get_reference(reference);
    var obj = get_inst_node(reference);
    var options = {
        operation: "get_json",
        id: "#",
        text: new_node_type,
    };

    nextType = typeList("#", new_node_type).length + 1

    var newNode = {
        type: new_node_type,
        text: "new_" + new_node_type + "_" + nextType,
        children: [],
    };

    switch (new_node_type) {
        case "project-settings":
            newNode.text = "Project Settings";
            position = "first";
            break;
        case "group-settings":
            newNode.text = "Group Settings";
            position = "first";
            break
        case "field":
            options.text = "field-settings"
            break;
        case "group":
            break
        case "file":
            options.id = obj.id
            options.content = await get_data({ url: "settings/blank_project.json", isJson: false, })
            options.text = "new_file_" + (obj.children.length + 1) + ".json"
            newNode.text = options.text
            options.operation = "create_node"
            options.type = "file"
            break;
        case "folder":
        case "default":
            options.id = obj.id
            options.text = "new_folder_" + (obj.children.length + 1)
            options.operation = "create_node"
            options.type = "folder"
            break;
        default:
            break;
    }

    if (options.text != "") {
        get_data({ url: "starter.php", data: options })
            .then(({ content }) => {
                newNode.children = content
                inst.create_node(obj, newNode, position, function (new_node) {
                    setTimeout(() => inst.edit(new_node), 0);
                });
            })
            .catch(error => { console.log(error) })
    }

}

/**
 * create aditional context menu in project/ws tree
 * @param {string} node
 * @param {object} $this
 */
function contextMenu({ type }) {
    var tmp = $.jstree.defaults.contextmenu.items();
    tmp.create = false
    if (type !== "field_") {
        tmp.create = {
            label: "New object",
            action: false,
            submenu: {
                create_prj_setings: {
                    separator_after: false,
                    label: "Project Settings",
                    action: (data) => createNode(data, "project-settings"),
                    _disabled: () => compare_type("#", type),
                },
                create_grp_setings: {
                    separator_after: true,
                    label: "Group Settings",
                    action: (data) => createNode(data, "group-settings"),
                    _disabled: () => compare_type("group", type),
                },
                create_group: {
                    separator_after: false,
                    label: "Group",
                    action: (data) => createNode(data, "group"),
                    _disabled: () => compare_type("#", type),
                },
                create_table: {
                    separator_after: false,
                    label: "Table (ctrl+l)",
                    action: (data) => createNode(data, "table"),
                    _disabled: () => compare_type("group", type),
                },
                create_field: {
                    label: "Field (ctrl+f)",
                    action: (data) => createNode(data, "field"),
                    _disabled: () => compare_type("table", type),
                },
            }
        }
    }
    if (type === "default") {
        tmp.create = {
            label: "New",
            action: false,
            submenu: {
                create_folder: {
                    label: "Folder",
                    action: (node) => createNode(node, 'default')
                },
                create_file: {
                    label: "File",
                    action: (node) => createNode(node, 'file')
                },
            }
        }
    }
    return tmp;
}

const sql_CreateTable = (TableId) => {
    const fields = typeList(TableId, "field")
    const tableName = get_nodeName(TableId)
    fn = fields.map((e) => {
        f = get_nodeName(e)
        //todo: recuperar la informción de configuración del campo
        return `\`${f}\`  VARCHAR(40) NULL `
    }).join(",")
    sql = `CREATE TABLE IF NOT EXISTS '${tableName}' ( ${fn} ); `
    return sql
}

/**
 * regresa un array con los hijos de un nodo id que tenga un determinado tp (type)
 */
const typeList = (id, tp) => get_nodeChildrensId(id).filter((e) => get_json_node(e).type === tp && e)
/**
 * regresa un string con la propiedad name
 */
const get_nodeName = id => get_nodeById(id).text
/**
 * regresa un array con los hijos de un nodo id
 */
const get_nodeChildrensId = id => get_nodeById(id).children_d

function search_intree(search_value = false, long = 3) {
    search_value && search_value.length >= long ?
        project().jstree("search", search_value)
        :
        project().jstree("clear_search")
}
