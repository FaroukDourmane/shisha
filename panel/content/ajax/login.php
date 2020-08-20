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

  // CHANGE EMAIL
  if ( isset($_POST["action"]) && $_POST["action"] == "changeEmail" )
  {
    $email = trim(strtolower(mysqli_real_escape_string($Q,$_POST["panel_email"])));
    $password = $_POST["panel_password"];
    $type = "error";

    if ( !empty(trim($email)) && !empty(trim($password)) )
    {
      $query = $Q->query("SELECT * FROM `panel` LIMIT 1 ");
      $fetch = $query->fetch_assoc();

      if ( password_verify($password,$fetch["password"]) )
      {
        $update = $Q->query("UPDATE `panel` SET `email`='$email' ");

        if ($update)
        {
          $_SESSION["panel_email"] = $email;
          $type = "success";
          $text = __("update_success",true);
        }else{
          $text = mysqli_error($Q);
        }

      }else{
        $text = __("wrong_password",true);
      }
    }else{
      $text = __("missing_inputs",true);
    }

    $response = [
      "type" => $type,
      "text" => $text
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }

  // CHANGE PASSWORD
  if ( isset($_POST["action"]) && $_POST["action"] == "changePasswrod" )
  {
    $old_pass = $_POST["old_pass"];
    $new_pass = $_POST["new_pass"];
    $confirm_pass = $_POST["confirm_pass"];
    $type = "error";


    if ( !empty(trim($old_pass)) && !empty(trim($new_pass)) && !empty(trim($confirm_pass)) )
    {

        if ( $new_pass == $confirm_pass )
        {
          $query = $Q->query("SELECT * FROM `panel` LIMIT 1 ");
          $fetch = $query->fetch_assoc();

          if ( password_verify($old_pass,$fetch["password"]) )
          {
            $pass_hash = password_hash($new_pass, PASSWORD_DEFAULT);
            $update = $Q->query("UPDATE `panel` SET `password`='$pass_hash' ");

            if ($update)
            {
              $type = "success";
              $text = __("update_success",true);
            }else{
              $text = mysqli_error($Q);
            }

          }else{
            $text = __("wrong_password",true);
          }
        }else{
          $text = __("wrong_password_confirm",true);
        }

    }else{
      $text = __("missing_inputs",true);
    }

    $response = [
      "type" => $type,
      "text" => $text
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }
?>
