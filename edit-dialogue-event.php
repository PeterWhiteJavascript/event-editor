<?php
$scene = $_POST['scene'];
$name = $_POST['name'];
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="editor-left-menu">
            <!--This is the options menu for the editor-->
            <ul>
                <li><a id="create-new-interaction"><div class="menu-button btn btn-default">Create New Interaction</div></a></li>
            </ul>
        </div>
        <div id="editor-interaction-menu">
            
        </div>
        <script src="js/edit-dialogue-event.js"></script>
    </body>
</html>