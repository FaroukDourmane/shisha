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

  $type = "error";

  if ( isset($_POST["action"]) && $_POST["action"] == "upload_slideshow" )
  {
    $path = "../../../assets/slides/";

    $type = "error";
    $file = upload("gallery",$path,"images");

    if ($file)
    {
      $sql_path = "assets/slides/$file";
      $insert_gallery = $Q->query("INSERT INTO `slideshow` (`path`) VALUES ('$sql_path') ");

        if ( $insert_gallery )
        {
          $id = $Q->insert_id;
          $type = "success";
          $text = $sql_path;
        }
    }else{
      $text = __("upload_error",true);
    }

    $response = [
      "type" => $type,
      "text" => $text,
      "id" => $id
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }

?>
