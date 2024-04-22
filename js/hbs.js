function RegisterHelpers() {
	msg.info("registering helpers...")
	Handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
		var operators = {
			'eq': (l, r) => l == r,
			'noteq': (l, r) => l != r,
			'gt': (l, r) => Number(l) > Number(r),
			'or': (l, r) => l || r,
			'and': (l, r) => l && r,
			'%': (l, r) => (l % r) === 0,
			"inString": (l, r) => r.indexOf(l) !== -1,
			"notInString": (l, r) => r.indexOf(l) === -1,
		}
		result = operators[operator](operand_1, operand_2)

		if (result) return options.fn(this)
		else return options.inverse(this)
	})
}

const RegisterPartials = () => {
	msg.info("registering partials...")
	const partials = ["modalHeader", "modalFooter"]
	partials.forEach(async (e) => {
		url = `templates/partials/${e}.hbs`
		t = await get_data({ url, isJson: false })
		Handlebars.registerPartial(e, t)
	})
}

function getChildrenHelper(form) {
	Handlebars.registerHelper('getchildren', function (id, options) {
		return process_template(id, options, form)
	});
}

function properties_template(form) {
	Handlebars.registerHelper('properties_template', function (id, options) {
		return process_template(id, options, form)
	})
}

function process_template(id, options, form) {
	var nodeid = prjTree().get_json(id)
	var template = Handlebars.compile(form)
	var type = options.data.root.type
	if (type != 'filed' && type != 'field-settings') {
		nodeid['readonly'] = true
	}
	var res = template(nodeid)
	return res;
}

RegisterHelpers()
RegisterPartials()