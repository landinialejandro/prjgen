const msg = new Msglog();
LoadModule("js/alert.js");
LoadModule("js/starter.project.js");
LoadModule("js/starter.ws.js");
LoadModule("js/edit.text.button.js");
LoadModule("js/add.new.properties.js");
LoadModule("js/keyboard.input.js");
LoadModule("js/validate.control.js");

/**
 * TODO: se puede verificar cuando se compile si el usuario ha modificado el archivo y avisarle
 */

(function ($) {
  $(window).on("load", function () {
    hidePreloader();
  });
})(jQuery);

$(function () {
  //loaded page function.
  load_menu();
  setTimeout(() => {
    load_page($(".nav-sidebar").find(".project-page"));
    constructWSTree();
  }, 500);
  getVersion()
    .then(({ version }) => {
      msg.info("version: " + version);
      $(".starter-version").html(version);
    })
    .catch((err) => {
      console.log(err);
    });
});

/**
 * click on save project
 */
$(".navbar-nav").on("click", ".saveproject", function (e) {
  Container(false);
  updateData();
  updateTree();
  saveProject();
  Container();
});

/**
 * click on new project
 */
$(".navbar-nav").on("click", ".newproject", function (e) {
  loadProject("settings/blank_project.json");
});

/**
 * click on make project
 */
$(".navbar-nav").on("click", ".makeproject", function (e) {
  tableList();
});

/**
 * click on search on tree options buttons
 */
$(".start-search").on("click", function (e) {
  goto_search();
});
$(".clear-search").on("click", function (e) {
  search_intree(false);
});
$(".search-value").on("keypress", function (e) {
  if (e.key === "Enter") {
    goto_search();
  }
});

/**
 * click on update project
 */
$(".card-starter").on("click", ".updateproject", function (e) {
  updateData();
});

/**
 * click on menu link item
 */
$(".nav-sidebar").on("click", ".nav-link", function (e) {
  e.preventDefault();
  load_page($(this));
});

/**
 * enable or disable containers
 * @param {boolean} enable or disable a container
 */
function Container(enable = true) {
  if (enable) {
    setTimeout(() => {
      $(".container-disabled").removeClass("container-disabled");
    }, 200);
  } else {
    $(".card-starter").addClass("container-disabled");
    $("#ws_tree").addClass("container-disabled");
  }
}

/**
 * load page from links left menu
 * @param {object} object data menu link item
 * @returns {boolean} class active object
 */
async function load_page(object) {
  var url = object.attr("href");
  var active = object.hasClass("active");
  if (url !== "#") {
    var page = await get_file({ url, isJson: false });
    $(".nav-sidebar .active").removeClass("active");
    object.addClass("active");
    $(".breadcrumb-item.active").text(object.children("p").text());
    $(".card-starter").html(page);
  } else {
    location.reload();
  }
  return active;
}

/**
 * Load starter left menu
 */
async function load_menu() {
  var data = await get_file({ url: "settings/nav_sidebar.json" });
  var html = await get_file({
    url: "templates/nav_sidebar.hbs",
    isJson: false,
  });
  var template = Handlebars.compile(html);

  $(".nav-sidebar").html(template(data));
}

function goto_search() {
  var search_value = $(".search-value").val();
  search_intree(search_value);
}
