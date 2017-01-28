<?php
$name = $_POST['name'];
$scene = $_POST['scene'];

$pagesid = $_POST['pagesid'];
$pagesname = $_POST['pagesname'];
$music = $_POST['music'];
$bg = $_POST['bg'];
$text = $_POST['text'];
$choices = json_decode($_POST['choices'],true);


$pages = (object)[];
for($i=0;$i<count($pagesid);$i++){
    $pages -> $pagesid[$i] = (object)[
        'name' => $pagesname[$i],
        'music' => $music[$i],
        'bg' => $bg[$i],
        'text' => $text[$i],
        'choices' => (object)[]
    ];
    if(isset($choices[$pagesid[$i]])){
        $pages->$pagesid[$i]->choices = $choices[$pagesid[$i]];
    } else {
        $pages->$pagesid[$i]->choices[] = (object)[
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
        <script>
        var scene = $("#title").text();
        var form = $('<form action="show-events.php" method="post"><input type="text" name="scene" value="'+scene+'"></form>');
        form.submit();
        </script>
    </body>
</html>