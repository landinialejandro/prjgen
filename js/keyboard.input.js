hotkeys("ctrl+f,ctrl+l", function (event, handler) {
  event.preventDefault();
  msg.info("you pressed: " + handler.key);
  switch (handler.key) {
    case "ctrl+f":
      type = "field";
      break;
    case "ctrl+l":
      type = "table";
      break;
    default:
      alert(event);
  }
  var data = { reference: prjTree().get_selected() };
  console.log(data);
  msg.info("adding new " + type);
  createNode(data, type);
});
