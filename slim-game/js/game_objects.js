Quintus.GameObjects=function(Q){
    Q.Sprite.extend("Pointer",{
        init: function(p) {
            this._super(p, {
                sheet:"ui_pointer",
                frame:0,
                type:Q.SPRITE_NONE,
                
                guide:[],
                movTiles:[],
                
                stepDistanceX:Q.tileW,
                stepDistanceY:Q.tileH,
                stepDelay:0.2,
                stepWait:0,
                
                flashObjs:[],
                viewNotSet:true,
                
                locsTo:[]
            });
            this.add("animation, tween");
            this.on("inserted");
            this.hide();
        },
        inserted:function(){
            Q.BatCon.setXY(this);
            Q._generatePoints(this,true);
        },
        //Makes the pointer go to a certain object
        snapTo:function(obj){
            this.p.loc = obj.p.loc;
            this.p.diffX = 0;
            this.p.diffY = 0;
            this.p.stepping=false;
            Q.BatCon.setXY(this);
            this.checkTarget();
            this.getTerrain();
        },
        getTerrain:function(){
            var type = Q.BatCon.getTileType(this.p.loc);
            this.trigger("onTerrain",type);
        },
        reset:function(){
            Q.BatCon.setXY(this);
            this.show();
            this.checkTarget();
            this.addControls();
            this.show();
            this.on("checkConfirm");
        },
        checkTarget:function(){
            var p = this.p;
            p.target=Q.BattleGrid.getObject(p.loc);
            if(p.target){
                this.trigger("onTarget",p.target);
            } else {
                this.trigger("offTarget");
            }
        },
        //Checks to see if we're going off the map and stop it.
        checkValidLoc:function(loc){
            if(loc[0]<0||loc[1]<0||loc[0]>=this.stage.mapWidth||loc[1]>=this.stage.mapHeight){
                return false;
            }
            return loc;
        },
        addControls:function(skill){
            this.show();
            if(skill&&skill.range){
                if(skill.range[0]==="straight"){
                    //Only takes into account the direction of the input.
                    //Viewport is centered around the middle of the range
                    this.on("checkInputs",this,"checkStraightInputs");
                    //The pointer is hidden for straight aoe
                    this.hide();
                    //Force the first direction
                    Q.inputs[this.p.user.p.dir]=true;
                    return;
                }
            }
            //The standard checkInputs.
            this.on("checkInputs");
        },
        compareLocsForDirection:function(){
            var userLoc = this.p.user.p.loc;
            var loc = this.p.loc;
            var dir = this.p.user.p.dir;
            var difX = userLoc[0]-loc[0];
            var difY = userLoc[1]-loc[1];
            //When the pointer is on top of the character, don't change the direction
            if(difX===0&&difY===0) return;
            //If the x dif is greater than the y dif
            if(Math.abs(difX)>Math.abs(difY)){
                //If the user is to the left of the pointer, make him face right
                if(difX<0) dir = "right";
                else dir = "left";
            } else {
                if(difY<0) dir = "down";
                else dir = "up";
            }
            if(dir!==this.p.user.p.dir){
                this.p.user.playStand(dir);
            }
        },
        displayCharacterMenu:function(){
            if(!this.p.target) return;
            Q.stageScene("characterMenu",2,{target:this.p.target,currentTurn:Q.BatCon.turnOrder[0],pointer:this});
            this.off("checkInputs");
            this.off("checkConfirm");
        },
        //Check confirm only runs when the user is moving around the pointer without any menu selection
        checkConfirm:function(){
            var input = Q.inputs;
            //If we're trying to load a menu
            if(input['confirm']){
                this.displayCharacterMenu();
                input['confirm']=false;
                return;
            } else if(input['esc']){
                var obj = Q.BatCon.turnOrder[0];
                //If the character has moved this turn
                if(obj.p.didMove){
                    //If the pointer is on top of the character, move the character back to its initial starting loc from the start of this turn
                    if(this.p.loc[0]===obj.p.loc[0]&&this.p.loc[1]===obj.p.loc[1]){
                        //Reset the character's loc
                        Q.BattleGrid.moveObject(obj.p.loc,obj.p.initialLoc,obj);
                        obj.p.loc = [obj.p.initialLoc[0],obj.p.initialLoc[1]];
                        Q.BatCon.setXY(obj);
                        //Allow the character to move again
                        obj.p.didMove = false;
                    }
                }
                this.snapTo(obj);
                input['esc']=false;
            }
        },
        //Do the logic for the directional inputs that were pressed
        checkInputs:function(){
            var p = this.p;
            var input = Q.inputs;
            var newLoc = [p.loc[0],p.loc[1]];
            if(input['up']){
                p.diffY = -p.stepDistanceY;
                newLoc[1]--;
            } else if(input['down']){
                p.diffY = p.stepDistanceY;
                newLoc[1]++;
            }
            if(input['right']){
                p.diffX = p.stepDistanceX;
                newLoc[0]++;
            } else if(input['left']){
                p.diffX = -p.stepDistanceX;
                newLoc[0]--;
            }
            var validLoc = this.checkValidLoc(newLoc);
            //If there's a loc and the loc was changed
            if(validLoc&&(newLoc[0]!==p.loc[0]||newLoc[1]!==p.loc[1])){
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x + p.diffX;
                p.destY = p.y + p.diffY;
                p.stepWait = p.stepDelay;
                //Set the loc right away and not when the pointer gets to the location
                p.loc = newLoc;
                this.getTerrain();
                this.checkTarget();
                //Move any aoe tiles
                if(this.has("AOEGuide")) this.AOEGuide.moveTiles(p.loc);
                //Compare the location of the pointer to change the user's direction
                if(this.p.user) this.compareLocsForDirection();
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        checkStraightInputs:function(){
            var p = this.p;
            var input = Q.inputs;
            var newLoc = [p.user.p.loc[0],p.user.p.loc[1]];
            var dir;
            if(input['up']){
                newLoc[1]-=1;
                dir = "up";
                input['up']=false;
            } else if(input['down']){
                newLoc[1]+=1;
                dir = "down";
                input['down']=false;
            } else if(input['right']){
                newLoc[0]+=1;
                dir = "right";
                input['right']=false;
            } else if(input['left']){
                newLoc[0]-=1;
                dir = "left";
                input['left']=false;
            }
            var validLoc = this.checkValidLoc(newLoc);
            //If there's a dir, loc, and the loc was changed
            if(dir&&validLoc&&(newLoc[0]!==p.loc[0]||newLoc[1]!==p.loc[1])){
                p.diffX = (newLoc[0]-p.loc[0])*p.stepDistanceX;
                p.diffY = (newLoc[1]-p.loc[1])*p.stepDistanceY;
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x+p.diffX;
                p.destY = p.y+p.diffY;
                p.stepWait = p.stepDelay;
                //Set the loc right away and not when the pointer gets to the location
                p.loc = newLoc;
                this.getTerrain();
                this.checkTarget();
                p.user.playStand(dir);
                if(this.has("AOEGuide")) this.AOEGuide.moveStraightTiles(dir);
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        //Moves the invisible pointer to an object at the start of a turn
        //The time it takes for the pointer to reach its target is affected by how far away the object is.
        tweenTo:function(obj){
            var loc = obj.p.loc;
            var coords = Q.BatCon.getXY(loc);
            var dist = Q.BattleGrid.getTileDistance(loc,this.p.loc);
            //Set lower to go faster
            var baseSpeed = 50;
            var speed = (baseSpeed*dist)/1000;
            this.animate({x:coords.x,y:coords.y},speed,Q.Easing.Quadratic.Out,{callback:function(){this.trigger("atDest",[(coords.x-Q.tileW/2)/Q.tileW,(coords.y-Q.tileH/2)/Q.tileH]);}});
            this.p.loc = [loc[0],loc[1]];
        },
        step:function(dt){
            var p = this.p;
            p.z=p.y+Q.tileH/2;
            p.stepWait -= dt;
            if(p.stepping) {
                p.x += p.diffX * dt / p.stepDelay;
                p.y += p.diffY * dt / p.stepDelay;
            }
            if(p.stepWait > 0) { return;}
            if(p.stepping) {
                p.x = p.destX;
                p.y = p.destY;
            }
            p.stepping = false;
            p.diffX = 0;
            p.diffY = 0;
            this.trigger("checkInputs");
            this.trigger("checkConfirm");
        }
    });
    
    //The grid that keeps track of all interactable objects in the battle.
    //Any time an object moves, this will be updated
    Q.GameObject.extend("BattleGridObject",{
        init:function(p){
            this.stage = p.stage;
            this.grid = [];
            this.allyZocGrid = [];
            this.enemyZocGrid = [];
            var tilesX = p.stage.mapWidth;
            var tilesY = p.stage.mapHeight;
            for(var i=0;i<tilesY;i++){
                this.grid[i]=[];
                this.allyZocGrid[i]=[];
                this.enemyZocGrid[i]=[];
                for(var j=0;j<tilesX;j++){
                    this.grid[i][j]=false;
                    this.allyZocGrid[i][j]=false;
                    this.enemyZocGrid[i][j]=false;
                }
            }
            //When an item is inserted into this stage, check if it's an interactable and add it to the grid if it is
            Q.stage(0).on("inserted",this,function(itm){
                this.addObjectToBattle(itm);
            });
        },
        //Returns the correct grid
        getGrid:function(obj){
            return obj.p.team==="enemy"?this.enemyZocGrid:this.allyZocGrid;
        },
        //Show a team's zoc
        showZOC:function(team){
            var objs = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team===team&&char.p.zoc; 
            });
            if(!objs) return;
            objs.forEach(function(obj){
                obj.p.zocTiles.forEach(function(tile){
                    tile.show();
                });
            });
        },
        //Hide a team's zoc
        hideZOC:function(team){
            var objs = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team===team&&char.p.zoc; 
            });

            if(!objs) return;
            objs.forEach(function(obj){
                obj.p.zocTiles.forEach(function(tile){
                    tile.hide();
                });
            });
        },
        //Get all zoc tiles for a team
        getZOC:function(team,loc){
            return this[team+"ZocGrid"][loc[1]][loc[0]];
        },
        //Set the zone of control in an object's zocTiles
        setZOC:function(loc,obj){
            if(!obj.p.zoc) return;
            var zoc = obj.p.zoc;
            var grid = this.getGrid(obj);
            obj.p.zocTiles = [];
            for(var i=-zoc;i<zoc+1;i++){
                for(var j=0;j<((zoc*2+1)-Math.abs(i*2));j++){
                    //Don't add a tile if it is impassable
                    if(Q.BatCon.getTileType([loc[0]+i,loc[1]+j-(zoc-Math.abs(i))])==="impassable") continue;
                    //Don't allow the center tile
                    if(i===0&&loc[1]+j-(zoc-Math.abs(i))===loc[1]) continue;

                    var tileLoc = [loc[0]+i,loc[1]+j-(zoc-Math.abs(i))];
                    //Don't allow tiles that are offscreen
                    if(tileLoc[0]<0||tileLoc[1]<0||tileLoc[0]>=this.stage.mapWidth||tileLoc[1]>=this.stage.mapHeight) continue;
                    //There is already a tile there.
                    var tileThere = this.getZOC(obj.p.team,tileLoc);
                    if(tileThere){
                        tileThere.p.number++;
                        obj.p.zocTiles.push(tileThere);
                    } else {
                        //Keep a reference to the ZOC tiles in each object and also here
                        var tile = this.stage.insert(new Q.ZOCTile({loc:tileLoc}));
                        grid[tile.p.loc[1]][tile.p.loc[0]] = tile;
                        obj.p.zocTiles.push(tile);
                    }
                    
                }
            }
        },
        
        //Remove the zone of control from an area
        removeZOC:function(obj){
            if(!obj.p.zoc) return;
            var grid = this.getGrid(obj);
            obj.p.zocTiles.forEach(function(tile){
                var gridTile = grid[tile.p.loc[1]][tile.p.loc[0]];
                if(gridTile){
                    gridTile.p.number--;
                    if(gridTile.p.number<=0){
                        grid[tile.p.loc[1]][tile.p.loc[0]] = false;
                        tile.destroy();
                    }
                }
            });
        },
        //Move the zone of control
        moveZOC:function(to,obj){
            if(!obj.p.zoc) return;
            //First, remove the current ZOC
            this.removeZOC(obj);
            //Then, create a new ZOC for this object
            this.setZOC(to,obj);
        },
        //Get an object at a location in the grid
        getObject:function(loc){
            return this.grid[loc[1]][loc[0]];
        },
        //Set an object to a space in the grid
        setObject:function(loc,obj){
            this.grid[loc[1]][loc[0]] = obj;
        },
        //Move an object in the grid
        moveObject:function(from,to,obj){
            if(obj.p.zoc) this.moveZOC(to,obj);
            this.removeObject(from);
            this.setObject(to,obj);
            //Update the effect of the tile that this object is on
            obj.updateTileEffect(to);
        },
        //Removes an object from the grid
        removeObject:function(loc){
            this.grid[loc[1]][loc[0]] = false;
        },
        addObjectToBattle:function(obj){
            if(obj.has("interactable")){
                //Place the object in the grid
                this.setObject(obj.p.loc,obj);
                //If the object has ZOC, create the tiles
                this.setZOC(obj.p.loc,obj);
            }
        },
        //Used to get rid of the object. Used in lifting and if an interactable is destroyed(TODO)
        removeObjectFromBattle:function(obj){
            if(obj.p.zoc) this.removeZOC(obj);
            this.removeObject(obj.p.loc);
        },
        //Gets objects around a space based on the passed in aoe
        getObjectsAround:function(loc,aoe,target){
            var objects = [];
            var radius = aoe[1];
            var bounds = this.getBounds(loc,radius);
            switch(aoe[0]){
                //Diamond shape
                case "normal":
                    for(var i=-radius;i<radius+1;i++){
                        for(var j=0;j<((radius*2+1)-Math.abs(i*2));j++){
                            var object = this.getObject([loc[0]+i,loc[1]+j-(radius-Math.abs(i))]);
                            if(object) objects.push(object);
                            
                        }
                    }
                    break;
                    //Square shape
                case "corners":
                    for(var i=bounds.tileStartX;i<bounds.tileStartX+bounds.cols;i++){
                        for(var j=bounds.tileStartY;j<bounds.tileStartY+bounds.rows;j++){
                            var object = this.getObject([i,j]);
                            if(object) objects.push(object);
                        }
                    }
                    break;
                    //Straight line
                case "straight":
                    var dir = target?target.p.dir:false;
                    var arr = Q.getDirArray(dir);
                    for(var i=0;i<radius;i++){
                        var spot = [i*arr[0]+loc[0],i*arr[1]+loc[1]];
                        var object = this.getObject(spot);
                        if(object) objects.push(object);
                    }
                    break;
            }
            //Don't include the middle square
            if(aoe[2]==="excludeCenter"){
                objects.forEach(function(obj,i){
                    if(obj.p.loc[0]===loc[0]&&obj.p.loc[1]===loc[1]){
                        objects.splice(i,1);
                    }
                });
            }
            return objects;
        },
        //Gets the closest empty tiles around a location
        getEmptyAround:function(loc,required){
            var tiles = [];
            var radius = 1;
            //If the search fails for the closest 4 tiles, try the next range
            while(!tiles.length){
                for(var i=-radius;i<radius+1;i++){
                    for(var j=0;j<((radius*2+1)-Math.abs(i*2));j++){
                        var curLoc = [loc[0]+i,loc[1]+j-(radius-Math.abs(i))];
                        var object = this.getObject(curLoc);
                        var tile = Q.BatCon.getTileType(curLoc);
                        if(!object&&tile!=="impassable"&&(!tile.required||(tile.required&&required[tile.required]))) tiles.push(curLoc);
                    }
                }
                radius++;
            }
            return tiles;
        },
        //Removes any objects that are dead in an array
        removeDead:function(arr){
            return arr.filter(function(itm){
                return itm.p.hp>0;
            });
        },
        //Gets the bounds of the level
        getBounds:function(loc,num){
            var maxTileRow = this.grid.length;
            var maxTileCol = this.grid[0].length;
            var minTile = 0;
            var rows=num*2+1,
                cols=num*2+1,
                tileStartX=loc[0]-num,
                tileStartY=loc[1]-num;
            var dif=0;

            if(loc[0]-num<minTile){
                dif = cols-(num+1+loc[0]);
                cols-=dif;
                tileStartX=num+1-cols+loc[0];
            }
            if(loc[0]+num>=maxTileCol){
                dif = cols-(maxTileCol-loc[0]+num);
                cols-=dif;
            }
            if(loc[1]-num<minTile){
                dif = rows-(num+1+loc[1]);
                rows-=dif;
                tileStartY=num+1-rows+loc[1];
            }
            if(loc[1]+num>=maxTileRow){
                dif = rows-(maxTileRow-loc[1]+num);
                rows-=dif;
            }
            if(cols+tileStartX>=maxTileCol){cols=maxTileCol-tileStartX;};
            if(rows+tileStartY>=maxTileRow){rows=maxTileRow-tileStartY;};
            return {tileStartX:tileStartX,tileStartY:tileStartY,rows:rows,cols:cols,maxTileRow:maxTileRow,maxTileCol:maxTileCol};
        },
        //Gets the tile distance between two locations
        getTileDistance:function(loc1,loc2){
            return Math.abs(loc1[0]-loc2[0])+Math.abs(loc1[1]-loc2[1]);
        }
    });

    //The battle controller holds all battle specific code.
    Q.GameObject.extend("BattleController",{
        init:function(p){
            this.stage = p.stage;
            //Any characters that have their hp reduced to 0 or under get removed all at once (they get destroyed when they're killed, but only removed here after)
            this.markedForRemoval = [];
            this.add("attackFuncs,skillFuncs");
        },
        //Run once at the start of battle
        startBattle:function(){
            this.turnOrder = this.generateTurnOrder(this.stage.lists["Character"]);
            this.allies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="ally"; 
            });
            this.enemies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="enemy"; 
            });
            
            this.startTurn();
        },
        finishBattle:function(){
            this.allies.forEach(function(ally){
                if(ally.p.savedData){
                    ally.p.savedData.awards = ally.p.awards;  
                }
            });
            Q.clearStages();
        },
        //Eventually check custom win conditions. For now, if there are no players OR no enemies, end it.
        checkBattleOver:function(){
            if(this.allies.length===0){
                //Do anything that happens after a battle
                this.finishBattle();
                var defeat = this.stage.options.battleData.defeat;
                if(defeat.func==="loadBattleScene"){
                    Q.stageScene("battleScene",0,{data:this.stage.options.data, path:defeat.scene});
                } else if(defeat.func==="loadDialogue"){
                    Q.stageScene("dialogue", 1, {data: this.stage.options.data,path:defeat.scene});
                } else if(defeat.func==="loadBattle"){
                    Q.stageScene("battle",0,{data:this.stage.options.data, path:defeat.scene});
                }
                return true;
            }
            if(this.enemies.length===0){
                //Do anything that happens after a battle
                this.finishBattle();
                var victory = this.stage.options.battleData.victory;
                if(victory.func==="loadBattleScene"){
                    Q.stageScene("battleScene",0,{data:this.stage.options.data, path:victory.scene});
                } else if(victory.func==="loadDialogue"){
                    Q.stageScene("dialogue", 1, {data: this.stage.options.data,path:victory.scene});
                } else if(victory.func==="loadBattle"){
                    Q.stageScene("battle",0,{data:this.stage.options.data, path:victory.scene});
                }
                
                return true;
            }
        },
        //Starts the character that is first in turn order
        startTurn:function(){
            var obj = this.turnOrder[0];
            //Hide and disable the pointer if it's not an ally's turn
            //TEMP (Take out false to enable)
            if(false&&obj.p.team!=="ally"&&Q.pointer){
                Q.pointer.hide();
                Q.pointer.off("checkInputs");
                Q.pointer.off("checkConfirm");
                Q.pointer.trigger("offTarget");
                Q.pointer.on("atDest",function(){
                    Q.BatCon.turnOrder[0].startTurn();
                    //Follow the AI object
                    Q.viewFollow(Q.BatCon.turnOrder[0],this.stage);
                    //Q.CharacterAI(Q.BatCon.turnOrder[0]);
                    this.off("atDest");
                });
            } else {
                Q.pointer.checkTarget();
                Q.pointer.on("atDest",function(){
                    Q.BatCon.turnOrder[0].startTurn();
                    this.p.loc = Q.BatCon.turnOrder[0].p.loc;
                    this.reset();
                    this.checkTarget();;
                    //Display the menu on turn start
                    this.displayCharacterMenu();
                    this.off("atDest");
                });
            }
            Q.viewFollow(Q.pointer,this.stage);
            //Tween the pointer to the AI
            Q.pointer.tweenTo(obj);
        },
        //When a character ends their turn, run this to cycle the turn order
        endTurn:function(){
            //Move the first character to the back (Maybe do some speed calculations to place them somewhere else)
            var lastTurn = this.turnOrder.shift();
            this.turnOrder.push(lastTurn);
            //Remove any dead characters
            this.removeMarked();
            //Check if the battle is over at this point
            if(this.checkBattleOver()) return; 
            this.startTurn();
        },
        //Generates the turn order at the start of the battle
        generateTurnOrder:function(objects){
            var turnOrder = [];
            var sortForSpeed = function(){
                var topSpeed = objects[0];
                var idx = 0;
                for(var i=0;i<objects.length;i++){
                    if(objects[i].p.totalSpeed>topSpeed.p.totalSpeed){
                        topSpeed=objects[i];
                        idx = i;
                    }
                }
                turnOrder.push(topSpeed);
                objects.splice(idx,1);
                if(objects.length){
                    return sortForSpeed();
                } else {
                    return turnOrder;
                }
            };
            var tO = sortForSpeed();
            return tO;
        },
        //When an object is destroyed, mark them for removal at the end of the turn
        markForRemoval:function(obj){
            this.markedForRemoval.push(obj);
        },
        removeMarked:function(){
            if(this.markedForRemoval.length){
                for(var i=0;i<this.markedForRemoval.length;i++){
                    this.removeFromBattle(this.markedForRemoval[i]);
                    //this.markedForRemoval[i].destroy();
                }
                this.markedForRemoval = [];
            }
        },
        addToTurnOrder:function(obj){
            this.turnOrder.push(obj);
        },
        //Removes an object from the turn order
        removeFromTurnOrder:function(obj){
            for(var i=0;i<this.turnOrder.length;i++){
                if(this.turnOrder[i].p.id===obj.p.id){
                    this.turnOrder.splice(i,1);
                    return;
                }
            }
            //this.turnOrder.splice(this.turnOrder.indexOf(this.turnOrder.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
        },
        addToTeam:function(obj){
            var team = obj.p.team==="ally"?this.allies:this.enemies;
            team.push(obj);
        },
        removeFromTeam:function(obj){
            if(obj.p.team==="ally"){
                this.allies.splice(this.allies.indexOf(this.allies.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            } else if(obj.p.team==="enemy"){
                this.enemies.splice(this.enemies.indexOf(this.enemies.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            }
        },
        //Adds an object to battle (currently used when dropping a lifted object)
        addToBattle:function(obj){
            this.addToTurnOrder(obj);
            this.addToTeam(obj);
        },
        //Removes the object from battle (at end of turn)
        removeFromBattle:function(obj){
            this.removeFromTurnOrder(obj);
            this.removeFromTeam(obj);
        },
        getXY:function(loc){
            return {x:loc[0]*Q.tileW+Q.tileW/2,y:loc[1]*Q.tileH+Q.tileH/2};
        },
        setXY:function(obj){
            obj.p.x = obj.p.loc[0]*Q.tileW+Q.tileW/2;
            obj.p.y = obj.p.loc[1]*Q.tileH+Q.tileH/2;
        },
        getInteractableAt:function(loc){
            var target = this.stage.lists[".interactable"].items.filter(function(obj){
                return obj.p.loc&&obj.p.loc[0]===loc[0]&&obj.p.loc[1]===loc[1];
            })[0];
            return target;
        },
        getTileType:function(loc){
            //Prioritize the collision objects
            var tileLayer = this.stage.lists.TileLayer[1];
            if(tileLayer.p.tiles[loc[1]]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]]){
                var type = tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]].p.type; 
                 return type?type:"impassable";
            }
            //If there's nothing on top, check the ground
            var tileLayer = this.stage.lists.TileLayer[0];
            if(tileLayer.p.tiles[loc[1]]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]]){
                 return tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]].p.type;
            }
        },
        //Removes any objects that are not a certain team from an array
        removeTeamObjects:function(arr,team){
            for(var i=arr.length-1;i>=0;i--){
                if(arr[i].p.team!==team){
                    arr.splice(i,1);
                }
            }
        },

        //Loads the preview to the attack when the user presses enter on an enemy while in the attack menu
        previewAttackTarget:function(user,loc){
            var target = Q.BattleGrid.getObject(loc);
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user,targets:[target]}));
        },
        //Previews a skill
        previewDoSkill:function(user,loc,skill){
            var targets = [];
            if(skill.aoe){
                targets = Q.BattleGrid.removeDead(Q.BattleGrid.getObjectsAround(loc,skill.aoe,user));
                //Don't allow for unnaffected targets
                if(skill.affects) this.removeTeamObjects(targets,skill.affects);
            } else {
                targets[0] = Q.BattleGrid.getObject(loc);
            }
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user,targets:targets,skill:skill}));
        },
        showEndTurnDirection:function(obj){
            Q.pointer.off("checkInputs");
            Q.pointer.off("checkConfirm");
            Q.pointer.snapTo(obj);
            Q.pointer.hide();
            obj.add("directionControls");
        },
        //Divide the exp amongst any characters that fought this enemy
        /*How it works:
            Sort the array of attackers that hit this target from lowest level to highest level.
            The base exp gain is 10exp. This means the exp gain for an enemy that has been defeated by a single character of the same level will get 10 exp.
            Every level difference between the lowest level attacker and the defender results in a 2exp increase/decrease
            Characters that appear later in the sorted array get half of the previous character's exp
        */
        giveExp:function(defeated,shared){
            //Whoever got the last hit gets an additional share of the exp
            var lastHit = shared[shared.length-1];
            //Sort from lowest to highest level
            var sorted = shared.sort(function(a,b){
                return a.p.level>b.p.level;
            });
            var defeatedLevel = defeated.p.level;
            var lowestLevel = sorted[0].p.level;
            var dif = defeatedLevel-lowestLevel;
            //Set the exp to be 10 + 2 for each level higher the defeated enemy was. It's negative if the enemy was lower than the lowest level. Must be at least 1.
            var exp = 10+dif>0?10+dif:1;
            var text = [];
            //Give the exp to all participants
            sorted.forEach(function(obj,i){
                Q.setAward(obj,"assisted",1);
                //Don't give exp to dead people
                if(obj.p.hp<=0) return;
                var gain = Math.floor(exp/(i+1));
                if(lastHit.p.id===obj.p.id){
                    gain*=2;
                }
                obj.p.exp+= gain;
                obj.trigger("saveProp",{name:"exp",value:obj.p.exp});
                var leveledUp = false;
                //Level up the character if they are at or over 100
                if(obj.p.exp>=100){
                    leveledUp = true;
                    obj.levelUp();
                    obj.trigger("saveProp",{name:"level",value:obj.p.level});
                }
                text.push({func:"showExpGain",obj:obj,props:[gain,leveledUp]});
            });
            return text;
        },
        //The user lifts the object
        liftObject:function(user,obj){
            //Set the obj to be lifted by the user
            user.p.lifting = obj;
            //Remove the obj from battle (lifted units cannot be targetted nor take up space)
            Q.BattleGrid.removeObjectFromBattle(obj);
            //The lifts object doesn't get a turn
            this.removeFromTurnOrder(obj);
            obj.p.loc = [user.p.loc[0],user.p.loc[1]-1];
            this.setXY(obj);
            obj.p.z = user.p.y+Q.tileH;
            obj.playLifted(obj.p.dir);
            user.playLift(user.p.dir);
        },
        dropObject:function(user,obj,locTo){
            user.p.lifting = false;
            obj.p.loc = locTo;
            Q.BatCon.setXY(obj);
            obj.p.z = obj.p.y;
            obj.playStand(obj.p.dir);
            user.playStand(user.p.dir);
            //Add the object to the grid
            Q.BattleGrid.setObject(locTo,obj);
            //Only add into the battle if the object is alive
            if(obj.p.hp>0){
                //Set the character's ZOC
                Q.BattleGrid.setZOC(locTo,obj);
                //Add the object to allies/enemies and the turnorder
                this.addToBattle(obj);
            }
        },
        //Returns true if the object is liftable
        isLiftable:function(user,obj){
            if(!obj.p.lifting&&(obj.p.interactable||obj.p.team===user.p.team||obj.p.hp<=0)){
                return true;
            }
            return false;
        }

    });
    
    Q.component("attackFuncs",{
        added:function(){
            //Any feedback from the attack is stored here
            this.text = [];
            //If any defenders dies from an attack, save the feedback and add it on to text at the end
            this.expText = [];
        },
        //Compares the first obj's dir to the second object's dir.
        compareDirection:function(attacker,defender){
            var getDirection = function(dir,dirs){
                for(var i=0;i<dirs.length;i++){
                    if(dir===dirs[i]){
                        return i;
                    }
                }
            };
            var checkBounds = function(num){
                if(num>=dirs.length){
                    return num-dirs.length;
                }
                return num;
            };
            //Set values that we will multiply accuracy by later on
            var back = 1;
            var side = 0.8;
            var front = 0.6;
            
            //If the characters are diagonal to each other, we're attacking from the side, regardless of which direction either participants are facing
            if(Math.abs(attacker.p.loc[0]-defender.p.loc[0])===Math.abs(attacker.p.loc[1]-defender.p.loc[1])){
                return side;
            }
            //Array of possible directions clockwise from 12 o'clock
            var dirs = ["up", "right", "down", "left"];
            //Get the number for the user dir
            var userDir = getDirection(attacker.p.dir,dirs);
            //Get the number for the target dir
            var targetDir = getDirection(defender.p.dir,dirs);
            //An array of the values (also clockwise from 12 o'clock)
            //EX:
            //if both user and target are 'Up', they will both be 0 and that will give the back value (since they are both facing up, the user has attacked from behind).
            var values = [back,side,front,side];
            for(var j=0;j<values.length;j++){
                //Make sure we are in bounds, else loop around to the start of the array
                if(checkBounds(userDir+j)===targetDir){
                    //If we've found the proper value, return it
                    return values[j];
                }
            }
        },
        getBlow:function(attackNum,attacker,defendNum,defender){
            var attackerCritChance = attacker.p.criticalChance;
            if(attacker.p.tileEffect.stat==="criticalChance") attackerCritChance*=attacker.p.tileEffect.amount;
            var attackerStrike = attacker.p.strike;
            if(attacker.p.tileEffect.stat==="strike") attackerStrike*=attacker.p.tileEffect.amount;
            var attackerBlind = attacker.p.status.blind;
            var defenderParry = defender.p.parry;
            if(defender.p.tileEffect.stat==="parry") defenderParry*=attacker.p.tileEffect.amount;
            var defenderBlind = defender.p.status.blind;
            var result = {
                hit:false,
                crit:false,
                block:false
            };
            //Take into account which direction each of the participants are facing
            //Defender is facing attacker -> 50% accuracy
            //Attacker is facing the side of the defender -> 75% accuracy
            //Attacker is attacking from behind the defender -> 100% accuracy
            var dir = this.compareDirection(attacker,defender);
            //Divide the random attackNum by the dir
            attackNum/=dir;
            //Double crit chance if attacking from behind
            if(dir===1) attackerCritChance*=2;
            //If the attacker is blind, decrease accuracy
            if(attackerBlind) attackNum/=0.75;
            //If the defender is blind, increase accuracy and make the defender less likely to parry
            if(defenderBlind){
                attackNum/=0.75;
                defendNum/=0.75;
            }
            if(attackNum<=attackerCritChance){
                result.crit = true;
            } else if(attackNum<=attackerStrike){
                result.hit = true;
            }
            if(defendNum<=defenderParry){
                result.block = true;
            }

            return {attacker:attacker,defender:defender,result:result};
        },
        //Forces the damage to be at least 1
        getDamage:function(dmg){
            if(dmg<=0) dmg=1;
            return dmg;
        },
        //When a skill is used, figure out if it hit
        processSkillResult:function(obj,skill){
            var attacker = obj.attacker;
            var defender = obj.defender;
            var result = obj.result;
            var damage = 0;
            //Make sure that neither of the participants have been defeated
            if(attacker.p.hp<=0||defender.p.hp<=0){return;};
            //If the skill wasn't blocked and it didn't miss
            //If we got a crit, auto hit (skills can't crit)
            if(result.crit){
                damage = this.successfulSkillBlow(attacker,defender,skill,result);
            } else if(result.hit) {
                damage = this.successfulSkillBlow(attacker,defender,skill,result);
            } else {
                //Miss
                damage = 0;
            }
            return damage;
        },
        //When a regular attack is used
        processResult:function(obj){
            var attacker = obj.attacker;
            var defender = obj.defender;
            var result = obj.result;
            var damage = 0;
            var sound = "hit1.mp3";
            if(attacker.p.hp<=0||defender.p.hp<=0){return;};
            //If the attack crit
            if(result.crit){
                //Successful Blow
                if(result.block){
                    damage = this.successfulBlow(attacker,defender,result);
                } 
                //Critical Blow
                else {
                    damage = this.criticalBlow(attacker,defender,result);
                    sound = "critical_hit.mp3";
                }
            } 
            //If the attack hit
            else if(result.hit){
                //Glancing Blow
                if(result.block){
                    damage = this.glancingBlow(attacker,defender,result);
                    sound = "glancing_blow.mp3";
                }
                //Successful Blow
                else {
                    damage = this.successfulBlow(attacker,defender,result);
                }
            } 
            //If the attack missed
            else {
                //Counter Chance
                if(result.block){
                    //Don't allow countering if the attacker is out of range of the defender
                    var dist = Q.BattleGrid.getTileDistance(attacker.p.loc,defender.p.loc);
                    if(defender.p.range>=dist){
                        damage = -1;
                    } else {
                        damage = 0;
                    }
                }
                //Miss
                else {
                    damage = 0;
                }
            }
            return {damage:damage,sound:sound};
        },
        processSkillSelfTarget:function(attacker,skill,result){
            var damage = 0;
            if(result.hit||result.crit){
                var attackerTile = attacker.p.tileEffect;
                var low = attacker.p.totalDamageLow+skill.damageLow;
                var high = attacker.p.totalDamageHigh+skill.damageHigh;
                if(attackerTile.stat==="damage") {
                    low*=attackerTile.amount;
                    high*=attackerTile.amount;
                }
                var armour = attacker.p.armour;
                if(attacker.p.status.sturdy) armour*=1.5;
                if(attackerTile.stat==="armour") armour*=attackerTile.amount;
                damage = this.getDamage(Math.floor(Math.random()*(high-low)+low)-armour);
            }
            return damage;
        },
        processSelfTarget:function(attacker,result){
            var damage = 0;
            if(result.hit||result.crit){
                var attackerTile = attacker.p.tileEffect;
                var low = attacker.p.totalDamageLow;
                var high = attacker.p.totalDamageHigh;
                if(attackerTile.stat==="damage") {
                    low*=attackerTile.amount;
                    high*=attackerTile.amount;
                }
                var armour = attacker.p.armour;
                if(attacker.p.status.sturdy) armour*=1.5;
                if(attackerTile.stat==="armour") armour*=attackerTile.amount;
                damage = this.getDamage(Math.floor(Math.random()*(high-low)+low)-armour);
            }
            return damage;
        },
        calcSkillBlowDamage:function(attacker, defender, float, skill) {
            var attackerTile = attacker.p.tileEffect;
            var low = attacker.p.totalDamageLow+skill.damageLow;
            var high = attacker.p.totalDamageHigh+skill.damageHigh;
            if(attackerTile.stat==="damage") {
                low*=attackerTile.amount;
                high*=attackerTile.amount;
            }
            var defenderTile = defender.p.tileEffect;
            var armour = defender.p.armour;
            if(defender.p.status.sturdy) armour*=1.5;
            if(defenderTile.stat==="armour") armour*=defenderTile.amount;
            return Math.floor(float*(high-low) + low)-Math.floor(armour);
        },
        successfulSkillBlow:function(attacker,defender,skill,result){
            return this.getDamage(this.calcSkillBlowDamage(attacker, defender, Math.random(), skill));
        },
        calcBlowDamage:function(attacker, defender, float) {
            var attackerTile = attacker.p.tileEffect;
            var low = attacker.p.totalDamageLow;
            var high = attacker.p.totalDamageHigh;
            if(attackerTile.stat==="damage") {
                low*=attackerTile.amount;
                high*=attackerTile.amount;
            }
            var defenderTile = defender.p.tileEffect;
            var armour = defender.p.armour;
            if(defender.p.status.sturdy) armour*=1.5;
            if(defenderTile.stat==="armour") armour*=defenderTile.amount;
            return Math.floor(float*(high-low) + low)-Math.floor(armour);
        },
        successfulBlow:function(attacker,defender,result){
            return this.getDamage(this.calcBlowDamage(attacker, defender, Math.random()));
        },
        criticalBlow:function(attacker,defender,result){
            var speed = attacker.p.totalSpeed;
            var attackerTile = attacker.p.tileEffect;
            if(attackerTile.stat==="speed"){
                speed*=attackerTile.amount;
            }
            var damage = attacker.p.totalDamageHigh;
            if(attackerTile.stat==="damage") damage*=attackerTile.amount;
            var rand = Math.ceil(Math.random()*100);
            //Maybe attack again!
            if(rand<=speed&&defender.p.hp-damage>0){
                console.log("Attacking Again!");
                this.calcAttack(attacker,defender);
            }
            return damage;
        },
        glancingBlow:function(attacker,defender,result){
            var attackerTile = attacker.p.tileEffect;
            var low = attacker.p.totalDamageLow;
            var high = attacker.p.totalDamageHigh;
            if(attackerTile.stat==="damage") {
                low*=attackerTile.amount;
                high*=attackerTile.amount;
            }
            var defenderTile = defender.p.tileEffect;
            var armour = defender.p.armour;
            if(defender.p.status.sturdy) armour*=1.5;
            if(defenderTile.stat==="armour") armour*=defenderTile.amount;
            var damage = this.getDamage(Math.floor(((Math.random()*(high-low)+low)-armour)/2));
            console.log("Glancing Blow for "+damage);
            return damage;
        },
        counterChance:function(attacker,defender,result){
            if(defender.p.hp<=0){return 0;};
            //Only allow counter attacking if the defender has enough range
            if(Q.BattleGrid.getTileDistance(defender.p.loc,attacker.p.loc)<=defender.p.range){
                console.log("Counter chance!")
                this.calcAttack(defender,attacker);
            }
            return 0;
        },
        miss:function(attacker,defender,result){
            var speed = attacker.p.totalSpeed;
            var attackerTile = attacker.p.tileEffect;
            if(attackerTile.stat==="speed"){
                speed*=attackerTile.amount;
            }
            var rand = Math.ceil(Math.random()*100);
            //Get a second chance at attacking
            if(rand<=speed){
                console.log("Missed, but attack again!");
                this.calcAttack(attacker,defender);
            }
            return 0;
        },
        calcAttack:function(attacker,defender,skill){
            //The time it takes between defensive animations
            //This sometimes is different depending on the skill
            var time;
            var damage;
            var sound;
            if(skill){
                if(skill.kind==="consumable"){
                    var bag = Q.state.get("Bag");
                    bag.decreaseItem(skill,skill.kind);
                }
                if(attacker.p.hp<=0) return;
                damage = 0;
                var blow = this.getBlow(Math.ceil(Math.random()*100),attacker,Math.ceil(Math.random()*100),defender);
                //If the skill is damaging
                if(skill.damageLow&&skill.damageHigh){
                    //Self targeting
                    if(attacker.p.id===defender.p.id){
                        damage = this.processSkillSelfTarget(blow.attacker,skill,blow.result);
                    } else {
                        damage = this.processSkillResult(blow,skill);
                    }
                    if(damage>0){
                        //If the skill does less damage to further targets.
                        if(skill.diminishFarDamage){
                            //Get the distance between the two objects (minus 1 as 1 range is 100% power)
                            var dist = Q.BattleGrid.getTileDistance(attacker.p.loc,defender.p.loc)-1;
                            damage-=Math.floor(damage*(dist*skill.diminishFarDamage));
                        }
                        //If the defender would be defeated by the damage
                        if(defender.p.hp-damage<=0){
                            if(skill.holdBack){
                                damage = defender.p.hp-1;
                                if(damage<=0) damage=1;
                            }
                        }
                    }
                } 
                //If the skill does not do any damage
                else {
                    damage = -2;
                }
                
                //If the defender is still alive and there's an effect from this skill
                if(defender.p.hp-damage>0&&skill.effect){
                    var rand = Math.ceil(Math.random()*100);
                    if(rand<=skill.effect.accuracy){
                        var props = skill.effect.props.slice();
                        props.push(defender,attacker);
                        //The skill func will return the feedback
                        var newText = this.entity.skillFuncs[skill.effect.func].apply(this,props);
                        for(var i=0;i<newText.length;i++){
                            this.text.push(newText[i]);
                        }
                    }
                }
                if(skill.dfAnimTime){
                    time = skill.dfAnimTime;
                }

            } else {
                var props = this.processResult(this.getBlow(Math.ceil(Math.random()*100),attacker,Math.ceil(Math.random()*100),defender));
                damage = props.damage;
                sound = props.sound;
            }
            //After the damage has been calculated, come up with the text to show the user
            if(damage>0){
                this.text.push({func:"showDamage",obj:defender,props:[damage,time,sound]});
                var expText = defender.takeDamage(damage,attacker);
                //If a defender was defeated
                if(expText){
                    this.expText.push.apply(this.expText,expText);
                }
            } 
            //Miss
            else if(damage===0){
                this.text.push({func:"showMiss",obj:defender,props:[attacker,time]});
            } 
            //Counter chance
            else if(damage===-1){
                this.text.push({func:"showCounter",obj:defender,props:[attacker,time]});
                this.calcAttack(defender,attacker);
            } 
            //The skill does not do any damage
            else if(damage===-2){
                
            }
        },
        doAttack:function(attacker,targets,skill){
            this.text = [];
            var anim = "Attack";
            var sound = "slashing";
            attacker.p.didAction = true;
            if(skill){
                if(skill.cost) {
                    attacker.p.sp-=skill.cost;
                    //Save the sp use
                    attacker.trigger("saveProp",{name:"sp",value:attacker.p.sp});
                }
                if(skill.anim) anim = skill.anim;
                if(skill.sound) sound = skill.sound;
            }
            //Compute the attack
            for(var i=0;i<targets.length;i++){
                this.calcAttack(attacker,targets[i],skill);
            }
            var text = this.text;
            //If a defender died, there will be an exp gain
            if(this.expText.length){
                //Wait between damage and exp gain
                text.push({func:"waitTime",obj:this,props:[1000]});
                text.push.apply(text,this.expText);
                //Empty the expText array for next time
                this.expText = [];
            }
            var obj = this;
            //The standard finish attack
            obj.entity.on("finishAttack",obj,"finishAttack");
            attacker.doAttackAnim(targets,anim,sound,function(){
                obj.doDefensiveAnim(text);
            });
        },
        //Play the defensive animation for each targetted character
        doDefensiveAnim:function(text){
            var t = text.shift();
            var time = t.obj[t.func].apply(t.obj,t.props);
            var obj = this;
            setTimeout(function(){
                if(text.length){
                    obj.doDefensiveAnim(text);
                } else {
                    obj.entity.trigger("finishAttack");
                }
            },time);
        },
        finishAttack:function(){
            var active = Q.BatCon.turnOrder[0];
            //The current character died (from being counter attacked, etc...)
            if(active.p.hp<=0){
                Q.BatCon.endTurn();
                return;
            }
            //Remove any characters that have been defeated
            Q.BatCon.removeMarked();
            //If this character has now attacked and moved, end their turn.
            if(active.p.didMove){
                //TEMP
                if(true||active.p.team!=="enemy"){
                    Q.BatCon.showEndTurnDirection(active);
                } else {
                    //Set the AI's direction and end its turn
                }
            }   
            //If the character has not moved yet
            else {
                //Check if there's either no more enemies, or no more allies
                if(Q.BatCon.checkBattleOver()) return;
                //Get the new walk matrix since objects may have moved
                active.p.walkMatrix = new Q.Graph(Q.getMatrix("walk",active.p.team,active.p.canMoveOn));
                //Snap the pointer to the current character
                Q.pointer.snapTo(active);
                //If the current character is not AI
                //TEMP
                if(true||active.p.team!=="enemy"){
                    Q.pointer.displayCharacterMenu();
                } else {
                    //Do whatever the AI does after attacking and can still move
                }
            }
            this.entity.off("finishAttack");
        },
        waitTime:function(time){
            return time?time:1000;
        }
    });
    Q.component("skillFuncs",{
        pull:function(tiles,target,user){
            var text = [];

            return text;
        },
        //pushes a target
        push:function(tiles,target,user){
            var text = [];
            var tileTo = [];
            //Pushing in the y direction
            if(user.p.loc[0]===target.p.loc[0]){
                //Pushing up
                if(user.p.loc[1]-target.p.loc[1]>0){
                    tileTo = [target.p.loc[0],target.p.loc[1]-tiles];
                } 
                //Pushing down
                else {
                    tileTo = [target.p.loc[0],target.p.loc[1]+tiles];
                }
            }
            //Pushing in the x direction
            else if(user.p.loc[1]===target.p.loc[1]){
                //Pushing left
                if(user.p.loc[0]-target.p.loc[0]>0){
                    tileTo = [target.p.loc[0]-tiles,target.p.loc[1]];
                } 
                //Pushing right
                else {
                    tileTo = [target.p.loc[0]+tiles,target.p.loc[1]];
                }
            }
            //Make sure there's no object or impassable tile where the target will be pushed to.
            //TO DO: Only push as far as the object can go without crashing into something (for 2+ tile push)
            if(!Q.BattleGrid.getObject(tileTo)&&Q.BatCon.getTileType(tileTo)!=="impassable"){
                text.push({func:"pushed",obj:target,props:[tileTo]});
                if(tiles===1){
                    //text.push(user.p.name+" pushed "+target.p.name+" "+tiles+" tile!");
                } else {
                    //text.push(user.p.name+" pushed "+target.p.name+" "+tiles+" tiles!");
                }
            };
            return text;
        },
        changeStatus:function(status,turns,target,user){
            var text = [];
            var num = turns;
            if(Q._isArray(turns)){
                num = Math.floor(Math.random()*turns[1])+turns[0];
            }
            var curStatus = target.hasStatus(status);
            if(curStatus){
                curStatus.turns = curStatus.turns>num?num:curStatus.turns;
            } else {
                text.push({func:"addStatus",obj:target,props:[status,num,user]});
            }
            return text;
        },
        
        healHp:function(amount,target,user){
            Q.setAward(target,"selfHealed",amount);
            Q.setAward(user,"targetHealed",amount);
            var text = [];
            if(target.p.hp+amount>target.p.maxHp) amount=target.p.maxHp-target.p.hp;
            target.p.hp+=amount;
            text.push({func:"healHp",obj:target,props:[amount]});
            return text;
        }
    });
};