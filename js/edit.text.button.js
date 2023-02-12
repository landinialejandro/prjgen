$("body").on("click", "button.data-desc", function(e) {
    var data = $(this).data();
    edit_text_modal(data);
});

async function edit_text_modal(data) {
    var json_selected = get_json_node(data.nodeid);
    console.log(json_selected.data.description);
    const form = await get_file({url:"templates/edit_text_modal.hbs",isJson:false});
    var template = Handlebars.compile(form);
    $(".container-form").append(template(json_selected));
    $("#modal-" + data.nodeid).modal("show");
}

async function saveSetting(nodeid) {
    var obj_node = prjTree().get_node(nodeid);
    var file = obj_node.data.filesetting;
    var dir = obj_node.data.filesettingdir;
    msg.info("Save in setting file: " + file);
    if (file) {
        alert('Las modificaciones se guardarán el archivo settings');
        var data = {
            operation: "get_json",
            id: dir + "/" + file,
            text: "file"
        }
        var data_setting = await get_data({url:"starter.php", data})

        $('.form-node-description').each(function() {
            var $this = $(this);
            var data_desc = $this.data();
            msg.secondary(data_desc.key + ": " + $this.val());
            data_setting.content.data.description[data_desc.key] = $this.val();
        })

        const datab = {
            operation: "save_file",
            type: "json",
            id: url,
            text: JSON.stringify(data_setting.content),
            folder: dir,
        }
        //save in settings file
        save_file("projects/"+file, datab);
    }
}

function saveValues(nodeid) {
    msg.info("Save in project node: " + nodeid);
    var obj_node = prjTree().get_node(nodeid);
    $('.form-node-description').each(function() {
        var $this = $(this);
        var data_desc = $this.data();
        obj_node.data.description[data_desc.key] = $this.val();
    })
    $("#modal-" + nodeid).modal("hide");
    setTimeout(() => {
        fillForm(nodeid);
        saveProject();
    }, 200);
}