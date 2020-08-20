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

  if ( isset($_POST["action"]) && $_POST["action"] == "insertArticle" )
  {

    $title = mysqli_real_escape_string($Q, $_POST["title"]);
    $title_en = mysqli_real_escape_string($Q, $_POST["title_en"]);
    $title_tr = mysqli_real_escape_string($Q, $_POST["title_tr"]);

    $content = mysqli_real_escape_string($Q, $_POST["content"]);
    $contentEN = mysqli_real_escape_string($Q, $_POST["contentEN"]);
    $contentTR = mysqli_real_escape_string($Q, $_POST["contentTR"]);

    $keywords = mysqli_real_escape_string($Q, $_POST["keywords"]);
    $date = time();

    $type = "error";

    if ( !empty(trim($title)) && !empty(trim($content)) )
    {
      $insert = $Q->query("INSERT INTO `articles` (`title`,`title_en`,`title_tr`,`keywords`,`content`,`content_en`,`content_tr`,`date`) VALUES ('$title','$title_en','$title_tr','$keywords','$content','$contentEN','$contentTR','$date') ");

      if ( $insert )
      {
        $last_id = $Q->insert_id;
        $path = "../../../assets/articles/$last_id/";
        $file = upload("file",$path,"images");

        if ( $file )
        {
          $sql_path = "assets/articles/$last_id/".$file;
          $update = $Q->query("UPDATE `articles` SET `cover`='$sql_path' WHERE `id`='$last_id' ");

          if ( $update ) {
            $type = "success";
            $text = __("update_success",true);
          }else{
            delete_file("../../../".$sql_path);
            $text = __("update_error",true);
          }
        }else{
          $delete = $Q->query("DELETE FROM `articles` WHERE `id`='$last_id' ");
          $text = __("upload_error",true);
        }
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
