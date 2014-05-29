<?php
require 'defaults.php';
header("Content-Type: application/json");

$action = "save";
if(!empty($_POST['action'])) {
	switch ($_POST['action']) {
		case 'delete':
			$action = 'delete';
			break;
		case 'restore':
			$action = 'restore';
			break;
		case 'save':
		default:
			$action = 'save';
			break;
	}
}


if(empty($_POST["imageUrl"]) || ($action == "save" && empty($_POST['newImageUrl']))) {
	abortWithStatus(403);
}
$oldImage = $_POST["imageUrl"];

if(strpos($oldImage, BASE_URL) !== 0) {
	abortWithStatus(403);
}

$oldImage = substr($oldImage, strlen(BASE_URL));

$fullOldImageUrl = PHOTOBOOTH_BASE_DIR . $oldImage;
if(!isPhotoboothImage($fullOldImageUrl)) {
	abortWithStatus(403);
}

$match = array();
if(preg_match('/([^\/]+)(?=\.\w+$)/', $oldImage, $matches)) {
	$filename = $matches[1]; 
} else {
	abortWithStatus(403);
}
if(
	($action == "restore" && strpos($oldImage, "/" . URL_TRASH) !== 0) 
	|| ($action == "save" && strpos($oldImage, "/" . URL_NEW) !== 0) 
	|| ($action == "delete" && strpos($oldImage, "/" . URL_NEW) !== 0 && strpos($oldImage, "/" . URL_GALLERY) !== 0)
	) {
	abortWithStatus(403, "test");
}


if($action == "save") {
	$image_data = file_get_contents($_POST['newImageUrl']);
	$newFileName = '/' . URL_GALLERY . '/' . $filename . '_' . time() . '.jpg';
	file_put_contents(".." . $newFileName, $image_data);
}

if($action == "save" || $action == "delete") {
	$deletFileName = '/' . URL_TRASH . '/' . $filename . '.jpg';
	$src = $fullOldImageUrl;
	$dest = PHOTOBOOTH_BASE_DIR . $deletFileName;
} elseif ($action == "restore") {
	$restoreFilename = '/' . URL_NEW . '/' . $filename . '.jpg';
	$src = $fullOldImageUrl;
	$dest = PHOTOBOOTH_BASE_DIR . $restoreFilename;
	$newFileName = $restoreFilename;
}
	
if(is_file($dest) ) {
	// never delete file on restore
	if($action != "restore") {
		unlink($src);	
	}
} else {
	rename($src, $dest);
}

if($action == "delete") {
	$newFileName = $deletFileName;
}


echo json_encode(array("newUrl" => BASE_URL . $newFileName , "oldUrl" => $_POST['imageUrl'] ));


