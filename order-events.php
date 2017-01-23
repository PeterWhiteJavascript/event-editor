<?php
$scene = $_POST['scene'];
//TO DO: Get all of the scenes from JSON


?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Change the Order of Events</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1><?php echo $scene; ?></h1></div>
            <div id="content">
                
                <ul id="sortable" class="menu middle-left">
                    <!-- SAMPLE LI -->
                    <li name="Event 1"><a class="scene-button"><div class="menu-button">Event 1</div></a></li>
                    <li name="Event 2"><a class="scene-button"><div class="menu-button">Event 2</div></a></li>
                    <?php
                        //Loop through all of the scenes and show them here
                    ?>
                </ul>
                
                <ul class="menu middle-right">
                    <li><a id="save-order"><div class="menu-button">Save Order</div></a></li>
                </ul>
                <div id="footer"><a><div class="menu-button">BACK</div></a></div>
            </div>
        </div>
        <script src="js/order-events.js"></script>
    </body>
</html>
