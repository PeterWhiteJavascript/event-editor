$(function(){
    var selectedScene;
    $('#save-move').click(function(e){
        var event = $("#title").text();
        var scene = $(selectedScene).first().text();
        var from = $("#subtitle").text();
        var form = $('<form action="change-to-scene.php" method="post"><input type="text" name="event" value="'+event+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="from" value="'+from+'"></form>');
        form.submit();
    });
    //When an individual scene is clicked
    $(document).on("click",".scene-button",function(e){
        selectedScene = this;
        $(".menu-button.active").removeClass("active");
        $(this).children(":first").addClass('active');
    });
    //Default to top item being selected
    $(".scene-button").first().trigger("click");
    
    $('#footer').click( function(e) {
        var form = $('<form action="show-events.php" method="post"></form>');
        form.append('<input type="text" name="scene" value="'+$("#subtitle").text()+'">');
        form.submit();
    });
});


