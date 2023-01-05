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

const get_json_node = (id = "#", flat = false) => prjTree.get_json(id, { flat })
const get_reference = (reference) => $.jstree.reference(reference)
const get_inst_node = (reference) => get_reference(reference).get_node(reference)
const compare_type = (type, node_type) => node_type != type;
const updateTree = () => prjTree.settings.core.data = get_json_node();
const get_prj_types = () => get_file({ url: "settings/prj_types.json" });
const get_ws_types = () => get_file({ url: "settings/ws_types.json" });
const get_ws_selectedNode  = () => $("#ws_tree").jstree().get_selected(true)[0].text;
const get_workspace = () => get_file({ url: "settings/workspace.json" });
const destroyProject = () => prjTree && prjTree.destroy();
const goto_search = () => search_intree($(".search-value").val());

document.addEventListener("DOMContentLoaded", () => hidePreloader())

//Procesos principales
get_file({ url: "templates/nav_sidebar.hbs", isJson: false, }).then((hbs) => {
    const template = Handlebars.compile(hbs)
    get_file({ url: "settings/nav_sidebar.json" }).then((json) => {
        $(".nav-sidebar").html(template(json))
        load_page($(".nav-sidebar").find(".project-page").attr("href"))
        constructWSTree()
    })
})
getVersion()
    .then(({ version }) => {
        msg.info("version: " + version);
        $(".starter-version").html(version);
    })
    .catch((err) => {
        console.log(err);
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
$(".navbar-nav").on("click", ".newproject", (e) => loadProject("settings/blank_project.json"))

/**
 * click on make project
 */
$(".navbar-nav").on("click", ".makeproject", (e) => tableList())

/**
 * click on search on tree options buttons
 */
$(".start-search").on("click", (e) => goto_search())
$(".clear-search").on("click", (e) => search_intree(false))
$(".search-value").on("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault()
        goto_search()
    }
})

/**
 * click on update project
 */
$(".card-starter").on("click", ".updateproject", (e) => updateData())

/**
 * click on menu link item
 */
$(".nav-sidebar").on("click", ".nav-link", function (e) {
    e.preventDefault()
    load_page($(this).attr("href")).then(() => $(this).addClass("active"))
});

/**
 * enable or disable containers
 * @param {boolean} enable or disable a container
 */
function Container(enable = true) {
    if (enable) {
        setTimeout(() => $(".container-disabled").removeClass("container-disabled"), 200)
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
async function load_page(url) {
    if (url !== "#") {
        var page = await get_file({ url, isJson: false }) //carga las distintas paginas html, project_page.html es la pagina de proyectos
        $(".nav-sidebar .active").removeClass("active") //remueve la clase active del elemento actual, para que no se quede con la clase active el elemento que se esta cargando
        $(".card-starter").html(page) //carga la pagina html en el div card-starter
    } else {
        location.reload();
    }
    return;
}
