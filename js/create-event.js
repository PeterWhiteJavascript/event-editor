$( function() {
    $('#footer').click( function(e) {
        var form = $('<form action="show-events.php" method="post"></form>');
        form.append('<input type="text" name="scene" value="'+$("#subtitle").text()+'">');
        form.submit();
    });
});