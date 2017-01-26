Quintus.QFunctions=function(Q){
    //Sets up a character that is used in the story.
    Q.setUpStoryCharacter=function(data){
        function getEquipment(equipmentData){
            var equipment = Q.state.get("equipment");
            var keys = Object.keys(equipmentData);
            var eq = {};
            keys.forEach(function(key){
                if(equipmentData[key]){
                    eq[key] = equipment[equipmentData[key][0]][equipmentData[key][1]];
                } else {
                    eq[key] = {};
                }
            });
            return eq;
        }
        function getSkills(skillsData){
            var skills = Q.state.get("skills");
            var keys = Object.keys(skillsData);
            var sk = {
                dagger:{},
                sword:{},
                axe:{},
                spear:{},
                bow:{},
                shield:{}
            };
            keys.forEach(function(key){
                sk[key] = {};
                for(var i=0;i<skillsData[key].length;i++){
                    sk[key][skillsData[key][i]]=skills[key][skillsData[key][i]];
                }
            });
            return sk; 
        }
        
        var char = {
            name:data.name,
            level:data.level,
            exp:data.exp,
            gender:data.gender,
            stats:data.stats,
            charClass:data.charClass,
            equipment:getEquipment(data.equipment),
            skills:getSkills(data.skills),
            awards:data.awards?data.awards:Q.setUpAwards()
        };
        char.awards.value = data.value;
        char.awards.method = data.method;
        return char;
    };
    Q.setUpAwards = function(){
        var awards = Q.state.get("awards");
        var keys = Object.keys(awards);
        var obj = {};
        //The default value for all awards is 0
        keys.forEach(function(key){
            obj[key] = 0;
        });
        return obj;
    };
    Q.setAward = function(obj,prop,value){
        if(!obj) return;
        obj.p.awards[prop]+=value;
    };
    //Value scale of 1-100
    Q.getCharacterValue=function(value){
        if(value<=33) return "egoistic";
        if(value>=66) return "altruistic";
        return "loyal";
    };
    //Method scale of 1-100
    Q.getCharacterMethod=function(value){
        if(value<=33) return "compassionate";
        if(value>=66) return "logical";
        return "intuitive";
    };
    
    Q.getPathData=function(data,path){
        var newData = data;
        var arr = path.split('/');
        for(var i=0;i<arr.length;i++){
            newData = newData[arr[i]];
        }
        return newData;
    };
    Q.setOption=function(opt,value){
        Q.state.p.options[opt]=value;
    };
    //Follows a sprite
    Q.viewFollow=function(obj,stage){
        if(!stage){stage=Q.stage(0);};
        var minX=0;
        var maxX=(stage.mapWidth*Q.tileW)*stage.viewport.scale;
        var minY=0;
        var maxY=(stage.mapHeight*Q.tileH)*stage.viewport.scale;
        stage.follow(obj,{x:true,y:true},{minX: minX, maxX: maxX, minY: minY,maxY:maxY});
    };
    Q.pauseAllStages = function(){
        Q.stages.forEach(function(st){
            if(!st) return;
            st.pause();
        });
    };
    Q.unpauseAllStages = function(){
        Q.stages.forEach(function(st){
            if(!st) return;
            st.unpause();
        });
    };
    //Converts the direction into an location array that can be used to multiply for direction
    Q.getDirArray = function(dir){
        switch(dir){
            case "up":
                return [0,-1];
            case "right":
                return [1,0];
            case "down":
                return [0,1];
            case "left":
                return [-1,0];
        }
    };
    Q.getMatrix = function(type,team,required){
        var tileTypes = Q.state.get("tileTypes");
        var cM=[];
        var stage = Q.stage(0);
        var otherTeam = team==="enemy"?"ally":"enemy";
        function getWalkable(){
            var tile = tileTypes[Q.BatCon.getTileType([i_walk,j_walk])];
            var move = tile.move;
            //If there is something required for standing on this tile and the character does not have it
            if(tile.required&&(!required||!required[tile.required])) move = 1000000;
            return move?move:1000000;
        }
        function getTarget(){
            return Q.BattleGrid.getObject([i_walk,j_walk]);
        }
        function getZOC(){
            return Q.BattleGrid.getZOC(otherTeam,[i_walk,j_walk]);
        }
        for(var i_walk=0;i_walk<stage.lists.TileLayer[0].p.tiles[0].length;i_walk++){
            var costRow = [];
            for(var j_walk=0;j_walk<stage.lists.TileLayer[0].p.tiles.length;j_walk++){
                var cost = 1;
                var objOn = false;
                var zocOn = false;
                //If we're walking, enemies are impassable
                if(type==="walk"){
                    cost = getWalkable();
                    //Don't check for other objects and ZOC in the story
                    if(team!=="story"&&cost<1000000){
                        objOn = getTarget();
                        zocOn = getZOC();
                    }

                    //Allow walking over allies and dead people as long as there's no zoc tile
                    if(objOn&&(objOn.p.team===team||objOn.p.hp<=0)&&!zocOn){objOn=false;};
                }
                //If there's still no enemy on the sqaure, get the tileCost
                if(objOn){
                    costRow.push(1000000);
                } else if(zocOn){
                    costRow.push(1000);
                } else {
                    costRow.push(cost);
                }
            }
            cM.push(costRow);
        }
        return cM;
    };
    //Returns a path from one location to another
    Q.getPath = function(loc,toLoc,graph){
        var start = graph.grid[loc[0]][loc[1]];
        var end = graph.grid[toLoc[0]][toLoc[1]];
        return Q.astar.search(graph, start, end);
    };
};