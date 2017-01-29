<?php
$name = $_POST['name'];
$scene = $_POST['scene'];



?>
<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
        <title>RPG</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="slim-game/css/style.css" />
        <script src='slim-game/lib/quintus.js'></script>
        <script src='slim-game/lib/quintus_sprites.js'></script>
        <script src='slim-game/lib/quintus_scenes.js'></script>
        <script src='slim-game/lib/quintus_input.js'></script>
        <script src='slim-game/lib/quintus_anim.js'></script>
        <script src='slim-game/lib/quintus_2d.js'></script>
        <script src='slim-game/lib/quintus_tmx.js'></script>
        <script src='slim-game/lib/quintus_touch.js'></script>
        <script src='slim-game/lib/quintus_ui.js'></script>
        <script src='slim-game/lib/quintus_audio.js'></script>
        <script src="slim-game/lib/astar.js"></script>
        
        <script src="slim-game/lib/jquery-3.1.1.js"></script>
        <script src="slim-game/lib/jquery-ui.min.js"></script>
        
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    </head>
    <body>
        <div id="title" hidden><?php echo $scene; ?></div>
        <div id="title2" hidden><?php echo $name; ?></div>
        
        
        <script src='slim-game/js/main.js'></script>
        <script src='slim-game/js/objects.js'></script>
        <script src='slim-game/js/animations.js'></script>
        <script src='slim-game/js/hud.js'></script>
        <script src='slim-game/js/music.js'></script>
        <script src='slim-game/js/ai.js'></script>
        <script src='slim-game/js/ui_objects.js'></script>
        <script src='slim-game/js/q_functions.js'></script>
        <script src='slim-game/js/scene_funcs.js'></script>
        <script src='slim-game/js/game_objects.js'></script>
        <script src='slim-game/js/editor_tester.js'></script>
    </body>
</html>