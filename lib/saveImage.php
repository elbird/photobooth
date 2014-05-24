<?php
header("Content-Type: application/json");

$image_data = file_get_contents($_REQUEST['url']);



file_put_contents("../saved/photo.jpg",$image_data);

echo '{ "url": "saved/photo.jpg", "oldUrl": "' . $_REQUEST['oldUrl'] . '"}';


