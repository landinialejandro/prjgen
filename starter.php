<?php
require_once('class_fs.php');
//modificación para obtener el dato del body
$body = trim(file_get_contents("php://input"));
if (is_null($decoded = json_decode($body, true)))  $decoded = [];
$defaults = [
	'operation' => "test",
	'id' => "",
	'folder' => "",
	'text' => "",
	'content' => "",
	'type' => "",
	'parent' => "",

];
$_REQUEST = array_merge($defaults, $_REQUEST, $decoded);

[
	'operation' => $operation,
	'id' => $id,
	'folder' => $folder,
	'text' => $text,
	'content' => $content,
	'type' => $type,
	'parent' => $parent,

] = $_REQUEST;

//-------------------------------------------
if ($operation) {
	$folder = $folder ? $folder : 'projects';
	$fs = new fs($folder);
	try {
		$id = $id && $id !== '#' ? $id : '/';
		$rslt = null;
		$dir = dirname(__FILE__) . "/settings/";
		switch ($operation) {
			case 'get_node':
				$rslt = $fs->lst($id, ($id && $id === '#'));
				break;
			case "get_content":
				$rslt = $fs->data($id);
				break;
			case 'create_node':
				$parn = $content ? $content : '';
				$rslt = $fs->create($id, $text ? $text : '', (!($type) || $type !== 'file'), $parn);
				break;
			case 'rename_node':
				$rslt = $fs->rename($id, $text ? $text : '');
				break;
			case 'delete_node':
				$rslt = $fs->remove($id);
				break;
			case 'move_node':
				$parn = $parent && $parent !== '#' ? $parent : '/';
				$rslt = $fs->move($id, $parn);
				break;
			case 'copy_node':
				$parn = $parent && $parent !== '#' ? $parent : '/';
				$rslt = $fs->copy($id, $parn);
				break;
			case 'save_file':
				$parn = $text ? $text : '';
				$rslt = $fs->create("", $id, false, $parn);
				break;
			case 'get_json':
				$parn = $text ? $text : '';
				switch ($parn) {
					case 'field-settings':
						$res = get_children($dir . "field");
						break;
					case 'project-settings':
						$res = get_children($dir . "project");
						break;
					case 'group-settings':
						$res = get_children($dir . "group");
						break;
					case 'table':
					case 'group':
						$type = ucfirst($parn);
						$res[] = [
							"text" => "$type Settings",
							"type" => "$parn-settings",
							"children" => get_children($dir . $parn)
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
				$rslt = array('id' => $id, 'content' => $text ? $text : 'TEST');
				break;
			default:
				throw new Exception('Unsupported operation: ' . $operation);
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
