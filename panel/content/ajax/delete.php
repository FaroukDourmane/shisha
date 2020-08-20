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
  if ( isset($_POST["action"]) && $_POST["action"] == "deleteMedia" )
  {
    $id = intval($_POST["id"]);
    $type = "error";

    $delete = $Q->query("DELETE FROM `media` WHERE `id`='$id'");
    if ( $delete )
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


  // ##########################################################
  // ##### DELETE PRODUCT #####################################
  // ##########################################################
  if ( isset($_POST["action"]) && $_POST["action"] == "deleteProduct" )
  {
    $id = intval($_POST["id"]);
    $type = "error";

    $query = $Q->query("SELECT * FROM `products` WHERE `id`='$id' ");

    if ( $query->num_rows <= 0 ) {

    }

    $fetch = $query->fetch_assoc();

    $delete = $Q->query("DELETE FROM `products` WHERE `id`='$id'");

    if ($delete)
    {
      delete_file("../../../".$fetch["cover"]);

      $galleries = $Q->query("SELECT * FROM `product_gallery` WHERE `product`='$id' ");
      if ( $galleries->num_rows > 0 )
      {
        while ( $image = $galleries->fetch_assoc() )
        {
          delete_file("../../../".$image["path"]);
        }

        $delete_galleries = $Q->query("DELETE FROM `product_gallery` WHERE `product`='$id' ");
      }

      $type = "success";
      $text = __("update_success",true);
    }else{
      $text = mysqli_error($Q);
    }

    $response = [
      "type" => $type,
      "text" => $text
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }


  // ################ DELETE CATEGORY ###############

  if ( isset($_POST["action"]) && $_POST["action"] == "deleteCategory" )
  {
    $id = intval($_POST["id"]);
    $type = "error";

    $delete = $Q->query("DELETE FROM `categories` WHERE `id`='$id'");
    if ( $delete )
    {
      $delete_products = $Q->query("DELETE FROM `products` WHERE `category`='$id' ");

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

  if ( isset($_POST["action"]) && $_POST["action"] == "deleteSocial" )
  {
    $id = intval($_POST["id"]);
    $type = "error";

    $delete = $Q->query("DELETE FROM `social` WHERE `id`='$id' AND `deletable`='1' ");
    if ( $delete )
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

  if ( isset($_POST["action"]) && $_POST["action"] == "deleteArticle" )
  {
    $id = intval($_POST["id"]);
    $type = "error";

    $delete = $Q->query("DELETE FROM `articles` WHERE `id`='$id' ");
    if ( $delete )
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
