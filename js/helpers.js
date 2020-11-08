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
				},
				"inString": function (l, r) {
					return r.indexOf(l) !== -1;
				},
				"notInString": function (l, r) {
					return r.indexOf(l) === -1;
				}
			},
			result = operators[operator](operand_1, operand_2);

		if (result) return options.fn(this);
		else return options.inverse(this);
	});
}

function getChildrenHelper(form) {
	Handlebars.registerHelper('getchildren', function (id, options) {
		return process_template(id,options,form);
	});
}

function properties_template(form) {
	Handlebars.registerHelper('properties_template', function (id, options) {
		return process_template(id,options,form);
	})
}

function process_template(id, options, form) {
	var nodeid = prjTree.get_json(id);
	var template = Handlebars.compile(form);
	var type = options.data.root.type;
	if (type != 'filed' && type != 'field-setting') {
		nodeid['readonly'] = true;
	}
	var res = template(nodeid);
	return res;
}