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

  if ( isset($_POST["action"]) && $_POST["action"] == "upload_gallery" )
  {
    $id = intval($_POST["id"]);

    $path = "../../../assets/products/$id/";


    $file = upload("gallery",$path,"images");

    if ($file)
    {
      $sql_path = "assets/products/$id/$file";

      $insert_gallery = $Q->query("INSERT INTO `product_gallery`
        (`product`, `path`)
          VALUES
        ('$id','$sql_path')");
    }
  }

  if ( isset($_POST["action"]) && $_POST["action"] == "insertArticle" )
  {

    $category = intval($_POST["category"]);
    $name = mysqli_real_escape_string($Q, $_POST["name"]);
    $description = mysqli_real_escape_string($Q, $_POST["description"]);

    $price_tl = intval($_POST["price_tl"]);
    $price_usd = intval($_POST["price_usd"]);
    $weight = mysqli_real_escape_string($Q, $_POST["productWeight"]);

    $id = 0;

    $date = time();

    $type = "error";

    if ( !empty(trim($name)) && $category !== 0 && !empty($description) )
    {
      $insert = $Q->query(" INSERT INTO `products`
      (`category`, `name`, `product_description`, `price_tl`, `price_usd`, `weight`,`time`)
        VALUES
      ('$category','$name', '$description','$price_tl','$price_usd','$weight', '$date')
      ");

      if ( $insert )
      {
        $last_id = $Q->insert_id;
        $path = "../../../assets/products/$last_id/";
        $sql_path = "assets/products/$last_id/";

        $cover = upload("cover",$path,"images");

        if ( $cover )
        {
          $cover_path = $sql_path.$cover;
          $update_cover = $Q->query("UPDATE `products` SET `cover`='$cover_path' WHERE `id`='$last_id' ");
        }

        $type = "success";
        $text = __("update_success",true);
        $id = $last_id;
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
