<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);
$name = addDashes($_POST['name']);
$desc = $_POST['desc'];
$eventType = $_POST['event-type'];
$newFile;
if(isset($_POST['origName'])){
    $file = "data/events/".$scene."/".addDashes($_POST['origName']).".json";
    $newFile = json_decode(file_get_contents($file), true);
    $newFile['name'] = $name;
    $newFile['desc'] = $desc;
    $newFile['kind'] = $eventType;
    file_put_contents("data/events/".$scene."/".$name.".json", json_encode($newFile));
    if($name!==$_POST['origName']){
        unlink($file);
    }
}  else {
    $newFile = [
        'name' => $name,
        'desc' => $desc,
        'kind' => $eventType
    ];
    switch($eventType){
        case "story":
            $newFile['pages'] = [];
            break;
        case "dialogue":
            $newFile['interactions'] = (object)[];
            break;
        case "battleScene":
            $newFile['battleScene'] = (object)[];
            break;
        case "battle":
            $newFile['battle'] = (object)[];
            break;
    }
    file_put_contents("data/events/".$scene."/".$name.".json", json_encode($newFile));
}

//Add the event to the event order of the scene
$sceneData = json_decode(file_get_contents("data/scenes/".$scene.".json"), true);
if(!in_array($name, $sceneData['eventOrder'])){
    $sceneData['eventOrder'][] = $name;
    //If the orig name is in here, remove it
    if(isset($_POST['origName'])){
        $index = array_search($_POST['origName'],$sceneData['eventOrder']);
        if($index !== FALSE){
            unset($sceneData['eventOrder'][$index]);
        }
    }
    $sceneData['eventOrder'] = array_values($sceneData['eventOrder']);
    file_put_contents("data/scenes/".$scene.".json", json_encode($sceneData));
    
}
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="name"><?php echo $name; ?></div>
        <div id="scene"><?php echo $scene; ?></div>
        <div id="kind"><?php echo $eventType; ?></div>
        <script>
        var form = $('<form action="edit-'+$("#kind").text()+'-event.php" method="post"></form>');
        form.append('<input type="text" name="name" value="'+$("#name").text()+'">');
        form.append('<input type="text" name="scene" value="'+$("#scene").text()+'">');
        form.submit();
        </script>
    </body>
</html>