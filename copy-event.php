<?php
include("php-config.php");
$name = addDashes($_POST['name']);
$scene = addDashes($_POST['scene']);


$directory = 'data/events/'.$scene;
//Get the event
$event = json_decode(file_get_contents($directory."/".$name.'.json'), true);

//Make sure there's no other event with this name in this folder
$scanned_directory = array_diff(scandir($directory), array('..', '.'));

$num = 0;
while(in_array($name."(".$num.")".'.json', $scanned_directory)){
    $num++;
}
$event['name'] = $name."(".$num.")";
// encode array to json
$json = json_encode($event);

//write json to file
if (file_put_contents($directory.'/'.$name."(".$num.")".'.json', $json)){
    //Add the file to the order
    $sceneData = json_decode(file_get_contents("data/scenes/".$scene.'.json'), true);
    $sceneData['eventOrder'][] = $name."(".$num.")";
    file_put_contents("data/scenes/".$scene.'.json', json_encode($sceneData));
} else {
    echo "Oops! Error creating json file...";
}

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
