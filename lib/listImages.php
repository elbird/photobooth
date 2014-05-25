<?php
require 'defaults.php';

header('Content-Type: application/json');

$type;
switch ($_GET["type"]) {
	case URL_GALLERY:
		$type = URL_GALLERY;
		break;
	case URL_NEW:
		$type = URL_NEW;
		break;
	case URL_TRASH:
		$type = URL_TRASH;
		break;
	default:
		# code...
		break;
}
if(empty($type)) {
	echo json_encode(array("error" => "no type set"));
	die();
}

$dirPath = PHOTOBOOTH_BASE_DIR . $type . "/";
$files = array();
$dir = new DirectoryIterator($dirPath);
$i = 0;
foreach ($dir as $fileinfo) {
	if(isPhotoboothImage($dirPath . $fileinfo->getFilename())) {
		$mtime = $fileinfo->getMTime();
		if(empty($files[$mtime])) {
			$files[$mtime] = array();
		}
    	$files[$mtime][] = BASE_URL . '/' . $type . '/' . $fileinfo->getFilename();
    }
}
//var_dump($files);
krsort($files);
$images = array();
foreach ($files as $file) {
	$images = array_merge($images, $file);
}
/*
if ($handle = opendir($dirPath)) {
    while (false !== ($file = readdir($handle)) ) {
    	if(isPhotoboothImage($dirPath . $file)) {
    		 $images[] = BASE_URL . '/' . $type . '/' . $file;
    	}
    }
}*/
echo json_encode(array("imageurls" => $images));