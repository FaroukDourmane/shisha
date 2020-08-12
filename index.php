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
    <div class="landing-container">
      <div class="top">
        <div class="left-side">
          <div class="logo">
            <img src="assets/svg/logo2.svg" />
          </div>

          <ul>
            <li> <a href="#"> <img src="assets/svg/home.svg" /> Home </a> </li>
            <li> <a href="#"> <img src="assets/svg/hookah.svg" /> Products </a> </li>
            <li> <a href="#"> <img src="assets/svg/question.svg" /> Who we are </a> </li>
            <li> <a href="#"> <img src="assets/svg/contact.svg" /> Contact us </a> </li>
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
        </div>
      </div>

      <div class="content">
        <div class="slide-container">
          <div class="wrapper">
            <div class="item">
              <div class="informations">
                <span>Kefo Kozalak Nargile Takımı</span>
                <h5>176,25 TL</h5>
              </div>
              <img src="assets/img/shisha.png" alt="Kefo Kozalak Nargile Takımı" />
            </div>
          </div>
          <div class="buttons">
            <a href="#" class="right"> <img src="assets/svg/right-chevron.svg" /> </a>
            <a href="#" class="left"> <img src="assets/svg/left-chevron.svg" /> </a>
          </div>
        </div>

        <div class="text">
          <h1>Smoke with legacy</h1>
          <p> <b>NaraJammo</b>, we provide the best</p>
        </div>
      </div>
    </div>
    <!-- END Landing container -->

    <!-- Our story -->
    <div class="story-container">
      <h1> <b>O</b>ur story</h1>
      <p>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
      </p>

      <a href="#" class="products-btn">
        <img src="assets/svg/hookah.svg" /> Our products
        <div class="extra-lines"></div>
      </a>
    </div>
    <!-- END Our story -->

    <!-- Products -->
    <div class="products-container">
      <div class="menu">
        <ul>
          <li> <a href="#"> Hookah supplies </a> </li>
          <li> <a href="#"> Lances </a> </li>
          <li> <a href="#"> Bottles </a> </li>
          <li> <a href="#"> Steel hookah sets </a> </li>
          <li> <a href="#"> Spare parts </a> </li>
          <li> <a href="#"> Full hookah sets </a> </li>
        </ul>
      </div>

      <div class="content">
        <!-- Slide -->
        <div class="slide-container">
          <a href="#" class="slide right"><img src="assets/svg/right-chevron-black.svg" /></a>
          <a href="#" class="slide left"><img src="assets/svg/left-chevron-black.svg" /></a>

          <div class="wrapper">
            <div class="item">
              <div class="image">
                <img src="assets/img/shisha.png" alt="Kefo Kozalak Nargile Takımı" />
              </div>
              <div class="text">
                <h1>Kefo Kozalak Nargile Takımı</h1>
                <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet</p>
                <h5>176,25 TL</h5>
                <div class="button">
                  <a href="#" class="buy"> View item </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END Slide -->

        <!-- Products wrapper -->
        <div class="products-section">
          <h5> <a href="#">Hookah supplies</a> </h5>
          <div class="wrapper">
            <?php for ($i=0; $i < 8; $i++) { ?>
            <div class="product">
              <img src="assets/img/shisha.png" alt="Kefo Kozalak Nargile Takımı" />
              <h6>Kefo Kozalak Nargile Takımı</h6>
              <h6 class="price">176,25 TL</h6>
              <div class="visit-btn">
                <a href="#"> <img src="assets/svg/right-arrow.svg" /> </a>
              </div>
            </div>
            <?php } ?>
          </div>
        </div>
        <!-- END Products wrapper -->

        <!-- Products wrapper -->
        <div class="products-section">
          <h5> <a href="#">Tutun</a> </h5>
          <div class="wrapper">
            <?php for ($i=0; $i < 8; $i++) { ?>
            <div class="product">
              <img src="assets/img/shisha.png" alt="Kefo Kozalak Nargile Takımı" />
              <h6>Kefo Kozalak Nargile Takımı</h6>
              <h6 class="price">176,25 TL</h6>
              <div class="visit-btn">
                <a href="#"> <img src="assets/svg/right-arrow.svg" /> </a>
              </div>
            </div>
            <?php } ?>
          </div>
        </div>
        <!-- END Products wrapper -->
      </div>
    </div>
    <!-- END Products -->


    <!-- Footer -->
    <div class="footer-container">
      <div class="wrapper">
        <div class="side">
          <ul>
            <li> <a href="#"> Home </a> </li>
            <li> <a href="#"> Products </a> </li>
            <li> <a href="#"> Who we are </a> </li>
            <li> <a href="#"> Contact us </a> </li>
          </ul>
        </div>

        <div class="side">
          <ul>
            <li> <a href="#"> Hookah supplies </a> </li>
            <li> <a href="#"> Lances </a> </li>
            <li> <a href="#"> Bottles </a> </li>
            <li> <a href="#"> Steel hookah sets </a> </li>
            <li> <a href="#"> Spare parts </a> </li>
            <li> <a href="#"> Full hookah sets </a> </li>
          </ul>
        </div>

        <div class="side">
          <h5>Contact us</h5>
          <p>email@email.com</p>
          <p>0552 000 000 00</p>
          <p>01 Street 520 New York City, USA</p>
          <a href="#" class="whatsapp-btn"> <img src="assets/svg/whatsapp.svg" alt=""> Call us on whatsapp </a>
        </div>

        <div class="side">
          <form class="" action="" method="post">
            <input type="text" name="" value="" placeholder="Your name" required/>
            <input type="email" name="" value="" placeholder="Your email" required/>
            <textarea name="name" placeholder="Write a message" required></textarea>

            <label>
              <input type="submit" name="" value="" />
              <a> <img src="assets/svg/right-arrow-black.svg" alt=""> </a>
            </label>
          </form>
        </div>
      </div>

      <div class="copyrights">
        <div class="rights">All rights reserved</div>
        <div class="social">
          <a href="#"> <img src="assets/svg/facebook.svg" /> </a>
          <a href="#"> <img src="assets/svg/instagram.svg" /> </a>
        </div>
      </div>
    </div>
    <!-- END Footer -->
  </body>

  <footer>
    <script type="text/javascript" src="assets/js/jquery.min.js"></script>
    <script type="text/javascript" src="assets/js/main.js"></script>
  </footer>
</html>
