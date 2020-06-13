var prjTree = false;

$(function () {
	constructWSTree();
});

$('.container-form').on('click', '.btn-expand', function () {
	expandContainer('.' + this.dataset.nodeid,this)
});

$(".saveproject").on('click', function (e) {
	$('.card-project').addClass('container-disabled');
	updateData();
	updateTree();
	saveProject();
});

$(".newproject").on('click', function (e) {
	destroyProject();
	constructTree('settings/blank_project.json');
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
	$('.form-node').each(function () {
		var obj_node = prjTree.get_node(this.dataset.nodeid);
		if (obj_node.li_attr.lang) {
			obj_node.data.user_value[this.dataset.index].text = $(this).val();
		} else {
			//lang undefined
			obj_node.data.user_value = $(this).val();
		}
	});
}

function saveProject() {
	var node = getJsonNode();
	var file = node[0].text;
	var jsonData = JSON.stringify(node);
	$.ajax({
		type: "POST",
		url: "starter.php",
		data: { 'operation': 'save_file', 'type': 'json', 'id': 'projects/' + file + '.json', 'text': jsonData },
		dataType: "json",
		success: function (res) {
			if (res == undefined) {
				alert("Error : 219");
			}
			else {
				alert(res.id);
			}
			$('.card-project').removeClass('container-disabled');
		},
		error: function (res) {
			if (res == undefined) {
				alert("Error : 465");
			}
			else {
				alert("Error : 468 " + res.responseText);
			}
			$('.card-project').removeClass('container-disabled');
		}
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
		"create_group": {
			"separator_after": true,
			"label": "Group",
			"action": function (data) {
				createNode(data, "group");
			}
		},
		"create_table": {
			"separator_after": true,
			"label": "Table",
			"action": function (data) {
				createNode(data, "table");
			}
		},
		"create_field": {
			"label": "Field",
			"action": function (data) {
				createNode(data, "field");
			}
		}
	};
	if ($this.get_type(node) === "field_") {
		delete tmp.create;
	}
	return tmp;
}

async function createNode(data, type) {
	var inst = $.jstree.reference(data.reference);
	var obj = inst.get_node(data.reference);

	if (type === 'field') {
		try {
			var data = { operation: "get_json", id: "#", text: "field-settings" };
			const childs = await get_data(data);
		} catch (err) {
			return console.log(err.message);
		}
	} else {
		childs = [];
	}

	inst.create_node(obj, {
		type: type,
		text: "new_" + type + "_" + (obj.children.length + 1),
		children: childs
	}, "last", function (new_node) {
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
		const form = await get_file('templates/fieldForm.html');

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
						return true;
					}
				},
				"types": types,
				'contextmenu': {
					'items': function (node) {
						return contextMenu(node, this);
					}
				},
				"plugins": ["dnd", "search", "state", "types", "contextmenu"]
			})
			.on('create_node.jstree', function (e, data) {
				var error = true;
				var parentData = getJsonNode(data.node.parent);
				if (parentData.type === 'table' && data.node.type === 'field' && error) {
					error = false;
				}
				if (parentData.type === 'group' && data.node.type === 'table' && error) {
					error = false;
				}
				if (parentData.type === '#' && data.node.type === 'group' && error) {
					error = false;
				}
				if (parentData.type === 'field' && data.node.type === 'field-setting' && error) {
					error = false;
				}
				if (parentData.type === 'field-setting' && data.node.type === 'default' && error) {
					error = false;
				}

				if (error) {
					data.instance.refresh();
					console.log("can't add " + data.node.type + " into " + parentData.type);
				} else {
					data.instance.set_id(data.node, data.node.id);
				}
				updateTree();
			})
			.on('changed.jstree', function (e, data) {
				if (data.action === "select_node") {
					var algo = prjTree.get_json(data.node.id);
					console.log(algo);
					var template = Handlebars.compile(form);
					$('.container-form').html(template(algo));
				}
			})
			.on('rename_node.jstree', function (e, data) {
				if (data.node.type === "#") {
					alert('rename project file?');
				}
			})
			.on('loaded.jstree', function () {
				prjTree = $('#project_tree').jstree(true);
			});

	} catch (err) {
		return console.log(err.message);
	}
}

async function constructWSTree() {
	try {
		const types = await get_file('settings/ws_types.json');
		const data = await get_file('settings/workspace.json');

		$('#ws_tree')
			.jstree({
				"check_callback": true,
				"core": {
					"data": data
				},
				"plugins": ["types"],
				"types": types
			})
			.on('loaded.jstree', function (e, data) {
				var file = data.instance.get_children_dom('last-open');
				file = $(file).text();
				constructTree('projects/' + file);
			})
			.on('select_node.jstree', function (n, data, e) {
				var type = data.node.type;
				if (type === 'default') {
					var file = data.node.text;
					destroyProject();
					constructTree('projects/' + file);
				}
			});
	} catch (err) {
		return console.log(err.message);
	}
}
