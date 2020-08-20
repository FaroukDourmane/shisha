<?php
  require_once(__DIR__."/../config/config.php");
  deny_self(basename(__FILE__));
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nara Jammo - hookah store</title>
    <link rel="icon" href="assets/img/logo.ico"/>
    <link rel="stylesheet" href="assets/css/main.css">

  </head>

  <body>
    <!-- Landing container -->
    <div class="landing-container" style="<?php echo (isset($landing_bg)) ? $landing_bg : ""; ?>">
      <div class="top">
        <div class="left-side">
          <div class="logo">
            <img src="assets/svg/logo2.svg" />
          </div>

          <ul>
            <li> <a href="index.php"> <img src="assets/svg/home.svg" /> Home </a> </li>
            <li> <a href="products.php"> <img src="assets/svg/hookah.svg" /> Products </a> </li>
            <li> <a href="about.php"> <img src="assets/svg/question.svg" /> Who we are </a> </li>
            <li> <a href="contact.php"> <img src="assets/svg/contact.svg" /> Contact us </a> </li>
          </ul>
        </div>

        <div class="right-side">
          <div class="top-menu">
            <ul class="list">
              <li><a>+000 000 000 00</a></li>
              <li><a href="#"> <img src="assets/svg/facebook.svg" /> </a></li>
              <li><a href="#"> <img src="assets/svg/instagram.svg" /> </a></li>
              <li><a href="#"> <img src="assets/svg/twitter.svg" /> </a></li>
            </ul>

            <ul class="lang">
              <ul>
                <li class="main">
                  <a href="#" class="main">EN</a>
                  <!-- <ul>
                    <li> <a href="#"> TR </a> </li>
                    <li> <a href="#"> AR </a> </li>
                  </ul> -->
                </li>
              </ul>
            </ul>
          </div>
