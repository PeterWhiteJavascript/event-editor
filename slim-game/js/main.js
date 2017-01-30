window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, QFunctions, AI, Animations, HUD, Music, Objects, UIObjects, SceneFuncs, GameObjects, EditorTester")
        .setup({development: true})
        .touch().controls(true)
        .enableSound();

//Constants
//Since this is a top-down game, there's no gravity
Q.gravityY=0;
//The width of the tiles
Q.tileW = 32;
//The height of the tiles
Q.tileH = 32;
//Astar functions used for pathfinding
Q.astar = astar;
//A necessary component of Astar
Q.Graph = Graph;
//The highest rank for weapons
Q.maxEquipmentRank = 2;


//End Constants

//Wraps the text to fit inside a container.
//Really useful for long descriptions
//Automatically run when the label is changed and the text is inside a container
//label is the new incoming label
//maxWidth is either the textWidth property of the container that the text is in, or it is the container's w
Q.UI.Text.prototype.wrapLabel = function(label,maxWidth){
    var ctx = Q.ctx;
    var split = label.split(' ');
    var newLabel = '';
    var tempLabel = '';
    var spaceWidth = ctx.measureText(" ").width+3;
    var spaces = 0;
    //Loop through the array of the split label
    for(var i=0;i<split.length;i++){
        //Run regex to get rid of extra line breaks (Optimally, the logic could be improved to not need this)
        //This is only needed for the streaming text for Dialogue. Maybe the label for that should be saved before this modification or something
        split[i] = split[i].replace(/(\r\n|\n|\r)/gm,"");
        //The upcoming width for this word
        var nextWidth = split[i]?ctx.measureText(split[i]).width:0;
        for(var j=0;j<split[i].length;j++){
            var measured = ctx.measureText(tempLabel);
            //Move to a new line
            if(measured.width+nextWidth+spaceWidth*spaces>=maxWidth){
                newLabel+="\n";
                tempLabel = '';
                spaces = 0;
            } else {
                tempLabel+=split[i][j];
            }
        }
        newLabel+=split[i];
        if(i!==split.length-1){
            newLabel+=" ";
        }
        spaces++;
    }
    return newLabel;
};

//Set up the game state's options
//The default values will be overridden by data coming from the save file.
Q.state.set({
    options:{
        //If true, BGM will play
        musicEnabled:true,
        musicVolume:100,
        //If true, SFX will play
        soundEnabled:true,
        soundVolume:100,
        //The speed at which the text cycles on screen (1,2, or 3)
        textSpeed:1,
        //If true, text will automatically go to the next text after the previous one completes.
        autoScroll:false,
        //How fast the cursor moves in battle
        cursorSpeed:2
    },
    //Which tunes have been loaded (so that we don't load music twice)
    loadedMusic:[],
    //The current music
    currentMusic:""
});

//Sort the equipment by rank so it doesn't have to be done every time
Q.organizeEquipment=function(){
    var eq = Q.state.get("equipment");
    //This is the highest rank that we've added in the game
    var ranks = Q.maxEquipmentRank;
    eq.weaponSorted = [];
    eq.shieldSorted = [];
    eq.bodySorted = [];
    eq.feetSorted = [];
    eq.accessorySorted = [];
    
    var types = ["weapon","shield","body","feet","accessory"];
    //Loop through each type
    for(var i=0;i<types.length;i++){
        //Create the sorted array in the equipment object
        var srt =  eq[types[i]+"Sorted"] = [];
        //Loop through the total ranks
        for(var j=1;j<=ranks;j++){
            //Create an empty array at this rank at fill it with all euqipment of this rank from this type
            srt[j-1] = [];
            var type = types[i];
            //Get all of the different types of equipment
            var keys = Object.keys(eq[type]);
            for(var k=0;k<keys.length;k++){
                //If the equipment's rank is equal to the current rank, put it into this array
                if(eq[type][keys[k]].rank===j){
                    srt[j-1].push(eq[type][keys[k]]);
                }
            }
        }
    }
};
//When new game is selected, generate a new game state
Q.newGame=function(options){
    //Set up the game state with default values
    Q.state.set({
        //The scene name. This does not have to be 'act', but it does have to match the json.
        sceneName:"act1_1",//"side_quest1",
        //The quests that have been accepted. Array full of strings
        acceptedQuests:[],
        //The current day. Affects when story quests trigger
        day:1
    });
    //The main character's object
    var alex = Q.state.get("characters").alex;
    alex.gender = options.gender;
    var storyAlex = Q.setUpStoryCharacter(alex);
    Q.state.set("alex",storyAlex);
    //For now, alex is the only character (just added more people)
    Q.state.set("allies",[storyAlex/*,Q.setUpStoryCharacter(Q.state.get("characters").astrea),Q.setUpStoryCharacter(Q.state.get("characters").peter)*/]);
    //Set up the new game bag
    Q.state.set("Bag",new Q.Bag({items:{
        consumable:[
            ["potion",3]
        ],
        weapon:[],
        shield:[],
        body:[],
        feet:[],
        accessory:[],
        key:[]
    }}));
    //Start a scene
    Q.startScene(Q.state.get("sceneName"));
};
//Start the game from the save data
Q.startGame=function(save){
    Q.state.set({
        sceneName:save.sceneName,
        day:save.day,
        options:save.options,
        acceptedQuests:save.acceptedQuests
    });
    var storyChars = [];
    save.allies.forEach(function(ally){
        storyChars.push(Q.setUpStoryCharacter(ally));
    });
    Q.state.set("alex",storyChars.filter(function(ally){return ally.name==="Alex";})[0]);
    Q.state.set("allies",storyChars);
    //Set up the Bag.
    Q.state.set("Bag",new Q.Bag({items:save.inventory}));//Q.Bag is in objects.js
    
    Q.startScene(Q.state.get("sceneName"));
};
var files = [
    //IMAGES SPRITES
    "sprites/archer.png",
    "sprites/barbarian.png",
    "sprites/knight.png",
    //IMAGES UI
    "ui/ui_objects.png",
    "ui/text_box.png",
    //IMAGES TILES
    "tiles/tiles.png",
    "tiles/interactables.png",
    //ANIMATIONS
    "animations/SonicBoom.png",
    "animations/Whirlwind.png",
    "animations/Piercing.png",
    //AUDIO SFX
    "sfx/cannot_do.mp3",
    "sfx/coin.mp3",
    "sfx/confirm.mp3",
    "sfx/dying.mp3",
    "sfx/explosion.mp3",
    "sfx/critical_hit.mp3",
    "sfx/glancing_blow.mp3",
    "sfx/hit1.mp3",
    "sfx/inflict_status.mp3",
    "sfx/shooting.mp3",
    "sfx/slashing.mp3",
    "sfx/text_stream.mp3",
    "sfx/whirlwind.mp3",
    //AUDIO BGM
    //"bgm/demo.mp3"
    //JSON DATA
    "json/data/equipment.json",
    "json/data/items.json",
    "json/data/locations.json",
    "json/data/quests.json",
    "json/data/character_classes.json",
    "json/data/characters.json",
    "json/data/skills.json",
    "json/data/status.json",
    "json/data/awards.json",
    "json/data/ui_objects.json",
    "json/data/tile_types.json",
    //JSON STORY
    "json/story/act1_1.json",
    "json/story/act1_2.json",
    "json/story/act1_3.json",
    //THE SAMPLE SAVE DATA
    "json/save/sample_save_data.json"
];
//Load all of the assets that we need. We should probably load bgm only when necessary as it takes several seconds per file.
Q.load(files.join(','),function(){
    //All equipment data
    Q.state.set("equipment",Q.assets['json/data/equipment.json']);
    //Items that are not equipment. I may make key items seperate.
    Q.state.set("items",Q.assets['json/data/items.json']);
    //All default values for the locations (used when generating the menus).
    Q.state.set("locations",Q.assets['json/data/locations.json']);
    //All quests that can be taken by the player at the pub.
    Q.state.set("quests",Q.assets['json/data/quests.json']);
    //All base settings for character classes
    Q.state.set("charClasses",Q.assets['json/data/character_classes.json']);
    //The story characters that you can recruit (including alex)
    Q.state.set("characters",Q.assets['json/data/characters.json']);
    //The list of skills and their effects
    Q.state.set("skills",Q.assets['json/data/skills.json']);
    //The list of awards and descriptions
    Q.state.set("awards",Q.assets['json/data/awards.json']);
    //The descriptions for status effects
    Q.state.set("status",Q.assets['json/data/status.json']);
    //The attributes of each type of tile that can be stepped on.
    Q.state.set("tileTypes",Q.assets['json/data/tile_types.json']);
    //Get the equipment in the proper format
    Q.organizeEquipment();
    //Initialize the sprite sheets and make the animations work. -> animations.js
    Q.setUpAnimations();
    
    /*
     *  THIS IS THE SLIM VERSION OF THE GAME THAT IS USED FOR TESTING ONLY
     */
    $(document.body).append('<div id="back-button" class="btn btn-default">TO EDITOR</div>');
    $(document.body).append('<div id="back-button2" class="btn btn-default">TO EVENTS</div>');
    var scene = document.getElementById("title").innerHTML.toLowerCase();
    var name = document.getElementById("title2").innerHTML.toLowerCase();
    Q.load("../../data/events/"+scene+"/"+name+".json",function(){
        //Figure out what type of scene we're testing
        Q.state.set("testingScene",Q.assets["../../data/events/"+scene+"/"+name+".json"]);
        var kind = Q.state.get("testingScene").kind;
        switch(kind){
            case "story":
                Q.testStoryScene(Q.state.get("testingScene"));
                $("#back-button").click(function(){
                    var scene = $("#title").text();
                    var name = $("#title2").text();
                    var form = $('<form action="edit-story-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"></form>');
                    form.submit();
                });
                $("#back-button2").click(function(){
                    var scene = $("#title").text();
                    var name = $("#title2").text();
                    var form = $('<form action="show-events.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"></form>');
                    form.submit();
                });
                break;
        }
    });
    
    //Start the game from the JSON save data
    //Q.startGame(Q.assets['json/save/sample_save_data.json']);
    //Make it so that you can open the options menu at all times
    //For now, press space or z to load
    Q.input.on("fire",Q,"loadOptions");
});
//Checks if the user wants to go to the options menu
Q.loadOptions = function(){
    if(!Q.stage(4)){
        Q.pauseAllStages();
        Q.stageScene("optionsMenu",4);
    } else  {
        Q.clearStage(4);
        Q.unpauseAllStages();
    }
};
//Q.debug=true;
});