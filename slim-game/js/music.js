Quintus.Music=function(Q){
//Make sure that when the user enables music, it start playing
Q.state.on("change.musicEnabled",function(value){
    if(value){
        var music = Q.state.get("currentMusic");
        Q.state.set("currentMusic",false);
        Q.input.off("fire",Q,"loadOptions");
        Q.playMusic(music,function(){Q.input.on("fire",Q,"loadOptions");});
    } else {
        Q.stopMusic(Q.state.get("currentMusic"));
    }
});

Q.stopMusic=function(music){
    Q.audio.stop("bgm/"+music);
};

Q.playMusic=function(music,callback){
    if(Q.state.get("options").musicEnabled){
        var loadedMusic = Q.state.get("loadedMusic");
        var ld = loadedMusic.filter(function(songName){
            return songName===music;
        })[0];
        //If the music hasn't been loaded
        if(!ld){
            Q.stopMusic(Q.state.get("currentMusic"));
            Q.stopMusic(music);
            Q.load("bgm/"+music,function(){
                Q.audio.play("bgm/"+music,{loop:true});
                loadedMusic.push(music);
                if(callback){callback();}
            });
        //If the music is different than the currentMusic
        } else if(Q.state.get("currentMusic")!==music){
            Q.stopMusic(Q.state.get("currentMusic"));
            Q.stopMusic(music);
            Q.audio.play("bgm/"+music,{loop:true});
        }
        if(ld){
            if(callback){callback();}
        }
    } else {
        if(callback){callback();}
    }
    Q.state.set("currentMusic",music);
};

Q.playSound=function(sound,callback){
    if(Q.state.get("options").soundEnabled){
        Q.audio.play("sfx/"+sound);
    }
    if(callback){callback();}
};
//Does a normal Q.load, but also checks if music is enabled before loading.
//This allows you to not load music while testing.
Q.loadMusic=function(music,callback){
    if(Q.state.get("options").musicEnabled){
        Q.load(music,callback);
    } else {
        callback();
    }
};
    
};


