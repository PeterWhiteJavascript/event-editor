<?php
include("php-config.php");
$scene = addDashes($_POST['scene']);

$directory = "data/events/".$scene;
//Get the events
$events = array_diff(scandir($directory), array('..', '.'));
$eventOrder = json_decode(file_get_contents("data/scenes/".$scene.'.json'), true)['eventOrder'];

$sorted = [];
//Sort the files by the eventsOrder
forEach($eventOrder as $name){
    forEach($events as $file){
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
        <title>Change the Order of Events</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1><?php echo $scene; ?></h1></div>
            <div id="content">
                
                <ul id="sortable" class="menu middle-left">
                    <?php
                        foreach($sorted as $file) {
                            $data = json_decode(file_get_contents($directory.'/'.$file), true);
                            echo '<li name="'.$data['name'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                        }
                    ?>
                </ul>
                
                <ul class="menu middle-right">
                    <li><a id="save-order"><div class="menu-button btn btn-default">Save Order</div></a></li>
                </ul>
                <div id="footer"><a><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/order-events.js"></script>
    </body>
</html>
