secondary_log('validate.control.js');
jQuery.validator.setDefaults({
    success: "valid",
    errorElement: 'span',
    errorPlacement: function (error, element) {
        error.addClass('invalid-feedback');
        element.closest('.input-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
        var data = $(element).data();
        $(element).addClass('is-invalid');
        $('#' + data.nodeid).addClass('bg-gradient-danger');
        danger_log(data.nodeid);
        project.jstree("select_node",data.nodeid);
        alert('has an error!!!')
    },
    unhighlight: function (element, errorClass, validClass) {
        var data = $(element).data();
        $(element).removeClass('is-invalid');
        $('#' + data.nodeid).removeClass('bg-gradient-danger');
    }
});

function validate_control() {
    info_log("validating");
    
    $(".validate-control").each(function () { 
        $(this).valid();
     });
}
