$( function() {
    $( "#sortable" ).sortable({
        axis: "y"
    });
    $( "#sortable" ).disableSelection();
  
    $('#save-order').click( function(e) {
        var form = $('<form action="save-order.php" method="post"></form>');
        $('#sortable').children('li').each(function () {
            form.append('<input type="text" name="order[]" value="'+$(this).attr("name")+'">');
        });
        form.append('<input type="text" name="scene" value="'+$("#title").text()+'">');
        form.submit();
    });
    $('#footer').click( function(e) {
        var form = $('<form action="show-events.php" method="post"></form>');
        form.append('<input type="text" name="scene" value="'+$("#title").text()+'">');
        form.submit();
    });
    
} );