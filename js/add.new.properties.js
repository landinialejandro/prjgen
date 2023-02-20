$("body").on("click", "button.add-new-properties", function(e) {
    var data = $(this).data();
    add_properties_modal(data);
});
$("body").on("click", "button.remove-property", function(e) {
    var data = $(this).data();
    remove_property(data);
});

async function add_properties_modal(data) {
    var json_selected = get_json_node(data.nodeid);
    const add_object = {
        "newdata": {
            "id": "",
            "usershelper": "",
            "placeholder": "",
            "text": "",
            "required": "false"
        },
        "id": data.nodeid
    }
    console.log(json_selected);
    const form = await get_data({url:"templates/add_properties_modal.hbs",isJson:false});
    var template = Handlebars.compile(form);
    var bb = template(add_object);
    $(".container-form").append(bb);
    $("#modal-" + data.nodeid).modal("show");
}

function addValues(nodeid) {
    if (confirm("add to project")) {
        var obj_node = prjTree().get_node(nodeid);
        var new_prop = {};
        $('.form-new-prop').each(function() {
            var $this = $(this)
                //TODO: check key values
            new_prop[$this.data('key')] = $this.val();
        })
        obj_node.data.properties.push(new_prop);
        msg.info("Add property to project:" + nodeid);
        console.log(obj_node);
        $("#modal-" + nodeid).modal("hide");
        setTimeout(() => {
            fillForm(nodeid);
            saveProject();
        }, 300);
    } else {
        msg.info('Add property to project CANCELED')
    }
}

function addSetting(nodeid) {
    alert("add to setting")
        //TODO: add values to settings
}

function remove_property(data) {
    msg.info('Remove property START')
    if (confirm("Remove??")) {
        var obj_node = prjTree().get_node(data.nodeid);
        msg.secondary("start object: ")
        msg.info(obj_node);
        var elements = Object.keys(obj_node.data.properties).length
        msg.secondary("Elements: " + elements);
        if (elements > 1) {
            //remove object
            msg.danger("Remove property from project: node:" + data.nodeid + "  index: " + data.index);
            obj_node.data.properties.splice(data.index, 1);
            msg.warning("Result object: ");
            msg.info(obj_node);
            setTimeout(() => {
                fillForm(data.nodeid);
                //saveProject();
            }, 300);
        } else {
            alert("You can't remove all elements");
        }
    } else {
        msg.info('Remove property CANCELED')
    }
    msg.info('Remove property END')
}