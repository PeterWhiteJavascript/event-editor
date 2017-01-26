<?php
$name = "New Event";
$scene = $_POST["scene"];
$event = [];
$desc = "";
$kind = "dialogue";
//Check if name is set, otherwise it's a new event
if(isset($_POST['name'])){
    $name = $_POST["name"];
    $scene = $_POST["scene"];
    $event = json_decode(file_get_contents('data/events/'.$scene.'/'.$name.'.json'), true);
    $desc = $event['desc'];
    $kind = $event['kind'];
}
?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>Create an Event</title>
    </head>
    <body>
        <div id="wrapper">
            <div id="subtitle" hidden><h2><?php echo $scene; ?></h2></div>
            <div id="title"><h1><?php echo $name; ?></h1></div>
            <div id="content">
                <div class="menu middle">
                    <form action="edit-event.php" method="post">
                        Event Name<br>
                        <input type="text" name="name" value="<?php echo $name; ?>"><br>
                        Description<br>
                        <textarea type="text" name="desc" value="<?php echo $desc; ?>"></textarea><br>
                        Event Type<br>
                        <select name="event-type">
                            <option <?php if($kind=="dialogue"){echo "selected";}?> value="dialogue">Dialogue</option>
                            <option <?php if($kind=="battleScene"){echo "selected";}?> value="battleScene">Battle Scene</option>
                            <option <?php if($kind=="battle"){echo "selected";}?> value="battle">Battle</option>
                        </select>
                        <?php
                        if(isset($_POST['name'])){
                        ?>
                        <input type="hidden" name="origName" value="<?php echo $name; ?>">
                        <?php
                        }
                        ?>
                        <input type="hidden" name="scene" value="<?php echo $scene; ?>">
                        <input type="submit" value="Create/Edit Scene">
                    </form>
                </div>
                <div id="footer"><a><div class="menu-button btn btn-default">BACK</div></a></div>
            </div>
        </div>
        <script src="js/create-event.js"></script>
    </body>
</html>