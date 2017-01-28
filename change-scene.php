<?php
include("php-config.php");
$scene = addDashes($_POST["scene"]);
$event = addDashes($_POST["event"]);
$directory = 'data/scenes';
$scanned_directory = array_diff(scandir($directory), array('..', '.'));
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Change the Scene of this Event</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="subtitle" hidden><h2><?php echo $scene; ?></h2></div>
            <div id="title"><h1><?php echo $event; ?></h1></div>
            <div id="content">
                <ul class="menu middle-left">
                    <div>Select the new scene</div>
                    <?php
                    foreach($scanned_directory as $file) {
                        $data = json_decode(file_get_contents($directory.'/'.$file), true);
                        echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                    }
                    ?>
                </ul>
                
                <ul class="menu middle-right">
                    <li><a id="save-move"><div class="menu-button btn btn-default">Move to Selected Scene</div></a></li>
                </ul>
                <div id="footer"><a><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/change-scene.js"></script>
    </body>
</html>
