$( function() {
    $('#footer a').click( function(e) {
        var form = $('<form action="show-events.php" method="post"></form>');
        form.append('<input type="text" name="scene" value="'+$("#title").text()+'">');
        form.submit();
    });
});