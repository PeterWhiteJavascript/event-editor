<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);
//Save the order of events in a scene
$order = $_POST['order'];

$sceneData = json_decode(file_get_contents("data/scenes/".$scene.'.json'), true);
$sceneData['eventOrder'] = $order;
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