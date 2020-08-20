<?php require_once("templates/header.php"); ?>
  <link rel="stylesheet" href="assets/css/products.css">
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
      <!-- <div class="slide-container">
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
      </div> -->
      <!-- END Slide -->

      <h1> Hookah supplies </h1>

      <!-- Products wrapper -->
      <div class="products-section">
        <div class="wrapper">
          <?php for ($i=0; $i < 8; $i++) { ?>
          <div class="product">
            <a href="#" class="link"></a>
            <img src="assets/img/shisha.png" alt="Kefo Kozalak Nargile Takımı" />
            <h6>Kefo Kozalak Nargile Takımı</h6>
            <h6 class="price">176,25 TL</h6>
            <div class="visit-btn">
              <a href="#"> <img src="assets/svg/right-arrow.svg" /> </a>
            </div>
          </div>
          <?php } ?>
        </div>

        <div class="pagination-container">
          <a href="#" class="active">1</a>
          <a href="#">2</a>
          <a href="#">3</a>
        </div>
      </div>
      <!-- END Products wrapper -->
    </div>
  </div>
  <!-- END Products -->

  <!--END Right side--></div>
  <!-- END Top --></div>
  </div>
<!-- <script defer src="https://maps.googleapis.com/maps/api/js?v=weekly&key=AIzaSyD4BziyBqse3rS1VZMSg5LmZf9gJU44feg&callback=initMap"></script> -->
<?php require_once("templates/footer.php"); ?>
