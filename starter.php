<?php
include('class_fs.php');
if (isset($_REQUEST['operation'])) {
	$fs = new fs('');
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

				$rslt = $fs->save($node, $parn);

			case 'get_json':
				$id = isset($_REQUEST['id']) && $_REQUEST['id'] !== '#' ? $_REQUEST['id'] : '/';
				$parn = isset($_REQUEST['text']) ? $_REQUEST['text'] : '';

				switch ($parn) {
					case 'field-setting':
						//
						$dir = dirname(__FILE__) . "/settings/files";
						$files = array_diff(scandir($dir), array('.', '..'));
						$res=[];
						foreach ($views as $file){
							$res = $fs->getContent("$dir/$file");
						}

						$rslt = array('id' => $parn,'content'=>$res);
						break;
					default:
						throw new Exception('Unsupported operation json: ' . $parn);
						break;
				}

				

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
