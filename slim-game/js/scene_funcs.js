Quintus.SceneFuncs=function(Q){
    
    Q.startScene = function(scene,start,sceneType){
        Q.load("json/story/"+scene+".json",function(){
            var data = Q.assets["json/story/"+scene+".json"];
            //Load the bg assets and create the scene
            Q.loadMusic(data.music.join(','),function(){
                Q.loadTMX(data.bgs.concat(data.chars).concat(data.maps).join(','), function() {
                    var starting = start?start:data.startScene[0];
                    var sceneData = data[starting];
                    //dialogue, battle, battleScene
                    var type = sceneType?sceneType:"dialogue";
                    var sceneNum = 1;
                    if(type==="battleScene"||type==="battle"){sceneNum = 0;};
                    Q.playMusic(sceneData.music,function(){
                        Q.clearStages();
                        //Stage the scene
                        Q.stageScene(type,sceneNum,{data: data,path:starting});
                    });
                });
            });
        });
    };
    Q.scene("story",function(stage){
        var data = stage.options.data;
        var bgImage = stage.insert(new Q.BackgroundImage({asset:data.pages[0].bg}));
        Q.storyController = stage.insert(new Q.StoryController({pages:data.pages,pageNum:0,bgImage:bgImage}));
    });
    
    Q.scene("dialogue",function(stage){
        Q.inputs['confirm'] = false;
        var dialogueData = stage.options.dialogueData = Q.getPathData(stage.options.data,stage.options.path);
        var bgImage;
        if(dialogueData.bg){
            bgImage = stage.insert(new Q.BackgroundImage({asset:dialogueData.bg}));
        }
        //The textbox is in charge of all of the functions that need to be run to do custom events.
        //It also shows the text_box.png
        var textBox = stage.textBox = stage.insert(new Q.TextBox({dialogueData:dialogueData,bgImage:bgImage,bg:dialogueData.bg}));
        //The left/right Assets are the characters that are speaking in the dialogue
        textBox.p.leftAsset = stage.insert(new Q.StoryImage({x:100,y:Q.height-textBox.p.h-150}));
        textBox.p.rightAsset = stage.insert(new Q.StoryImage({x:Q.width-100,y:Q.height-textBox.p.h-150,flip:'x'}));
        //The Dialogue Area is the inner area of the text box. It will be transparent later on.
        textBox.p.dialogueArea = stage.insert(new Q.DialogueArea({w: Q.width-20}));
        //The Dialogue is the text that is inside the dialogue area
        textBox.p.dialogueText = textBox.p.dialogueArea.insert(new Q.Dialogue({text:dialogueData.interaction[0].text?dialogueData.interaction[0].text:"~",align: 'left', x: 10}));
        textBox.next();
    }); 
    Q.scene("battleScene",function(stage){
        Q.inputs['confirm'] = false;
        Q.stageScene("fader",11);
        //Get the data to play out this scene
        var data = stage.options.sceneData = Q.getPathData(stage.options.data,stage.options.path);
        var music = data.music;
        if(!music) music = Q.state.get("currentMusic");
        Q.playMusic(music,function(){
            //Display the tmx tile map
            //If one is not passed in, we are re-using the map from the previous battle
            if(data.map){
                Q.stageTMX(data.map, stage);
            }
            stage.lists.TileLayer[0].p.z = 0;
            stage.lists.TileLayer[1].p.z = 1;
            stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
            stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
            //The battle controller holds all battle specific functions
            Q.BatCon = new Q.BattleController({stage:stage});
            stage.add("viewport");
            stage.viewport.scale = 2;
            //The invisible sprite that the viewport follows
            stage.viewSprite = stage.insert(new Q.ViewSprite());
            Q.viewFollow(stage.viewSprite,stage);
            
            var allyData = Q.state.get("allies");
            var charData = data.initialChars;
            var chars = [];
            charData.forEach(function(char){
                var character;
                //If the character is an ally, get the data from the allies array
                if(char.team==="ally"){
                    //Find the data in the allies array
                    var data = allyData.filter(function(ally){
                        return ally.name===char.name;
                    })[0];
                    if(data){
                        character = new Q.StoryCharacter({charClass:data.charClass,storyId:char.storyId,level:data.level,exp:data.exp,name:data.name,skills:data.skills,equipment:data.equipment,gender:data.gender,stats:data.stats,team:char.team,awards:char.awards});
                        character.add("statCalcs");
                    } else {
                        character = new Q.StoryCharacter({charClass:char.charClass,dir:char.dir?char.dir:"left",storyId:char.storyId,team:char.team,awards:char.awards});
                    }
                } else {
                    character = new Q.StoryCharacter({charClass:char.charClass,dir:char.dir?char.dir:"left",storyId:char.storyId,team:"enemy"});
                }
                chars.push(character);
                character.p.loc = char.loc;
                character.p.anim = char.anim;
            });
            chars.forEach(function(char){
                stage.insert(char);
            });
            Q.stageScene("dialogue",1,{data:stage.options.data,path:stage.options.path});
        });
        
    },{sort:true});
    Q.scene("battle",function(stage){
        Q.stageScene("fader",11);
        //The data that is used for this battle
        var battleData = stage.options.battleData = Q.getPathData(stage.options.data,stage.options.path);
        var music = battleData.music;
        if(!music) music = Q.state.get("currentMusic"); 
        Q.playMusic(music,function(){
            //Display the tmx tile map
            Q.stageTMX(battleData.map, stage);
            stage.lists.TileLayer[0].p.z = -2;
            stage.lists.TileLayer[1].p.z = -1;
            stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
            stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
            //Create the grid which keeps track of all interactable objects. This allows for easy searching of objects by location
            Q.BattleGrid = new Q.BattleGridObject({stage:stage});
            //The battle controller holds all battle specific functions
            Q.BatCon = new Q.BattleController({stage:stage});
            stage.add("viewport");
            stage.viewport.scale = 2;
            
            var allyData = Q.state.get("allies");
            var allies = [];
            allyData.forEach(function(ally,i){
                var char = new Q.Character({charClass:ally.charClass,level:ally.level,exp:ally.exp,name:ally.name,skills:ally.skills,equipment:ally.equipment,gender:ally.gender,stats:ally.stats,team:"ally",hp:ally.hp,sp:ally.sp,awards:ally.awards});
                char.p.savedData = ally;
                char.add("statCalcs,save");
                allies.push(char);
                char.p.loc = [battleData.placementSquares[i][0],battleData.placementSquares[i][1]];
                char.p.dir = battleData.placementSquares[i][2];
            });
            //Display the enemies, interactables, pickups, and placement locations
            var enemyData = battleData.enemies;
            var enemies = [];
            enemyData.forEach(function(enm){
                var char = new Q.Character({charClass:enm.charClass,level:enm.level,equipmentRank:enm.equipmentRank,equipmentType:enm.equipmentType,gender:"male",team:"enemy",dir:enm.dir?enm.dir:"left",awards:Q.setUpAwards()});
                char.add("randomCharacter,statCalcs");
                enemies.push(char);
                char.p.loc = enm.loc;
            });
            
            var neutralData = battleData.neutral?battleData.neutral:[];
            var neutral = [];
            neutralData.forEach(function(neu){
                var ally = Q.state.get("characters")[neu.name];
                var char;
                //If the neutral character is a story character
                if(ally){
                    var storyChar = Q.setUpStoryCharacter(ally);
                    char = new Q.Character({charClass:storyChar.charClass,level:storyChar.level,exp:storyChar.exp,name:storyChar.name,skills:storyChar.skills,equipment:storyChar.equipment,gender:storyChar.gender,stats:storyChar.stats,team:"ally",awards:storyChar.awards});
                    char.add("statCalcs");
                } else {
                    char = new Q.Character({charClass:neu.charClass,level:neu.level,equipmentRank:neu.equipmentRank,equipmentType:neu.equipmentType,gender:"male",team:"enemy",dir:neu.dir?neu.dir:"left",awards:Q.setUpAwards()});
                    char.add("randomCharacter,statCalcs");
                }
                neutral.push(char);
                char.p.loc = neu.loc;
            });
            
            var interactables = battleData.ineractables?battleData.ineractables:[];
            var inter = [];
            //Insert the interactables (TODO)
            interactables.forEach(function(){
                
            });
            allies.forEach(function(ally){
                stage.insert(ally);
            });
            enemies.forEach(function(enemy){
                stage.insert(enemy);
            });
            neutral.forEach(function(neut){
                stage.insert(neut);
            });
            //The pointer is what the user controls to select things. At the start of the battle it is used to place characters and hover enemies (that are already placed).
            Q.pointer = stage.insert(new Q.Pointer({loc:allies[0].p.loc}));

            //Default to following the pointer
            Q.viewFollow(Q.pointer,stage);

            //Display the hud which shows character and terrain information
            Q.stageScene("battleHUD",3,{pointer:Q.pointer});
            Q.BatCon.startBattle();
        });
        
    },{sort:true});
    //Displayed when selecting a character in battle
    Q.scene("characterMenu",function(stage){
        var target = stage.options.target;
        var active = stage.options.currentTurn;
        if(target===active){
            stage.ActionMenu = stage.insert(new Q.ActionMenu({target:target,active:true}));
        } else {
            stage.ActionMenu = stage.insert(new Q.ActionMenu({target:target}));
        }
    });
    //Displayed when pressing the menu button at any time.
    Q.scene("optionsMenu",function(stage){
        var menu = stage.insert(new Q.UI.Container({w:Q.width/2,h:Q.height/2,cx:0,cy:0,fill:"blue",opacity:0.5}));
        menu.p.x = Q.width/2-menu.p.w/2;
        menu.p.y = Q.height/2-menu.p.h/2;
        var title = menu.insert(new Q.UI.Text({x:menu.p.w/2,y:15,label:"OPTIONS",size:30}));
        var texts = ["Music","Sound","Text Speed","Auto Scroll","Cursor Speed"];
        var vals = Q.state.get("options");
        var values = ["musicEnabled","soundEnabled","textSpeed","autoScroll","cursorSpeed"];
        var options = [];
        for(var i=0;i<texts.length;i++){
            var option = menu.insert(new Q.UI.Container({x:10,y:50+i*40,fill:"red",w:menu.p.w-20,h:40,cx:0,cy:0,radius:0,value:vals[values[i]]}));
            option.insert(new Q.UI.Text({align:"left",x:10,y:8,label:texts[i]}));
            option.val = option.insert(new Q.UI.Text({align:"right",x:option.p.w-10,y:8,label:""+vals[values[i]]}));
            if(i===0){
                option.p.fill = "green";
            }
            options.push(option);
        }
        var optionNum = 0;
        var optsFuncs  = [
            function(opt){if(opt.p.value){opt.p.value=false;}else{opt.p.value=true;}},
            function(opt){if(opt.p.value){opt.p.value=false;}else{opt.p.value=true;}},
            function(opt){opt.p.value++;if(opt.p.value>3){opt.p.value=1;}},
            function(opt){if(opt.p.value){opt.p.value=false;}else{opt.p.value=true;}},
            function(opt){opt.p.value++;if(opt.p.value>3){opt.p.value=1;}}
        ];
        stage.on("step",function(){
            if(Q.inputs['confirm']){
                //Run the proper function
                optsFuncs[optionNum](options[optionNum]);
                vals[values[optionNum]] = options[optionNum].p.value;
                options[optionNum].val.p.label = ""+vals[values[optionNum]];
                Q.state.trigger("change."+values[optionNum],options[optionNum].p.value);
                Q.inputs['confirm']=false;
                return;
            }
            if(Q.inputs['up']){
                options[optionNum].p.fill="red";
                optionNum--;
                if(optionNum<0){optionNum=options.length-1;};
                options[optionNum].p.fill="green";
                Q.inputs['up']=false;
            } else if(Q.inputs['down']){
                options[optionNum].p.fill="red";
                optionNum++;
                if(optionNum>=options.length){optionNum=0;};
                options[optionNum].p.fill="green";
                Q.inputs['down']=false;
            }
        });
    });
    Q.scene("battleHUD",function(stage){
        //Create the top left hud which gives information about the ground (grass,dirt,etc...)
        var terrainHUD = stage.insert(new Q.TerrainHUD());
        //Create the top right hud that shows condensed stats about the currently hovered object (people, interactable non-human/monsters, etc...)
        var statsHUD = stage.insert(new Q.StatsHUD());
    });
    Q.scene("battleText",function(stage){
        stage.insert(new Q.BattleTextBox({text:stage.options.text,callback:stage.options.callback}));
    });
    Q.scene("location",function(stage){
        //Set the current menu. Default is 'start'
        if(!stage.options.menu){alert("No Menu Given in JSON!!!");};
        Q.state.set("currentMenu",stage.options.menu?stage.options.menu:Q.state.get("currentMenu"));
        //Load any bgs for this location
        Q.load(stage.options.data.bgs.join(','),function(){
            Q.playMusic(stage.options.data[stage.options.menu].music,function(){
                Q.stageScene("dialogue", 1, {data: stage.options.data, path: Q.state.get("currentMenu")});
            });
        });
    });
    Q.scene("fader",function(stage){
        stage.insert(new Q.Fader());
    });
};
