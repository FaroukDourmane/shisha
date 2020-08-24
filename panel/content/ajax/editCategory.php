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

  if ( isset($_POST["action"]) && $_POST["action"] == "editCategory" )
  {
    $id = intval($_SESSION["category_id"]);
    $type = "error";

    $name_en = trim(mysqli_real_escape_string($Q, $_POST["name_en"]));
    $name_ar = trim(mysqli_real_escape_string($Q, $_POST["name_ar"]));
    $name_tr = trim(mysqli_real_escape_string($Q, $_POST["name_tr"]));
    $status = intval($_POST["status"]);

    $query = $Q->query("SELECT * FROM `categories` WHERE `id`='$id' ");
    $fetch = $query->fetch_assoc();

    if ( $query->num_rows > 0 )
    {
      $path = "../../../assets/categories/$id/";
      $photo = upload("photo",$path,"images");

      $edit = $Q->query("UPDATE `categories` SET `name_en`='$name_en',`name_tr`='$name_tr',`name_ar`='$name_ar',`status`='$status' WHERE `id`='$id' ");
        if ( $edit )
        {
          if ( $photo )
          {
            if (!empty(trim($fetch["image_path"])))
            {
              delete_file("../../../".$fetch["image_path"]);
            }
            $sql_path = "assets/categories/$id/$photo";
            $update_photo = $Q->query("UPDATE `categories` SET `image_path`='$sql_path' WHERE `id`='$id' ");
          }

          $type = "success";
          $text = __("update_success",true);
        }else {
          $text = mysqli_error($Q);
        }

    }else{
      $type = "error";
      $text = __("not_authorized",true);
    }

    $response = [
      "type" => $type,
      "text" => $text
    ];

    $json_response = json_encode($response);
    echo $json_response;
  }
?>
