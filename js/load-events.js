//This will be filled with php for already made scenes
var events = [];

//Store the event that has been clicked on
var selectedEvent;

$(function(){
    //START OPTS BUTTONS
    $('#edit-event').click( function(e) {
        console.log(selectedEvent);
        alert("TO DO: save events and display the map.");
    });
    $('#new-event').click( function(e) {
        //Remove the current description
        $("#show-desc div").remove();
        //Create the scene name
        $("#show-events").append('<li><a class="scene-button"><input class="menu-button-modify" placeholder="New Scene"></input></a></li>');
        events.push({name:"New Scene",desc:"Lorem ipsum dolor"});
        $("#show-events li a").last().trigger("click");
    });
    
    $('#copy-event').click( function(e) {
        
    });
    
    $('#move-event').click( function(e) {
        
    });
    
    $('#change-scene').click( function(e) {
        
    });
    $('#rename-event').click( function(e) {
        $(selectedEvent).trigger('rename');
    });
    $('#edit-desc').click( function(e) {
        $("#show-desc").trigger('rename-desc');
    });
    $('#delete-event').click( function(e) {
        var yes = confirm("Really delete?");
        if(yes){
            $(selectedEvent).trigger('delete');
        }
        if($(".scene-button").first()){
            selectedEvent = $(".scene-button").first();
            $(selectedEvent).trigger("click");
        } else {
            selectedEvent = false;
        }
    });
    //END OPTS BUTTONS
    //When an individual scene is clicked
    $(document).on("click",".scene-button",function(e){
        selectedEvent = this;
        $(".button-selected").removeClass("button-selected");
        $(this).children(":first").addClass('button-selected');
        //Remove description that is there
        $("#show-desc div").remove();
        //Show the description for the scene
        var idx = $(".scene-button").index(selectedEvent);
        var desc = events[idx].desc;
        var kind = events[idx].kind;
        $("#show-desc").append('<div class="desc-text">'+desc+'</div>');
        $("#show-desc").append('<div class="desc-foot">'+kind+'</div>');
    });
    
    //Delete a scene
    $(document).on("delete",".scene-button",function(e){
        $(this).parent().remove();
        $("#show-desc").children(":first").remove();
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
    $(document).on("rename-desc","#show-desc",function(e){
        $(this).children(":first").remove();
        $(this).append('<textarea class="menu-desc-modify" placeholder="Description"></textarea>');
    });
    $(document).on("renamed-desc","#show-desc",function(e){
        var text = $(this).children(":first").val();
        events[$(".scene-button").index(selectedEvent)].desc = text;
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
    
    //Fill the events array
    var ev = $("#show-events").children();
    for(var i=0;i<ev.length;i++){
        events.push({name:$(ev[i]).attr("name"),desc:$(ev[i]).attr("desc"),kind:$(ev[i]).attr("kind")});
    }
    //Default to top item being selected
    $(".scene-button").first().trigger("click");
    
});

