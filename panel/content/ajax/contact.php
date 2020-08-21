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

  if ( isset($_POST["action"]) && $_POST["action"] == "changeContact" )
  {
    $email = strtolower(trim(mysqli_real_escape_string($Q, $_POST["email"])));
    $phone = trim(mysqli_real_escape_string($Q, $_POST["phone"]));
    $cellphone = trim(mysqli_real_escape_string($Q, $_POST["cellphone"]));
    $address = trim(mysqli_real_escape_string($Q, $_POST["address"]));

    $whatsapp = trim(mysqli_real_escape_string($Q, $_POST["whatsapp"]));
    $map = trim(mysqli_real_escape_string($Q, $_POST["map"]));

    $type = "error";

    $update = $Q->query("UPDATE `contact` SET `email`='$email',`phone`='$phone',`cellphone`='$cellphone',`address`='$address',`map_code`='$map',`whatsapp`='$whatsapp' ");
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
