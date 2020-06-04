var fields_settings = [];
$(function () {

  $('#project_tree').jstree({
    "core": {
      "data": {
        "url": "projects/project.json",
        "dataType": "json" // needed only if you do not supply JSON headers
      },
      'check_callback': function (o, n, p, i, m) {
        
        if (m && m.dnd && m.pos !== 'i') {
          return false;
        }
        if (o === "move_node" || o === "copy_node") {
          if (this.get_node(n).parent === this.get_node(p).id) {
            return false;
          }
        }
        return true;
      }
    },
    "types": {
      "#": {
        "max_children": 3,
        "icon": "fas fa-project-diagram"
      },
      "group": {
        "max_children": 20,
        "max_depth": 20,
        "icon": "far fa-object-group"
      },
      "table": {
        "max_children": 20,
        "max_depth": 20,
        "icon": "fas fa-table"
      },
      "field": {
        "max_children": 20,
        "max_depth": 20,
        "icon": "fas fa-stream"
      }
    },
    'contextmenu': {
      'items': function (node) {
        return contextMenu(node, this);
      }
    },
    "plugins": ["dnd", "search", "state", "types", "contextmenu"]
  });
  cosntructFieldsSettings();
});

$(".getjson").on('click', function (e) {
  var tree = $('#project_tree').jstree(true);
  var selTreeData = tree.get_selected(); // set flat:true to get all nodes in 1-level json
  var treeData = tree.get_json(selTreeData, {
    flat: false
  }); // set flat:true to get all nodes in 1-level json
  var childrens = tree.get_children_dom(selTreeData);
  //var jsonData = JSON.stringify(treeData);
  var text = '<span class = "right badge badge-success">'+ treeData.type + 
            '</span><span class="right badge badge-danger">' + treeData.text + 
            '</span><span class="right badge badge-warning">' + treeData.id +'</span>';
  $('.card-title').html(text);
  doForm(childrens);

});

function contextMenu(node, $this) { //create adtional context menu
  var tmp = $.jstree.defaults.contextmenu.items();
  delete tmp.create.action;
  tmp.create.label = "New object";
  tmp.create.submenu = {
    "create_group": {
      "separator_after": true,
      "label": "Group",
      "action": function (data) {
        createNode(data, "group");
      }
    },
    "create_table": {
      "separator_after": true,
      "label": "Table",
      "action": function (data) {
        createNode(data, "table");
      }
    },
    "create_field": {
      "label": "Field",
      "action": function (data) {
        createNode(data, "field");
      }
    }
  };
  if ($this.get_type(node) === "field_") {
    delete tmp.create;
  }
  return tmp;
}

function createNode(data, type) {
  var inst = $.jstree.reference(data.reference);
  var obj = inst.get_node(data.reference);
  inst.create_node(obj, {
    type: type
  }, "last", function (new_node) {
    setTimeout(function () {
      inst.edit(new_node);
    }, 0);
  });
}

function doForm(obj) {
  var tree = $('#project_tree').jstree(true);
  var html = '<form role="form">';
  $(obj).each(function () {
    var json_obj = tree.get_json(this.id);
    //console.log(json_obj);
    html += '<div class="form-group">' +
      '<label for="' + this.id + '" class="">' + json_obj.text +
      ': </label>';
    if (this.type === 'text' || this.type === 'integer') {
        var value = json_obj.data.user_value;
        var placeholder = json_obj.data.placeholder;
        if (this.lang){
            json_obj.data.user_value.forEach(element =>{
                value = element.text;
                html +='<div class="input-group mb-3"><div class="input-group-prepend"><span class="input-group-text">'+element.id+'</span></div>';
                html +='<input type="text" class="form-control" placeholder="' + placeholder + '" value = "' + value + '" ></div>';
            });
        }else{
            html += '<input type="text" class="form-control" name="' + this.id + '" id="' + this.id +
              '" placeholder="' + placeholder + '" value = "' + value + '" >';
        }
    }
    if (this.type === 'options') {
      json_obj.children.forEach(element => {
        html += '<select class="custom-select" name="' + this.id + '" id="' + this.id + '">';
        element.children.forEach(element => {
          html += '<option value="' + element.text + '">' + element.text + '</option>';
        });
        html += '</select>';
      });
    }
    html += '</div>';
  });
  html += '</form>';
  $('.field-options').html(html);
}

function cosntructFieldsSettings() {
  $.getJSON('projects/fieldSettings/_construct.json', function (data) {
    data.forEach(element => {
      $.getJSON('projects/fieldSettings/' + element + '.json', function (data) {
        fields_settings.push(data);
      });
    });
  });
  setTimeout(function () {
    console.log(JSON.stringify(fields_settings));
  }, 1500);
}