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

  if ( isset($_POST["action"]) && $_POST["action"] == "upload_gallery" )
  {
    if ( !isset($_SESSION["temp_gallery"]) )
    {
       $reference = generateReference();
       $_SESSION["temp_gallery"][$reference] = array();
    }

    $reference = $_SESSION["temp_gallery"];
    $path = "../../../assets/temp/$reference/";
    $upload = upload_files("gallery",$path,"images");

    if ( $upload && is_array($upload) )
    {
      foreach ($upload as $key => $value) {
        $_SESSION["temp_gallery"][$reference][] = $value;
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
