      <?php require_once("templates/header.php"); ?>

      <?php
      // #################################################
      // #################################################
      // CHECK ADMIN AUTH
      if ( !admin_logged() )
      {
      	$text = __("not_authorized",true);
      	$type = "error";

      	throwMessage($text, $type);
      	redirect("../login.php");
      	exit;
      }
      // END : CHECK ADMIN AUTH
      // #################################################
      // #################################################
      ?>

      <!--<link rel="stylesheet" href="../../assets/css/main_<?php //__("dir"); ?>.css">-->
      <link rel="stylesheet" href="../../assets/css/<?php __("css_file"); ?>.css">

      <?php if ( $_SESSION["CURRENT_PANEL_LANG"] == "AR" ) { ?>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700&display=swap" rel="stylesheet">
      <?php } ?>

      <div class="loadingContainer active"></div>

      <div class="push-notifications-container"></div>

      <div class="ajaxContainer"></div>

<?php require_once("templates/footer.php"); ?>
