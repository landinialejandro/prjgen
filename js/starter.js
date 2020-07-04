var prjTree = false;
var loadedWS = false;

$(function () {
	load_menu();
	setTimeout(() => {
		load_page($('.nav-sidebar').find('.project-page'));
		constructWSTree();
	}, 300);
	getVersion();
});

$(".container-form").on('click', '.btn-expand', function () {
	$(this).text(expandContainer('.' + this.dataset.nodeid));
});

$(".card-starter").on('click','.saveproject', function (e) {
	updateData();
	$('.card-starter').addClass('container-disabled');
	updateTree();
	saveProject();
});

$(".card-starter").on('click','.newproject', function (e) {
	loadProject('settings/blank_project.json');
});

$(".card-strater").on('click','.save-app-data', function (e) {
	updateData();
});

$(".nav-sidebar").on('click','.nav-link', function (e) {
	e.preventDefault();
	load_page($(this));
});

function destroyProject() {
	if (prjTree) {
		prjTree.destroy();
	}
}

/**
 * udpdate user data in project tree 
 */
function updateData() {
	$('.card-starter').addClass('container-disabled');
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
	$('.container-disabled').removeClass('container-disabled');
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

/**
 * get json node from data reference
 * @param {Object} data tree to get reference
 * @return {Object} json node data
 */
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

async function constructWSTree() {
	try {
		const types = await get_file('settings/ws_types.json');
		const ws = await get_file('settings/workspace.json');

		$('#ws_tree')
			.jstree({
				'core': {
					'data': {
						'url': 'starter.php?operation=get_node',
						'data': function (node) {
							return {
								'id': node.id
							};
						}
					},
					'check_callback': function (o, n, p, i, m) {
						if (m && m.dnd && m.pos !== 'i') {
							return false;
						}
						if (o === "move_node" || o === "copy_node") {
							if (this.get_node(n).parent === this.get_node(p).id) {
								return false;
							}
						}
						return true;
					}
				},
				'sort': function (a, b) {
					return this.get_type(a) === this.get_type(b) ? (this.get_text(a) > this.get_text(b) ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
				},
				'contextmenu': {
					'items': function (node) {
						var tmp = $.jstree.defaults.contextmenu.items();
						delete tmp.create.action;
						tmp.create.label = "New";
						tmp.create.submenu = {
							"create_folder": {
								"separator_after": true,
								"label": "Folder",
								"action": function (data) {
									var inst = $.jstree.reference(data.reference),
										obj = inst.get_node(data.reference);
									inst.create_node(obj, {
										type: "default"
									}, "last", function (new_node) {
										setTimeout(function () {
											inst.edit(new_node);
										}, 0);
									});
								}
							},
							"create_file": {
								"label": "File",
								"action": function (data) {
									var inst = $.jstree.reference(data.reference),
										obj = inst.get_node(data.reference);
									inst.create_node(obj, {
										type: "file"
									}, "last", function (new_node) {
										setTimeout(function () {
											inst.edit(new_node);
										}, 0);
									});
								}
							}
						};
						if (this.get_type(node) === "file") {
							delete tmp.create;
						}
						return tmp;
					}
				},
				"types": types,
				"unique": {
					"duplicate": function (name, counter) {
						return name + ' ' + counter;
					}
				},
				"plugins": ["state", "sort", "types", "contextmenu", "unique"]
			})
			.on('loaded.jstree', function (e, data) {
				if (ws.text && ws.text !== "" && ws.text !== 'undefined') {
					loadedWS = ws.text;
					loadProject('projects/' + loadedWS);
				}
			})
			.on('select_node.jstree', function (n, data, e) {
				var type = data.node.type;
				var event = false;
				if (typeof data.event !== 'undefined') {
					event = (data.event.type === 'contextmenu' ? false : true);
				}
				if (type === 'file' && event) {
					//id="ws_tree"
					var file = data.node.text;
					var active = $('.project-page').hasClass('active') ;
					if (file !== loadedWS || !active) {
						$('#ws_tree').addClass('container-disabled');
						load_page($('.project-page'));
						loadedWS = file;
						loadProject('projects/' + file);
						save_file('workspace.json', {
							text: file
						}, "settings");
					}
				}
			});
	} catch (err) {
		return console.log(err.message);
	}
}

async function load_page(object) {
	var url = object.attr('href');
	var active = object.hasClass('active') ;
	if (url !== "#") {
		var page = await get_file(url);
		$('.nav-sidebar .active').removeClass('active');
		object.addClass('active');
		$('.breadcrumb-item.active').text(object.children('p').text());
		$('.card-starter').html(page);
	} else {
		location.reload();
	}
	return active;
}

async function load_menu(){
	var data = await get_file('settings/nav_sidebar.json');
	var html = await get_file('templates/nav_sidebar.html');
	var template = Handlebars.compile(html);
	$('.nav-sidebar').html(template(data));

}

async function getVersion(){
	options = {
		operation:"version",
		id:"#",
		text:"get-version"
	};
	var version = await get_data("starter.php", options);
	console.log(version);
}


function loadProject(file) {
	destroyProject();
	constructTree(file);
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

/*
TODO:	lista de campos de una tabla en proceso
		lista de tablas
	

*/