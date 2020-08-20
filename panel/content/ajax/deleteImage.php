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

if ( isset($_POST["action"]) && $_POST["action"] == "deleteImage" )
{
  $id = intval($_POST["id"]);
  $query = $Q->query("SELECT * FROM `product_gallery` WHERE `id`='$id' ");
  if ( $query->num_rows > 0 )
  {
    $fetch = $query->fetch_assoc();

    $delete = $Q->query("DELETE FROM `product_gallery` WHERE `id`='$id' ");
    $type = 'error';

    if ( $delete )
    {
      $delete_file = delete_file("../../../".$fetch["path"]);
      $type = "success";
      $text = __("update_success",true);
    }else{
      $text = mysqli_error($Q);
    }
  }else{
    $text = __("image_not_found", true);
  }

  $response = [
    "type" => $type,
    "text" => $text
  ];

  $json_response = json_encode($response);
  echo $json_response;
}
?>
