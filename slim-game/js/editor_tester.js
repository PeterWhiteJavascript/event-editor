Quintus.EditorTester = function(Q){
    function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }
    Q.testStoryScene = function(data){
        
        var b = [];
        var m = [];
        //get all of the bgs and music and load them
        data.pages.forEach(function(page){
            b.push(page.bg);
            m.push("bgm/"+page.music);
        });
        //Load the assets
        Q.load(b.filter(onlyUnique),function(){
            Q.loadMusic(m.filter(onlyUnique),function(){
                //Show the scene
                Q.stageScene("story",1,{data:data});
            });
        });
        
    };
    
};