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

  if ( isset($_POST["action"]) && $_POST["action"] == "deletePhoto" && isset($_SESSION["product_id"]) && isset($_POST["id"]) )
  {
    $photo_id = intval($_POST["id"]);
    $product_id = intval($_SESSION["product_id"]);

    $check = $Q->query("SELECT * FROM `product_gallery` WHERE `product_id`='$product_id' AND `id`='$photo_id' ");
    if ($check->num_rows > 0)
    {
      $fetch = $check->fetch_assoc();
      $path = $fetch["image_path"];
      $fullpath = "../../../$path";

      if ( delete_file($fullpath) )
      {
        $delete = $Q->query("DELETE FROM `product_gallery` WHERE `product_id`='$product_id' AND `id`='$photo_id' ");

        if ( $delete )
        {
          $type = "success";
          $text = __("photo_deleted", true);
        }else{
          $type = "error";
          $text = __("photo_not_deleted", true);
        }

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
      "id" => $photo_id
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }
?>
