$(function(){
    $( "#sortable" ).sortable({
        axis: "y"
    });
    $( "#sortable" ).disableSelection();
    //Store the page that has been clicked on
    var selectedPage;

    //Increment every time a new page is added (so we don't have duplicate page names if a page was deleted)
    var uniquePages = $("#pages ul li").length;
    
    //When editing a name, set to true
    var editingName = false;
    function renamePageOption(from,to){
        $(".pages-to option").each(function(){
            if($(this).text()===from){
                $(this).text(to);
            }
        });
    }
    function appendNewPageOption(){
        $(".pages-to").each(function(){
            var text = $("#pages ul li:nth-child("+($("#pages ul li").length)+") a div").html();
            $(this).append('<option value="'+text+'">'+text+'</option>');
        });
    }
    function appendPagesOptions(to){
        for(var i=1;i<$("#pages ul li").length+1;i++){
            var text = $("#pages ul li:nth-child("+i+") a div").html();
            if($(to).attr("initialValue")===text){
                to.append('<option value="'+text+'" selected>'+text+'</option>');
            } else {
                to.append('<option value="'+text+'">'+text+'</option>');
            }
            
        }
    }
    //The effect functions that happen when going to a certain page.
    var funcs = [
        "None",
        "Change Morale",
        "Change Gold",
        "Change Exp",
        "Change Enemy Setup"
    ];
    //Includes the properties for each effect func
    var props = [
        [],
        [{name:"Amount",value:0},{name:"Affects",value:["Whole Party","Avaiable Only"]}],
        [{name:"Amount",value:0}],
        [{name:"Amount",value:0},{name:"Affects",value:["Whole Party","Avaiable Only"]}],
        [{name:"Change To",value:[1,2,3,4]}]
        
    ];
    function appendOnPageEffects(to){
        for(var i=0;i<funcs.length;i++){
            to.append('<option class="page-effect" value="'+funcs[i]+'">'+funcs[i]+'</option>');
        }
    }
    $(".on-page-effect").on("change",function() {
        var val = $(this).val();
        var num = 0;
        for(var i=0;i<funcs.length;i++){
            if(funcs[i]===val){
                num = i;
                break;
            }
        }
        var p = props[num];
        console.log(p)
        //TO DO: do something with the props. Display each prop and allow the user to modify the value

    });
    function createSaveForm(){
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
        return form;
    }
     
    //START CHOICE BUTTONS
    $('#add-new-choice').click( function(e) {
        $("#choices ul").append('<li class="choice-'+$(selectedPage).parent().attr("id")+' choice-li"><a class="remove-choice"><div class="btn btn-default">x</div></a><div>Display Text: <input class="display-text" placeholder="Choice"></input></div><div>Desc: <textarea class="desc-text"></textarea></div><div>To Page: <select class="pages-to"></select></div><div>Effect: <select class="on-page-effect"></select></div></li>');
        //Loop through the pages and put them in the select
        appendPagesOptions($(".pages-to").last());
        appendOnPageEffects($(".on-page-effect").last());
    });
    
    //END CHOICE BUTTONS
    
    //START MAIN OPTIONS BUTTONS
    //Create a new page
    $('#add-new-page').click( function(e) {
        uniquePages++;
        var music = $("#pages ul li:last-child").attr("music")?$("#pages ul li:last-child").attr("music"):$("#music-select option").first().val();
        var bg = $("#pages ul li:last-child").attr("bg")?$("#pages ul li:last-child").attr("bg"):$("#bg-select option").first().val();
        $("#pages ul").append('<li id="'+new Date().getUTCMilliseconds()+'" music="'+music+'" bg="'+bg+'" text=""><a class="scene-button"><div class="menu-button btn btn-default">Page '+uniquePages+'</div></a></li>');
        appendNewPageOption();
        $(".scene-button").last().trigger("click");
    });
    $('#remove-page').click( function(e) {
        if($('#pages ul li').length>1){
            $(selectedPage).parent().remove();
            $(".scene-button").first().trigger("click");
        }
    });
    //Copies the page, but give a new unique id
    $('#copy-page').click( function(e) {
        uniquePages++;
        var id = new Date().getUTCMilliseconds();
        $("#pages ul").append('<li id="'+id+'" music="'+$(selectedPage).parent().attr("music")+'" bg="'+$(selectedPage).parent().attr("bg")+'" text="'+$(selectedPage).parent().attr("text")+'"><a class="scene-button"><div class="menu-button btn btn-default">Page '+uniquePages+'</div></a></li>');
        //TO DO: Also copy any choices
        var clone = $('.choice-'+$(selectedPage).parent().attr("id")).clone();
        clone.attr("class","choice-"+id+" choice-li");
        $("#choices ul").append(clone);
        appendNewPageOption();
        //Set the pages to and effect to be the same
        /*for(var i=1;i<$(".choice-"+id+" .pages-to").length+1;i++){
            console.log($(".choice-"+$(selectedPage).parent().attr("id")+" .pages-to").val())
        }*/
        $(".choice-"+$(selectedPage).parent().attr("id")+" select").each(function(i) {
            var select = this;
            console.log($(select).val())
            $(".choice-"+id).find("select").eq(i).val($(select).val());
        });
        //$(".choice-"+id+" .pages-to").val($('.choice-'+$(selectedPage).parent().attr("id")+' .pages-to').val());
        //$(".choice-"+id+" .on-page-effect").val($('.choice-'+$(selectedPage).parent().attr("id")+' .on-page-effect').val());
        
        $(".scene-button").last().trigger("click");
    });
    //Test the event in the same conditions as in game!
    $('#test-event').click( function(e) {
        var form = createSaveForm();
        form.append('<input type="text" name="testing" value="true">')
        form.submit();
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
        var form = createSaveForm();
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
        var orig = $(selectedPage).find(':first-child').attr("origValue");
        if(!name.length){
            name = orig;
        }
        $(selectedPage).find(':first-child').remove();
        $(selectedPage).append('<div class="menu-button btn btn-default active">'+name+'</div>');
        renamePageOption(orig,name);
        editingName=false;
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
                editingName=true;
            }
        } else {
            //Hide the choices from the last page
            $(".choice-"+$(selectedPage).parent().attr("id")).hide();
            //Show the choices for the current page
            $(".choice-"+$(this).parent().attr("id")).show();
            //Save the text
            $(selectedPage).parent().attr("text",$("#text-select textarea").val()); 
            //Make sure to always finish editing if a new element is selected
            if(editingName){
                finishEditPageName();
            }
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
    
    $("audio").first().attr("src","slim-game/audio/bgm/"+$("#music-select select").val());
    $("#bg-preview").attr("src","slim-game/images/"+$("#bg-select select").val());
    //Fill the pages-to selects
    $(".pages-to").each(function(){
        appendPagesOptions($(this));
    });
    $(".on-page-effect").each(function(){
        appendOnPageEffects($(this));
    });
    //Hide all choices
    $(".choice-li").hide();
    //If there are no pages, create one
    if($("#pages ul li").length===0){
        $('#add-new-page').trigger("click");
    }
    
});

