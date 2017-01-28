<?php
$scene = $_POST['scene'];
$name = $_POST['name'];

$event = json_decode(file_get_contents('data/events/'.$scene.'/'.$name.'.json'), true);
$pages = $event['pages'];

$bg_directory = 'slim-game/images/bg';
$bgs = array_diff(scandir($bg_directory), array('..', '.'));

$music_directory = 'slim-game/audio/bgm';
$music = array_diff(scandir($music_directory), array('..', '.'));
?>

<!DOCTYPE html>
<html>
    <head>
        <?php include 'config.php';?>
    </head>
    <body>
        <div id="editor-title"><h2><?php echo $name; ?></h2></div>
        <div id="scene-name" hidden><h2><?php echo $scene; ?></h2></div>
        <div id="editor-content">
            <div class="editor-left-menu">
                <!--This is the options menu for the editor-->
                <ul>
                    <li><a id="add-new-page"><div class="menu-button btn btn-default">Add New Page</div></a></li>
                    <li><a id="remove-page"><div class="menu-button btn btn-default">Remove Page</div></a></li>
                    <li><a id="copy-page"><div class="menu-button btn btn-default">Copy Page</div></a></li>
                    <li><a id="save-event"><div class="menu-button btn btn-default">Save Event</div></a></li>
                    <li><a id="back"><div class="menu-button btn btn-default">Go Back</div></a></li>
                </ul>
            </div>
            <div class="editor-left-menu" id="pages">
                <ul>
                <?php
                foreach ($pages as $key => $value) {
                    $mus = $value['music'];
                    $bg = $value['bg'];
                    $te = $value['text'];
                    $name = $value['name'];
                    echo '<li id="'.$key.'" music="'.$mus.'" bg="'.$bg.'" text="'.$te.'"><a class="scene-button"><div class="menu-button btn btn-default">'.$name.'</div></a></li>';
                }
                ?>
                </ul>
            </div>
            <div id="editor-page-options">
                <div id="music-select">Music:
                    <select>
                        <?php 
                        forEach($music as $song){
                            echo '<option value='.$song.'>'.$song.'</option>';
                        }
                        ?>
                    </select>
                </div>
                <audio controls>
                    <source type="audio/mp3" src="">Sorry, your browser does not support HTML5 audio.
                </audio>
                <img id="bg-preview">
                <div id="bg-select">BG: 
                    <select>
                        <?php 
                        forEach($bgs as $bg){
                            echo '<option value=bg/'.$bg.'>bg/'.$bg.'</option>';
                        }
                        ?>
                    </select>
                </div>
                <br>
                <div id="text-select">Text: 
                </div>
                <div id="page-options">
                    <a id="add-new-choice"><div class="btn btn-default">Add Choice</div></a>
                </div>
                <div id="choices">Choices:
                    <ul>
                        <?php
                        forEach($pages as $key => $value){
                            forEach($value['choices'] as $key2 => $value2){
                                $display = $value2['displayText'];
                                $desc = $value2['desc'];
                                $page = $value2['page'];
                                $effect = $value2['effect'];
                                echo '<li class="choice-'.$key.'"><a class="remove-choice"><div class="btn btn-default">x</div></a><div>Display Text: <input class="display-text" value="'.$display.'"></input></div><div>Desc: <textarea class="desc-text">'.$desc.'</textarea></div><div>To Page: <select class="pages-to"></select></div><div>Effect: <select class="on-page-effect"></select></div></li>';
                            }
                        }
                        ?>
                    </ul>
                </div>
            </div>
        </div>
        <script src="js/edit-story-event.js"></script>
    </body>
</html>