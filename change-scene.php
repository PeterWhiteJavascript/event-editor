<?php
$scene = $_POST["scene"];
$event = $_POST["event"];
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Change the Scene of this Event</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="subtitle"><h2><?php echo $scene; ?></h2></div>
            <div id="title"><h1><?php echo $event; ?></h1></div>
            <div id="content">
                <ul class="menu middle-left">
                    <div>Select the new scene</div>
                    <li><a class="scene-button"><div class="menu-button">Act 1</div></a></li>
                    <li><a class="scene-button"><div class="menu-button">Act 2</div></a></li>
                    <?php
                        //Loop through all scenes and display them
                    ?>
                </ul>
                
                <ul class="menu middle-right">
                    <li><a id="save-move"><div class="menu-button">Move to Selected Scene</div></a></li>
                </ul>
                <div id="footer"><a><div class="menu-button">BACK</div></a></div>
            </div>
        </div>
        <script src="js/change-scene.js"></script>
    </body>
</html>
