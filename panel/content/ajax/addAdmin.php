<?php

  require_once(__DIR__."/../../../config/config.php");
  require_once(__DIR__."/../../config/sessions.php");
  require_once(__DIR__."/../../config/".panel_lang_file());

  // #################################################
  // #################################################
  // CHECK ADMIN AUTH
  if ( !admin_logged() )
  {
    $text = __("not_authorized",true);
    $type = "error";

    $response = [
      "type" => $type,
      "text" => $text
    ];

    $json_response = json_encode($response);
    echo $json_response;
    exit;
  }
  // END : CHECK ADMIN AUTH
  // #################################################
  // #################################################

  if ( isset($_POST["action"]) && $_POST["action"] == "addAdmin" )
  {

    $email = strtolower(trim(mysqli_real_escape_string($Q, $_POST["email"])));
    $password = $_POST["password"];

    $articles = ($_POST["articles"] == "true") ? 1 : 0;
    $customer_profiles = ($_POST["customer_profiles"] == "true") ? 1 : 0;
    $videos = ($_POST["videos"] == "true") ? 1 : 0;
    $photos = ($_POST["photos"] == "true") ? 1 : 0;
    $see_requests = ($_POST["see_requests"] == "true") ? 1 : 0;
    $edit_requests = ($_POST["edit_requests"] == "true") ? 1 : 0;
    $remove_requests = ($_POST["remove_requests"] == "true") ? 1 : 0;

    $type = "error";

    $missing_inputs = 0;
    $missing_permissions = 0;


    // check inputs
    if ( strlen($email) <= 0 || strlen(trim($password)) <= 0 )
    {
      $missing_inputs = 1;
    }

    if ( !$articles && !$customer_profiles && !$videos && !$photos && !$see_requests && !$edit_requests && !$remove_requests )
    {
      $missing_permissions = 1;
    }

    if ( !$missing_inputs && !$missing_permissions )
    {
      $check_email = $Q->query("SELECT * FROM `admin` WHERE `email`='$email' ");

      if ( $check_email->num_rows > 0 )
      {
        $type = "error";
        $text = __("email_in_use",true);
      }else{
        $password = password_hash($password, PASSWORD_DEFAULT);
        $insert = $Q->query("INSERT INTO `admin`
          (`email`,`password`,`articles`,`customer_profiles`,`videos`,`photos`,`see_requests`,`edit_requests`,`remove_requests`)
          VALUES
          ('$email','$password','$articles','$customer_profiles','$videos','$photos','$see_requests','$edit_requests','$remove_requests') ");

        if ( $insert )
          {
            $type = "success";
            $text = __("update_success",true);
          }else {
            $text = mysqli_error($Q);
          }
      }
    }else{
      if ( $missing_inputs )
      {
        $text = __("email_password_required",true);
      }else if ( $missing_permissions ){
        $text = __("choose_permission",true);
      }
    }

    $response = [
      "type" => $type,
      "text" => $text
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }
?>
