$(document).ready(function(){

  $(".loginForm").submit(function(e){

    e.preventDefault();
    $(".loadingContainer").addClass("active");
    $(".auto-form-wrapper").addClass("loading");

    var email = $("input[name='panel_email']").val();
    var password = $("input[name='panel_pass']").val();

    $.post("ajax/login.php", {action: "login_admin", email: email, password: password})
    .done(function(response){

      if ( response.type == "success" )
      {
        $(".loadingContainer").removeClass("active");
        $(".login-success").addClass("active");

        setTimeout(function() {
          window.location.href = "content/";
        }, 3000);

      }else{
        location.reload();
      }

    });

  });

});
