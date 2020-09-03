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

  if ( isset($_POST["action"]) && $_POST["action"] == "insertArticle" && isset($_SESSION["reference"]) )
  {

    $reference = $_SESSION["reference"];

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

    $id = 0;
    $date = time();
    $type = "error";

    if ( !empty(trim($name_en)) && $category !== 0 && !empty($description) )
    {
      $insert = $Q->query(" INSERT INTO `products`
      (`category`, `name_en`, `name_ar`, `name_tr`, `description`, `price_tl`, `price_usd`, `price_eur`,`time`,`keywords`,`status`)
        VALUES
      ('$category','$name_en','$name_ar','$name_tr', '$description','$price_tl','$price_usd','$price_eur', '$date','$keywords','$status')
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

        if (isset($_SESSION["temp_gallery"][$reference])) {
          foreach ($_SESSION["temp_gallery"][$reference] as $key => $value) {
            $filepath = "../../../assets/temp/$reference/$value";
            $newpath = "../../../assets/products/$last_id/$value";
            if ( rename($filepath, $newpath) ) {
              $sqlpath = "assets/products/$last_id/$value";
              $insert_gallery = $Q->query("INSERT INTO `product_gallery` (`product_id`,`image_path`) VALUES ('$last_id','$sqlpath') ");
            }
          }
        }

        $type = "success";
        $text = __("update_success",true);
        $id = $last_id;

        unset($_SESSION["temp_gallery"]);
        unset($_SESSION["reference"]);
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
