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

  require_once(__DIR__."/sessions.php");
  require_once(__DIR__."/functions/main.php");
  deny_self(basename(__FILE__));

  require_once(__DIR__."/connection.php");
  //DEFINE("assets", "/radargrup/assets");

  require_once(lang_file());

  $lang_suffix = __("lang_prefix",true);
  #####################################################
  ## GENERATE TOKEN FOR USERS                        ##
  ##############################################     ##
  if ( !isset($_SESSION["_TOKEN"]) )          ##     ##
  {                                           ##     ##
    $_SESSION["_TOKEN"] = generateToken();    ##     ##
  }                                           ##     ##
  ##############################################     ##
  ## END                                             ##
  #####################################################
?>
