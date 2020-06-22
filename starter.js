var prjTree = false;
var loadedWS = false;

$(function () {
	constructWSTree();

	// $.get('settings/icons/icons.json', function(data){    
	// 	$.get('templates/iconlist.html',function(form){
	// 		var template = Handlebars.compile(form);
	// 		$('.container-icons').html(template(data));
	// 	})
	// });

});

$('.container-form').on('click', '.btn-expand', function () {
	expandContainer('.' + this.dataset.nodeid, this);
});

$(".saveproject").on('click', function (e) {
	updateData();
	$('.card-project').addClass('container-disabled');
	updateTree();
	saveProject();
});

$(".newproject").on('click', function (e) {
	loadProject('settings/blank_project.json');
});

$(".save-app-data").on('click', function (e) {
	updateData();
});

function destroyProject() {
	if (prjTree) {
		prjTree.destroy();
	}
}

function updateData() {
	$('.card-project').addClass('container-disabled');
	$('.form-node').each(function () {
		var $this = $(this);
		var obj_node = prjTree.get_node($this.data("nodeid"));
		if (!$.isEmptyObject(obj_node)) {
			var data = obj_node.data;
			if (data != null) {
				if (Array.isArray(data.user_value)) {
					data.user_value[$this.data("index")].text = $this.val();
				} else if ($this.hasClass('custom-control-input')) {
					data.options[$this.data("index")].checked = this.checked;
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

function saveProject() {
	var node = getJsonNode();
	var file = node[0].text;
	save_file(file + '.json', node);
}

function save_file(url, data, folder = 'projects') {
	$.ajax({
		type: "POST",
		url: "starter.php",
		data: {
			'operation': 'save_file',
			'type': 'json',
			'id': url,
			'text': JSON.stringify(data),
			folder: folder
		},
		dataType: "json",
		success: function (res) {
			if (res == undefined) {
				alert("Error: unexpected response");
			} else {
				console.log("%c saved file: ", "background: white; color: green");
				console.log(res.id);
			}
		},
		error: function (res) {
			if (res == undefined) {
				alert("Error: undefined");
			} else {
				alert("Error: " + res.responseText);
			}
		},
		complete: function () {
			$('.container-disabled').removeClass('container-disabled');
		}
	}).always(function () {
		$('#ws_tree').jstree(true).refresh();
	});
}

function getJsonNode(id = '#', flat = false) {
	var nodeDataJson = prjTree.get_json(id, {
		flat: flat
	}); // set flat:true to get all nodes in 1-level json
	return nodeDataJson;
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
				return compare_type('#',data);
			}
		},
		"create_group": {
			"separator_after": false,
			"label": "Group",
			"action": function (data) {
				createNode(data, "group");
			},
			"_disabled": function (data) {
				return compare_type('#',data);
			}
		},
		"create_grp_setings": {
			"separator_after": true,
			"label": "Group Settings",
			"action": function (data) {
				createNode(data, "group-settings");
			},
			"_disabled": function (data) {
				return compare_type('group',data);
			}
		},
		"create_table": {
			"separator_after": true,
			"label": "Table",
			"action": function (data) {
				createNode(data, "table");
			},
			"_disabled": function (data) {
				return compare_type('group',data);
			}
		},
		"create_field": {
			"label": "Field",
			"action": function (data) {
				createNode(data, "field");
			},
			"_disabled": function (data) {
				return compare_type('table',data);
			}
		}
	};
	if ($this.get_type(node) === "field_") {
		delete tmp.create;
	}
	return tmp;
}

function get_reference(data) { //return reference node
	var inst = $.jstree.reference(data.reference);
	return inst.get_node(data.reference);
}

function compare_type(type,data){
	var obj = get_reference(data);
	return obj.type != type;
}

async function createNode(data, type) {
	var inst = $.jstree.reference(data.reference);
	var obj = inst.get_node(data.reference);
	var text = "new_" + type + "_" + (obj.children.length + 1);
	var childs = [];
	var options = {
		operation: "get_json",
		id: "#",
		text: ""
	};
	var a_attr = {};
	var position = "last";
	if (type === 'field') {
		options.text = "field-settings";
	}
	if (type === 'project-settings') {
		options.text = "project-settings";
		text = "Project Settings";
		a_attr = {
			'style': 'background-color: yellow'
		};
		position = "first";
	}
	if (type === 'group-settings') {
		options.text = "group-settings";
		text = "Group Settings";
		a_attr = {
			'style': 'background-color: yellow'
		};
		position = "first";
	}
	if (options.text != "") {
		try {
			childs = await get_data("starter.php", options);
		} catch (err) {
			return console.log(err.message);
		}
	}
	inst.create_node(obj, {
		type: type,
		text: text,
		children: childs,
		a_attr: a_attr
	}, position, function (new_node) {
		setTimeout(function () {
			inst.edit(new_node);
		}, 0);
	});
}

function updateTree() {
	var treeData = getJsonNode();
	prjTree.settings.core.data = treeData;
}

async function constructTree(file) {

	try {
		const types = await get_file('settings/prj_types.json');
		const data = await get_file(file);
		const form = await get_file('templates/headerForm.html');
		const fieldform = await get_file('templates/fieldForm.html');

		$('#project_tree')
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
			.on('create_node.jstree', function (e, data) {
				data.instance.set_id(data.node, data.node.id);
				updateTree();
			})
			.on('changed.jstree', function (e, data) {
				if (data.action === "select_node") {
					var selectedID = prjTree.get_json(data.node.id);
					//console.log(selectedID);
					whenHelper();
					getChildrenHelper(fieldform);

					var template = Handlebars.compile(form);
					$('.container-form').html(template(selectedID));

				}
			})
			.on('rename_node.jstree', function (e, data) {
				if (data.node.type === "#") {
					alert('rename project file?');
				}
			})
			.on('loaded.jstree', function () {
				prjTree = $('#project_tree').jstree(true);
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
					if (file !== loadedWS) {
						$('#ws_tree').addClass('container-disabled');
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

function loadProject(file) {
	destroyProject();
	constructTree(file);
}

function whenHelper() {
	Handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
		var operators = {
				'eq': function (l, r) {
					return l == r;
				},
				'noteq': function (l, r) {
					return l != r;
				},
				'gt': function (l, r) {
					return Number(l) > Number(r);
				},
				'or': function (l, r) {
					return l || r;
				},
				'and': function (l, r) {
					return l && r;
				},
				'%': function (l, r) {
					return (l % r) === 0;
				}
			},
			result = operators[operator](operand_1, operand_2);

		if (result) return options.fn(this);
		else return options.inverse(this);
	});
}

function getChildrenHelper(fieldform) {
	Handlebars.registerHelper('getchildren', function (id, options) {
		var nodeID = prjTree.get_json(id);
		var template = Handlebars.compile(fieldform);
		var type = options.data.root.type;
		if (type != 'filed' && type != 'field-setting') {
			nodeID['readonly'] = true;
		}
		var res = template(nodeID);
		return res;
	});
}

/*
TODO:
	

*/