//This will be filled with php for already made scenes
var scenes = [];

//Store the scene that has been clicked on
var selectedScene;

$(function(){
    //START OPTS BUTTONS
    $('#open-scene').click( function(e) {
        console.log(selectedScene)
        alert("TO DO")
    });
    $('#create-new-scene').click( function(e) {
        //Remove the current description
        $("#load-desc div").remove();
        //Create the scene name
        $("#load-scene").append('<li><a class="scene-button"><input class="menu-button-modify" placeholder="New Scene"></input></a></li>');
        scenes.push({name:"New Scene",desc:"Lorem ipsum dolor"});
        $("#load-scene li a").last().trigger("click");
    });
    $('#rename-scene').click( function(e) {
        $(selectedScene).trigger('rename');
    });
    $('#edit-desc').click( function(e) {
        $("#load-desc").trigger('rename-desc');
    });
    $('#delete-scene').click( function(e) {
        var yes = confirm("Really delete?");
        if(yes){
            $(selectedScene).trigger('delete');
        }
        if($(".scene-button").first()){
            selectedScene = $(".scene-button").first();
            $(selectedScene).trigger("click");
        } else {
            selectedScene = false;
        }
    });
    //END OPTS BUTTONS
    //When an individual scene is clicked
    $(document).on("click",".scene-button",function(e){
        selectedScene = this;
        $(".button-selected").removeClass("button-selected");
        $(this).children(":first").addClass('button-selected');
        //Remove description that is there
        $("#load-desc div").remove();
        //Show the description for the scene
        var idx = $(".scene-button").index(selectedScene);
        var desc = scenes[idx].desc;
        $("#load-desc").append('<div class="desc-text">'+desc+'</div>');
    });
    
    //Delete a scene
    $(document).on("delete",".scene-button",function(e){
        $(this).parent().remove();
        $("#load-desc").children(":first").remove();
    });
    //Renaming a scene
    $(document).on("rename",".scene-button",function(e){
        //doesn't work
        var text = $(this).children(":first").val();
        $(this).append('<input class="menu-button-modify" placeholder=""'+text+'""></input>');
        $(this).children(":first").remove();
    });
    $(document).on("renamed",".scene-button",function(e){
        var text = $(this).children(":first").val();
        $(this).append('<div class="menu-button">'+text+'</div>');
        $(this).children(":first").remove();
        $(this).trigger("click");
        return false;
    });
    
    //Press enter for the rename scene
    $(document).on("keypress",".menu-button-modify",function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            e.preventDefault();
            $(this).parent().trigger('renamed');
        }
    });
    
    //Renaming desc
    $(document).on("rename-desc","#load-desc",function(e){
        $(this).children(":first").remove();
        $(this).append('<textarea class="menu-desc-modify" placeholder="Description"></textarea>');
    });
    $(document).on("renamed-desc","#load-desc",function(e){
        var text = $(this).children(":first").val();
        scenes[$(".scene-button").index(selectedScene)].desc = text;
        $(this).append('<div class="desc-text">'+text+'</div>');
        $(this).children(":first").remove();
        return false;
    });
    //Press enter for rename description
    $(document).on("keypress",".menu-desc-modify",function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            e.preventDefault();
            $(this).parent().trigger('renamed-desc');
        }
    });
    
});


