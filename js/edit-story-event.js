//Store the page that has been clicked on
var selectedPage;

$(function(){
    function appendPagesOptions(to){
        for(var i=1;i<$("#pages ul li").length+1;i++){
            var text = $("#pages ul li:nth-child("+i+") a div").html();
            to.append('<option value="'+text+'">'+text+'</option>');
        }
    }
    var effects = [
        {name:"None",value:{func:"none",props:[]}},
        {name:"+1 Morale",value:{func:"improveParty",props:["morale",1]}},
        {name:"Enemy Setup #2",value:{func:"updateNextBattle",props:["enemySetUp",2]}},
        {name:"+100 Gold",value:{func:"getGold",props:[100]}}
    ];
    function appendOnPageEffects(to){
        for(var i=0;i<effects.length;i++){
            to.append('<option value="">'+effects[i].name+'</option>');
        }
    }
    //START CHOICE BUTTONS
    $('#add-new-choice').click( function(e) {
        $("#choices ul").append('<li class="choice-'+$(selectedPage).parent().attr("id")+'"><a class="remove-choice"><div class="btn btn-default">x</div></a><div>Display Text: <input class="display-text" placeholder="Choice"></input></div><div>Desc: <textarea class="desc-text"></textarea></div><div>To Page: <select class="pages-to"></select></div><div>Effect: <select class="on-page-effect"></select></div></li>');
        //Loop through the pages and put them in the select
        appendPagesOptions($(".pages-to").last());
        appendOnPageEffects($(".on-page-effect").last());
    });
    
    //END CHOICE BUTTONS
    
    //START MAIN OPTIONS BUTTONS
    //Create a new page
    $('#add-new-page').click( function(e) {
        $("#pages ul").append('<li id="'+new Date().getUTCMilliseconds()+'" music="'+$("#pages ul li:last-child").attr("music")+'" bg="'+$("#pages ul li:last-child").attr("bg")+'" text=""><a class="scene-button"><div class="menu-button btn btn-default">Page '+($("#pages ul li").length+1)+'</div></a></li>');
    });
    $('#remove-page').click( function(e) {
        $(selectedPage).parent().remove();
        $(".scene-button").first().trigger("click");
    });
    //Copies the page, but give a new unique id
    $('#copy-page').click( function(e) {
        $("#pages ul").append('<li id="'+new Date().getUTCMilliseconds()+'" music="'+$(selectedPage).parent().attr("music")+'" bg="'+$(selectedPage).parent().attr("bg")+'" text="'+$(selectedPage).parent().attr("text")+'"><a class="scene-button"><div class="menu-button btn btn-default">Page '+($("#pages ul li").length+1)+'</div></a></li>');
        $(".scene-button").first().trigger("click");
    });
    
    $('#back').click( function(e) {
        var sure = confirm("Are you sure you want to go back without saving?")
        if(sure){
            var form = $('<form action="create-event.php" method="post"></form>');
            form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
            form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
            form.submit();
        }
    });
    $('#save-event').click( function(e) {
        $(selectedPage).parent().attr("text",$("#text-select textarea").val()); 
        var form = $('<form action="save-story-pages.php" method="post"></form>');
        form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
        form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
        var ids = [];
        $("#pages ul li").each(function(i,li){
            form.append('<input type="text" name="pagesid[]" value="'+$(li).attr("id")+'">');
            form.append('<input type="text" name="pagesname[]" value="'+$(li).first().text()+'">');
            form.append('<input type="text" name="music[]" value="'+$(li).attr("music")+'">');
            form.append('<input type="text" name="bg[]" value="'+$(li).attr("bg")+'">');
            form.append('<input type="text" name="text[]" value="'+$(li).attr("text")+'">');
            ids.push($(li).attr("id"));
        });
        var choices = {};
        //Loop through each id
        for(var i=0;i<ids.length;i++){
            var id = ids[i];
            choices[id] = [];
            //Loop through the choices in each id
            for(var j=0;j<$(".choice-"+id).length;j++){
                var choice = {};
                choice.displayText = $(".choice-"+id+" .display-text")[j].value;
                choice.desc = $(".choice-"+id+" .desc-text")[j].value;
                choice.page = $(".choice-"+id+" .pages-to")[j].value;
                choice.effect = "TODO";//(".choice-"+id+" .on-page-effect")[j].value;
                choices[id].push(choice);
            }
        }
        var json = JSON.stringify(choices);
        //Send the choices as a JSON string
        form.append("<input type='text' name='choices' value='"+json+"'>");
        form.submit();
    });
    //END MAIN OPTIONS BUTTONS
    $(document).on('change', '#music-select select', function() {
        $(selectedPage).parent().attr("music",$(this).val());
        $("audio").first().attr("src","slim-game/audio/bgm/"+$(this).val());
    });
    $(document).on('change', '#bg-select select', function() {
        $(selectedPage).parent().attr("bg",$(this).val());
        $("#bg-preview").attr("src","slim-game/images/"+$(this).val());
    });
    function finishEditPageName(){
        var name = $(selectedPage).find(':first-child').val();
        if(!name.length) name = $(selectedPage).find(':first-child').attr("origValue");
        $(selectedPage).find(':first-child').remove();
        $(selectedPage).append('<div class="menu-button btn btn-default">'+name+'</div>');
    }
    //When an individual page is clicked
    $(document).on("click",".scene-button",function(e){
        //If the user clicks the page that is already selected, they are trying to rename it
        if(this === $(selectedPage).get(0)){
            //Don't do this if we're already editing it
            if($(selectedPage).find(':first-child').is("div")){
                var name = $(selectedPage).find(':first-child').text();
                $(selectedPage).find(':first-child').remove();
                $(selectedPage).append('<input class="rename-page" origValue="'+name+'" value="'+name+'"></input>');
                $(selectedPage).find(':first-child').select();
                $(selectedPage).find(':first-child').focusout(finishEditPageName);
                $(selectedPage).find(':first-child').change(finishEditPageName);
            }
        } else {
            
            //Hide the choices from the last page
            $(".choice-"+$(selectedPage).parent().attr("id")).hide();
            //Show the choices for the current page
            $(".choice-"+$(this).parent().attr("id")).show();
            //Save the text
            $(selectedPage).parent().attr("text",$("#text-select textarea").val()); 
            selectedPage = this;
            $(".menu-button.active").removeClass("active");
            $(this).children(":first").addClass('active');
            //Remove description that is there
            $("#text-select textarea").remove();
            $("#music-select select").val($(selectedPage).parent().attr("music"));
            $("#bg-select select").val($(selectedPage).parent().attr("bg"));
            //Show the description for the scene
            var desc = $(this).parent().attr("text");
            $("#text-select").append('<textarea class="desc-text">'+desc+'</textarea>');
            //Change the audio and bg src
            $("audio").first().attr("src","slim-game/audio/bgm/"+$("#music-select select").val());
            $("#bg-preview").attr("src","slim-game/images/"+$("#bg-select select").val());
        }
    });
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
    });
    
    //Default to top item being selected
    $(".scene-button").first().trigger("click");
    $("audio").first().attr("src","slim-game/audio/bgm/"+$("#music-select select").val());
    $("#bg-preview").attr("src","slim-game/images/"+$("#bg-select select").val());
    //Fill the pages-to selects
    $(".pages-to").each(function(){
        appendPagesOptions($(this));
    });
    $(".on-page-effect").each(function(){
        appendOnPageEffects($(this));
    });
    
    
});

