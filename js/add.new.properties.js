console.log("add.new.properties");
$("body").on("click", "button.add-new-properties", function (e) {
    var data = $(this).data();
    add_properties_modal(data);
});

async function add_properties_modal(data) {
    var json_selected = get_json_node(data.nodeid);
    const add_object = {"newdata":{
        "id": "",
        "usershelper":"",
        "placeholder": "",
        "text": ""
    },
    "id": data.nodeid}
    console.log(json_selected);
    //object = $.extend(true, json_selected,add_object)
    console.log(add_object);
    const form = await get_file("templates/add_properties_modal.html");
    var template = Handlebars.compile(form);
    $(".container-form").append(template(add_object));
    $("#add-properties-modal-" + data.nodeid).modal("show");
}

function addValues(nodeid){
    alert("add to project")
    var obj_node = prjTree.get_node(nodeid);
    var new_prop = {};
    $('.form-new-prop').each(function(){
        var $this = $(this)
        var data = $this.data();
        new_prop[data.key] = $this.val();
        console.log(new_prop);
    })
    obj_node.data.user_value.push(new_prop);
    console.log(obj_node);
}
function addSetting(nodeid){
    alert("add to setting")
}