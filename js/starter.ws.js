var loadedWS = false;

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
						Container(false);
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
