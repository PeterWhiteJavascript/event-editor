<?php
$scene = $_POST["scene"];
$desc = $_POST['desc'];
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Edit a Scene</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="title"><h1>Edit <?php echo $scene; ?></h1></div>
            <div id="content">
                <div class="menu middle">
                    <form action="save-edited-scene.php" method="post">
                        Scene Name<br>
                        <input type="text" name="name" value="<?php echo $scene; ?>"><br>
                        Description<br>
                        <textarea type="text" name="desc" value="<?php echo $desc; ?>"></textarea><br>
                        <input type="hidden" name="origName" value="<?php echo $scene; ?>">
                        <input type="submit" value="Edit Scene">
                    </form>
                </div>
                <div id="footer"><a href="load.php"><div class="menu-button">BACK</div></a></div>
            </div>
        </div>
    </body>
</html>



