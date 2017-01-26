Quintus.UIObjects=function(Q){
    //The background image user in dialogue and menus
    Q.Sprite.extend("BackgroundImage",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                type:Q.SPRITE_NONE,
                w:Q.width,h:Q.height
            });
            Q._generatePoints(this,true);
        }
    });
    //The person who is talking in the story
    Q.Sprite.extend("StoryImage",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                w:200,
                h:300,
                type:Q.SPRITE_NONE
            });
        }
    });
    Q.Sprite.extend("TextBox",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                type:Q.SPRITE_NONE,
                asset:"ui/text_box.png",
                
                interactionIndex:0,
                textIndex:0,
                cantCycle:false,
                noCycle:false,
                autoCycle:false,
                
                //The number of frames between inputs
                inputsTime:15
            });
            //Uncomment if we add touch and set type to Q.SPRITE_UI
            //Q._generatePoints(this,true);
            this.p.y=Q.height-this.p.h;
            this.on("step",this,"checkInputs");
        },
        waitForInputsTimer:function(){
            this.p.inputsTimer--;
            if(this.p.inputsTimer<=0){
                this.on("step",this,"checkInputs");
                this.off("step",this,"waitForInputsTimer");
            }
        },
        checkInputs:function(){
            if(Q.inputs['confirm']){
                if(!this.p.cantCycle&&!this.p.noCycle){
                    if(this.p.dialogueText.interact()){
                        this.nextText();
                    }
                    this.p.inputsTimer=this.p.inputsTime;
                    this.off("step",this,"checkInputs");
                    this.on("step",this,"waitForInputsTimer");
                    Q.inputs['confirm']=false;
                };
            }
        },
        checkTextNum:function(){
            var currentInteraction = this.p.dialogueData.interaction[this.p.interactionIndex];
            if(!currentInteraction.text || this.p.textIndex >= currentInteraction.text.length) {
                this.p.textIndex = 0;
                this.p.interactionIndex++;
            }
        },
        next:function() {
            var interaction = this.p.dialogueData.interaction[this.p.interactionIndex];
            //Debug
            if(!interaction){
                alert("Check the console for error.");
                console.log("No interaction becuase the interaction index may be too high")
                console.log("Interaction:");
                console.log(this.p.dialogueData.interaction);
                console.log("Interaction Index:");
                console.log(this.p.interactionIndex);
            }
            //Disallow user cycling for some dialogue
            if(interaction.noCycle){
                this.p.cantCycle = true;
                this.p.noCycle = true;
            }
            if(interaction.autoCycle){
                this.p.cantCycle = true;
                this.p.dialogueText.p.autoCycle = interaction.autoCycle;
                this.on("step",this,"autoCycle");
            }
            var type = this.checkDialogueType(this.p.dialogueData.interaction[this.p.interactionIndex]);
            this['cycle' + type]();
        },
        nextText:function() {
            //Destroy the blinking next text if it's there
            this.p.dialogueText.destroyNextTextTri();
            //Check if we're at the end of the text
            this.checkTextNum();
            //Do the next text (or func)
            this.next();
        },
        checkDialogueType:function(interaction){
            if(interaction.text){
                return 'Text';
            } else if(interaction.func){
                return 'Func';
            }
        },
        cycleText:function(){
            this.showDialogueBox();
            var interaction = this.p.dialogueData.interaction[this.p.interactionIndex];
            this.p.dialogueText.setNewText(interaction.text[this.p.textIndex]);
            this.p.dialogueText.p.align = interaction.pos;
            
            if(this.p.dialogueText.p.align == 'left') {
                this.p.dialogueText.p.x = 10;
            } else if(this.p.dialogueText.p.align == 'right') {
                this.p.dialogueText.p.x = this.p.dialogueArea.p.w-10;
            }
            this.p.textIndex++;
            
            //Update the assets
            if(interaction.asset[0]){
                this.p.leftAsset.p.asset = "story/"+interaction.asset[0];
            } else {
                this.p.leftAsset.p.asset = "";
            }
            if(interaction.asset[1]){
                this.p.rightAsset.p.asset = "story/"+interaction.asset[1];
            } else {
                this.p.rightAsset.p.asset = "";
            }
            // Check if we should run the next line in the action queue immediately without waiting for user confirmation (ie. to open a menu)
            if(interaction.skipLast && interaction.text.length == this.p.textIndex) {
                this.nextText();
            }
        },
        cycleFunc:function(){
            var interaction = this.p.dialogueData.interaction[this.p.interactionIndex];
            //If the function finishes this dialogue, it will be true.
            //This also runs the function that needs to be executed from the JSON
            if(this[interaction.func].apply(this,interaction.props)){return;};
            //Don't run the next part yet
            if(interaction.wait) return;
            if(this.p.cantCycle||this.p.noCycle) return;
            this.p.interactionIndex++;
            this.next();
        },
        //START JSON FUNCTIONS
        //Load location data (in town)
        loadLocation:function(location,menu){
            var stage = this.stage;
            //Make sure the battle is gone
            Q.clearStages();
            this.destroy();
            Q.stageScene("location",0,{data:Q.state.get("locations")[location],menu:menu});
            this.p.cantCycle = true;
            return true;
        },
        //Load the battle scene, which is a dialogue scene with the tmx map and story characters walking around
        loadBattleScene:function(path){
            var stage = this.stage;
            Q.stageScene("battleScene",0,{data:stage.options.data, path:path});
            this.p.cantCycle = true;
            return true;
        },
        //Load the battle scene
        loadBattle:function(path){
            var stage = this.stage;
            Q.stageScene("battle",0,{data:stage.options.data, path:path});
            //Clear this stage
            Q.clearStage(1);
            this.p.cantCycle = true;
            return true;
        },
        //Loads another json file's scene
        loadScene:function(sceneName,start,type){
            Q.startScene(sceneName,start,type);
            this.p.cantCycle = true;
            return true;
        },
        //Probably only used for testing. May be used for loading data from save without saving.
        useSave:function(name){
            Q.load("json/save/"+name+".json",function(){
                var save = Q.assets['json/save/sample_save_data.json'];
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
            });
            
        },
        //Shows additional dialogue (which will probably be determined by factors such as player choices, how well they did in battle, etc...)
        moreDialogue:function(path){
            var stage = this.stage;
            Q.stageScene("dialogue",1,{data:stage.options.data, path:path});
            return true;
        },
        //Enable cycling and cycle to the next text
        forceCycle:function(){
            this.p.cantCycle = false;
            this.p.noCycle = false;
            this.nextText();
        },
        //Run to stop autocycling
        finishAutoCycle:function(){
            if(!this.p.noCycle){
                this.off("step",this,"autoCycle");
                this.p.cantCycle = false;
                this.p.dialogueText.p.autoCycle = 0;
            }
        },
        //Automatically cycles to the next text after a certain number of frames.
        autoCycle:function(){
            if(this.p.dialogueText.p.autoCycle<=0){
                this.finishAutoCycle();
                this.nextText();
                return;
            }
            this.p.dialogueText.p.autoCycle--;
        },
        //Any time the user needs to make a decision during dialogue
        confirmation:function(options){
            this.p.cantCycle = true;
            this.p.noCycle = true;
            var stage = this.stage;
            //Create the options menu box and put it into focus
            stage.insert(new Q.ConfirmBox({maxIndex:options.length-1,options:options}));
            return true;
        },
        triggerQuest:function(questName){
            var quests = Q.state.get("acceptedQuests");
            if(quests[questName]) {
                // We've already received this quest
                return;
            }
            var data = Q.state.get("quests")[questName];
            Q.load(data.bgs.concat(data.chars).join(','),function(){
                Q.clearStages();
                Q.stageScene("dialogue", 1, {data: data, path: "dialogue"});
            });
            return true;
        },
        //Accepts a quest that the player has confirmed that they want to do.
        acceptQuest:function(quest){
            var quests = Q.state.get("acceptedQuests");
            quests[quest] = {name:quest,completed:false};
            //For now, send the user right to the scene!
            Q.clearStages();
            Q.startScene(quest);
            return true;
        },
        getProp:function(prop){
            return this.p[prop];
        },
        changeBg:function(bg){
            this.p.bg = bg;
            this.p.bgImage.p.asset = bg;
        },
        doDefeat:function(){
            //This will run on defeat. TODO
        },
        //Battle Scene Below
        changeMusic:function(music){
            var t = this;
            Q.playMusic(music,function(){t.forceCycle();});
        },
        checkAddCharacter:function(name){
            //For now, just add the character to the party 100% of the time
            Q.state.get("allies").push(Q.state.get("characters")[name]);
        },
        getStoryCharacter:function(id){
            //Gets a story character by their id
            if(Q._isNumber(id)){
                return Q.stage(0).lists.StoryCharacter.filter(function(char){
                    return char.p.storyId===id;
                })[0];
            } 
            //Gets a story character by a property
            else if(Q._isString(id)){
                return Q.stage(0).lists.StoryCharacter.filter(function(char){
                    return char.p[id];
                })[0];
            }
        },
        //Get all characters on a certain team
        getStoryTeamCharacters:function(team){
            return Q.stage(0).lists.StoryCharacter.filter(function(char){
               return char.p.team===team; 
            });
        },
        waitTime:function(time){
          var t = this;
          setTimeout(function(){
              t.forceCycle();
          },time);
        },
        //Hides the dialogue box
        hideDialogueBox:function(){
            Q.stage(1).hide();
        },
        showDialogueBox:function(){
            Q.stage(1).show();
        },
        //Sets the viewport at a location or object
        setView:function(obj,flash){
            var spr = Q.stage(0).viewSprite;
            //Go to location
            if(Q._isArray(obj)){
                spr.p.loc = obj;
                Q.BatCon.setXY(spr);
            } 
            //Follow object (passed in id number)
            else {
                spr.followObj(this.getStoryCharacter(obj));
            }
            if(flash){
                Q.stageScene("fader",11);
            }
        },
        //Tweens the viewport to the location
        centerView:function(obj,speed){
            this.p.cantCycle = true;
            this.p.noCycle = true;
            //Set the viewsprite to the current object that the viewport is following
            var spr = Q.stage(0).viewSprite;
            spr.p.obj = false;
            var t = this;
            //Go to location
            if(Q._isArray(obj)){
                spr.animate({x:obj[0],y:obj[1]},1,Q.Easing.Quadratic.InOut,{callback:function(){
                        t.forceCycle();
                    }});
            } 
            //Follow object (passed in id number)
            else {
                var to = this.getStoryCharacter(obj);
                spr.animate({x:to.p.x,y:to.p.y},speed?speed:1,Q.Easing.Quadratic.InOut,{callback:function(){
                        spr.followObj(to);
                        t.forceCycle();
                    }});
            }
            
            
        },
        allowCycle:function(){
            this.p.cantCycle = false;
            this.p.noCycle = false;
            this.p.dialogueText.p.autoCycle = 0;
            this.p.dialogueText.createNextTri();
        },
        //Changes the direction of a story character
        changeDir:function(id,dir){
            var obj = this.getStoryCharacter(id);
            obj.playStand(dir);
        },
        playAnim:function(id,anim,dir,sound,callbackString){
            Q.playSound(sound+".mp3");
            var t = this;
            this.getStoryCharacter(id)["play"+anim](dir,function(){t[callbackString]();});
        },
        changeMoveSpeed:function(id,speed){
            var obj = this.getStoryCharacter(id);
            obj.p.stepDelay = speed;
        },
        //Moves a character along a path
        moveAlong:function(id,path,dir,atDest){
            var obj = this.getStoryCharacter(id);
            //If the is a function that should be played once the object reaches its destination
            if(atDest){
                var destObj;
                if(atDest.obj==="text"){
                    destObj = this;
                } else if(atDest.obj==="char"){
                    destObj = obj;
                }
                obj.on("doneAutoMove",destObj,atDest.func);
            }
            obj.on("doneAutoMove",obj,function(){
                this.playStand(dir);
            });
            obj.moveAlongPath(path);
        },
        //Fades a character to nothing
        fadeChar:function(id,time,wait){
            var obj = this.getStoryCharacter(id);
            var t =this;
            obj.animate({opacity:0},time,Q.Easing.Linear,{callback:function(){if(wait){t.nextText();}}});
        },
        setCharacterAs:function(setTo,amount,prop,team,filter){
            var objs = this.getStoryTeamCharacters(team);
            var obj = this[filter][amount](objs,prop);
            obj.p[setTo] = true;
        },
        propertyFilter:{
            lowest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p[prop]>b.p[prop];
                })[0];
            },
            highest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p[prop]<b.p[prop];
                })[0];
            }
        },
        awardFilter:{
            lowest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p.awards[prop]>b.p.awards[prop];
                })[0];
            },
            highest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p.awards[prop]<b.p.awards[prop];
                })[0];
            }
        }
        //END JSON FUNCTIONS
    });
    
    Q.UI.Container.extend("ConfirmBox",{
        init:function(p){
            this._super(p,{
                x:Q.width/2,y:Q.height/2,
                cx:0,cy:0,
                w:300,h:200,
                type:Q.SPRITE_NONE,
                fill:"yellow",
                textIndex:0,
                confirmOptions:[],
                z:100
            });
            //Q._generatePoints(this,true);
            this.on("inserted");
        },
        inserted:function(){
            var options = this.p.options;
            var box = this;
            //Display the list of options to choose from
            options.forEach(function(opt,i){
                //The text that displays to show the option
                var confirmOption = box.insert(new Q.UI.Text({y:i*20,label:opt.text,next:opt.next}));
                box.p.confirmOptions.push(confirmOption);
                if(i===0){confirmOption.p.color="red";};
                //When this option is selected
                confirmOption.on("selected",function(path){
                    this.stage.pause();
                    if(opt.exitStage && Q.stages.length > 1) {
                        // Pop off the top stage, and unpause the previous one
                        var lastStage = Q.stages.length - 1;
                        Q.clearStage(lastStage);
                        Q.stages[lastStage - 1].unpause();
                    } else {
                        Q.stageScene("dialogue", 1, {data: box.stage.options.data, path: path});
                    }
                });
            });
            this.fit(10,10);
        },
        changeOptionColor:function(){
            this.p.confirmOptions.forEach(function(opt){
                opt.p.color="black";
            });
            this.p.confirmOptions[this.p.textIndex].p.color="red";
        },
        cycleUp:function(){
            this.p.textIndex--;
            if(this.p.textIndex<0){this.p.textIndex=this.p.maxIndex;};
            this.changeOptionColor();
        },
        cycleDown:function(){
            this.p.textIndex++;
            if(this.p.textIndex>this.p.maxIndex){this.p.textIndex=0;};
            this.changeOptionColor();
        },
        selectOption:function(){
            this.p.confirmOptions[this.p.textIndex].trigger("selected",this.p.confirmOptions[this.p.textIndex].p.next);
        },
        step:function(){
            if(Q.inputs['up']){
                this.cycleUp();
                Q.inputs['up']=false;
            } else if(Q.inputs['down']){
                this.cycleDown();
                Q.inputs['down']=false;
            } else if(Q.inputs['confirm']){
                this.selectOption();
                Q.inputs['confirm']=false;
            }
        }
    });
    Q.UI.Container.extend("DialogueArea",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                type:Q.SPRITE_UI,
                label:"",
                w:Q.width-20,
                h:95,
                fill:"yellow"
            });
            Q._generatePoints(this,true);
            this.p.y=Q.height-this.p.h-15;
            this.p.x+=10;
            this.p.textWidth = this.p.w-40;
        }
    });
    Q.UI.Text.extend("Dialogue",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                type:Q.SPRITE_NONE,
                label:"NO TEXT YET. HIDE THIS OR SET TEXT.",
                charNum:0,
                time:0,
                speed:Q.state.get("options").textSpeed
            });
        },
        destroyNextTextTri:function(){
            if(this.p.nextTextTri) this.p.nextTextTri.destroy();
        },
        createNextTri:function(){
            this.destroyNextTextTri();
            this.p.nextTextTri = this.stage.insert(new Q.NextTextTri({x:this.stage.textBox.p.w/2,y:this.stage.textBox.p.y+this.stage.textBox.p.h-Q.tileH/4}));
            
        },
        setNewText:function(text){
            this.p.text = text;
            this.p.charNum=0;
            this.p.time=0;
            this.p.label = this.p.text[this.p.charNum];
            this.on("step",this,"streamCharacters");
        },
        streamCharacters:function(){
            this.p.time++;
            if(this.p.time>=this.p.speed){
                this.p.time=0;
                this.p.charNum++;
                if(this.p.charNum>=this.p.text.length){
                    this.off("step",this,"streamCharacters");
                    if(!this.stage.textBox.p.cantCycle&&!this.stage.textBox.p.noCycle){
                        this.createNextTri();
                    }
                    return;
                }
                this.p.label+=this.p.text[this.p.charNum];
                //if(this.p.charNum%2===0){
                    Q.playSound("text_stream.mp3");
                //}
            }
        },
        interact:function(){
            var done = false;
            if(this.p.label.length>=this.p.text.length){
                done=true;
            } else {
                this.p.label=this.p.text;
                this.off("step",this,"streamCharacters");
            }
            return done;
        }
    });
    Q.Sprite.extend("NextTextTri",{
        init: function(p) {
            this._super(p, {
                w:Q.tileW/2,h:Q.tileH/2,
                type:Q.SPRITE_NONE,
                blinkNum:0,
                blinkTime:15
            });
            //Triangle points
            this.p.p1=[-this.p.w/2,-this.p.h/2];
            this.p.p2=[0,0];
            this.p.p3=[this.p.w/2,-this.p.h/2];
            this.p.z = 100000;
            this.on("step","trackBlink");
        },
        trackBlink:function(){
            if(this.p.blinkNum<=0){
                this.blink();
                this.p.blinkNum = this.p.blinkTime;
            }
            this.p.blinkNum--;
        },
        blink:function(){
            if(this.p.opacity) this.p.opacity = 0;
            else this.p.opacity = 1;
        },
        draw:function(ctx){
            ctx.beginPath();
            ctx.lineWidth="6";
            ctx.fillStyle="red";
            ctx.moveTo(this.p.p1[0],this.p.p1[1]);
            ctx.lineTo(this.p.p2[0],this.p.p2[1]);
            ctx.lineTo(this.p.p3[0],this.p.p3[1]);
            ctx.closePath();
            ctx.fill();
        }
    });
    //The invisible sprite that follows characters
    Q.Sprite.extend("ViewSprite",{
        init:function(p){
            this._super(p,{
                w:Q.tileW,
                h:Q.tileH,
                type:Q.SPRITE_NONE
            });
            this.add("animation, tween");
        },
        followObj:function(obj){
            this.p.obj = obj;
            this.on("step","follow");
        },
        follow:function(){
            var obj = this.p.obj;
            if(obj){
                this.p.x = obj.p.x;
                this.p.y = obj.p.y;
            } else {
                this.off("step","follow");
            }
        }
    });
    Q.UI.Container.extend("Fader",{
        init:function(p){
            this._super(p,{
                x:Q.width/2,
                y:Q.height/2,
                w:Q.width,h:Q.height,
                fill:"#FFF",
                time:1,
                z:1000000
            });
            this.add("tween");
            this.animate({opacity:0},this.p.time,Q.Easing.Quadratic.In,{callback:function(){Q.clearStage(11);}});

        }
    });
};

