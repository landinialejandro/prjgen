console.log("edit.text.button");
$("body").on("click", "button.edit-text", function (e) {
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
    console.log("%c save in setting file: " + "%c" + file, "background: white; color: green");
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
            console.log("%c " + data_desc.key + ": " + "%c" + $this.val(), "background: grey; color: black");
            data_setting.data.description[data_desc.key] = $this.val();
        })
        save_file(file, data_setting, dir);
    }
}

function saveValues(nodeid) {
    console.log("%c save in project: " + "%c" + nodeid, "background: white; color: green");
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