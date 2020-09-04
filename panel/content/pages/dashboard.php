<?php
require_once(__DIR__."/../../../config/config.php");
require_once(__DIR__."/../../config/sessions.php");
require_once(__DIR__."/../../config/".panel_lang_file());

//$query = $Q->query("SELECT * FROM `general` ");
//$fetch = $query->fetch_assoc();

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


// CATEGORIES
$categories_q = $Q->query("SELECT * FROM `categories` ORDER BY `id` ");
$active_categories_q = $Q->query("SELECT COUNT(*) FROM `categories` WHERE `status`='1' ");
$hidden_categories_q = $Q->query("SELECT COUNT(*) FROM `categories` WHERE `status`='0' ");

$active_categories = $active_categories_q->fetch_assoc();
$hidden_categories = $hidden_categories_q->fetch_assoc();
// END CATEGORIES

// PRODUCTS
$products_q = $Q->query("SELECT * FROM `products` ORDER BY `id` ");
$active_products_q = $Q->query("SELECT COUNT(*) FROM `products` WHERE `status`='1' ");
$hidden_products_q = $Q->query("SELECT COUNT(*) FROM `products` WHERE `status`='0' ");

$active_products = $active_products_q->fetch_assoc();
$hidden_products = $hidden_products_q->fetch_assoc();
// END PRODUCTS

// BLOG
$blog_q = $Q->query("SELECT * FROM `articles` ORDER BY `id` ");
$active_blog_q = $Q->query("SELECT COUNT(*) FROM `articles` WHERE `status`='1' ");
$hidden_blog_q = $Q->query("SELECT COUNT(*) FROM `articles` WHERE `status`='0' ");

$active_blog = $active_blog_q->fetch_assoc();
$hidden_blog = $hidden_blog_q->fetch_assoc();
// END BLOG
?>

        <div class="row page-title-header">
          <!-- <div class="col-md-12">
            <div class="page-header-toolbar">
              <div class="sort-wrapper">
                <button type="button" class="btn btn-primary toolbar-item">New</button>
              </div>
            </div>
          </div> -->

          <div class="col-12">
            <h1 style="text-align: <?php __('align'); ?>"> <?php __("products"); ?> </h1>
          </div>
        </div>

        <!-- Page Title Header Ends-->

        <div class="row">
          <div class="col-md-3 grid-margin">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $products_q->num_rows; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("total"); ?></h5>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div class="col-md-9 grid-margin">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-lg-4 col-md-6">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $active_products["COUNT(*)"]; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("active_products"); ?></h5>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $hidden_products["COUNT(*)"]; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("hidden_products"); ?></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CATEGORIES -->
        <div class="row page-title-header">
          <!-- <div class="col-md-12">
            <div class="page-header-toolbar">
              <div class="sort-wrapper">
                <button type="button" class="btn btn-primary toolbar-item">New</button>
              </div>
            </div>
          </div> -->

          <div class="col-12">
            <h1 style="text-align: <?php __('align'); ?>"> <?php __("categories"); ?> </h1>
          </div>
        </div>

        <div class="row">
          <div class="col-md-3 grid-margin">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $categories_q->num_rows; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("total"); ?></h5>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div class="col-md-9 grid-margin">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-lg-4 col-md-6">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $active_categories["COUNT(*)"]; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("active_category"); ?></h5>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $hidden_categories["COUNT(*)"]; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("hidden_category"); ?></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        <!-- BLOG -->
        <div class="row page-title-header">
          <!-- <div class="col-md-12">
            <div class="page-header-toolbar">
              <div class="sort-wrapper">
                <button type="button" class="btn btn-primary toolbar-item">New</button>
              </div>
            </div>
          </div> -->

          <div class="col-12">
            <h1 style="text-align: <?php __('align'); ?>"> <?php __("blog"); ?> </h1>
          </div>
        </div>

        <div class="row">
          <div class="col-md-3 grid-margin">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $blog_q->num_rows; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("total"); ?></h5>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div class="col-md-9 grid-margin">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-lg-4 col-md-6">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $active_blog["COUNT(*)"]; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("active_articles"); ?></h5>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $hidden_blog["COUNT(*)"]; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("hidden_articles"); ?></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

  <!-- <div class="row">
    <div class="col-md-8">
      <div class="row">

        <div class="col-md-12 grid-margin">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <h4 class="card-title mb-0"><?php __("latest_added_products"); ?></h4>
                <a id="getAjaxPage" href="#products" ><small><?php __("all_products"); ?></small></a>
              </div>
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th><?php __("product_name"); ?></th>
                      <th><?php __("category"); ?></th>
                      <th><?php __("registration_date"); ?></th>
                    </tr>
                  </thead>
                  <tbody>
                  <?php
                  $lang_suffix = __("lang_suffix", true);
                  ?>
                    <tr>
                      <td> <a target="_blank" href="#"> Product name </a> </td>
                      <td><?php //echo category($company["category"], "name_$lang_suffix"); ?> Category name</td>
                      <td><?php __("since"); //echo " ".date_difference($company["added_date"]); ?> 10 minutes</td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div> -->


<input type="hidden" name="hiddenKey" value="<?php echo $_SESSION["_TOKEN"]; ?>" />
