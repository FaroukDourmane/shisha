<?php
require_once(__DIR__."/../config/config.php");
require_once(__DIR__."/config/sessions.php");
require_once(__DIR__."/config/".panel_lang_file());

  if ( admin_logged() )
  {
    redirect("content/");
  }else{
    redirect("login.php");
  }

  exit;
?>
