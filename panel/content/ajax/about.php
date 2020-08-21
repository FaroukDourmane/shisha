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

  if ( isset($_POST["action"]) && $_POST["action"] == "generalAbout" )
  {
    $query = $Q->query("SELECT * FROM `about` ");
    $fetch = $query->fetch_assoc();

    $about = trim(mysqli_real_escape_string($Q, $_POST["about"]));
    $media_type = intval($_POST["media_type"]);
    $youtubeId = mysqli_real_escape_string($Q, $_POST["youtubeId"]);

    $path = "../../../assets/img/about/";
    $photo = upload("photo",$path,"images");

    $type = "error";

    $update = $Q->query("UPDATE `about` SET `text`='$about',`media_type`='$media_type',`video_id`='$youtubeId' ");

    if ( $update )
    {
      if ( $photo )
      {
        $old_photo = $fetch["photo"];
        if (!empty(trim($old_photo))){
          $old_path = "../../../".$old_photo;
          delete_file($old_path);
        }

        $sql_path = "assets/img/about/$photo";
        $update_photo = $Q->query("UPDATE `about` SET `photo`='$sql_path' ");
      }
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
