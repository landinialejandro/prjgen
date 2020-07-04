LoadModule('js/alert.js');
LoadModule('js/starter.project.js');
LoadModule('js/starter.ws.js');

$(function () {
	load_menu();
	getVersion();
	setTimeout(() => {
		load_page($('.nav-sidebar').find('.project-page'));
		constructWSTree();
	}, 300);
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

/**
 * Load starter left menu
 */
async function load_menu(){
	var data = await get_file('settings/nav_sidebar.json');
	var html = await get_file('templates/nav_sidebar.html');
	var template = Handlebars.compile(html);
	$('.nav-sidebar').html(template(data));
}

/**
 * get date for last starter commit
 */
async function getVersion(){
	options = {
		operation:"version",
		id:"#",
		text:".starter-version"
	};
	var version = await get_data("starter.php", options);
	$(options.text).html(version[3]);
}

/*
TODO:	lista de campos de una tabla en proceso

*/