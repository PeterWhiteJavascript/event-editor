<?php
$scene = $_POST["scene"];

$directory = 'data/scenes';
unlink($directory.'/'.$scene.".json");

header("Location: load.php");