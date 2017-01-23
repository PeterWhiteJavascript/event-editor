<?php

?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create a new Scene</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1>NEW SCENE</h1></div>
            <div id="content">
                <div class="menu middle">
                    <form action="save-new-scene.php" method="post">
                        Scene Name<br>
                        <input type="text" name="name"><br>
                        Description<br>
                        <input type="text" name="desc">
                        <br>
                        <input type="submit" value="Create Scene">
                    </form>
                </div>
                <div id="footer"><a href="load.php"><div class="menu-button">BACK</div></a></div>
            </div>
        </div>
    </body>
</html>
