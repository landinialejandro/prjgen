$("body").on("click", "button.add-new-properties", function (e) {
    var data = $(this).data();
    add_properties_modal(data.nodeid);
});
$("body").on("click", "button.remove-property", function (e) {
    var data = $(this).data();
    remove_property(data);
});

const add_properties_modal = (id) => {
    const add_object = {
        "newdata": {
            "id": "",
            "usershelper": "",
            "placeholder": "",
            "text": "",
            "required": "false"
        },
        "id": id
    }
    console.log(get_json_node(id));
    get_data({ url: "templates/add_properties_modal.hbs", isJson: false }).then((form) => {
        var template = Handlebars.compile(form);
        var result = template(add_object);
        $(".container-form").append(result);
        $("#modal-" + id).modal("show");
    })
}

function addValues(id) {
    if (confirm("add to project")) {
        var obj_node = get_nodeById(id)
        var new_prop = {};
        $('.form-new-prop').each(function () {
            var $this = $(this)
            //TODO: check key values
            new_prop[$this.data('key')] = $this.val();
        })
        obj_node.data.properties.push(new_prop);
        msg.info("Add property to project:" + id);
        console.log(obj_node);
        $("#modal-" + id).modal("hide");
        setTimeout(() => {
            fillForm(id);
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
        var obj_node = get_nodeById(data.nodeid);
        msg.secondary("start object: ")
        console.log(obj_node);
        var elements = Object.keys(obj_node.data.properties).length
        msg.secondary("Elements: " + elements);
        if (elements > 1) {
            //remove object
            msg.danger("Remove property from project: node:" + data.nodeid + "  index: " + data.index);
            obj_node.data.properties.splice(data.index, 1);
            msg.warning("Result object: ");
            console.log(obj_node);
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