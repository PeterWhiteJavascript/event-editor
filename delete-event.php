<?php
include("php-config.php");
$scene = addDashes($_POST["scene"]);
$name = addDashes($_POST["name"]);
//Delete the file
$directory = 'data/events/'.$scene;
unlink($directory.'/'.$name.".json");
//Remove the event from the order in the scene
$sceneData = json_decode(file_get_contents("data/scenes/".$scene.'.json'), true);
if (($key = array_search($name, $sceneData['eventOrder'])) !== false) {
    unset($sceneData['eventOrder'][$key]);
}

file_put_contents("data/scenes/".$scene.'.json', json_encode($sceneData));

?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="title"><h1><?php echo $scene; ?></h1></div>
        <script>
        var scene = $("#title").text();
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
        form.submit();
        </script>
    </body>
</html>