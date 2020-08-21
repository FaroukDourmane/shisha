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
  require_once(__DIR__."/functions/main.php");
  deny_self(basename(__FILE__));

  /*
  $HOST = "localhost";
  $USERNAME = "faroukdev_faroukdev";
  $PASS = ")1x#05i6tvx2";
  $DATABASE = "faroukdev_portfolio";
  */

  $HOST = "localhost";
  $USERNAME = "root";
  $PASS = "";
  $DATABASE = "shisha";

  $Q = new mysqli("$HOST", "$USERNAME", "$PASS", "$DATABASE");

  if( $Q->connect_errno ){
    die("ERROR : <b> <p> ".$Q->connect_error."</p></b></h1>");
  }

  $Q->set_charset("utf8");

  /*
  header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
  header("Cache-Control: post-check=0, pre-check=0", false);
  header("Pragma: no-cache");
  */

  // Redirect HTTPS
  /*
  if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") {
        $location = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        header('HTTP/1.1 301 Moved Permanently');
        header('Location: ' . $location);
        exit;
    }
  */


  //delete_expired_sessions();
  //updateSession();
?>
