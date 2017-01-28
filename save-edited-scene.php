<?php
include("php-config.php");
$original_name = addDashes($_POST['origName']);
$name = addDashes($_POST["name"]);
$desc = $_POST["desc"];
$directory = 'data/scenes';
$scanned_directory = array_diff(scandir($directory), array('..', '.'));
$data;
while ($file = current($scanned_directory)) {
    if ($file == $original_name.".json") {
        $data = json_decode(file_get_contents($directory.'/'.$file), true);
    }
    next($scanned_directory);
}
//If the file has been renamed, delete the old file as well
if ($orignial_name!=$name) {
    unlink($directory.'/'.$original_name.".json");
}
$newFile = [
    'name' => $name,
    'desc' => $desc,
    'eventOrder' => $data['eventOrder']
   ];

// encode array to json
$json = json_encode($newFile);

//write json to file
if (file_put_contents('data/scenes/'.$name.'.json', $json)){
    header("Location: load.php");
} else {
    echo "Oops! Error creating json file...";
}
header("Location: load.php");
