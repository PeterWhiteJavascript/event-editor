<?php
include("php-config.php");
$event = addDashes($_POST["event"]);
$from = addDashes($_POST["from"]);
$scene = addDashes($_POST["scene"]);
//Make a copy of the event in the new folder
$eventFile = file_put_contents('data/events/'.$scene.'/'.$event.'.json', file_get_contents("data/events/".$from."/".$event.'.json'), true);
//Delete the file from the original location
unlink('data/events/'.$from.'/'.$event.".json");

//Remove the event from the order in the old scene
$sceneData = json_decode(file_get_contents("data/scenes/".$from.'.json'), true);
if (($key = array_search($event, $sceneData['eventOrder'])) !== false) {
    unset($sceneData['eventOrder'][$key]);
}
file_put_contents("data/scenes/".$from.".json", json_encode($sceneData));

//Add the event to the new scene's event order
$sceneData2 = json_decode(file_get_contents("data/scenes/".$scene.'.json'), true);
$sceneData2['eventOrder'][] = $event;
file_put_contents("data/scenes/".$scene.'.json', json_encode($sceneData2));

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