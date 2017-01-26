Quintus.Animations=function(Q){
Q.setUpAnimations=function(){
    //UI Objects
    Q.compileSheets("ui/ui_objects.png","json/data/ui_objects.json");
    
    
    //Sprites
    var toSheet= [
        ['archer','archer.png',24,48,6,6,288,338],
        ['barbarian','barbarian.png',24,48,6,6,288,338],
        ['knight','knight.png',24,48,6,14,288,338]
    ];
    for(j=0;j<toSheet.length;j++){
        Q.sheet(toSheet[j][0],
        "sprites/"+toSheet[j][1],
        {
           tilew:toSheet[j][2],
           tileh:toSheet[j][3],
           sx:toSheet[j][4],
           sy:toSheet[j][5],
           w:toSheet[j][6],
           h:toSheet[j][7]
        });
    };
    //Animations
    var toSheet= [
        ['SonicBoom','SonicBoom.png',96,96,0,0,288,288],
        ['Whirlwind','Whirlwind.png',32,32,0,0,96,32],
        ['Piercing','Piercing.png',64,32,0,0,320,32]
    ];
    for(j=0;j<toSheet.length;j++){
        Q.sheet(toSheet[j][0],
        "animations/"+toSheet[j][1],
        {
           tilew:toSheet[j][2],
           tileh:toSheet[j][3],
           sx:toSheet[j][4],
           sy:toSheet[j][5],
           w:toSheet[j][6],
           h:toSheet[j][7]
        });
    };
        
    var standRate = 1/3;
    var walkRate = 1/6;
    Q.animations("Character", {
        standingleft:{ frames: [1,2], rate:standRate},
        walkingleft:{ frames: [1,2,3], rate:walkRate},
        attackingleft:{ frames: [1,2,3,3,2,1], rate:walkRate, loop:false,trigger:"doneAttack"},
        missedleft:{frames:[8,8,8],rate:standRate,loop:false,trigger:"playStand"},
        counteringleft:{frames:[8,8,8],rate:standRate,loop:false,trigger:"doneCounter"},
        liftleft:{frames:[8,8,8],rate:standRate},
        liftedleft:{frames:[50],rate:standRate},
        hurtleft:{frames:[48],rate:standRate},
        dyingleft:{frames:[48,50],rate:standRate,loop:false,trigger:"doneDying"},
        deadleft:{frames:[50],rate:standRate},
        
        standingright:{ frames: [5,6], rate:standRate},
        walkingright:{ frames: [5,6,7], rate:walkRate},
        attackingright:{ frames: [5,6,7,7,6,5], rate:walkRate, loop:false,trigger:"doneAttack"},
        missedright:{frames:[9,9,9],rate:standRate,loop:false,trigger:"playStand"},
        counteringright:{frames:[9,9,9],rate:standRate,loop:false,trigger:"doneCounter"},
        liftright:{frames:[9,9,9],rate:standRate},
        liftedright:{frames:[51],rate:standRate},
        hurtright:{frames:[49],rate:standRate},
        dyingright:{frames:[49,51],rate:standRate,loop:false,trigger:"doneDying"},
        deadright:{frames:[51],rate:standRate},
        
        standingup:{ frames: [5,6], rate:standRate},
        walkingup:{ frames: [5,6,7], rate:walkRate},
        attackingup:{ frames: [5,6,7,7,6,5], rate:walkRate, loop:false,trigger:"doneAttack"},
        missedup:{frames:[9,9,9],rate:standRate,loop:false,trigger:"playStand"},
        counteringup:{frames:[9,9,9],rate:standRate,loop:false,trigger:"doneCounter"},
        liftup:{frames:[9,9,9],rate:standRate},
        liftedup:{frames:[51],rate:standRate},
        hurtup:{frames:[49],rate:standRate},
        dyingup:{frames:[49,51],rate:standRate,loop:false,trigger:"doneDying"},
        deadup:{frames:[51],rate:standRate},
        
        standingdown:{ frames: [1,2], rate:standRate},
        walkingdown:{ frames: [1,2,3], rate:walkRate},
        attackingdown:{ frames: [1,2,3,3,2,1], rate:walkRate, loop:false,trigger:"doneAttack"},
        misseddown:{frames:[8,8,8],rate:standRate,loop:false,trigger:"playStand"},
        counteringdown:{frames:[8,8,8],rate:standRate,loop:false,trigger:"doneCounter"},
        liftdown:{frames:[8,8,8],rate:standRate},
        lifteddown:{frames:[50],rate:standRate},
        hurtdown:{frames:[48],rate:standRate},
        dyingdown:{frames:[48,50],rate:standRate,loop:false,trigger:"doneDying"},
        deaddown:{frames:[50],rate:standRate},
        
        levelingUp:{frames:[12,12],rate:standRate,loop:false,trigger:"playStand"}
    });
    Q.animations("SonicBoom",{
        booming:{frames:[0,0,1,1,0,0,1,1,2,2,1,1,2,2,3,3,4,4,3,3,4,4,5,5,4,4,5,5,6,7,6,7,8,7,8,7,6,0,0],rate:1/10, loop:false,trigger:"doneAttack"}
    });
    Q.animations("Whirlwind",{
        winding:{frames:[0,0,1,1,2,2,1,2,1,2,1,2,1,2],rate:1/6, loop:false,trigger:"doneAttack"}
    });
    Q.animations("Piercing",{
        piercingStart:{frames:[0,1],rate:1/6,loop:false,next:"piercingEnd",trigger:"doneAttack"},
        piercingEnd:{frames:[2,3],rate:1/6,loop:false,trigger:"finished"}
    });
};
    
};