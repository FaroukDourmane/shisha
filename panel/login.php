<?php
  require_once(__DIR__."/../config/config.php");
  require_once(__DIR__."/config/sessions.php");
  require_once(__DIR__."/config/".panel_lang_file());

  if ( admin_logged() )
  {
    redirect("content/");
    exit;
  }
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title> <?php __("login"); ?> </title>
    <!-- plugins:css -->
    <link rel="stylesheet" href="admin/src/assets/vendors/iconfonts/mdi/css/materialdesignicons.min.css">
    <link rel="stylesheet" href="admin/src/assets/vendors/iconfonts/ionicons/css/ionicons.css">
    <link rel="stylesheet" href="admin/src/assets/vendors/iconfonts/typicons/src/font/typicons.css">
    <link rel="stylesheet" href="admin/src/assets/vendors/iconfonts/flag-icon-css/css/flag-icon.min.css">
    <link rel="stylesheet" href="admin/src/assets/vendors/css/vendor.bundle.base.css">
    <link rel="stylesheet" href="admin/src/assets/vendors/css/vendor.bundle.addons.css">
    <!-- endinject -->
    <!-- plugin css for this page -->
    <!-- End plugin css for this page -->
    <!-- inject:css -->
    <link rel="stylesheet" href="admin/src/assets/css/shared/style.css">
    <!-- endinject -->
    <link rel="shortcut icon" href="admin/src/assets/images/favicon.png" />

    <!-- Main style -->
    <link rel="stylesheet" type="text/css" href="../assets/css/customPanel-<?php __("dir"); ?>.css">

    <!-- Main style -->
    <link rel="stylesheet" type="text/css" href="../assets/css/panel_login.css">
  </head>

  <body>
    <div class="container-scroller">

      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="content-wrapper d-flex align-items-center auth auth-bg-1 theme-one">
          <div class="row w-100">
            <div class="col-lg-4 mx-auto">
              <div class="auto-form-wrapper">
                <div class="loadingContainer"></div>

                <div class="login-success" dir="<?php __("dir"); ?>">
                  <i class="mdi mdi-checkbox-marked-circle-outline"></i>
                  <?php __("login_success"); ?>
                  <span> <?php __("redirecting_you"); ?> </span>
                </div>

                <form class="loginForm" action="#">
                  <?php showMessage(); ?>

                  <div class="row mb-5">
                    <div class="col-12">
                      <a href="../index.php" class="btn btn-secondary">
                        <i class="mdi mdi-arrow-left"></i>
                        <?php __("home"); ?>
                      </a>
                    </div>
                  </div>

                  <div class="form-group text-center">
                    <label class="label"><?php __("email"); ?></label>
                      <input type="email" name="panel_email" class="form-control" placeholder="example@email.com" required />
                  </div>
                  <div class="form-group text-center">
                    <label class="label"><?php __("password"); ?></label>
                      <input type="password" name="panel_pass" class="form-control" placeholder="*********" required />
                  </div>
                  <div class="form-group">
                    <button class="btn btn-primary submit-btn btn-block"><?php __("login"); ?></button>
                  </div>
                </form>
              </div>
              <p class="footer-text text-center">All rights reserved.</p>
            </div>
          </div>
        </div>
        <!-- content-wrapper ends -->
      </div>
      <!-- page-body-wrapper ends -->
    </div>
    <!-- container-scroller -->
    <!-- plugins:js -->
    <script src="admin/src/assets/vendors/js/vendor.bundle.base.js"></script>
    <script src="admin/src/assets/vendors/js/vendor.bundle.addons.js"></script>
    <!-- endinject -->
    <!-- inject:js -->
    <script src="admin/src/assets/js/shared/off-canvas.js"></script>
    <script src="admin/src/assets/js/shared/misc.js"></script>
    <!-- endinject -->

    <!-- Panel Login -->
    <script src="../assets/js/panel-login.js"></script>
    <!-- End login -->
  </body>
</html>
