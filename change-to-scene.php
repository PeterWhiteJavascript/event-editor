<?php
$event = $_POST["event"];
$from = $_POST["from"];
$scene = $_POST["scene"];
//Move the event from the "from" scene to the "scene" scene.

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