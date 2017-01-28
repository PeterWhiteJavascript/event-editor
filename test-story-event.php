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
        <link rel="stylesheet" href="css/style.css" />
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
    </head>
    <body style="background-color:#B6B6CE">
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
        <div id="main">
            <canvas id="quintus" width="1150" height="700" style="
                -webkit-box-shadow: 1px 0px 13px 9px rgba(209,229,235,0.5);
                -moz-box-shadow: 1px 0px 13px 9px rgba(209,229,235,0.5);
                box-shadow: 1px 0px 13px 9px rgba(209,229,235,0.5);
                ">
            </canvas>
        </div>
    </body>
</html>