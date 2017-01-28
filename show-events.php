<?php
include("php-config.php");
$scene = addDashes($_POST["scene"]);
//Get the event order
$order = json_decode(file_get_contents('data/scenes/'.$scene.'.json'), true)['eventOrder'];
$directory = 'data/events/'.$scene;
$scanned_directory = array_diff(scandir($directory), array('..', '.'));

$sorted = [];
//Sort the files by the eventsOrder
forEach($order as $name){
    forEach($scanned_directory as $file){
        if($file == $name.'.json'){
            $sorted[] = $file;
        }
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Load an Event</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1><?php echo $scene; ?></h1></div>
            <div id="content">
                <ul id="show-events" class="menu left">
                    <?php
                    foreach($sorted as $file) {
                        $data = json_decode(file_get_contents($directory.'/'.$file), true);
                        echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'" kind="'.$data['kind'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                    }
                    ?>
                </ul>
                <div id="show-desc" class="menu middle"></div>
                <ul class="menu right">
                    <li><a id="edit-event"><div class="menu-button btn btn-default">Edit Event</div></a></li>
                    <li><a id="new-event"><div class="menu-button btn btn-default">New Event</div></a></li>
                    <li><a id="copy-event"><div class="menu-button btn btn-default">Copy Event</div></a></li>
                    <li><a id="order-events"><div class="menu-button btn btn-default">Order Events</div></a></li>
                    <li><a id="change-scene"><div class="menu-button btn btn-default">Change Scene</div></a></li>
                    <li><a id="delete-event"><div class="menu-button btn btn-default">Delete Event</div></a></li>
                </ul>
                <div id="footer"><a href="load.php"><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/load-events.js"></script>
    </body>
</html>
