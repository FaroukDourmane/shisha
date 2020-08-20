<?php
  require_once(__DIR__."/../../../config/config.php");
  require_once(__DIR__."/../../config/sessions.php");
  deny_self(basename(__FILE__));

  require_once(__DIR__."/../../config/".panel_lang_file());

  if ( $_SESSION["CURRENT_PANEL_LANG"] == "AR" )
  {
    $current_lang_link = '
    <a class="nav-link dropdown-toggle px-2 d-flex align-items-center" id="LanguageDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
      <div class="d-inline-flex mr-0 mr-md-3">
        <div class="flag-icon-holder">
          <i class="flag-icon flag-icon-ae"></i>
        </div>
      </div>
      <span class="profile-text font-weight-medium d-none d-md-block">العربية</span>
    </a>';
  } else if ( $_SESSION["CURRENT_PANEL_LANG"] == "EN" )
  {
    $current_lang_link = '
    <a class="nav-link dropdown-toggle px-2 d-flex align-items-center" id="LanguageDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
      <div class="d-inline-flex mr-0 mr-md-3">
        <div class="flag-icon-holder">
          <i class="flag-icon flag-icon-us"></i>
        </div>
      </div>
      <span class="profile-text font-weight-medium d-none d-md-block">English</span>
    </a>';
  }

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Radar - Dashboard</title>
    <!-- plugins:css -->
    <link rel="stylesheet" href="../admin/src/assets/vendors/iconfonts/mdi/css/materialdesignicons.min.css">
    <link rel="stylesheet" href="../admin/src/assets/vendors/iconfonts/ionicons/css/ionicons.css">
    <link rel="stylesheet" href="../admin/src/assets/vendors/iconfonts/typicons/src/font/typicons.css">
    <link rel="stylesheet" href="../admin/src/assets/vendors/iconfonts/flag-icon-css/css/flag-icon.min.css">
    <link rel="stylesheet" href="../admin/src/assets/vendors/css/vendor.bundle.base.css">
    <link rel="stylesheet" href="../admin/src/assets/vendors/css/vendor.bundle.addons.css">
    <!-- endinject -->
    <!-- plugin css for this page -->
    <!-- End plugin css for this page -->
    <!-- inject:css -->
    <link rel="stylesheet" href="../admin/src/assets/css/shared/style.css">
    <!-- endinject -->
    <!-- Layout styles -->
    <link rel="stylesheet" href="../admin/src/assets/css/demo_1/style.css">
    <!-- End Layout styles -->
    <link rel="shortcut icon" href="../admin/src/assets/images/favicon.png" />
  </head>
  <body>
    <div class="container-scroller">
      <!-- partial:partials/_navbar.html -->
      <nav class="navbar default-layout col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
        <div class="text-center navbar-brand-wrapper d-flex align-items-top justify-content-center">
          <a class="navbar-brand brand-logo pt-4" href="../content">
            <?php __("dashboard"); ?>
          </a>

          <button class="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
            <span class="mdi mdi-menu"></span>
          </button>
        </div>
        <div class="navbar-menu-wrapper d-flex align-items-center">
          <ul class="navbar-nav">
            <li class="nav-item dropdown language-dropdown">

              <?php echo $current_lang_link; ?>

              <div class="dropdown-menu dropdown-menu-left navbar-dropdown py-2" aria-labelledby="LanguageDropdown">
                <a href="?l=en" class="dropdown-item">
                  <div class="flag-icon-holder">
                    <i class="flag-icon flag-icon-us"></i>
                  </div>English
                </a>
                <a href="?l=ar" class="dropdown-item">
                  <div class="flag-icon-holder">
                    <i class="flag-icon flag-icon-ae"></i>
                  </div>العربية
                </a>
              </div>
            </li>
          </ul>

          <ul class="navbar-nav logout-nav">
            <li class="nav-item">
              <a class="nav-link" href="?log=out">
                <i class="mdi mdi-logout"></i>
                <?php __("logout"); ?>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <!-- partial -->
      <div class="container-fluid page-body-wrapper">
        <!-- partial:partials/_sidebar.html -->
        <nav class="sidebar sidebar-offcanvas pt-5" id="sidebar">
          <ul class="nav">

            <!-- Statistics -->
            <li class="nav-item">
              <a class="nav-link" id="getAjaxPage" href="#dashboard">
                <i class="menu-icon typcn typcn-document-text"></i>
                <span class="menu-title"><?php __("statistics"); ?></span>
              </a>
            </li>
            <!-- END Statistics -->

            <!-- General -->
            <li class="nav-item">
              <a class="nav-link " data-toggle="collapse" href="#general-settings" aria-expanded="false" aria-controls="ui-basic">
                <i class="menu-icon typcn typcn-coffee"></i>
                <span class="menu-title"><?php __("general_settings"); ?></span>
                <i class="menu-arrow"></i>
              </a>
              <div class="collapse" id="general-settings">
                <ul class="nav flex-column sub-menu">
                  <li class="nav-item">
                    <a class="nav-link" id="getAjaxPage" href="#login"><?php __("login_informations"); ?></a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" id="getAjaxPage" href="#slideshow"><?php __("slideshow"); ?></a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" id="getAjaxPage" href="#contact"><?php __("contact"); ?></a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" id="getAjaxPage" href="#social"><?php __("social_media"); ?></a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" id="getAjaxPage" href="#about"><?php __("about_us"); ?></a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" id="getAjaxPage" href="#catalog"><?php __("catalog"); ?></a>
                  </li>
                </ul>
              </div>
            </li>
            <!-- END General -->

            <!-- Requests -->
            <li class="nav-item">
              <a class="nav-link" id="getAjaxPage" href="#companies">
                <i class="menu-icon typcn typcn-document-text"></i>
                <span class="menu-title"><?php __("companies"); ?></span>
              </a>
            </li>
            <!-- END Requests -->

            <!-- Requests -->
            <li class="nav-item">
              <a class="nav-link" id="getAjaxPage" href="#categories">
                <i class="menu-icon typcn typcn-document-text"></i>
                <span class="menu-title"><?php __("categories"); ?></span>
              </a>
            </li>
            <!-- END Requests -->

            <!-- Blog -->
            <li class="nav-item">
              <a class="nav-link" data-toggle="collapse" href="#blog-settings" aria-expanded="false" aria-controls="ui-basic">
                <i class="menu-icon typcn typcn-coffee"></i>
                <span class="menu-title"><?php __("blog"); ?></span>
                <i class="menu-arrow"></i>
              </a>
              <div class="collapse" id="blog-settings">
                <ul class="nav flex-column sub-menu">
                  <li class="nav-item">
                    <a class="nav-link" id="getAjaxPage" href="#newarticle"><?php __("new_article"); ?></a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" id="getAjaxPage" href="#articles"><?php __("view_articles"); ?></a>
                  </li>
                </ul>
              </div>
            </li>
            <!-- END Blog -->

          </ul>
        </nav>

<!-- partial -->
<div class="main-panel">
  <div class="content-wrapper">
