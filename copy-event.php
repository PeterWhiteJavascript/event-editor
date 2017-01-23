<?php
$name = $_POST['name'];
$scene = $_POST['scene'];

//TODO: Copy the posted event (by name) and rename to be unique

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
