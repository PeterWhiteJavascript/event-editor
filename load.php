<?php
//Get all of the scene data
$directory = 'data/scenes';
$scanned_directory = array_diff(scandir($directory), array('..', '.'));
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Load a Scene</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1>LOAD</h1></div>
            <div id="content">
                <ul id="load-scene" class="menu left">
                    <?php
                    foreach($scanned_directory as $file) {
                        $data = json_decode(file_get_contents($directory.'/'.$file), true);
                        echo '<li name="'.$data['name'].'" desc="'.$data['desc'].'"><a class="scene-button"><div class="menu-button btn btn-default">'.$data['name'].'</div></a></li>';
                    }
                    ?>
                </ul>
                <div id="load-desc" class="menu middle">
                    <!--The first description is shown with js-->
                    <div class="desc-text"></div>
                </div>
                <ul class="menu right btn-group">
                    <li><a id="open-scene"><div class="menu-button btn btn-default">Open Scene</div></a></li>
                    <li><a id="edit-scene"><div class="menu-button btn btn-default">Edit Scene</div></a></li>
                    <li><a id="delete-scene"><div class="menu-button btn btn-default">Delete Scene</div></a></li>
                    <li><a id="create-new-scene"><div class="menu-button btn btn-default">Create New Scene</div></a></li>
                </ul>
                <div id="footer"><a href="index.php"><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/load.js"></script>
    </body>
</html>
