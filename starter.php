<?php
require_once('class_fs.php');
//modificación para obtener el dato del body
$content = trim(file_get_contents("php://input"));
if (is_null($decoded = json_decode($content, true)))  $decoded = [];
$_REQUEST = array_merge($_REQUEST, $decoded);
//-------------------------------------------
if (isset($_REQUEST['operation'])) {
	$folder = isset($_REQUEST['folder']) ? $_REQUEST['folder'] : 'projects';
	$fs = new fs($folder);
	try {
		$id = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
		$rslt = null;
		switch ($_REQUEST['operation']) {
			case 'get_node':
				$rslt = $fs->lst($id, (isset($_REQUEST['id']) && $_REQUEST['id'] === '#'));
				break;
			case "get_content":
				$rslt = $fs->data($id);
				break;
			case 'create_node':
				$parn = isset($_REQUEST['content']) ? $_REQUEST['content'] : '';
				$rslt = $fs->create($id, isset($_REQUEST['text']) ? $_REQUEST['text'] : '', (!isset($_REQUEST['type']) || $_REQUEST['type'] !== 'file'), $parn);
				break;
			case 'rename_node':
				$rslt = $fs->rename($id, isset($_REQUEST['text']) ? $_REQUEST['text'] : '');
				break;
			case 'delete_node':
				$rslt = $fs->remove($id);
				break;
			case 'move_node':
				$parn = isset($_REQUEST['parent']) && $_REQUEST['parent'] !== '#' ? $_REQUEST['parent'] : '/';
				$rslt = $fs->move($id, $parn);
				break;
			case 'copy_node':
				$parn = isset($_REQUEST['parent']) && $_REQUEST['parent'] !== '#' ? $_REQUEST['parent'] : '/';
				$rslt = $fs->copy($id, $parn);
				break;
			case 'save_file':
				$parn = isset($_REQUEST['text']) ? $_REQUEST['text'] : '';
				$rslt = $fs->create("", $id, false, $parn);
				break;
			case 'get_json':
				$parn = isset($_REQUEST['text']) ? $_REQUEST['text'] : '';
				switch ($parn) {
					case 'field-settings':
						$dir = dirname(__FILE__) . "/settings/fields";
						$res = get_children($dir);
						break;
					case 'project-settings':
						$dir = dirname(__FILE__) . "/settings/project";
						$res = get_children($dir);
						break;
					case 'group-settings':
						$dir = dirname(__FILE__) . "/settings/groups";
						$res = get_children($dir);
						break;
					case 'table':
						$dir = dirname(__FILE__) . "/settings/tables";
						$res[] = [
							"text" => "Table Settings",
							"type" => "table-settings",
							"children" => get_children($dir)
						];
						break;
					case 'group':
						$dir = dirname(__FILE__) . "/settings/groups";
						$res[] = [
							"text" => "Group Settings",
							"type" => "group-settings",
							"children" => get_children($dir)
						];
						break;
					case 'file':
						$res = json_decode($fs->getContent($id), true);
						break;
					default:
						throw new Exception('Unsupported operation json: ' . $parn);
						break;
				}
				$rslt = array('id' => $parn, 'content' => $res);
				break;
			case 'version':
				$data = json_decode($fs->getContent("settings/settings.json"), true);
				$rslt = array('id' => $id, 'content' => $data);
				break;
			case 'test':
				$parn = isset($_REQUEST['text']) ? $_REQUEST['text'] : '';
				$rslt = array('id' => $id, 'content' => $parn);
				break;
			default:
				throw new Exception('Unsupported operation: ' . $_REQUEST['operation']);
				break;
		}
		header('Content-Type: application/json; charset=utf-8');
		//change memory_limit = 512MB; in php.ini
		echo json_encode($rslt);
	} catch (Exception $e) {
		header($_SERVER["SERVER_PROTOCOL"] . ' 500 Server Error');
		header('Status:  500 Server Error');
		echo $e->getMessage();
	}
	die();
}

function get_children($dir, $sort = true) { //from dir get the children elements
	$fs = new fs($dir);
	$files = array_diff(scandir($dir), array('.', '..'));
	$res = [];
	foreach ($files as $file) {
		$ext = pathinfo($file, PATHINFO_EXTENSION);
		if ($ext === 'json') {
			$data = json_decode($fs->getContent("$dir/$file"), true);
			// add setting file name to array
			$data['data']['filesetting'] = "$file";
			$data['data']['filesettingdir'] = "$dir";
			$res[] = $data;
		}
	}
	if ($sort) {
		$order = array_column($res, 'order');
		array_multisort($order, SORT_ASC, $res);
	}
	return $res;
}
