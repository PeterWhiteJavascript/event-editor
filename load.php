<?php

?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Load an Event</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1>LOAD</h1></div>
            <div id="content">
                <ul id="load-scene" class="menu left">
                    <!-- SAMPLE LI -->
                    <li name="ASJ:DLKASJD" desc="Use php to echo the first desc"><a class="scene-button"><div class="menu-button">ASJ:DLKASJD</div></a></li>
                    <?php
                    //use for loop to show any scenes that have been created
                    ?>
                </ul>
                <div id="load-desc" class="menu middle">
                    <!--Show the first description-->
                    <div class="desc-text"><?php echo "Use php to echo the first desc"; ?></div>
                </div>
                <ul id="load-opts" class="menu right">
                    <li><a id="open-scene"><div class="menu-button">Open Scene</div></a></li>
                    <li><a id="create-new-scene"><div class="menu-button">Create New Scene</div></a></li>
                    <li><a id="rename-scene"><div class="menu-button">Rename Scene</div></a></li>
                    <li><a id="edit-desc"><div class="menu-button">Edit Description</div></a></li>
                    <li><a id="delete-scene"><div class="menu-button">Delete Scene</div></a></li>
                </ul>
                <div id="footer"><a href="index.php"><div class="menu-button">BACK</div></a></div>
            </div>
        </div>
        <script src="js/load.js"></script>
    </body>
</html>
