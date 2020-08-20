<?php
/*
     /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
    |         DESIGNED & DEVELOPED        |
    |                                     |
    |                 BY                  |
    |                                     |
    |   F A R O U K _ D O  U R  M A  N E  |
    |                                     |
    |       dourmanefarouk@gmail.com      |
    |                                     |
    \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
*/

require_once(__DIR__."/../../config/functions/main.php");
deny_self(basename(__FILE__));

$av_panel_lang = ["EN","AR"];


// Default Languange
if( !defined("DEFAULT_PANEL_LANG") ){
  DEFINE("DEFAULT_PANEL_LANG","EN"); // Change AR for arabic
}

if (isset($_GET["l"])){

  $actual_link = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

  // Final Link Redirect
  if(strpos($actual_link,"&l") !== false){
    $remove_extra = explode('&l', $actual_link, 2);
    $final_link = $remove_extra[0];
  }else if(strpos($actual_link,"?l") !== false){
    $remove_extra = explode('?l', $actual_link, 2);
    $final_link = $remove_extra[0];
  }else{
    $final_link = $actual_link;
  }

  switch ($_GET["l"]) {
    case 'ar':
      $_SESSION["CURRENT_PANEL_LANG"] = "AR";
      redirect("$final_link");
      //header("Location: ".$final_link."");
      break;

    case 'en':
      $_SESSION["CURRENT_PANEL_LANG"] = "EN";
      redirect("$final_link");
      //header("Location: ".$final_link."");
      break;

    default:
      // code...
      break;
  }
}

if( !isset($_SESSION["CURRENT_PANEL_LANG"]) ){
  $_SESSION["CURRENT_PANEL_LANG"] = DEFAULT_PANEL_LANG;
}

if ( isset($_GET["log"]) && $_GET["log"] == "out" )
{
  if ( admin_logged() )
  {
    $email = strtolower(mysqli_real_escape_string($Q,$_SESSION["panel_email"]));
    $session_id = session_id();
    $delete = $Q->query("DELETE FROM `session` WHERE `email`='$email' AND `session_id`='$session_id' ");
    session_destroy();
    redirect("../login.php");
    exit;
  }else{
    redirect("../content");
  }

}

$LANG = array();
?>
