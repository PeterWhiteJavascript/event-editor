<?php
//This file contains the event editor. It'll have a copy of Quintus.

//Check if name is set, otherwise it's a new event
if(isset($_POST["name"])){
    $name = $_POST["name"];
} else {
    $name = "New Scene";
}
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create an Event</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1><?php echo $name; ?></h1></div>
            <div id="content">
                
            </div>
        </div>
    </body>
</html>