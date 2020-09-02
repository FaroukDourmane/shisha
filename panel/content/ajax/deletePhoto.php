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

  if ( isset($_POST["action"]) && $_POST["action"] == "deletePhoto" && isset($_SESSION["reference"]) && isset($_POST["id"]) )
  {
    $id = intval($_POST["id"]);
    $reference = $_SESSION["reference"];
    //$path = "../../../assets/temp/$reference/";
    //$upload = upload_files("photo_gallery",$path,"images");

    if ( isset($_SESSION["temp_gallery"][$reference][$id]) )
    {
      $filename = $_SESSION["temp_gallery"][$reference][$id];
      $file_path = "../../../assets/temp/$reference/$filename";
      if ( delete_file($file_path) )
      {
        unset($_SESSION["temp_gallery"][$reference][$id]);
        $type = "success";
        $text = __("photo_deleted", true);
      }else{
        $type = "error";
        $text = __("photo_not_deleted", true);
      }
    }else{
      $type = "error";
      $text = __("photo_not_found", true);
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
