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
            <div id="title"><h1><?php echo "ACT NAME GOES HERE" ?></h1></div>
            <div id="content">
                <ul id="show-events" class="menu left">
                    <!-- SAMPLE LI -->
                    <li name="Intro" desc="Introduction to the game" kind="dialogue"><a class="scene-button"><div class="menu-button">Intro</div></a></li>
                    <li name="At the castle" desc="The characters are at the castle" kind="dialogue"><a class="scene-button"><div class="menu-button">At the castle</div></a></li>
                    <li name="In the forest" desc="The forest" kind="battleScene"><a class="scene-button"><div class="menu-button">In the forest</div></a></li>
                    <li name="Battle in the forest" desc="Battle in the forest is going on." kind="battle"><a class="scene-button"><div class="menu-button">Battle in the forest</div></a></li>
                    <?php
                    //use for loop to show any scenes that have been created
                    ?>
                </ul>
                <div id="show-desc" class="menu middle">
                    <!--The first description is shown with js
                    <div class="desc-text"></div>
                    <div class="desc-foot"></div>-->
                </div>
                <ul id="show-opts" class="menu right">
                    <li><a id="edit-event"><div class="menu-button">Edit Event</div></a></li>
                    <li><a id="new-event"><div class="menu-button">New Event</div></a></li>
                    <li><a id="copy-event"><div class="menu-button">Copy Event</div></a></li>
                    <li><a id="move-event"><div class="menu-button">Move Event</div></a></li>
                    <li><a id="change-scene"><div class="menu-button">Change Scene</div></a></li>
                    <li><a id="rename-event"><div class="menu-button">Rename Event</div></a></li>
                    <li><a id="edit-desc"><div class="menu-button">Edit Description</div></a></li>
                    <li><a id="delete-event"><div class="menu-button">Delete Event</div></a></li>
                </ul>
                <div id="footer"><a href="index.php"><div class="menu-button">BACK</div></a></div>
            </div>
        </div>
        <script src="js/load-events.js"></script>
    </body>
</html>
