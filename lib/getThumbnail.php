<?php
error_reporting(E_ALL );
require 'defaults.php';
require '../vendor/autoload.php';

if(empty($_GET["image"])) {
	abortWithStatus(404);
}
$image = $_GET["image"];

if(strpos($image, BASE_URL) !== 0) {
	abortWithStatus(404);
}

$image = substr($image, strlen(BASE_URL));

$imagePath = PHOTOBOOTH_BASE_DIR . $image;
if(!isPhotoboothImage($imagePath)) {
	abortWithStatus(404);
}

try
{
     $thumb = PhpThumbFactory::create($imagePath);
}
catch (Exception $e)
{
     http_send_status(500);
     die();
}

header("Expires: Sat, 23 Jul 2016 05:00:00 GMT");

$thumb->resize(150, 150);
$thumb->show();