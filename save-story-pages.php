<?php
include("php-config.php");
$name = addDashes($_POST['name']);
$scene = addDashes($_POST['scene']);

$pagesid = $_POST['pagesid'];
$pagesname = $_POST['pagesname'];
$music = $_POST['music'];
$bg = $_POST['bg'];
$text = $_POST['text'];
$choices = json_decode($_POST['choices'],true);


$pages = [];
for($i=0;$i<count($pagesid);$i++){
    $pages[$i] = (object)[
        'name' => $pagesname[$i],
        'music' => $music[$i],
        'bg' => $bg[$i],
        'text' => $text[$i],
        'choices' => (object)[]
    ];
    if(isset($choices[$pagesid[$i]])){
        $pages[$i]->choices = $choices[$pagesid[$i]];
    } else {
        $pages[$i]->choices[] = (object)[
            'displayText' => "",
            'desc' => "",
            'page' => "",
            'effect' => ""
        ];
    }
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
        <div id="title2"><h1><?php echo $name; ?></h1></div>
        <script>
            
        <?php
        if(isset($_POST['testing'])){
        ?>
        var scene = $("#title").text();
        var name = $("#title2").text();
        var form = $('<form action="test-story-event.php" method="post"><input type="text" name="scene" value="'+scene+'"><input type="text" name="name" value="'+name+'"></form>');
        form.submit();
        <?php
        } else {
        ?>
        var scene = $("#title").text();
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
        form.submit();
        <?php
        }
        ?>
        </script>
    </body>
</html>