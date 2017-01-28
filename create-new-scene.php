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
                        <input type="text" name="name" placeholder="Name of Scene"><br>
                        Description<br>
                        <textarea type="text" name="desc" placeholder="Description"></textarea>
                        <br>
                        <input type="submit" value="Create Scene">
                    </form>
                </div>
                <div id="footer"><a href="load.php"><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
    </body>
</html>
