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
?>
<!--<link rel="stylesheet" type="text/css" href="../../assets/fonts/font-awesome-4.7.0/css/font-awesome.min.css">-->
<script src="https://kit.fontawesome.com/98e695973b.js" crossorigin="anonymous"></script>

    <!-- Product's statistics -->
        <div class="row page-title-header">
          <div class="col-12">
            <h1 style="text-align: <?php __('align'); ?>"> <?php __("products"); ?> </h1>
          </div>
        </div>

        <?php showMessage(); ?>

        <!-- Page Title Header Ends-->
        <div class="row">
          <div class="col-md-3 grid-margin">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold">0</h3>
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
                        <h3 class="mb-0 font-weight-semibold">0</h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("active_products"); ?></h5>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold">0</h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("hidden_products"); ?></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END Product's statistics -->

        <div class="row">
          <div class="col-md-8">
            <div class="row">

              <div class="col-md-12 grid-margin">
                <div class="card">
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th><?php __("product_name"); ?></th>
                            <th><?php __("category"); ?></th>
                            <th><?php __("registration_date"); ?></th>
                            <th><?php __("options"); ?></th>
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
                            <td>
                              <a href="#" class="btn btn-danger"> <i class="fas fa-trash-alt"></i> </a>
                              <a href="#" class="btn btn-primary"> <i class="fas fa-pen"></i> </a>
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


<input type="hidden" name="hiddenKey" value="<?php echo $_SESSION["_TOKEN"]; ?>" />
