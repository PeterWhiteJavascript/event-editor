<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
$desc = $_POST['desc'];
$eventType = $_POST['event-type'];
$interactions = (object)[];
//First, we need to save the data to file if this is a new event
if(!isset($_POST['origName'])){
    $newFile = [
        'name' => $name,
        'desc' => $desc,
        'kind' => $eventType,
        'interactions' => $interactions
       ];

    file_put_contents("data/events/".$scene."/".$name.".json", json_encode($newFile));
} 
//Get the interactions data from file
else {
    $event = json_decode(file_get_contents('data/events/'.$scene.'/'.$name.'.json'), true);
    $interactions = $event['interactions'];    
}
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <!--This is the options menu for the editor-->
        <ul class="small-menu left draggable">
            <li><a id="create-new-interaction"><div class="menu-button">Create New Interaction</div></a></li>
        </ul>
        <script src="js/edit-event.js"></script>
    </body>
</html>