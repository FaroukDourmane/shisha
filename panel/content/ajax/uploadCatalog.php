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

  $query = $Q->query("SELECT * FROM `general` ");
  $fetch = $query->fetch_assoc();

  $path = "../../../assets/files/";
  $file = upload("file",$path,"pdf");
  $type = "error";

  if ( $file )
  {
    $old_file = $fetch["catalog"];
    $sql_path = "assets/files/".$file;
    $update = $Q->query("UPDATE `about` SET `catalog`='$sql_path' ");

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

  $response = [
    "type" => $type,
    "text" => $text
  ];

  $json_response = json_encode($response);
  echo $json_response;

?>
