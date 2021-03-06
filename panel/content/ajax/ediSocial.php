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

  if ( isset($_POST["action"]) && $_POST["action"] == "editSocial" )
  {
    $facebook = trim(mysqli_real_escape_string($Q, $_POST["facebook"]));
    $twitter = trim(mysqli_real_escape_string($Q, $_POST["twitter"]));
    $instagram = trim(mysqli_real_escape_string($Q, $_POST["instagram"]));
    $snapchat = trim(mysqli_real_escape_string($Q, $_POST["snapchat"]));

    $type = "error";

    $update = $Q->query("UPDATE `general` SET `facebook`='$facebook',`twitter`='$twitter',`instagram`='$instagram',`snapchat`='$snapchat' ");
    if ( $update )
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
