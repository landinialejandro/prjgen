const msg = new Msglog()
const modules = [
    "js/alert.js",
    "js/starter.helpers.js",
    "js/starter.project.js",
    "js/starter.ws.js",
    "js/starter.debug.js",
    "js/edit.text.button.js",
    "js/add.new.properties.js",
    "js/keyboard.input.js",
    "js/validate.control.js",
    "js/hbs.js"
];
Promise.all(modules.map(LoadModule))
    .then(() => {
        //Código que se ejecuta después de que se hayan cargado todos los módulos
        get_settings()
            .then(({ version, release = "alpha" }) => {
                text = version + " - " + release
                msg.info("version: " + text);
                $(".starter-version").html(text);
            })
            .catch((err) => {
                console.log(err);
            });

        hidePreloader()
    })
    .catch((error) => {
        console.error(error);
    });

/**
 * TODO: se puede verificar cuando se compile si el usuario ha modificado el archivo y avisarle
 */

const getTypes = () => get_data({ url: "settings/types.json" })

//opciones por defecto de jstree
$.jstree.defaults = {
    ...$.jstree.defaults,
    core: {
        ...$.jstree.defaults.core,
        data: null,
        check_callback: function (o, n, p, i, m) {
            const t = filteredObject(types, [n.type])
            msg.secondary("check if can " + o + " by type");
            if (m && m.dnd && m.pos !== "i") return false;
            if (o === "move_node" || o === "copy_node") {
                if (n.parent === p.id) return false;
            }
            if (o === "delete_node") {
                if (!t[n.type].delete) {
                    msg.danger("ERROR! you can't delete: " + n.type)
                    return false;
                } else {
                    return confirm("Are you sure you want to delete?");
                }
            }
            if (o === "rename_node") {
                if (!t[n.type].rename) {
                    msg.danger("ERROR! yo can't rename: " + n.type)
                    return false
                }
                if (n.type === "table") {
                    tables = typeList("#", "table").map(id => get_nodeName(id))
                    if (tables.includes(i)) {
                        msg.danger("ERROR! Nombre Duplicado: " + i)
                        return false
                    }
                }
            }
            msg.info("you can " + o + " ");
            return true;
        },
    },
    types: {},
    sort: function (a, b) {
        return this.get_type(a) === this.get_type(b)
            ? this.get_text(a) > this.get_text(b) ? 1 : -1
            : this.get_type(a) >= this.get_type(b) ? 1 : -1;
    },
    contextmenu: { items: (node) => contextMenu(node) },
    plugins: ["dnd", "search", "state", "sort", "types", "contextmenu", "unique"],
    unique: { duplicate: (name, counter) => name + " " + counter },
    search: {
        case_sensitive: false,
        show_only_matches: true,
    },
    error: function (err) { this.edit(JSON.parse(err.data).obj); }
}

const ws = () => $("#ws_tree")
const debug = () => $("#debug_tree")
const project = () => $(".card-starter #project_tree")

const prjTree = () => project().jstree(true)

const get_workspace = () => get_data({ url: "settings/workspace.json" })
const get_ws_selectedNodeId = () => ws().jstree().get_selected(true)[0].id
const get_ws_selectedNodeText = () => ws().jstree().get_selected(true)[0].text
const get_ws_lastProject = async () => await get_workspace().then(({ id }) => id)

const get_json_node = (id = "#", flat = false) => prjTree().get_json(id, { flat })
const get_nodeById = id => prjTree().get_node(id);
const get_reference = (reference) => $.jstree.reference(reference)
const get_inst_node = (reference) => get_reference(reference).get_node(reference)
const compare_type = (type, node_type) => node_type != type
const updateTree = () => prjTree().settings.core.data = get_json_node()
const destroyProject = () => prjTree() && prjTree().destroy()
const goto_search = () => search_intree($(".search-value").val())

//Procesos principales
get_data({ url: "templates/nav_sidebar.hbs", isJson: false, })
    .then((hbs) => {
        const template = Handlebars.compile(hbs)
        get_data({ url: "settings/nav_sidebar.json" })
            .then((json) => {
                msg.info("Sidebar loaded...")
                $(".nav-sidebar").html(template(json))
                url = $(".nav-sidebar").find(".project-page").attr("href")
                loadPage(url)
                    .then(() => {
                        msg.info("WS tree loaded...")
                        constructWSTree()
                            .then(() => {
                                // msg.info("Debug tree loaded...")
                                // constructDebugTree()
                                Container()
                            })
                    })
                msg.info("Project page loaded...")
            })
    })


//click on save project
$(".navbar-nav").on("click", ".saveproject", function (e) {
    Container(false);
    updateData();
    updateTree();
    saveProject();
    Container();
});

//click on new project
$(".navbar-nav").on("click", ".newproject", (e) => loadProject("settings/blank_project.json"))

//click on make project
$(".navbar-nav").on("click", ".makeproject", (e) => {
    var tables = typeList("#", "table")
    fields = tables.map(id => sql_CreateTable(id))
    console.log(fields)
})

//click on search on tree options buttons
$(".start-search").on("click", (e) => goto_search())
$(".clear-search").on("click", (e) => search_intree(false))
$(".search-value").on("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault()
        goto_search()
    }
})

//click on update project
$(".card-starter").on("click", ".updateproject", (e) => updateData())

//click on menu link item
$(".nav-sidebar").on("click", ".nav-link", function (e) {
    e.preventDefault()
    loadPage($(this).attr("href")).then(() => $(this).addClass("active"))
    setBreadCrum(this.text.trim())
});

//load page from links left menu
const loadPage = async (url) => {
    Container(false)
    msg.info("loadPage - Cargando..." + url)
    if (url === "#") location.reload()
    get_data({ url, method: "", isJson: false }) //carga las distintas paginas html, project_page.html es la pagina de proyectos
        .then((page) => {
            $(".nav-sidebar .active").removeClass("active") //remueve la clase active del elemento actual, para que no se quede con la clase active el elemento que se esta cargando
            $(".card-starter").html(page) //carga la pagina html en el div card-starter
        })
}
