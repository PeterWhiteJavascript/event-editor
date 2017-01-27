<?php
$name = $_POST['name'];
$scene = $_POST['scene'];

$music = $_POST['music'];
$bg = $_POST['bg'];
$text = $_POST['text'];

$pages = [];
for($i=0;$i<count($music);$i++){
    $pages[$i] = [
        'music' => $music[$i],
        'bg' => $bg[$i],
        'text' => $text[$i]
    ];
}

$file = json_decode(file_get_contents('data/events/'.$scene.'/'.$name.'.json'), true);

$file['pages'] = $pages;
file_put_contents('data/events/'.$scene.'/'.$name.'.json', json_encode($file));
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