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

  if ( isset($_POST["action"]) && $_POST["action"] == "upload_gallery" && isset($_SESSION["product_id"]) )
  {
    $id = ( isset($_POST["id"]) ) ? intval($_POST["id"]) : intval($_SESSION["product_id"]);
    $path = "../../../assets/products/$id/";

    $type = "error";
    $file = upload("gallery",$path,"images");

    if ($file)
    {
      $sql_path = "assets/products/$id/$file";
      $insert_gallery = $Q->query("INSERT INTO `product_gallery`
        (`product`, `path`)
          VALUES
        ('$id','$sql_path')");

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

  if ( isset($_POST["action"]) && $_POST["action"] == "editProduct" && isset($_SESSION["product_id"]) )
  {

    $category = intval($_POST["category"]);
    $name = mysqli_real_escape_string($Q, $_POST["name"]);
    $description = mysqli_real_escape_string($Q, $_POST["description"]);

    $price_tl = intval($_POST["price_tl"]);
    $price_usd = intval($_POST["price_usd"]);
    $weight = mysqli_real_escape_string($Q, $_POST["productWeight"]);

    $id = ( isset($_POST["id"]) ) ? intval($_POST["id"]) : intval($_SESSION["product_id"]);

    $query = $Q->query("SELECT * FROM `products` WHERE `id`='$id' ");
    if ( $query->num_rows > 0 )
    {
      $fetch = $query->fetch_assoc();
    }

    $date = time();

    $type = "error";

    if ( !empty(trim($name)) && $category !== 0 && !empty($description) )
    {
      $insert = $Q->query(" UPDATE `products` SET
      `category`='$category',
      `name`='$name',
      `price_tl`='$price_tl',
      `price_usd`='$price_usd',
      `weight`='$weight',
      `description`='$description',
      WHERE `id`='$id'
      ");

      if ( $insert )
      {
        $path = "../../../assets/products/$id/";
        $sql_path = "assets/products/$id/";

        $cover = upload("cover",$path,"images");

        if ( $cover )
        {
          $old_file = "../../../".$fetch["cover"];
          $cover_path = $sql_path.$cover;

          $update_cover = $Q->query("UPDATE `products` SET `cover`='$cover_path' WHERE `id`='$id' ");
          if ($update_cover)
          {
            delete_file($old_file);
          }
        }

        $type = "success";
        $text = __("update_success",true);
      }
    }else{
      $text = __("missing_inputs",true);
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
