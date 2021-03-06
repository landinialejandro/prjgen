secondary_log("edit.text.button");
$("body").on("click", "button.data-desc", function (e) {
    var data = $(this).data();
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

async function saveSetting(nodeid) {
    var obj_node = prjTree.get_node(nodeid);
    var file = obj_node.data.filesetting;
    var dir = obj_node.data.filesettingdir;
    info_log("Save in setting file: " + file);
    if (file) {
        alert('Las modificaciones se guardarán el archivo settings');
        var options = {
            operation: "get_json",
            id: dir + "/" + file,
            text: "file"
        }
        var data_setting = await get_data("starter.php", options)

        $('.form-node-description').each(function () {
            var $this = $(this);
            var data_desc = $this.data();
            secondary_log( data_desc.key + ": " + $this.val());
            data_setting.data.description[data_desc.key] = $this.val();
        })
        save_file(file, data_setting, dir);
    }
}

function saveValues(nodeid) {
    info_log("Save in project node: " + nodeid);
    var obj_node = prjTree.get_node(nodeid);
    $('.form-node-description').each(function () {
        var $this = $(this);
        var data_desc = $this.data();
        obj_node.data.description[data_desc.key] = $this.val();
    })
    $("#edit-text-modal-" + nodeid).modal("hide");
    setTimeout(() => {
        fillForm(nodeid);
        saveProject();
    }, 200);
}