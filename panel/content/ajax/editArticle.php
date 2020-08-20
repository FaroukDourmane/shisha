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

  if ( isset($_POST["action"]) && $_POST["action"] == "editArticle" && isset($_SESSION["article_id"]) )
  {

    $title = mysqli_real_escape_string($Q, $_POST["title"]);
    $title_en = mysqli_real_escape_string($Q, $_POST["title_en"]);
    $title_tr = mysqli_real_escape_string($Q, $_POST["title_tr"]);

    $content = mysqli_real_escape_string($Q, $_POST["content"]);
    $contentEN = mysqli_real_escape_string($Q, $_POST["contentEN"]);
    $contentTR = mysqli_real_escape_string($Q, $_POST["contentTR"]);

    $keywords = mysqli_real_escape_string($Q, $_POST["keywords"]);
    $date = time();
    $id = intval($_SESSION["article_id"]);
    $type = "error";

    $query = $Q->query("SELECT * FROM `articles` WHERE `id`='$id' ");
    $fetch = $query->fetch_assoc();

    if ( !empty(trim($title)) && !empty(trim($content)) )
    {
      $path = "../../../assets/articles/$id/";
      $file = upload("file",$path,"images");

      $update = $Q->query("UPDATE `articles` SET `title`='$title',`title_en`='$title_en',`title_tr`='$title_tr',`keywords`='$keywords',`content`='$content',`content_en`='$contentEN',`content_tr`='$contentTR',`date`='$date' WHERE `id`='$id' ");

      if ( $update )
      {
        if ( $file )
        {
          $old_file = $fetch["cover"];
          delete_file("../../../".$old_file);

          $sql_path = "assets/articles/$id/".$file;
          $update = $Q->query("UPDATE `articles` SET `cover`='$sql_path' WHERE `id`='$id' ");
        }

        unset($_SESSION["article_id"]);
        $type = "success";
        $text = __("update_success",true);
      }else{
        $text = mysqli_error($Q);
      }
    }else{
      $text = __("missing_inputs",true);
    }
  }

  /*
  $path = "../../../assets/files/";
  $file = upload("file",$path,"pdf");
  $type = "error";

  if ( $file )
  {
    $old_file = $fetch["catalog"];
    $sql_path = "assets/files/".$file;
    $update = $Q->query("UPDATE `general` SET `catalog`='$sql_path' ");

    if ( $update ) {
      $old_file_src = "../../../".$old_file;
      delete_file($old_file_src);

      $type = "success";
      $text = __("update_success",true);
    }else{
      delete_file("../../../".$sql_path);
      $text = __("update_error",true);
    }
  }else{
    $text = __("upload_error",true);
  }
  */

  $response = [
    "type" => $type,
    "text" => $text
  ];

  $json_response = json_encode($response);
  echo $json_response;

?>
