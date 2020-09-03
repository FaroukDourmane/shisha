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

  if ( isset($_POST["action"]) && $_POST["action"] == "editProduct" && isset($_SESSION["product_id"]))
  {
    $id = intval($_SESSION["product_id"]);

    $check = $Q->query("SELECT * FROM `products` WHERE `id`='$id' ");

    if ( $check->num_rows <= 0 )
    {
      $text = __("product_not_found",true);
      $type = "error";

      $response = [
        "type" => $type,
        "text" => $text
      ];

      $json_response = json_encode($response);
      echo $json_response;
      exit;
    }

    /// DATA
    $category = intval($_POST["category"]);
    $status = intval($_POST["status"]);

    $name_en = mysqli_real_escape_string($Q, trim($_POST["name_en"]));
    $name_ar = mysqli_real_escape_string($Q, trim($_POST["name_ar"]));
    $name_tr = mysqli_real_escape_string($Q, trim($_POST["name_tr"]));

    $price_tl = intval($_POST["price_tl"]);
    $price_usd = intval($_POST["price_usd"]);
    $price_eur = intval($_POST["price_eur"]);

    $description = mysqli_real_escape_string($Q, trim($_POST["description"]));
    $keywords = strtolower(mysqli_real_escape_string($Q, trim($_POST["keywords"])));
    /// END DATA

    $date = time();

    if ( !empty(trim($name_en)) && $category !== 0 && !empty($description) )
    {
      $update = $Q->query(" UPDATE `products` SET `category`='$category', `name_en`='$name_en', `name_ar`='$name_ar', `name_tr`='$name_tr',
         `description`='$description', `price_tl`='$price_tl',
          `price_usd`='$price_usd', `price_eur`='$price_eur',
          `time`='$date',`keywords`='$keywords',
          `status`='$status'
          WHERE `id`='$id' ");

      if ( $update )
      {

        $path = "../../../assets/products/$id/";
        $sql_path = "assets/products/$id/";

        $cover = upload("cover",$path,"images");

        if ( $cover )
        {
          $fetch = $check->fetch_assoc();
          $old_path = "../../../".$fetch["cover"];

          $delete_cover = delete_file($old_path);

          $cover_path = $sql_path.$cover;
          $update_cover = $Q->query("UPDATE `products` SET `cover`='$cover_path' WHERE `id`='$id' ");
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
