<?php
$name = $_POST["name"];
$desc = $_POST["desc"];
//Make sure there's no other scene with this name
$directory = 'data/scenes';
$scanned_directory = array_diff(scandir($directory), array('..', '.'));

if (in_array($name.'.json', $scanned_directory)) {
    echo "File already exists!";
    echo "<br>";
    echo "Press the back button to go back!";
} else {
    $newFile = [
        'name' => $name,
        'desc' => $desc,
        'eventOrder' => []
       ];

    // encode array to json
    $json = json_encode($newFile);

    //write json to file
    if (file_put_contents('data/scenes/'.$name.'.json', $json)){
        header("Location: load.php");
    } else {
        echo "Oops! Error creating json file...";
    }
}


