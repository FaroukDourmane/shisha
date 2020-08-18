<?php require_once("templates/header.php"); ?>
  <link rel="stylesheet" href="assets/css/product.css">

  <div class="product-container">
    <ul class="links">
      <li><a href="#"> Hookah supplies </a></li>
      <li>Kefo Kozalak Nargile Takımı</li>
    </ul>

    <div class="wrapper">
      <div class="product-infos">
        <div class="img"> <img src="assets/img/shisha.png" /> </div>
        <div class="text">
          <div class="share">
            <a href="#"> <img src="assets/svg/twitter-black.svg" /> </a>
            <a href="#"> <img src="assets/svg/facebook-black.svg" /> </a>
            <a href="#"> <img src="assets/svg/link.svg" /> </a>
          </div>

          <h1>Kefo Kozalak Nargile Takımı</h1>
          <h2>176,25 TL</h2>

          <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet</p>
        </div>
      </div>

      <div class="gallery-container">
        <p> <span>More pictures</span> </p>
        <div class="slider-container">
          <a href="#" class="button right"> <img src="assets/svg/left-arrow-black.svg" /> </a>
          <a href="#" class="button left"> <img src="assets/svg/left-arrow-black.svg" /> </a>

          <div class="slide">
            <img src="assets/img/shisha.png" />
            <img src="assets/img/shisha.png" />
            <img src="assets/img/shisha.png" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--END Right side--></div>
  <!-- END Top --></div>
  </div>

  <!-- Products -->
  <div class="products-container">

    <div class="content">

      <!-- Products wrapper -->
      <div class="products-section">
        <h5> <a href="#">Similar products</a> </h5>
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
<?php require_once("templates/footer.php"); ?>
