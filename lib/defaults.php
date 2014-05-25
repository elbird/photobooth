<?php
error_reporting(E_ALL);
define("PHOTOBOOTH_BASE_DIR", __DIR__ . '/../');
define("BASE_URL", "/photobooth");
define("URL_NEW", "new");
define("URL_GALLERY", "gallery");
define("URL_TRASH", "trash");

function isPhotoboothImage($file) {
	if(is_file($file) && is_array($imageInfo = getimagesize($file))) {
    	if($imageInfo[2] === IMAGETYPE_JPEG) {
    		return TRUE;
    	}
    }
    return FALSE;
}


function abortWithStatus($status, $message) {
	http_response_code($status);
	die($message);
}
