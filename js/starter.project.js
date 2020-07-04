var prjTree = false;


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
	Container(false);
	$('.form-node').each(function () {
		var $this = $(this);
		var obj_node = prjTree.get_node($this.data("nodeid"));
		if (!$.isEmptyObject(obj_node)) {
			var data = obj_node.data;
			if (data != null) {
				var i = $this.data("index");
				if (Array.isArray(data.user_value)) {
					data.user_value[i].text = $this.val();
				} else if ($this.hasClass('custom-control-input')) {
					data.options[i].checked = this.checked;
				} else {
					data.user_value = $this.val();
				}
			}
			if ($this.hasClass('node-setting')) {
				var setting = $this.attr('name');
				obj_node[setting] = $this.val();
				//TODO: si cambia un setting habría que hacer un refresh del objeto tree.
			}
		}
	});
	Container();
}

/** 
 * save project data to file, get de file name from  name of root tree
 */
function saveProject() {
	var node = get_json_node();
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
		const form = await get_file('templates/headerForm.html');
		const form_group = await get_file('templates/form_group.html');

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
								console.log("%c ERROR! yo can't rename: " + n.type, "background: white; color: red");
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
				"plugins": ["dnd", "search", "state", "types", "contextmenu", "unique"]
			})
			.on('create_node.jstree', function (e, data, pos, callback, loaded) {
				data.instance.set_id(data.node, data.node.id);
				updateTree();
			})
			.on('changed.jstree', function (e, data) {
				if (data.action === "select_node") {
					var json_selected = get_json_node(data.node.id);
					var template = Handlebars.compile(form);
					whenHelper();
					getChildrenHelper(form_group);
					$('.container-form').html(template(json_selected));
					fieldList(json_selected);
				}
			})
			.on('rename_node.jstree', function (e, data) {
				if (data.node.type === "#") {
					alert('rename project file?');
				}
			})
			.on('loaded.jstree', function () {
				prjTree = $('.card-starter #project_tree').jstree(true);
			})
			.on('delete_node.jstree', function () {
				//before delete
			});

	} catch (err) {
		return console.log(err.message);
	}
}

async function createNode(data, type) {
	var inst = $.jstree.reference(data.reference);
	var obj = inst.get_node(data.reference);
	var options = {
		operation: "get_json",
		id: "#",
		text: ""
	};
	var newNode = {
		type: type,
		text: "new_" + type + "_" + (obj.children.length + 1),
		children: []
	};
	var position = "last";
	if (type === 'field') {
		options.text = "field-settings";
	}
	if (type === 'project-settings') {
		options.text = type;
		newNode.text = "Project Settings";
		position = "first";
	}
	if (type === 'group-settings') {
		options.text = type;
		newNode.text = "Group Settings";
		position = "first";
	}
	if (type === 'table-settings') {
		options.text = type;
		newNode.text = "Table Settings";
		position = "first";
	}

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
			"separator_after": true,
			"label": "Project Settings",
			"action": function (data) {
				createNode(data, "project-settings");
			},
			"_disabled": function (data) {
				return compare_type('#', data);
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
		"create_table": {
			"separator_after": false,
			"label": "Table",
			"action": function (data) {
				createNode(data, "table");
			},
			"_disabled": function (data) {
				return compare_type('group', data);
			}
		},
		"create_tbl_settings": {
			"separator_after": true,
			"label": "Table Settings",
			"action": function (data) {
				createNode(data, "table-settings");
			},
			"_disabled": function (data) {
				return compare_type('table', data);
			}
		},
		"create_field": {
			"label": "Field",
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

function fieldList() {
	var flatnode = get_json_node("#", true);
	$.each(flatnode, function (i, data) {
		if (data.type === 'table-settings') {
			var parent = prjTree.get_parent(data.id);
			var jsonParent = get_json_node(parent);
			var tbl_list = ["None"];
			$.each(jsonParent.children, function (i, obj) {
				if (obj.type === 'field') {
					tbl_list.push(obj.text);
				}
			});
			var table_settings = get_json_node(data.id);
			$.each(table_settings.children, function (i, obj) {
				if (obj.text === 'Default sortby') {
					var list = prjTree.get_node(obj.id);
					list.data.options = tbl_list;
					return false;
				}
			});
			updateTree();
		}
	});
}

function tableList() {
	var flatnode = get_json_node("#", true);
	$.each(flatnode, function (i, data) {
		if (data.type === 'table'){
			console.log(data.text);
		}
	});
}