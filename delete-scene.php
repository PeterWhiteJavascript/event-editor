<?php
include("php-config.php");
$scene = addDashes($_POST["scene"]);

$directory = 'data/scenes';
unlink($directory.'/'.$scene.".json");
array_map('unlink', glob("data/events/".$scene."/*.*"));
rmdir("data/events/".$scene);
header("Location: load.php");