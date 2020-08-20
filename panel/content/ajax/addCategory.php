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

  if ( isset($_POST["action"]) && $_POST["action"] == "addCategory" )
  {
    $name_en = trim(mysqli_real_escape_string($Q, $_POST["name_en"]));
    $name_ar = trim(mysqli_real_escape_string($Q, $_POST["name_ar"]));
    $name_tr = trim(mysqli_real_escape_string($Q, $_POST["name_tr"]));
    $type = "error";

    $add = $Q->query("INSERT INTO `categories` (`name`,`name_tr`,`name_ar`) VALUES ('$name_en','$name_tr','$name_ar') ");
    if ( $add )
    {
      $type = "success";
      $text = __("update_success",true);
    }else {
      $text = mysqli_error($Q);
    }

    $response = [
      "type" => $type,
      "text" => $text
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }
?>
