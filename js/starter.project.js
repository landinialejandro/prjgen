secondary_log('starter.project');
var prjTree = false;
var project = false;


/*
TODO:	lista de campos de una tabla en proceso

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
 * detroy the current loaded project
 */
function destroyProject() {
    if (prjTree) {
        prjTree.destroy();
    }
}

/**
 * udpdate user data in project tree 
 */
function updateData() {
    console.log('UpdateData');
    $('.form-node').each(function () {
        var $this = $(this);
        var obj_node = prjTree.get_node($this.data("nodeid"));
        console.log(obj_node);

        if (!$.isEmptyObject(obj_node)) {
            var data = obj_node.data;
            if (data != null) {
                var i = parseInt($this.data("index"));
                if (Array.isArray(data.properties) && i >= 0) {
                    data.properties[i].text = $this.val();
                } else if ($this.hasClass('custom-control-input')) {
                    data.options[i].checked = this.checked;
                } else {
                    if ($this.hasClass('node-icon')) {
                        obj_node.icon = $this.val();
                    } else {
                        data.text = $this.val();
                    }
                }
            }
            if ($this.hasClass('node-setting')) {
                var setting = $this.attr('name');
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
    info_log("saving project");
    var node = get_json_node('#');
    var file = node[0].text;
    //TODO: se puede controlar si el nombre es valido antes de pasarlo a la función
    save_file(file + '.json', node);
}

/**
 * get json data node
 * @param {String} id node, by default get root id
 * @param {boolean} flat false get structured tree json data, true: get plain data
 * @return {Object} json object 
 */
function get_json_node(id = '#', flat = false) {
    var json_node = prjTree.get_json(id, {
        flat: flat
    }); // set flat:true to get all nodes in 1-level json
    return json_node;
}

function get_reference(data) { //return reference node
    var inst = $.jstree.reference(data.reference);
    return inst.get_node(data.reference);
}

function compare_type(type, data) {
    var obj = get_reference(data);
    return obj.type != type;
}

function updateTree() {
    prjTree.settings.core.data = get_json_node();
}

async function constructTree(file) {

    try {
        const data = await get_file(file);
        const types = await get_file('settings/prj_types.json');

        $('.card-starter #project_tree')
            .jstree({
                "core": {
                    "data": data,
                    'check_callback': function (o, n, p, i, m) {
                        if (m && m.dnd && m.pos !== 'i') {
                            return false;
                        }
                        if (o === "move_node" || o === "copy_node") {
                            if (this.get_node(n).parent === this.get_node(p).id) {
                                return false;
                            }
                        }
                        if (o === "delete_node") {
                            if (n.type === 'field-setting') {
                                return false;
                            } else {
                                return confirm('Are you sure you want to delete?');
                            }
                        }
                        if (o === "rename_node") {
                            var no_rename = ['field-setting', 'prj-setting', 'grp-setting', 'group-settings', 'project-settings'];
                            if ($.inArray(n.type, no_rename) >= 0) {
                                danger_log("ERROR! yo can't rename: " + n.type);
                                return false;
                            }
                        }
                        return true;
                    }
                },
                "types": types,
                'contextmenu': {
                    'items': function (node) {
                        return contextMenu(node, this);
                    }
                },
                "plugins": ["dnd", "search", "state", "types", "contextmenu", "unique"],
                "search": {
                    "case_sensitive": false,
                    "show_only_matches": true
                }
            })
            .on('create_node.jstree', function (e, data, pos, callback, loaded) {
                data.instance.set_id(data.node, data.node.id);
                var json_selected = get_json_node(data.node.id);
                fieldList(json_selected);
                updateTree();
            })
            .on('changed.jstree', function (e, data) {
                if (data.action === "select_node") {
                    fillForm(data.node.id)
                    if (data.node.type === 'table-settings' || data.node.type === 'table') {
                        fieldList(data.node.id);
                    }
                }
            })
            .on('rename_node.jstree', function (e, data) {
                if (data.node.type === "#") {
                    alert('rename project file?');
                }
            })
            .on('loaded.jstree', function () {
                project = $('.card-starter #project_tree');
                prjTree = project.jstree(true);
            })
            .on('delete_node.jstree', function () {
                //before delete
            });

    } catch (err) {
        return danger_log(err.message);
    }
}

async function fillForm(nodeid) {
    info_log("Fill form START");
    const form = await get_file('templates/headerForm.html');
    const form_group = await get_file('templates/form_group.html');
    const form_properties = await get_file('templates/form_properties.html');
    var json_selected = get_json_node(nodeid);
    var template = Handlebars.compile(form);
    whenHelper();
    getChildrenHelper(form_group);
    properties_template(form_properties);

    warning_log("Object used to fill form: ");
    console.log(json_selected);
    $('.container-form').html(template(json_selected));
    
    validate_control();
    info_log("Fill form END");
}

async function createNode(data, type, position = "last") {
    var inst = $.jstree.reference(data.reference);
    var obj = inst.get_node(data.reference);
    var options = {
        operation: "get_json",
        id: "#",
        text: type
    };
    var newNode = {
        type: type,
        text: "new_" + type + "_" + (obj.children.length + 1),
        children: []
    };
    if (type === 'project-settings') {
        newNode.text = "Project Settings";
        position = "first";
    }
    if (type === 'group-settings') {
        newNode.text = "Group Settings";
        position = "first";
    }
    if (type === 'field') {
        options.text = "field-settings";
    }
    if (type === 'table') {}
    if (type === 'group') {}

    if (options.text != "") {
        try {
            newNode.children = await get_data("starter.php", options);
        } catch (err) {
            return console.log(err.message);
        }
    }
    inst.create_node(obj, newNode, position, function (new_node) {
        setTimeout(function () {
            inst.edit(new_node);
        }, 0);
    });
}

/**
 * create context menu in project tree
 * @param {string} node 
 * @param {object} $this 
 */
function contextMenu(node, $this) { //create adtional context menu
    var tmp = $.jstree.defaults.contextmenu.items();
    delete tmp.create.action;
    tmp.create.label = "New object";
    tmp.create.submenu = {
        "create_prj_setings": {
            "separator_after": false,
            "label": "Project Settings",
            "action": function (data) {
                createNode(data, "project-settings");
            },
            "_disabled": function (data) {
                return compare_type('#', data);
            }
        },
        "create_grp_setings": {
            "separator_after": true,
            "label": "Group Settings",
            "action": function (data) {
                createNode(data, "group-settings");
            },
            "_disabled": function (data) {
                return compare_type('group', data);
            }
        },
        "create_group": {
            "separator_after": false,
            "label": "Group",
            "action": function (data) {
                createNode(data, "group");
            },
            "_disabled": function (data) {
                return compare_type('#', data);
            }
        },
        "create_table": {
            "separator_after": false,
            "label": "Table (ctrl+l)",
            "action": function (data) {
                createNode(data, "table");
            },
            "_disabled": function (data) {
                return compare_type('group', data);
            }
        },
        "create_field": {
            "label": "Field (ctrl+f)",
            "action": function (data) {
                createNode(data, "field");
            },
            "_disabled": function (data) {
                return compare_type('table', data);
            }
        }
    };
    if ($this.get_type(node) === "field_") {
        delete tmp.create;
    }
    return tmp;
}

function fieldList(id) { //by table
    var flatnode = get_json_node(id, true);
    $.each(flatnode, function (i, data) {
        if (data.type === 'table-settings') {
            var jsonSettings = get_json_node(data.id);
            var jsonParent = get_json_node(data.parent); //get data from table
            var tbl_list = [];
            $.each(jsonParent.children, function (i, e) {
                if (e.type === 'field') {
                    tbl_list.push(e.text);
                    var jsonField = get_json_node(e.id);
                    console.log(jsonField.children); //TODO analizar la configuración de cada campo
                }
            });
            updateSelect(data.id, tbl_list); //in table-settings
            setupTable = sql_setupTable(jsonParent.text, tbl_list);
            jsonSettings.data["sql"] = setupTable;
            //console.log ( jsonSettings);
        }
    });
    updateTree();
}

function sql_setupTable(tname, tbl_list = []) {
    var fn_list = [];
    $.each(tbl_list, function (i, e) {
        fn_list.push(`'${e}'`);
    });
    fn_list = fn_list.join(",");
    sql = `create table if not exists '${tname}' ( ${fn_list}); `;
    console.log(sql); // TODO: esto debería ir al table-settings
    return sql;
}

function updateSelect(id, tbl_list = []) {
    var table_settings = get_json_node(id);
    var list = ["None"];
    list.push(tbl_list);
    $.each(table_settings.children, function (i, e) {
        if (e.text === 'Default sortby') {
            var element = prjTree.get_node(e.id);
            element.data.options = list;
            return false;
        }
    });
}

function tableList() {
    var flatnode = get_json_node("#", true);
    $.each(flatnode, function (i, data) {
        if (typeof (data) === undefined) {
            debugger;
        }
        if (data.type === 'table') {
            danger_log(data.text);
        }

    });
}

function search_intree(search_value = false, long = 3) {
    if (search_value && search_value.length >= long) {
        project.jstree("search", search_value);
    } else {
        project.jstree("clear_search");
    }
}