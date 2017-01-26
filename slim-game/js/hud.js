Quintus.HUD=function(Q){
    Q.UI.Container.extend("TerrainHUD",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:250,h:95,
                type:Q.SPRITE_NONE,
                fill:"blue",
                opacity:0.5
            });
            this.on("inserted");
        },
        inserted:function(){
            var info = ["Terrain","Move","Buffs"];
            this.p.stats = [];
            for(var i=0;i<info.length;i++){
                this.insert(new Q.HUDText({label:info[i],x:10,y:10+i*25}));
                this.p.stats.push(this.insert(new Q.HUDText({x:this.p.w-10,y:10+i*25,align:"right"})));
            }
            Q.pointer.on("onTerrain",this,"displayTerrain");
            Q.pointer.getTerrain();
            
        },
        displayTerrain:function(type){
            var terrain = Q.state.get("tileTypes")[type];
            var stats = this.p.stats;
            var labels = [
                terrain.name,
                ""+terrain.move,
                ""+terrain.buff
            ];
            for(var i=0;i<stats.length;i++){
                stats[i].p.label = labels[i];
            }
        }
    });
    Q.UI.Text.extend("HUDText",{
        init:function(p){
            this._super(p,{
                label:"",
                align:'left',
                size:20
            });
        }
    });
    Q.UI.Container.extend("StatsHUD",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:220,h:345,
                type:Q.SPRITE_NONE,
                fill:"blue",
                opacity:0.5
            });
            this.p.x=Q.width-this.p.w;
            this.on("inserted");
        },
        inserted:function(){
            var info = ["Class","Level","Move","HP","SP","Damage","Armour","Speed","Strike","Parry","Critical","Range","Exp."];
            this.p.stats = [];
            for(var i=0;i<info.length;i++){
                this.insert(new Q.HUDText({label:info[i],x:10,y:10+i*25}));
                this.p.stats.push(this.insert(new Q.HUDText({x:this.p.w-10,y:10+i*25,align:"right"})));
            }
            Q.pointer.on("onTarget",this,"displayTarget");
            Q.pointer.on("offTarget",this,"hideHUD");
        },
        displayTarget:function(obj){
            this.show();
            if(obj.p.team==="ally") this.p.fill = "blue";
            if(obj.p.team==="enemy") this.p.fill = "crimson";
            var stats = this.p.stats;
            var labels = [
                ""+obj.p.className,
                ""+obj.p.level,
                ""+obj.p.move,
                ""+obj.p.hp+"/"+obj.p.maxHp,
                ""+obj.p.sp+"/"+obj.p.maxSp,
                ""+obj.p.totalDamageLow+"-"+obj.p.totalDamageHigh,
                ""+obj.p.armour,
                ""+obj.p.totalSpeed,
                ""+obj.p.strike,
                ""+obj.p.parry,
                ""+obj.p.criticalChance,
                ""+obj.p.range,
                ""+obj.p.exp
            ];
            for(var i=0;i<stats.length;i++){
                stats[i].p.label = labels[i];
            }
            
        },
        hideHUD:function(){
            this.hide();
        }
    });
    Q.component("AOEGuide",{
        added:function(){
            this.getAOERange(this.entity.p.loc,this.entity.p.skill.aoe);
        },
        moveStraightTiles:function(dir){
            var tiles = this.aoeTiles;
            var arr = Q.getDirArray(dir);
            //Loop backwards so the closer enemy is targeted
            for(var i=tiles.length-1;i>=0;i--){
                var tile = tiles[i];
                var loc = tile.p.center;
                tile.p.loc = [(i+1)*arr[0]+loc[0],(i+1)*arr[1]+loc[1]];
                Q.BatCon.setXY(tile);
                var objOn = Q.BattleGrid.getObject(tile.p.loc);
                if(objOn){
                    Q.pointer.trigger("onTarget",objOn);
                }
            }
        },
        moveTiles:function(to){
            this.aoeTiles.forEach(function(tile){
                tile.p.loc = [tile.p.relative[0]+to[0],tile.p.relative[1]+to[1]];
                Q.BatCon.setXY(tile);
            });
        },
        destroyGuide:function(){
            var stage = this.entity.stage;
            this.aoeTiles.forEach(function(tile){
                stage.remove(tile);
            });
            this.entity.p.skill=false;
            this.entity.del("AOEGuide");
        },
        getAOERange:function(loc,aoe){
            var area = aoe[0];
            var radius = aoe[1];
            var special = aoe[2];
            var aoeTiles = this.aoeTiles =[];
            var bounds = Q.BattleGrid.getBounds(loc,radius);
            switch(area){
                //Diamond shape
                case "normal":
                    for(var i=-radius;i<radius+1;i++){
                        for(var j=0;j<((radius*2+1)-Math.abs(i*2));j++){
                            aoeTiles.push(this.entity.stage.insert(new Q.AOETile({loc:[loc[0]+i,loc[1]+j-(radius-Math.abs(i))],relative:[i,j-(radius-Math.abs(i))]})));
                        }
                    }
                    break;
                    //Square shape
                case "corners":
                    for(var i=bounds.tileStartX;i<bounds.tileStartX+bounds.cols;i++){
                        for(var j=bounds.tileStartY;j<bounds.tileStartY+bounds.rows;j++){
                            aoeTiles.push(this.entity.stage.insert(new Q.AOETile({loc:[i,j],relative:[loc[0]-i,loc[1]-j]})));
                        }
                    }
                    break;
                    //Line shape
                case "straight":
                    var dir = this.entity.p.user.p.dir;
                    //Gets the array multiplier for the direction
                    var arr = Q.getDirArray(dir);
                    for(var i=0;i<radius;i++){
                        var spot = [i*arr[0]+loc[0],i*arr[1]+loc[1]];
                        aoeTiles.push(this.entity.stage.insert(new Q.AOETile({loc:spot,center:loc})));
                    }
                    break;
            }
            //Don't include the middle square
            if(special==="excludeCenter"){
                aoeTiles.forEach(function(obj,i){
                    if(obj.p.loc[0]===loc[0]&&obj.p.loc[1]===loc[1]){
                        aoeTiles[i].destroy();
                        aoeTiles.splice(i,1);
                    }
                });
            }
        }
    });
    
    //Enables controlling of menus
    //Includes up, down, confirm, and esc.
    Q.component("menuControls",{
        added:function(){
            //Set the defaults
            this.changeMenuOpts();
        },
        turnOnInputs:function(){
            this.entity.on("step",this,"checkInputs");
        },
        turnOffInputs:function(){
            this.entity.off("step",this,"checkInputs");
        },
        changeMenuOpts:function(selected,menuNum){
            this.menuNum = menuNum?menuNum:0;
            //Default to the top of the menu
            this.selected = selected?selected:0;
            //The number of menu options in this menu
            this.menuLen = this.entity.p.options[this.menuNum].length;
        },
        fillAllRed:function(){
            this.entity.p.conts.forEach(function(cont){
                cont.p.fill="red";
            });
        },
        cycle:function(to){
            this.entity.p.conts[this.selected].p.fill="red";
            this.selected=to;
            this.entity.p.conts[this.selected].p.fill="green";
            this.entity.trigger("hoverOption",to);
        },
        checkInBoundsUp:function(to){
            if(this.selected===0||to<0){
                to=this.entity.p.options[this.menuNum].length-1;
            }
            return to;
        },
        checkInBoundsDown:function(to){
            if(to>this.entity.p.options[this.menuNum].length-1){
                to=0;
            };
            return to;
        },
        skipGray:function(to,dir){
            while(this.entity.p.conts[to]&&this.entity.p.conts[to].p.fill==="gray"){to+=dir;}
            //Going up
            if(dir<0) to = this.checkInBoundsUp(to);
            else to = this.checkInBoundsDown(to);
            return to;
        },
        checkInputs:function(){
            if(Q.inputs['up']){
                var to = this.checkInBoundsUp(this.selected-1);
                to = this.skipGray(to,-1);
                this.cycle(to);
                Q.inputs['up']=false;
            } else if(Q.inputs['down']){
                var to=this.checkInBoundsDown(this.selected+1);
                to = this.skipGray(to,1);
                this.cycle(to);
                Q.inputs['down']=false;
            }
            if(Q.inputs['confirm']){
                this.entity.trigger("pressConfirm",this.selected);
                Q.inputs['confirm']=false;
            }
            if(Q.inputs['esc']){
                this.entity.trigger("pressBack",this.menuNum);       
                Q.inputs['esc']=false;
            }
            if(Q.inputs['left']){
                this.entity.trigger("pressLeft");
                Q.inputs['left']=false;
            } else if(Q.inputs['right']){
                this.entity.trigger("pressRight");
                Q.inputs['right']=false;
            }
            
        },
        
        //Destroys all containers (the menu options)
        destroyConts:function(){
            this.entity.p.conts.forEach(function(cont){
                cont.destroy();
            });
        }
    });
    //The menu that loads in battle that allows the user to do things with a character
    Q.UI.Container.extend("ActionMenu",{
        init: function(p) {
            this._super(p, {
                w:200,h:350,
                cx:0,cy:0,
                fill:"blue",
                opacity:0.5,
                titles:["ACTIONS","ACTIONS","SKILLS","ITEMS"],
                options:[["Move","Attack","Skill","Lift","Item","Status","End Turn"],["Status","Exit Menu"],[]],
                funcs:[["loadMove","loadAttack","loadSkillsMenu","loadLift","loadItemsMenu","loadStatus","loadEndTurn"],["loadStatus","loadExitMenu"],[]],
                conts:[]
            });
            this.p.x = Q.width-this.p.w;
            this.p.y = Q.height-this.p.h;
            //Display the initial menu on inserted to the stage
            this.on("inserted");
            
            //Add the inputs for the menu
            this.add("menuControls");
            //If this is the active character, set up the skills options and check for lifted
            if(this.p.active){
                this.menuControls.menuNum = 0;
                this.setSkillOptions();
                this.checkLifting();
            } else this.menuControls.menuNum = 1;
        },
        inserted:function(){
            //Check if the target has done move or action and gray out the proper container
            this.on("checkGray");
            //When the user presses back
            this.on("pressBack");
            //When the user presses confirm
            this.on("pressConfirm");
            //Turn on the inputs
            this.menuControls.turnOnInputs();
            //Display the menu options
            this.displayMenu(this.menuControls.menuNum,0);
        },
        pressConfirm:function(selected){
            this[this.p.conts[selected].p.func]();
        },
        pressBack:function(menuNum){
            //If we're in the skills menu or items menu
            if(menuNum===2||menuNum===3){
                //Send us back to the main menu
                this.displayMenu(0,0);
            } 
            else {
                Q.pointer.addControls();
                Q.pointer.on("checkConfirm");
                //Make sure the characterMenu is gone
                Q.clearStage(2);
            }
        },
        setSkillOptions:function(){
            var target = this.p.target;
            var opts = [];
            var funcs = [];
            var skills = [];
            //Set possible skills
            var rh = target.p.equipment.righthand;
            var lh = target.p.equipment.lefthand;
            if(rh.equipmentType){
                var keys = Object.keys(target.p.skills[rh.equipmentType]);
                keys.forEach(function(key){
                    opts.push(target.p.skills[rh.equipmentType][key].name);
                    funcs.push("loadSkill");
                    skills.push(target.p.skills[rh.equipmentType][key]);
                });
            }
            if(lh.equipmentType){
                var keys = Object.keys(target.p.skills[lh.equipmentType]);
                keys.forEach(function(key){
                    opts.push(target.p.skills[lh.equipmentType][key].name);
                    funcs.push("loadSkill");
                    skills.push(target.p.skills[lh.equipmentType][key]);
                });
            }
            this.p.options[2]=opts;
            this.p.funcs[2]=funcs;
            this.p.skills=skills;
            //Set items
            var opts = [];
            var funcs = [];
            var itms = [];
            var items = Q.state.get("Bag").items.consumable;
            //If there are items in the bag
            if(items.length){
                items.forEach(function(item){
                    opts.push(item.name);
                    funcs.push("loadItem");
                    itms.push(item);
                });
            } else {
                opts.push("No Items");
                funcs.push("noItems");
            }
            this.p.options[3]=opts;
            this.p.funcs[3]=funcs;
            this.p.items=itms;  
        },
        checkLifting:function(){
            var lifting = this.p.target.p.lifting;
            if(lifting){
                this.p.options[0][3] = "Drop";
                this.p.funcs[0][3] = "loadDrop";
            }
        },
        //Checks if some containers should be gray
        checkGray:function(menuNum){
            if(menuNum===0){
                if(this.p.target.p.didMove){this.p.conts[0].p.fill="gray";};
                if(this.p.target.p.didAction){
                    this.p.conts[1].p.fill="gray";
                    this.p.conts[2].p.fill="gray";
                    this.p.conts[3].p.fill="gray";
                    this.p.conts[4].p.fill="gray";
                };
            }
        },
        //Displays new menu items within this menu
        displayMenu:function(menuNum,selected){
            this.menuControls.menuNum = menuNum;
            if(this.p.title) this.p.title.destroy();
            if(this.p.conts.length) this.menuControls.destroyConts();
            this.p.title = this.insert(new Q.UI.Text({x:this.p.w/2,y:15,label:this.p.titles[menuNum],size:20}));
            var options = this.p.options[menuNum];
            var funcs = this.p.funcs[menuNum];
            if(this.p.target.p.didMove&&menuNum===0) selected++;
            this.p.conts = [];
            for(var i=0;i<options.length;i++){
                var cont = this.insert(new Q.UI.Container({x:10,y:50+i*40,w:this.p.w-20,h:40,cx:0,cy:0,fill:"red",radius:0,func:funcs[i]}));
                var name = cont.insert(new Q.UI.Text({x:cont.p.w/2,y:12,label:options[i],cx:0,size:16}));
                if(menuNum===2){
                    name.p.x = 4;
                    name.p.align="left";
                    cont.insert(new Q.UI.Text({x:cont.p.w-4,y:12,label:""+this.p.skills[i].cost,cx:0,align:"right",size:16}));
                }
                this.p.conts.push(cont);
            }
            this.menuControls.selected = 0;
            this.menuControls.cycle(selected);
            this.trigger("checkGray",menuNum);
        },
        //Shows the move grid and zoc
        loadMove:function(){
            Q.BattleGrid.showZOC(this.p.target.p.team==="enemy"?"ally":"enemy");
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"walk"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.menuControls.turnOffInputs();
            this.hide();
            Q.pointer.p.user = this.p.target;
            Q.pointer.addControls();
            Q.pointer.snapTo(this.p.target);
        },
        //Shows the attack grid
        loadAttack:function(){
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"attack"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.menuControls.turnOffInputs();
            this.hide();
            Q.pointer.p.user = this.p.target;
            Q.pointer.addControls();
            Q.pointer.snapTo(this.p.target);
        },
        //Show the range for lifting (4 squares around the user)
        loadLift:function(){
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"lift"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.menuControls.turnOffInputs();
            this.hide();
            Q.pointer.p.user = this.p.target;
            Q.pointer.addControls();
            Q.pointer.snapTo(this.p.target);
        },
        //Shows the range for dropping
        loadDrop:function(){
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"drop"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.menuControls.turnOffInputs();
            this.hide();
            Q.pointer.p.user = this.p.target;
            Q.pointer.addControls();
            Q.pointer.snapTo(this.p.target);
        },
        //Loads the special skills menu
        loadSkillsMenu:function(){
            this.displayMenu(2,0);
        },
        //Show the attack grid for the skill
        loadSkill:function(){
            var skill = this.p.skills[this.menuControls.selected];
            if(this.p.target.p.sp-skill.cost<0){
                alert("Not Enough SP!");
                return;
            }
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"skill",skill:skill}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.menuControls.turnOffInputs();
            this.hide();
            
            if(!skill.aoe){
                skill.aoe = ["normal",0];
            }
            Q.pointer.p.skill = skill;
            Q.pointer.p.user = this.p.target;
            Q.pointer.snapTo(this.p.target);
            Q.pointer.addControls(skill);
            //Create the AOEGuide which shows which squares will be affected by the skill
            Q.pointer.add("AOEGuide");
        },
        noItems:function(){
            Q.playSound("cannot_do.mp3");
        },
        //When the user selects an item, ask to use it and show what it does
        loadItem:function(){
            var item = this.p.items[this.menuControls.selected];
            //Load the range grid
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"skill",item:item}));
            //Hide this options box. Once the user confirms if the item should be used, destroy this. If he presses 'back' the selection num should be the same
            this.menuControls.turnOffInputs();
            this.hide();
            if(!item.aoe){
                item.aoe = ["normal",0];
            }
            Q.pointer.p.item = item;
            //Must set it as a skill so it work for the aoe guide aoe
            Q.pointer.p.skill = item;
            Q.pointer.p.user = this.p.target;
            Q.pointer.snapTo(this.p.target);
            Q.pointer.addControls();
            //Create the AOEGuide which shows which squares will be affected by the skill
            Q.pointer.add("AOEGuide");
        },
        //Loads the items menu
        loadItemsMenu:function(){
            this.displayMenu(3,0);
        },
        //Loads the large menu that displays all stats for this character
        loadStatus:function(){
            //Hide this menu as it will be needed when the user exits the status menu.
            //this.hide();
            //Turn off inputs for this menu as the new menu will take inputs
            this.menuControls.turnOffInputs();
            //Insert the status menu
            this.p.bigStatusBox = this.stage.insert(new Q.BigStatusBox({target:this.p.target}));
        },
        //Loads the directional arrows so the user can decide which direction to face
        loadEndTurn:function(){
            Q.clearStage(2);
            Q.BatCon.showEndTurnDirection(Q.BatCon.turnOrder[0]);
            this.menuControls.turnOffInputs();
            this.hide();
            Q.pointer.hide();
        },
        loadExitMenu:function(){
            Q.pointer.addControls();
            Q.pointer.on("checkConfirm");
            //Make sure the characterMenu is gone
            Q.clearStage(2);
        }
    });
    
    
    Q.UI.Container.extend("BigStatusBox",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                w:750,
                h:500,
                fill:"blue",
                opacity:0.5,
                border:2
            });
            this.p.x = Q.width/2-this.p.w/2-100;
            this.p.y = Q.height/2-this.p.h/2;
            this.on("inserted");
        },
        //Insert all of the parts of this menu
        inserted:function(){
            //Holds the information that is show to the user depending on which option is hovered.
            this.p.infoCont = this.insert(new Q.BigInfoCont({h:this.p.h,w:this.p.w-150}));
            //The container of the list
            var listCont = this.insert(new Q.BigListCont({h:this.p.h,w:150}));
            //The list of options that can be selected
            this.p.bigStatusMenu = listCont.insert(new Q.BigStatusMenu({y:this.p.h/2,box:this}));
        },
        destroyInfo:function(){
            for(var i=0;i<this.p.infoCont.children.length;i++){
                this.p.infoCont.children[i].destroy();
            }
            this.off("pressConfirm");
        },
        showOverview:function(){
            var cont = this.p.infoCont;
            var width = cont.p.w;
            var spacing = 10;
            //Create the leftmost box that contains the name, lv, charClass, portrait, and equipment names.
            cont.insert(new Q.BigOverviewBox1({target:this.p.target,x:spacing,w:width/3-spacing,h:this.p.h-spacing*2,y:spacing}));
            //Create the top middle box which contains the hp, sp, dmgLo, dmgHi, Speed, Strike, Parry, CrtCh, and Armour
            cont.insert(new Q.BigOverviewBox2({target:this.p.target,x:width/3+spacing/2,w:width/3-spacing,h:this.p.h/1.5-spacing*2+spacing/2,y:spacing}));
            //Create the bottom middle box which contains the range, zoc, and exp
            cont.insert(new Q.BigOverviewBox3({target:this.p.target,x:width/3+spacing/2,w:width/3-spacing,h:this.p.h/3-spacing,y:this.p.h/1.5}));
            //Create the rightmost box that contains the str, end, dex, wsk, and rfl.
            cont.insert(new Q.BigOverviewBox4({target:this.p.target,x:width/3*2,w:width/3-spacing,h:this.p.h/2-spacing*2,y:spacing}));
        },
        showSkills:function(){
            this.on("pressConfirm",this,"selectSkills");
            var cont = this.p.infoCont;
            var width = cont.p.w;
            var spacing = 10;
            //The left box containing dagger and sword skills
            this.p.box1 = cont.insert(new Q.BigSkillsBox({x:spacing,w:width/3-spacing,h:this.p.h-spacing*2-100,y:spacing,bigStatusMenu:this.p.bigStatusMenu,target:this.p.target,box:this,skills:["dagger","sword"],skillNames:["Dagger","Sword"]}));
            //The middle box containing axe and spear skills
            this.p.box2 = cont.insert(new Q.BigSkillsBox({x:width/3+spacing/2,w:width/3-spacing,h:this.p.h-spacing*2-100,y:spacing,bigStatusMenu:this.p.bigStatusMenu,target:this.p.target,box:this,skills:["axe","spear"],skillNames:["Axe","Spear"]}));
            //the right box containing bow and shield skills
            this.p.box3 = cont.insert(new Q.BigSkillsBox({x:width/3*2,w:width/3-spacing,h:this.p.h-spacing*2-100,y:spacing,bigStatusMenu:this.p.bigStatusMenu,target:this.p.target,box:this,skills:["bow","shield"],skillNames:["Bow","Shield"]}));
            //The bottom description box
            this.p.bigSkillsDescBox = cont.insert(new Q.BigSkillsDescBox({x:10,y:this.p.h-spacing-100,w:width-spacing*2,h:100}));
            this.p.bigSkillsDescBox.hide();
        },
        showStatus:function(){
            this.on("pressConfirm",this,"selectStatus");
            var cont = this.p.infoCont;
            var width = cont.p.w;
            var spacing = 10;
            this.p.bigStatusConditionsBox = cont.insert(new Q.BigStatusConditionsBox({x:spacing,w:width/3-spacing,h:this.p.h-spacing*2,y:spacing,target:this.p.target,box:this,bigStatusMenu:this.p.bigStatusMenu}));
            this.p.bigStatusConditionsDescBox = cont.insert(new Q.BigStatusConditionsDescBox({x:spacing+width/3,w:width/1.5-spacing*2,h:this.p.h/2-spacing*2,y:spacing,target:this.p.target}));
            this.p.bigStatusConditionsDescBox.hide();
        },
        showAwards:function(){
            this.on("pressConfirm",this,"selectAwards");
            var cont = this.p.infoCont;
            var width = cont.p.w;
            var spacing = 10;
            this.p.bigAwardsBox = cont.insert(new Q.BigAwardsBox({x:spacing,w:width/3-spacing,h:this.p.h-spacing*2,y:spacing,target:this.p.target,box:this,bigStatusMenu:this.p.bigStatusMenu}));
            this.p.bigAwardsDescBox = cont.insert(new Q.BigAwardsDescBox({x:spacing+width/3,w:width/1.5-spacing*2,h:this.p.h/2-spacing*2,y:spacing,target:this.p.target}));
            this.p.bigAwardsDescBox.hide();
        },
        //When hovering "Skills" and the pressing confirm, give control over to the skills
        selectSkills:function(){
            //Tracks which BigSkillsBox we're in
            this.p.bigSkillsNum = 1;
            this.p.box1.menuControls.turnOnInputs();
            this.p.box1.menuControls.cycle(this.p.box1.menuControls.selected);
        },
        selectStatus:function(){
            this.p.bigStatusConditionsBox.menuControls.turnOnInputs();
            this.p.bigStatusConditionsBox.menuControls.cycle(this.p.bigStatusConditionsBox.menuControls.selected);
        },
        selectAwards:function(){
            this.p.bigAwardsBox.menuControls.turnOnInputs();
            this.p.bigAwardsBox.menuControls.cycle(this.p.bigAwardsBox.menuControls.selected);
        },
        //Shows a single skill's info when it's hovered from the BigSkillsBox
        loadSkill:function(skill){
            var box = this.p.bigSkillsDescBox;
            if(skill.name){
                box.show();
                box.setText(skill);
            } else {
                box.hide();
            }
        },
        loadStatus:function(status){
            this.p.bigStatusConditionsDescBox.show();
            this.p.bigStatusConditionsDescBox.setText(Q.state.get("status")[status]);
        },
        loadAwards:function(award){
            this.p.bigAwardsDescBox.show();
            this.p.bigAwardsDescBox.setText(Q.state.get("awards")[award]);
        }
    });
    Q.UI.Container.extend("BigAwardsBox",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow",
                skillsOptions:[],
                options:[[]]
            });
            this.on("inserted");
        },
        inserted:function(){
            this.add("menuControls");
            //When the user presses back
            this.on("pressBack");
            //Turn on when an option is hovered
            this.on("hoverOption");
            this.displayMenu();
        },
        displayMenu:function(){
            var target = this.p.target;
            var awards = target.p.awards;
            var data = Q.state.get("awards");
            this.p.conts = [];
            var keys = Object.keys(awards);
            for(var i=0;i<keys.length;i++){
                var info = data[keys[i]];
                var cont = this.insert(new Q.UI.Container({x:10,y:10+i*25,w:this.p.w-20,h:25,cx:0,cy:0,fill:"red",radius:0}));
                cont.insert(new Q.UI.Text({label:info.name,align:"left",x:10,y:cont.p.h/2-6,size:12}));
                cont.insert(new Q.UI.Text({label:awards[keys[i]]+"",align:"right",x:cont.p.w-10,y:cont.p.h/2-6,size:12}));
                this.p.conts.push(cont);
                this.p.options[0].push(keys[i]);
            }
        },
        showInfo:function(num){
            this.p.box.loadAwards(this.p.options[0][num]);
        },
        //Give control back to the BigStatusMenu
        pressBack:function(){
            this.menuControls.turnOffInputs();
            this.menuControls.fillAllRed();
            this.p.bigStatusMenu.menuControls.turnOnInputs();
        },
        //Display the information from the section
        hoverOption:function(num){
            this.showInfo(num);
        }
    });
    Q.UI.Container.extend("BigAwardsDescBox",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.p.textWidth = this.p.w-20;
            this.on("inserted");
        },
        setText:function(award){
            this.p.descText.p.label = "Description: "+award.desc;
        },
        inserted:function(){
            var textSize = 14;
            this.p.descText = this.insert(new Q.UI.Text({label:"Description: ",x:10,y:10,size:textSize,cx:0,cy:0,align:"left"}));
        }
    });
    
    Q.UI.Container.extend("BigStatusConditionsBox",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow",
                skillsOptions:[],
                options:[[]]
            });
            this.on("inserted");
        },
        inserted:function(){
            this.add("menuControls");
            //When the user presses back
            this.on("pressBack");
            //Turn on when an option is hovered
            this.on("hoverOption");
            this.displayMenu();
        },
        displayMenu:function(){
            var target = this.p.target;
            var status = target.p.status;
            var effects = ["Blind","Poison","Sturdy"];
            var st = ["blind","poison","sturdy"];
            this.p.conts = [];
            for(var i=0;i<effects.length;i++){
                var cont = this.insert(new Q.UI.Container({x:10,y:10+i*40,w:this.p.w-20,h:40,cx:0,cy:0,fill:"red",radius:0}));
                var text = status[st[i]]?status[st[i]].turns+"":"-";
                cont.insert(new Q.UI.Text({label:effects[i],align:"left",x:10,y:12,size:14}));
                cont.insert(new Q.UI.Text({label:text,align:"right",x:cont.p.w-10,y:12,size:14}));
                this.p.conts.push(cont);
                this.p.options[0].push(st[i]);
            }
        },
        showInfo:function(num){
            this.p.box.loadStatus(this.p.options[0][num]);
        },
        //Give control back to the BigStatusMenu
        pressBack:function(){
            this.menuControls.turnOffInputs();
            this.menuControls.fillAllRed();
            this.p.bigStatusMenu.menuControls.turnOnInputs();
        },
        //Display the information from the section
        hoverOption:function(num){
            this.showInfo(num);
        }
    });
    Q.UI.Container.extend("BigStatusConditionsDescBox",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.p.textWidth = this.p.w-20;
            this.on("inserted");
        },
        setText:function(status){
            this.p.descText.p.label = "Description: "+status.desc;
        },
        inserted:function(){
            var textSize = 14;
            this.p.descText = this.insert(new Q.UI.Text({label:"Description: ",x:10,y:10,size:textSize,cx:0,cy:0,align:"left"}));
        }
    });
    Q.UI.Container.extend("BigSkillsBox",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow",
                skillsOptions:[],
                options:[[]]
            });
            this.on("inserted");
            this.setSkills();
        },
        inserted:function(){
            this.add("menuControls");
            //When the user presses back
            this.on("pressBack");
            //Turn on when an option is hovered
            this.on("hoverOption");
            this.on("pressLeft");
            this.on("pressRight");
            
            //Display the menu options
            this.displayMenu();
        },
        setSkills:function(){
            var target = this.p.target;
            var options = this.p.skillsOptions;
            var skills = this.p.skills;
            for(var i=0;i<skills.length;i++){
                options[i] = [];
                var keys = Object.keys(target.p.skills[skills[i]]);
                if(keys.length){
                    for(var j=0;j<keys.length;j++){
                        options[i].push(target.p.skills[skills[i]][keys[j]]);
                    }
                } else {
                    options[i].push({});
                }
            }
        },
        displayMenu:function(){
            var skillsOptions = this.p.skillsOptions;
            this.p.conts = [];
            for(var i=0;i<this.p.skills.length;i++){
                var title = this.insert(new Q.UI.Text({x:this.p.w/2,y:10+i*(this.p.h/2),label:this.p.skillNames[i],cx:0,cy:0}));
                for(var j=0;j<skillsOptions[i].length;j++){
                    //Show 3 maximum
                    if(j>2) continue;
                    var cont = this.insert(new Q.UI.Container({x:10,y:60+i*(this.p.h/2)+j*40,w:this.p.w-20,h:40,cx:0,cy:0,fill:"red",radius:0,offset:i*3}));
                    if(skillsOptions[i][j]&&skillsOptions[i][j].name){
                        cont.insert(new Q.UI.Text({x:cont.p.w/2,y:12,label:skillsOptions[i][j].name,cx:0,size:16}));
                    } else {
                        cont.insert(new Q.UI.Text({x:cont.p.w/2,y:12,label:"None",cx:0,size:16}));
                    }
                    this.p.conts.push(cont);
                    this.p.options[0].push(skillsOptions[i][j]);
                }
            }
            
        },
        showInfo:function(num){
            this.p.box.loadSkill(this.p.options[0][num]);
        },
        //Give control back to the BigStatusMenu
        pressBack:function(){
            var box = this.p.box;
            box.p.box1.menuControls.fillAllRed();
            box.p.box2.menuControls.fillAllRed();
            box.p.box3.menuControls.fillAllRed();
            this.menuControls.turnOffInputs();
            this.p.bigStatusMenu.menuControls.turnOnInputs();
        },
        //Display the information from the section
        hoverOption:function(num){
            this.showInfo(num);
        },
        pressLeft:function(){
            var box = this.p.box;
            var num = box.p.bigSkillsNum;
            box.p["box"+num].menuControls.fillAllRed();
            box.p["box"+num].menuControls.turnOffInputs();
            var selected = box.p["box"+num].menuControls.selected;
            num--;
            if(num<1) num = 3;
            box.p["box"+num].menuControls.turnOnInputs();
            if(selected>box.p["box"+num].p.conts.length-1) selected=box.p["box"+num].p.conts.length-1;
            box.p["box"+num].menuControls.cycle(selected);
            box.p.bigSkillsNum = num;
        },
        pressRight:function(){
            var box = this.p.box;
            var num = box.p.bigSkillsNum;
            box.p["box"+num].menuControls.fillAllRed();
            box.p["box"+num].menuControls.turnOffInputs();
            var selected = box.p["box"+num].menuControls.selected;
            num++;
            if(num>3) num = 1;
            box.p["box"+num].menuControls.turnOnInputs();
            if(selected>box.p["box"+num].p.conts.length-1) selected=box.p["box"+num].p.conts.length-1;
            box.p["box"+num].menuControls.cycle(selected);
            box.p.bigSkillsNum = num;
        }
    });
    Q.UI.Container.extend("BigSkillsDescBox",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.p.textWidth = this.p.w-20;
            this.on("inserted");
        },
        setText:function(skill){
            this.p.nameText.p.label = "Name: "+skill.name;
            this.p.costText.p.label = "Cost: "+skill.cost;
            this.p.descText.p.label = "Description: "+skill.desc;
            this.p.damageText.p.label = skill.damageLow?"Damage: "+skill.damageLow+" - "+skill.damageHigh:"No Damage";
            this.p.rangeText.p.label = "Range: "+skill.range[1];
        },
        inserted:function(){
            var textSize = 14;
            this.p.nameText = this.insert(new Q.UI.Text({label:"Name: ",x:10,y:10,size:textSize,cx:0,cy:0,align:"left"}));
            this.p.costText = this.insert(new Q.UI.Text({label:"Cost: ",x:210,y:10,size:textSize,cx:0,cy:0,align:"left"}));
            this.p.descText = this.insert(new Q.UI.Text({label:"Description: ",x:10,y:40,size:textSize,cx:0,cy:0,align:"left"}));
            this.p.damageText = this.insert(new Q.UI.Text({label:"Damage: ",x:290,y:10,size:textSize,cx:0,cy:0,align:"left"}));
            this.p.rangeText = this.insert(new Q.UI.Text({label:"Range: ",x:430,y:10,size:textSize,cx:0,cy:0,align:"left"}));
        }
    });
    Q.UI.Container.extend("BigOverviewBox1",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target;
            var top = [target.p.name,"Lv. "+target.p.level,target.p.className];
            for(var i=0;i<top.length;i++){
                this.insert(new Q.UI.Text({label:""+top[i],align:"center",x:this.p.w/2,y:20+35*i}));
            }
            var portraitCont = this.insert(new Q.UI.Container({cx:0,cy:0,x:this.p.w/6,y:this.p.h/2-30-75,w:this.p.w/1.5,h:150,fill:"red",radius:75}));
            var portrait = portraitCont.insert(new Q.Sprite({sheet:target.p.charClass,sprite:"Character",x:portraitCont.p.w/2,y:portraitCont.p.h/2+20,scale:2}));
            portrait.add("animation");
            portrait.play("standingdown");
            var eq = target.p.equipment;
            var keys = Object.keys(eq);
            for(var i=0;i<keys.length;i++){
                //If the target has equipment here
                if(eq[keys[i]]&&eq[keys[i]].name){
                    this.insert(new Q.UI.Text({label:eq[keys[i]].name,cx:0,cy:0,x:this.p.w/2,y:this.p.h/2+65+i*35,size:16}));
                }
            }
            
        }
    });
    Q.UI.Container.extend("BigOverviewBox2",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target;
            var labels = ["HP","SP","DmgLo","DmgHi","Speed","Strike","Parry","CrtCh","Armour"];
            var stats = [target.p.maxHp+"/"+target.p.hp,target.p.maxSp+"/"+target.p.sp,target.p.totalDamageLow,target.p.totalDamageHigh,target.p.totalSpeed,target.p.strike,target.p.parry,target.p.criticalChance,target.p.armour];
            for(var i=0;i<labels.length;i++){
                this.insert(new Q.UI.Text({label:labels[i],x:5,y:8+i*35,size:18,cx:0,cy:0,align:"left"}));
                this.insert(new Q.UI.Text({label:""+stats[i],x:this.p.w-5,y:8+i*35,align:"right",size:18,cx:0,cy:0}));
            }
            
        }
    });
    Q.UI.Container.extend("BigOverviewBox3",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target;
            var labels = ["Range","ZOC","Exp."];
            var stats = [target.p.range,target.p.zoc,target.p.exp];
            for(var i=0;i<labels.length;i++){
                this.insert(new Q.UI.Text({label:labels[i],x:5,y:30+i*35,size:18,cx:0,cy:0,align:"left"}));
                this.insert(new Q.UI.Text({label:""+stats[i],x:this.p.w-5,y:30+i*35,align:"right",size:18,cx:0,cy:0}));
            }
        }
    });
    Q.UI.Container.extend("BigOverviewBox4",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target;
            var st = target.p.stats;
            var labels = ["STR","END","DEX","WSK","RFL"];
            var stats = [st.str,st.end,st.dex,st.wsk,st.rfl];
            for(var i=0;i<labels.length;i++){
                this.insert(new Q.UI.Text({label:labels[i],x:5,y:30+i*35,size:18,cx:0,cy:0,align:"left"}));
                this.insert(new Q.UI.Text({label:""+stats[i],x:this.p.w-5,y:30+i*35,align:"right",size:18,cx:0,cy:0}));
            }
        }
    });
    
    
    Q.UI.Container.extend("BigInfoCont",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                x:150,y:0,
                fill:"purple",
                border:2,
                stroke:"yellow"
            });
        }
    });
    Q.UI.Container.extend("BigListCont",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"purple",
                border:2,
                stroke:"yellow"
            });
        }
    });
    Q.UI.Container.extend("BigStatusMenu",{
        init:function(p){
            this._super(p,{
                w:150,
                h:30,
                cx:0,cy:0,
                options:[["Overview","Skills","Status","Awards"]],
                funcs:[["showOverview","showSkills","showStatus","showAwards"]],
                conts:[]
            });
            this.p.y-=this.p.h;
            this.on("inserted");
        },
        inserted:function(){
            this.add("menuControls");
            //When the user presses back
            this.on("pressBack");
            //When the user presses confirm
            this.on("pressConfirm,pressRight",this,"pressConfirm");
            //Turn on when an option is hovered
            this.on("hoverOption");
            //Turn on the inputs
            this.menuControls.turnOnInputs();
            //Display the menu options
            this.displayMenu(0);
            this.fit(10,10);
            this.p.y-=this.p.h/2;
        },
        displayMenu:function(menuNum){
            var options = this.p.options[0];
            this.p.conts = [];
            for(var i=0;i<options.length;i++){
                var cont = this.insert(new Q.UI.Container({x:10,y:50+i*40,w:this.p.w-20,h:40,cx:0,cy:0,fill:"red",radius:0}));
                var name = cont.insert(new Q.UI.Text({x:cont.p.w/2,y:12,label:options[i],cx:0,size:16}));
                this.p.conts.push(cont);
            }
            this.menuControls.selected = 0;
            this.menuControls.cycle(0);
        },
        showInfo:function(num){
            this.p.box.destroyInfo();
            this.p.box[this.p.funcs[0][num]]();
        },
        
        pressConfirm:function(){
            this.p.box.trigger("pressConfirm");
        },
        //Get rid of this menu and display the Action Menu
        pressBack:function(){
            //if(this.p.title) this.p.title.destroy();
            //if(this.p.conts.length) this.menuControls.destroyConts();
            this.stage.ActionMenu.p.bigStatusBox.destroy();
            this.stage.ActionMenu.show();
            this.stage.ActionMenu.menuControls.turnOnInputs();
        },
        //Display the information from the section
        hoverOption:function(num){
            this.showInfo(num);
        }
    });
    
    //Contains the character's full information
    Q.UI.Container.extend("StatsMenu",{
        init: function(p) {
            this._super(p, {
                w:Q.width/2,h:Q.height/2,
                cx:0,cy:0,
                fill:"black",
                opacity:0.5
            });
            this.p.x = Q.width/2-this.p.w/2;
            this.p.y = Q.height/2-this.p.h/2;
        }
    });
    
    Q.UI.Container.extend("RangeGrid",{
        init:function(p){
            this._super(p,{
                moveGuide:[]
            });
            this.on("inserted");
            this.on("step");
        },
        inserted:function(){
            var user = this.p.user;
            //Insert all of the squares
            switch(this.p.kind){
                case "walk":
                    //Loop through the user's move the get the move range
                    this.getTileRange(user.p.loc,user.p.move,user.p["walkMatrix"]);
                    break;
                case "attack":
                    this.getTileRange(user.p.loc,user.p.range,user.p["attackMatrix"]);
                    break;
                //Used for skills that have a weird range (eg 'T' shape)
                case "skill":
                    var skill = this.p.skill?this.p.skill:this.p.item;
                    switch(skill.range[0]){
                        case "self":
                            //Self skills can target the tile that the user is on
                            this.p.moveGuide.push(this.insert(new Q.RangeTile({loc:[user.p.loc[0],user.p.loc[1]]})));
                            //If there is range, then the skill can target self, or other squares (using potion, etc...)
                            if(skill.range[1]>0){
                                this.getTileRange(user.p.loc,skill.range[1],user.p["attackMatrix"]);
                            }
                            break;
                        case "normal":
                            this.getTileRange(user.p.loc,skill.range[1],user.p["attackMatrix"]);
                            break;
                            //No diagonal attack
                        case "straight":
                            this.getTileRange(user.p.loc,skill.range[1],user.p["attackMatrix"],skill.range[0]);
                            break;
                    }
                    break;
                //Shows the tiles that the user can lift
                case "lift":
                    this.getTileRange(user.p.loc,1,user.p["attackMatrix"]);
                    break;
                //Shows the tiles that an object can be dropped on
                case "drop":
                    this.getTileRange(user.p.loc,1,user.p["attackMatrix"]);
                    break;
            }
        },
        fullDestroy:function(){
            this.p.moveGuide.forEach(function(itm){
                itm.destroy();
            });
            this.destroy();
        },
        process:{
            straight:function(tiles,center){
                for(var i=0;i<tiles.length;i++){
                    if(tiles[i].x!==center[0]&&tiles[i].y!==center[1]){
                        tiles.splice(i,1);
                        i--;
                    }
                }
                return tiles;
            }
        },
        
        getTileRange:function(loc,stat,graph,special){
            var bounds = Q.BattleGrid.getBounds(loc,stat);
            var tiles=[];
            //Get all possible move locations that are within the bounds
            for(var i=bounds.tileStartX;i<bounds.tileStartX+bounds.cols;i++){
                for(var j=bounds.tileStartY;j<bounds.tileStartY+bounds.rows;j++){
                    if(graph.grid[i][j].weight<10000){
                        tiles.push(graph.grid[i][j]);
                    }
                }
            }
            if(special){
                tiles = this.process[special](tiles,loc);
            }
            //If there is at least one place to move
            if(tiles.length){
                //Loop through the possible tiles
                for(var i=0;i<tiles.length;i++){
                    //Get the path and then slice it if it goes across enemy ZOC
                    var path = Q.getPath(loc,[tiles[i].x,tiles[i].y],graph);
                    var pathCost = 0;
                    for(var j=0;j<path.length;j++){
                        pathCost+=path[j].weight;
                    }
                    if(path.length>0&&path.length<=stat&&pathCost<=stat+1000){
                        //If the path is normal
                        if(pathCost<=stat){
                            this.p.moveGuide.push(this.insert(new Q.RangeTile({loc:[tiles[i].x,tiles[i].y]})));
                        } 
                        //If the path includes a single ZOC tile
                        else if(pathCost>=1000) {
                            //Only include this path if the last tile is the ZOC tile
                            if(path[path.length-1].weight===1000){
                                this.p.moveGuide.push(this.insert(new Q.RangeTile({loc:[tiles[i].x,tiles[i].y]})));
                            }
                        }
                    }
                }
            //If there's nowhere to move
            } else {
                
            }
        },
        //Checks if we've selected a tile
        checkValidPointerLoc:function(){
            var loc = Q.pointer.p.loc;
            var valid = false;
            this.p.moveGuide.forEach(function(tile){
                if(tile.p.loc[0]===loc[0]&&tile.p.loc[1]===loc[1]){
                    valid=true;
                }
            });
            if(valid) return true;
            return false;
        },
        cannotDo:function(){
            Q.playSound("cannot_do.mp3");
            this.p.cannotDo = true;
        },
        step:function(){
            //Run this when pressing confirm on a range tile
            if(Q.inputs['confirm']){
                //Make sure the pointer is on a valid tile
                if(this.checkValidPointerLoc()){
                    var user = this.p.user;
                    switch(this.p.kind){
                        case "walk":
                            if(!Q.BattleGrid.getObject(Q.pointer.p.loc)){
                                //Hide the zoc
                                Q.BattleGrid.hideZOC(user.p.team==="enemy"?"ally":"enemy");
                                //Make the character move to the spot
                                user.moveAlong(Q.getPath(user.p.loc,Q.pointer.p.loc,user.p[this.p.kind+"Matrix"]));
                            } else {this.cannotDo();}
                            break;
                        case "attack":
                            //Make sure there's a target there
                            if(Q.BattleGrid.getObject(Q.pointer.p.loc)){
                                Q.BatCon.previewAttackTarget(user,Q.pointer.p.loc);
                                Q.pointer.off("checkInputs");
                                Q.pointer.off("checkConfirm");
                            } else {this.cannotDo();}
                            break;
                        case "skill":
                            var skill = this.p.skill?this.p.skill:this.p.item;
                            //Use the skill's aoe, else it's a normal single target
                            var aoe = skill.aoe?skill.aoe:["normal",0];
                            //Make sure there's a target 
                            var targets = Q.BattleGrid.removeDead(Q.BattleGrid.getObjectsAround(Q.pointer.p.loc,aoe,user));
                            //Remove any characters that are not affected.
                            if(skill.affects) Q.BatCon.removeTeamObjects(targets,skill.affects);
                            //If there is at least one target
                            if(targets.length){
                                Q.BatCon.previewDoSkill(user,Q.pointer.p.loc,this.p.item?this.p.item:skill);
                                Q.pointer.off("checkInputs");
                                Q.pointer.off("checkConfirm");
                            } else {this.cannotDo();}
                            
                            break;
                        case "lift":
                            var obj = Q.BattleGrid.getObject(Q.pointer.p.loc);
                            if(obj&&Q.BatCon.isLiftable(user,obj)){
                                Q.BatCon.liftObject(user,obj);
                                user.p.didAction = true;
                                if(user.p.didMove){
                                    Q.BatCon.showEndTurnDirection(user);
                                } else {
                                    Q.pointer.off("checkInputs");
                                    Q.pointer.off("checkConfirm");
                                    Q.pointer.snapTo(user);
                                    //Go back to the menu right away
                                    Q.stage(2).ActionMenu.displayMenu(0,0);
                                    Q.stage(2).ActionMenu.show();
                                    Q.stage(2).ActionMenu.menuControls.turnOnInputs();
                                }
                            } else {this.cannotDo();}
                            break;
                        case "drop":
                            var lifting = user.p.lifting;
                            //The location the user wants to drop the object on
                            var locTo = Q.pointer.p.loc;
                            //If there's nothing on the square
                            if(!Q.BattleGrid.getObject(locTo)&&Q.BatCon.getTileType(locTo)!=="impassable"){
                                Q.BatCon.dropObject(user,lifting,locTo);
                                user.p.didAction = true;
                                if(user.p.didMove){
                                    Q.BatCon.showEndTurnDirection(user);
                                } else {
                                    Q.pointer.off("checkInputs");
                                    Q.pointer.off("checkConfirm");
                                    Q.pointer.snapTo(user);
                                    //Go back to the menu right away
                                    Q.stage(2).ActionMenu.displayMenu(0,0);
                                    Q.stage(2).ActionMenu.show();
                                    Q.stage(2).ActionMenu.menuControls.turnOnInputs();
                                }
                            } else {this.cannotDo();}
                            break;
                    }
                    if(!this.p.cannotDo){
                        this.fullDestroy();
                        if(Q.pointer.has("AOEGuide")) Q.pointer.AOEGuide.destroyGuide();
                    }
                } else {
                    this.cannotDo();
                }
                Q.inputs['confirm']=false;
                this.p.cannotDo=false;
            } else if(Q.inputs['esc']){
                //Hide the zoc
                Q.BattleGrid.hideZOC(this.p.user.p.team==="enemy"?"ally":"enemy");
                Q.stage(2).ActionMenu.show();
                Q.stage(2).ActionMenu.menuControls.turnOnInputs();
                Q.pointer.show();
                Q.pointer.snapTo(this.p.user);
                Q.pointer.off("checkInputs");
                Q.pointer.off("checkConfirm");
                this.fullDestroy();
                if(Q.pointer.has("AOEGuide")) Q.pointer.AOEGuide.destroyGuide();
                Q.inputs['esc']=false;
            }
        } 
        
    });
    Q.Sprite.extend("RangeTile",{
        init:function(p){
            this._super(p,{
                sheet:"range_tile",
                frame:0,
                opacity:0.3,
                w:Q.tileW,h:Q.tileH,
                type:Q.SPRITE_NONE
            });
            Q.BatCon.setXY(this);
        }
    });
    Q.Sprite.extend("AOETile",{
        init:function(p){
            this._super(p,{
                sheet:"aoe_tile",
                frame:0,
                opacity:0.8,
                w:Q.tileW,h:Q.tileH,
                type:Q.SPRITE_NONE
            });
            Q.BatCon.setXY(this);
        }
    });
    Q.Sprite.extend("ZOCTile",{
        init:function(p){
            this._super(p,{
                sheet:"zoc_tile",
                frame:0,
                opacity:0.8,
                w:Q.tileW,h:Q.tileH,
                type:Q.SPRITE_NONE,
                hidden:true,
                number:1
            });
            Q.BatCon.setXY(this);
        }
    });
    Q.UI.Container.extend("AttackPreviewBox",{
        init:function(p){
            this._super(p,{
                opacity:0.3,
                cx:0,cy:0,
                w:400,h:200,
                type:Q.SPRITE_NONE,
                fill:"blue"
            });
            this.p.x = Q.width/2-this.p.w/2;
            this.p.y = 0;
            this.on("inserted");
            this.on("step",this,"checkInputs");
        },
        checkInputs:function(){
            if(Q.inputs['confirm']){
                var attacker = this.p.attacker;
                var targets = this.p.targets;
                var skill = this.p.skill;
                Q.BatCon.attackFuncs.doAttack(attacker,targets,skill);
                this.off("step",this,"checkInputs");
                this.destroy();
                Q.inputs['confirm']=false;
            } else if(Q.inputs['esc']){
                this.destroy();
                if(this.p.skill){
                    if(Q.pointer.has("AOEGuide")) Q.pointer.AOEGuide.destroyGuide();
                    if(this.p.skill.kind==="consumable"){
                        this.stage.ActionMenu.loadItem();
                    } else {
                        this.stage.ActionMenu.loadSkill();
                    }
                }
                else {
                    this.stage.ActionMenu.loadAttack();
                }
                Q.inputs['esc']=false;
            }
        },
        inserted:function(){
            //Get the comparison between the two char's directions
            this.p.attackingFrom = Q.BatCon.attackFuncs.compareDirection(this.p.attacker,this.p.targets[0]);
            var attacker = this.p.attacker;
            var defender = this.p.targets[0];
            var atkTile = attacker.p.tileEffect;
            var defTile = defender.p.tileEffect;
            var low = attacker.p.totalDamageLow;
            var high = attacker.p.totalDamageHigh;
            if(atkTile.stat==="damage"){
                low*=atkTile.amount;
                high*=atkTile.amount;
            }
            var strike = attacker.p.strike;
            if(atkTile.stat==="strike") strike*=atkTile.amount;
            var armour = defender.p.armour;
            if(defTile.stat==="armour") armour*=defTile.amount;
            if(defender.p.status.sturdy) armour*=1.5;
            var parry = defender.p.parry;
            if(defTile.stat==="parry") parry*=defTile.amount;
            //The comparison between the attacker's dir and defender's dir
            var dir = Q.BatCon.attackFuncs.compareDirection(attacker,defender);
            var accuracy = Math.floor((strike-parry)*dir);
            //If the attack is a skill, display different information
            if(this.p.skill){
                if(this.p.skill.damageLow&&this.p.skill.damageHigh){
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:10,label:accuracy+"% chance of hitting.",size:12,cx:0,cy:0,align:"center"}));
                    var skillLow = this.p.skill.damageLow;
                    var skillHigh = this.p.skill.damageHigh;
                    if(atkTile.stat==="damage"){
                        skillLow*=atkTile.amount;
                        skillHigh*=atkTile.amount;
                    }
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:50,label:"It'll do between "+Math.floor(low+skillLow-armour)+" and "+Math.floor(high+skillHigh-armour)+" damage, I reckon.",size:12,cx:0,cy:0,align:"center"}));
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:70,label:"The skill's name is "+this.p.skill.name+".",size:12,cx:0,cy:0,align:"center"}));
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:90,label:"It is targetting "+this.p.targets.length+" targets.",size:12,cx:0,cy:0,align:"center"}));
                }
                //The the skill has an effect, display some info on it
                if(this.p.skill.effect){
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:110,label:"This skill has a special effect. "+"The function is "+this.p.skill.effect.func,size:12,cx:0,cy:0,align:"center"}));
                }
            } else {
                this.insert(new Q.UI.Text({x:10+this.p.w/2,y:10,label:accuracy+"% chance of hitting.",size:12,cx:0,cy:0,align:"center"}));
                this.insert(new Q.UI.Text({x:10+this.p.w/2,y:50,label:"It'll do between "+Math.floor(low)+" and "+Math.floor(high)+" damage, I reckon.",size:12,cx:0,cy:0,align:"center"}));
            }
            this.insert(new Q.UI.Text({x:10+this.p.w/2,y:this.p.h-30,label:"Press enter to DO IT.",size:12,cx:0,cy:0,align:"center"}));
        }
    });
    //The in-battle dialogue equivalent
    Q.Sprite.extend("BattleTextBox",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                asset:"ui/text_box.png",
                textIndex:-1
            });
            this.p.y=Q.height-this.p.h;
            this.on("inserted");
            this.on("step",this,"checkInputs");
        },
        nextText:function(){
            this.p.textIndex++;
            while(Q._isObject(this.p.text[this.p.textIndex])){
                var text = this.p.text[this.p.textIndex];
                text.obj[text.func].apply(text.obj,text.props);
                this.p.textIndex++;
            }
            if(this.p.textIndex>=this.p.text.length){
                this.destroy();
                this.p.dialogueArea.destroy();
                this.p.callback();
                return;
            };
            this.p.dialogueText.setNewText(this.p.text[this.p.textIndex]);
        },
        checkInputs:function(){
            if(Q.inputs['confirm']){
                if(this.p.dialogueText.interact()){
                    this.nextText();
                };
                Q.inputs['confirm']=false;
            }
        },
        inserted:function(){
            this.p.dialogueArea = this.stage.insert(new Q.DialogueArea({w:Q.width-20}));
            this.p.dialogueText = this.p.dialogueArea.insert(new Q.Dialogue({text:this.p.text[this.p.textIndex], align: 'left', x: 10}));
            this.nextText();
        }
    });
    
    //The status icon displays the current status of the character. There can be multiple status's that cycle through.
    Q.Sprite.extend("StatusIcon",{
        init:function(p){
            this._super(p, {
                type:Q.SPRITE_NONE,
                collisionMask:Q.SPRITE_NONE,
                status:[],
                statusNum:0,
                time:0,
                timeCycle:60,
                sheet:"ui_blind",
                frame:0
            });
            this.setPos();
            this.p.z = this.p.char.p.z+Q.tileH;
            this.displayStatus();
        },
        setPos:function(){
            this.p.loc = [this.p.char.p.loc[0],this.p.char.p.loc[1]-1];
            Q.BatCon.setXY(this);
        },
        step:function(){
            var p = this.p;
            if(p.status.length<2) return;
            p.time++;
            if(p.time>p.timeCycle){
                this.changeStatus();
                p.time=0;
            }
        },
        displayStatus:function(){
            this.p.sheet = "ui_"+this.p.status[this.p.statusNum];
        },
        changeStatus:function(){
            var p = this.p;
            var cur = p.statusNum;
            var max = p.status.length;
            cur+1>=max?cur=0:cur++;
            p.statusNum = cur;
            this.displayStatus();
        },
        removeStatus:function(status){
            for(var i=0;i<this.p.status.length;i++){
                if(status===this.p.status[i]){
                    this.p.status.splice(i,1);
                }
            }
            if(!this.p.status.length){
                this.p.char.p.statusDisplay = false;
                this.destroy();
            }
        },
        reveal:function(){
            this.setPos();
            this.show();
        }
    });
    
    Q.Sprite.extend("DynamicNumber", {
        init:function(p){
            //For bigger boxes, set the w and h values when creating
            //12 is the default size since it's used for the damage box
            this._super(p, {
                color: "black",
                w: Q.tileW,
                h: Q.tileH,
                type:Q.SPRITE_NONE,
                collisionMask:Q.SPRITE_NONE,
                opacity:1,
                size:12,
                text:"",
                fill:"white"
            });
            Q.BatCon.setXY(this);
            this.add("tween");
            this.animate({ y:this.p.y-Q.tileH, opacity: 0 }, 2, Q.Easing.Quadratic.Out, { callback: function() { this.destroy(); }});
        },


        draw: function(ctx){
            ctx.fillStyle = this.p.color;
            ctx.font      = 'Bold 15px Arial';
            ctx.fillText(this.p.text, -this.p.w/2,0);
        }
    });
    Q.Sprite.extend("DynamicAnim", {
        init:function(p){
            this._super(p, {
                type:Q.SPRITE_NONE,
                collisionMask:Q.SPRITE_NONE
            });
            Q.BatCon.setXY(this);
            this.add("animation");
        }
    });
    Q.Sprite.extend("dirTri",{
        init: function(p) {
            this._super(p, {
                w:Q.tileW/2,h:Q.tileH/2,
                type:Q.SPRITE_NONE
            });
            //Triangle points
            this.p.p1=[-this.p.w/2,this.p.h/2];
            this.p.p2=[0,-this.p.h/2];
            this.p.p3=[this.p.w/2,this.p.h/2];
            this.p.z = this.p.y+Q.tileH*2;
        },
        changePos:function(dir,char){
            switch(dir){
                case "left":
                    this.p.x=char.p.x-char.p.w/2-this.p.w/2;
                    this.p.y=char.p.y;
                    this.p.angle=270;
                    break;
                case "up":
                    this.p.x=char.p.x;
                    this.p.y=char.p.y-char.p.h/2-this.p.h/2;
                    this.p.angle=0;
                    break;
                case "right":
                    this.p.x=char.p.x+char.p.w/2+this.p.w/2;
                    this.p.y=char.p.y;
                    this.p.angle=90;
                    break;
                case "down":
                    this.p.x=char.p.x;
                    this.p.y=char.p.y+char.p.w/2+this.p.w/2;
                    this.p.angle=180;
                    break;
            }
            this.p.z = this.p.y+Q.tileH*2;
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

    Q.component("directionControls", {
        added: function() {
            this.entity.on("step",this,"step");
            this.canMove = true;
            this.dirTri = this.entity.stage.insert(new Q.dirTri({x:this.entity.p.x,y:this.entity.p.y}));
            this.dirTri.changePos(this.entity.p.dir,this.entity);
        },
        step:function(dt){
            var dir;
            if(Q.inputs['left']) {
                dir='left';
            } else if(Q.inputs['right']) {;
                dir='right';
            } else if(Q.inputs['up']) {
                dir='up';
            } else if(Q.inputs['down']) {
                dir='down';
            }
            if(dir){
                this.entity.playStand(dir);
                this.dirTri.changePos(this.entity.p.dir,this.entity);
            }
            if(Q.inputs['confirm']){
                this.dirTri.destroy();
                Q.BatCon.endTurn();
                this.entity.del("directionControls");
                Q.inputs['confirm']=false;
            }
        }
    });
    
};