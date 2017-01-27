//Store the page that has been clicked on
var selectedPage;

$(function(){
    $('#add-new-page').click( function(e) {
        $("#pages ul").append('<li music="'+$("#pages ul:last-child").attr("music")+'" bg="'+$("#pages ul:last-child").attr("bg")+'" text=""><a class="scene-button"><div class="menu-button btn btn-default">Page '+($("#pages ul li").length+1)+'</div></a></li>');
    });
    $('#remove-page').click( function(e) {
        $(selectedPage).parent().remove();
        $(".scene-button").first().trigger("click");
    });
    $('#save-event').click( function(e) {
        var form = $('<form action="save-story-pages.php" method="post"></form>');
        form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
        form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
        $("#pages ul li").each(function(i,li){
            form.append('<input type="text" name="music[]" value="'+$(li).attr("music")+'">');
            form.append('<input type="text" name="bg[]" value="'+$(li).attr("bg")+'">');
            form.append('<input type="text" name="text[]" value="'+$(li).attr("text")+'">');
        });
        form.submit();
    });
    $(document).on('change', '#music-select select', function() {
        $(selectedPage).parent().attr("music",$(this).val());
        $("audio").first().attr("src","slim-game/audio/bgm/"+$(this).val());
    });
    $(document).on('change', '#bg-select select', function() {
        $(selectedPage).parent().attr("bg",$(this).val());
    });
    //When an individual page is clicked
    $(document).on("click",".scene-button",function(e){
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
        
    });
    
    //Default to top item being selected
    $(".scene-button").first().trigger("click");
    $("audio").first().attr("src","slim-game/audio/bgm/"+$("#music-select select").val());
});

