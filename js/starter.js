/**
 * TODO: se puede verificar cuando se compile si el usuario ha modificado el archivo y avisarle
 */

// Función para inicializar las opciones por defecto de jsTree
const initializeJsTreeDefaults = async () => {
    try {
        // Obtener los tipos
        const types = await get_data({ url: "settings/types.json" });

        // Configuración por defecto de jsTree
        $.jstree.defaults = {
            ...$.jstree.defaults,
            core: {
                ...$.jstree.defaults.core,
                data: null,
                check_callback: function (operation, node, parent, new_name, more) {
                    // Acceder a los types desde this.settings.types
                    const typesConfig = this.settings.types || {};
                    const typeConfig = typesConfig[node.type] || {};

                    msg.secondary(`Verificando si se puede realizar la operación '${operation}' en el tipo '${node.type}'`);

                    // Validación para operaciones de arrastrar y soltar
                    if (more && more.dnd && more.pos !== "i") {
                        msg.danger("Operación de arrastrar y soltar no permitida en esta posición.");
                        return false;
                    }

                    switch (operation) {
                        case "move_node":
                        case "copy_node":
                            // No permitir mover o copiar el nodo al mismo padre
                            if (node.parent === parent.id) {
                                msg.danger("No se puede mover o copiar el nodo al mismo padre.");
                                return false;
                            }
                            break;

                        case "delete_node":
                            if (!typeConfig.delete) {
                                msg.danger(`No tienes permiso para eliminar el tipo '${node.type}'.`);
                                return false;
                            } else {
                                return confirm("¿Estás seguro de que deseas eliminar este nodo?");
                            }

                        case "rename_node":
                            if (!typeConfig.rename) {
                                msg.danger(`No tienes permiso para renombrar el tipo '${node.type}'.`);
                                return false;
                            }
                            if (node.type === "table") {
                                const tables = typeList("#", "table").map(id => get_nodeName(id));
                                if (tables.includes(new_name)) {
                                    msg.danger(`Nombre duplicado detectado: '${new_name}'.`);
                                    return false;
                                }
                            }
                            break;

                        default:
                            // Para otras operaciones no especificadas, permitir por defecto
                            break;
                    }

                    msg.info(`Operación '${operation}' permitida en el tipo '${node.type}'.`);
                    return true;
                },
            },
            types: types, // Incluimos los types obtenidos
            sort: function (a, b) {
                const typeA = this.get_type(a);
                const typeB = this.get_type(b);

                if (typeA === typeB) {
                    return this.get_text(a) > this.get_text(b) ? 1 : -1;
                } else {
                    return typeA >= typeB ? 1 : -1;
                }
            },
            contextmenu: { items: (node) => contextMenu(node) },
            plugins: ["dnd", "search", "state", "sort", "types", "contextmenu", "unique"],
            unique: { duplicate: (name, counter) => `${name} ${counter}` },
            search: {
                case_sensitive: false,
                show_only_matches: true,
            },
            error: function (err) {
                this.edit(JSON.parse(err.data).obj);
            }
        };

    } catch (error) {
        console.error("Error al inicializar las opciones por defecto de jsTree:", error);
        msg.error("No se pudo cargar la configuración del árbol.");
    }
};

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
                                msg.info("Debug tree loaded...")
                                constructDebugTree()
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
