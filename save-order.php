<?php
$scene = $_POST['scene'];
//Save the order of events in a scene
$order = $_POST['order'];

print_r($order);

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