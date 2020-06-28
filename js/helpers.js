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
				"inString": function (l,r) {
					return r.indexOf( l ) !== -1;
				},
				"notInString": function (l,r) {
					return r.indexOf( l ) === -1;
				}
			},
			result = operators[operator](operand_1, operand_2);

		if (result) return options.fn(this);
		else return options.inverse(this);
	});
}

function getChildrenHelper(form_group) {
	Handlebars.registerHelper('getchildren', function (id, options) {
		var nodeID = prjTree.get_json(id);
		var template = Handlebars.compile(form_group);
		var type = options.data.root.type;
		if (type != 'filed' && type != 'field-setting') {
			nodeID['readonly'] = true;
		}
		var res = template(nodeID);
		return res;
	});
}