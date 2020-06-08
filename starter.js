var fields_settings = [];
$(function () {
	$.get("projects/project.json")
		.done(function (data) {
			constructTree(data);
		});
	cosntructFieldsSettings();
});

$('.node-options').on('click', '.btn-expand', function () {
	var nodeid = this.dataset.nodeid;
	var container = $('.' + nodeid);
	if (container.hasClass('active')) {

		container.slideUp("slow");
		container.removeClass('active');
		$(this).text('+');

	} else {

		container.slideDown("slow");
		container.addClass('active');
		$(this).text('-');
	}
});

$(".saveproject").on('click', function (e) {
	updateData();
	updateTree();
	saveProject();
});

$(".save-app-data").on('click', function (e) {
	updateData();
});

function updateData() {
	$('.form-node').each(function () {
		var obj_node = $('#project_tree').jstree(true).get_node(this.dataset.nodeid);
		if (obj_node.li_attr.lang) {
			obj_node.data.user_value[this.dataset.index].text = $(this).val();
		} else {
			//lang undefined
			obj_node.data.user_value = $(this).val();
		}
	});
};
function saveProject() {
	//card-refresh
	//$('.card').CardRefresh('card-refresh');
	var node = getJsonNode();
	var file = node[0].text;
	var jsonData = JSON.stringify(node);
	$.ajax({
		type: "POST",
		url: "starter.php",
		data: { 'operation': 'save_file', 'type': 'json', 'id': 'projects/' + file +'.json', 'text': jsonData },
		dataType: "json",
		success: function (res) {
			if (res == undefined) {
				alert("Error : 219");
			}
			else {
				alert(res.id);
			}
			//$('.card').CardRefresh('onLoadDone');
		},
		error: function (res) {
			if (res == undefined) {
				alert("Error : 465");
			}
			else {
				alert("Error : 468 " + res.id);
			}
			//$('.card').CardRefresh('onLoadDone');
		}
	});
}
function getJsonNode(id = '#', flat = false) {
	var tree = $('#project_tree').jstree(true);
	var nodeDataJson = tree.get_json(id, {
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

function createNode(data, type) {
	var inst = $.jstree.reference(data.reference);
	var obj = inst.get_node(data.reference);

	if (type === 'field') {
		childs = fields_settings;
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

function constructForm(obj) {
	var html = '<form role="form">';
	$(obj).each(function () {
		var node_obj = getJsonNode(this.id);
		html += '<div class="form-group">' +
			'<label for="' + this.id + '" class="">' + node_obj.text +
			': </label>';
		if (this.type === 'text' || this.type === 'integer') {
			var value = node_obj.data.user_value;
			var placeholder = node_obj.data.placeholder;
			if (this.lang) {
				var i = 0;
				node_obj.data.user_value.forEach(element => {
					value = element.text;
					var active = i === 0 ? " default " : "";
					html += '<div class="expandableContent ' + active + this.id + '">';
					html += '<div class="input-group mb-3"><div class="input-group-prepend"><span class="input-group-text">' + element.id + '</span></div>';
					html += '<input type="text" class="form-control form-node" data-nodeid="' + this.id + '" data-index="' + i + '" placeholder="' + placeholder + '" value = "' + value + '" ></div>';
					html += '</div>';
					i += 1;
				});
				html += '<button type="button" class="btn btn-block btn-default btn-xs btn-expand" data-nodeid="' + this.id + '" >+</button>';
			} else {
				html += '<input type="text" class="form-control form-node" data-nodeid="' + this.id + '" name="' + this.id + '" id="' + this.id +
					'" placeholder="' + placeholder + '" value = "' + value + '" >';
			}
		}
		if (this.type === 'options') {
			node_obj.children.forEach(element => {
				html += '<select class="custom-select form-node" data-nodeid="' + this.id + '" name="' + this.id + '" id="' + this.id + '">';
				element.children.forEach(element => {
					html += '<option value="' + element.text + '">' + element.text + '</option>';
				});
				html += '</select>';
			});
		}
		html += '</div>';
	});
	html += '</form>';
	$('.node-options').html(html);
}

function cosntructFieldsSettings() {
	$.getJSON('settings/fields/_construct.json', function (data) {
		data.forEach(element => {
			$.getJSON('settings/fields/' + element + '.json', function (data) {
				fields_settings.push(data);
			});
		});
	});
	setTimeout(function () {
		fields_settings = mySort(fields_settings);
	}, 500);
}

function updateTree() {
	var tree = $('#project_tree').jstree(true);
	var treeData = getJsonNode();
	tree.settings.core.data = treeData;
}

function constructTree(data) {
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
			"types": {
				"#": {
					"max_children": 9,
					"icon": "fas fa-project-diagram"
				},
				"group": {
					"max_children": 20,
					"max_depth": 20,
					"icon": "far fa-object-group"
				},
				"table": {
					"max_children": 20,
					"max_depth": 20,
					"icon": "fas fa-table"
				},
				"field": {
					"max_children": 20,
					"max_depth": 20,
					"icon": "fas fa-stream"
				},
				"field-setting": {
					"max_children": 20,
					"max_depth": 20,
					"icon": "fa fa-cog"
				}
			},
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
			//console.log(data);
			if (data.action === "select_node") {
				var tree = $('#project_tree').jstree(true);
				var childrens = tree.get_children_dom(data.node.id);
				var text = '<span class = "right badge badge-success" title="type">' + data.node.type +
					'</span><span class="right badge badge-danger" title="Name">' + data.node.text +
					'</span><span class="right badge badge-warning" title="ID">' + data.node.id + '</span>';
				$('.card-title').html(text);
				constructForm(childrens);
			}
		})
		.on('rename_node.jstree', function (e, data) {
			if (data.node.type === "#") {
				alert('rename project file?')
				// $.get('starter.php?operation=rename_node', { 'id' : data.node.id, 'text' : data.text })
				// 	.done(function (d) {
				// 		data.instance.set_id(data.node, d.id);
				// 	})
				// 	.fail(function () {
				// 		data.instance.refresh();
				// 	});
			}
		});
}