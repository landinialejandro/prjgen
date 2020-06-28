<?php
include('class_fs.php');
if (isset($_REQUEST['operation'])) {
	$folder = isset($_REQUEST['folder']) ? $_REQUEST['folder'] : 'projects';
	$fs = new fs($folder);
	try {
		$rslt = null;
		switch ($_REQUEST['operation']) {
			case 'get_node':
				$node = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$rslt = $fs->lst($node, (isset($_REQUEST['id']) && $_REQUEST['id'] === '#'));
				break;
			case "get_content":
				$node = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$rslt = $fs->data($node);
				break;
			case 'create_node':
				$node = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$rslt = $fs->create($node, isset($_REQUEST['text']) ? $_REQUEST['text'] : '', (!isset($_REQUEST['type']) || $_REQUEST['type'] !== 'file'));
				break;
			case 'rename_node':
				$node = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$rslt = $fs->rename($node, isset($_REQUEST['text']) ? $_REQUEST['text'] : '');
				break;
			case 'delete_node':
				$node = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$rslt = $fs->remove($node);
				break;
			case 'move_node':
				$node = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$parn = isset($_REQUEST['parent']) && $_REQUEST['parent'] !== '#' ? $_REQUEST['parent'] : '/';
				$rslt = $fs->move($node, $parn);
				break;
			case 'copy_node':
				$node = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$parn = isset($_REQUEST['parent']) && $_REQUEST['parent'] !== '#' ? $_REQUEST['parent'] : '/';
				$rslt = $fs->copy($node, $parn);
				break;
			case 'save_file':
				$node = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$parn = isset($_REQUEST['text']) ? $_REQUEST['text'] : '';

				$rslt = $fs->create("", $node, false, $parn);

				break;
			case 'get_json':
				$id = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$parn = isset($_REQUEST['text']) ? $_REQUEST['text'] : '';

				switch ($parn) {
					case 'field-settings':
						$dir = dirname(__FILE__) . "/settings/fields";
						break;
					case 'project-settings':
						$dir = dirname(__FILE__) . "/settings/project";
						break;
					case 'group-settings':
						$dir = dirname(__FILE__) . "/settings/groups";
						break;
					case 'table-settings':
						$dir = dirname(__FILE__) . "/settings/tables";
						break;
					default:
						throw new Exception('Unsupported operation json: ' . $parn);
						break;
				}
				$files = array_diff(scandir($dir), array('.', '..'));
				$res = [];
				foreach ($files as $file) {
					$ext = pathinfo($file, PATHINFO_EXTENSION);
					if ($ext === 'json') {
						$res[] = json_decode($fs->getContent("$dir/$file"), true);
					}
				}
				$order = array_column($res, 'order');
				array_multisort($order, SORT_ASC, $res);
				$rslt = array('id' => $parn, 'content' => $res);
				break;
			case 'version':
				//TODO: end version function
				$id = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				exec('git rev-parse --verify HEAD 2> /dev/null', $output);
				$parn = $output[0];
				$rslt = array('id' => $id, 'content' => $parn);
				break;
			case 'test':
				$id = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$parn = isset($_REQUEST['text']) ? $_REQUEST['text'] : '';
				$rslt = array('id' => $id, 'content' => $parn);
				break;
			default:
				throw new Exception('Unsupported operation: ' . $_REQUEST['operation']);
				break;
		}
		header('Content-Type: application/json; charset=utf-8');
		echo json_encode($rslt);
	} catch (Exception $e) {
		header($_SERVER["SERVER_PROTOCOL"] . ' 500 Server Error');
		header('Status:  500 Server Error');
		echo $e->getMessage();
	}
	die();
}
