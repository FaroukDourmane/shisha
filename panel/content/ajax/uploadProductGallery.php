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

  if ( isset($_POST["action"]) && $_POST["action"] == "upload_gallery" && isset($_SESSION["reference"]) )
  {

    $reference = $_SESSION["reference"];
    $path = "../../../assets/temp/$reference/";
    $upload = upload_files("photo_gallery",$path,"images");

    if ( $upload && is_array($upload) )
    {
      $inserted = array();

      foreach ($upload as $key => $value) {
        $_SESSION["temp_gallery"][$reference][] = $value;
        end($_SESSION["temp_gallery"][$reference]);
        $k = key($_SESSION["temp_gallery"][$reference]);
        $inserted[$k] = $value;
      }

      $type = "success";
      $text = $inserted;
    }else{
      $type = "error";
      $text = "Upload error";
    }

    $response = [
      "type" => $type,
      "text" => $text,
      "reference" => $reference
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }
?>
