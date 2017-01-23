<?php
$scene = $_POST["scene"];
$name = $_POST["name"];
//TO DO: Delete this event.
//Event must be deleted from the events folder and then the combined file must be recompiled.

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