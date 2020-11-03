console.log("edibutton");
$("body").on("click", "button.data-desc", function (e) {
    var data = $(this).data();
    //alert("hola editor: "+data.nodeid);
    edit_text_modal(data);
});

async function edit_text_modal(data) {
    var json_selected = get_json_node(data.nodeid);
    console.log(json_selected.data.description);
    const form = await get_file("templates/edit_text_modal.html");
    var template = Handlebars.compile(form);
    $(".container-form").append(template(json_selected));
    $("#edit-text-modal-" + data.nodeid).modal("show");
}

function saveSetting(nodeid) {
    alert("save node setting: " + nodeid);
    var obj_node = prjTree.get_node(nodeid);
}

function saveValues(nodeid) {
    console.log('Save in proyect');
    var obj_node = prjTree.get_node(nodeid);
    $('.form-node-description').each(function () {
        var $this = $(this);
        var data_desc = $(this).data();
        obj_node.data.description[data_desc.key] = $this.val();
    })
    $("#edit-text-modal-" + nodeid).modal("hide");
    setTimeout(() => {
        fillForm(nodeid);
        saveProject();
    }, 200);
}