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

  if ( isset($_POST["action"]) && $_POST["action"] == "upload_gallery" && isset($_SESSION["product_id"]) )
  {
    $message = "";

    $id = $_SESSION["product_id"];

    $path = "../../../assets/products/$id/";
    $upload = upload_files("photo_gallery_edit",$path,"images");

    if ( $upload && is_array($upload) )
    {
      $inserted = array();

      foreach ($upload as $key => $value) {
        $sql_path = "assets/products/$id/$value";
        $insert_sql = $Q->query("INSERT INTO `product_gallery` (`product_id`,`image_path`) VALUES ('$id','$sql_path') ");

        if ($insert_sql)
        {
          $k = $Q->insert_id;
          $inserted[$k] = $value;
        }
      }

      $type = "success";
      $text = $inserted;
      $message = __("photos_added", true);
    }else{
      $type = "error";
      $text = "Upload error";
    }

    $response = [
      "type" => $type,
      "text" => $text,
      "message" => $message,
      "id" => $id
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }
?>
