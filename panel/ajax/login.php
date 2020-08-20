<?php

  require_once(__DIR__."/../../config/config.php");
  require_once(__DIR__."/../config/sessions.php");
  require_once(__DIR__."/../config/".panel_lang_file());

  // #################################################
  // #################################################
  // CHECK ADMIN AUTH
  if ( admin_logged() )
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
  if ( isset($_POST["action"]) && $_POST["action"] == "login_admin" )
  {
    $email = trim(strtolower(mysqli_real_escape_string($Q,$_POST["email"])));
    $password = $_POST["password"];
    $session_id = session_id();
    $token = mysqli_real_escape_string($Q, $_SESSION["_TOKEN"]);
    $date = time();

    $type = "error";

    if ( !empty(trim($email)) && !empty(trim($password)) )
    {
      $query = $Q->query("SELECT * FROM `panel` WHERE `email`='$email' LIMIT 1 ");

      if ( $query->num_rows <= 0 )
      {
        $text = __("email_not_found",true);

        throwMessage($text, "error");

        $type = "error";

        $response = [
          "type" => $type,
          "text" => $text
        ];

        $json_response = json_encode($response);
        echo $json_response;
        exit;
      }

      $fetch = $query->fetch_assoc();

      if ( password_verify($password,$fetch["password"]) )
      {
        $insert = $Q->query("INSERT INTO `session` (`email`,`token`,`id`,`time`) VALUES ('$email','$token','$session_id','$date') ");

        if ($insert)
        {
          $_SESSION["panel_email"] = $email;
          $type = "success";
          $text = __("login_success",true);
        }else{
          $text = mysqli_error($Q);
        }

      }else{
        $text = __("wrong_password",true);
        throwMessage($text, "error");
      }
    }else{
      $text = __("missing_inputs",true);
      throwMessage($text, "error");
    }

    $response = [
      "type" => $type,
      "text" => $text
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }

?>
