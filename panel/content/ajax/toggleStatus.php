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

  // ########## DELETE MEDIA ####################
  if ( isset($_POST["action"]) && $_POST["action"] == "toggleStatus" && isset($_POST["item"]) && isset($_POST["id"]) )
  {
    $id = intval($_POST["id"]);
    $type = "error";
    $text = "";
    $process = "";

    switch ($_POST["item"]) {
      case 'product':
        $check = $Q->query("SELECT * FROM `products` WHERE `id`='$id' ");
        if ( $check->num_rows > 0 ) {
          $fetch = $check->fetch_assoc();

          if ( $fetch["status"] == 1 )
          {
            $update = $Q->query("UPDATE `products` SET `status`='0' WHERE `id`='$id' ");
            $type = "success";
            $text = __("product_hidden", true);
            $process = "hidden";
          }else{
            $update = $Q->query("UPDATE `products` SET `status`='1' WHERE `id`='$id' ");
            $type = "success";
            $text = __("product_activated", true);
            $process = "activated";
          }
        }else{
          $type = "error";
          $text = __("product_not_found", true);
        }
        break;

        case 'category':
          $check = $Q->query("SELECT * FROM `categories` WHERE `id`='$id' ");
          if ( $check->num_rows > 0 ) {
            $fetch = $check->fetch_assoc();

            if ( $fetch["status"] == 1 )
            {
              $update = $Q->query("UPDATE `categories` SET `status`='0' WHERE `id`='$id' ");
              $type = "success";
              $text = __("category_hidden", true);
              $process = "hidden";
            }else{
              $update = $Q->query("UPDATE `categories` SET `status`='1' WHERE `id`='$id' ");
              $type = "success";
              $text = __("category_activated", true);
              $process = "activated";
            }
          }else{
            $type = "error";
            $text = __("category_not_found", true);
          }
          break;
    }

    $response = [
      "type" => $type,
      "text" => $text,
      "process" => $process
    ];

    $json_response = json_encode($response);
    echo $json_response;
    exit;
  }
