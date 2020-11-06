secondary_log('keyboard.input')

hotkeys('ctrl+f,ctrl+l', function (event, handler) {
  event.preventDefault();
  switch (handler.key) {
    case 'ctrl+f':
      info_log('you pressed ctrl+f!');
      info_log('adding new filed');
      var data = {"reference":prjTree.get_selected()}
      console.log(data);
      createNode(data,'field');
      break;
    case 'ctrl+l':
      info_log('you pressed ctrl+l!');
      info_log('adding new table');
      var data = {"reference":prjTree.get_selected()}
      console.log(data);
      createNode(data,'table');
      break;
    default:
      alert(event);
  }
});