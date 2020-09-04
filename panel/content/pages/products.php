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

  $products_q = $Q->query("SELECT * FROM `products` ");

  $products_active_q =   $Q->query("SELECT COUNT(*) FROM `products` WHERE `status`='1' ");
  $products_hidden_q =   $Q->query("SELECT COUNT(*) FROM `products` WHERE `status`='0' ");

  $products_active = $products_active_q->fetch_assoc();
  $products_hidden = $products_hidden_q->fetch_assoc();

  if ( isset($_SESSION["product_id"]) ) {
    unset($_SESSION["product_id"]);
  }
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
                        <h3 class="mb-0 font-weight-semibold"><?php echo $products_active["COUNT(*)"]; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("active_products"); ?></h5>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                    <div class="d-flex">
                      <div class="wrapper">
                        <h3 class="mb-0 font-weight-semibold"><?php echo $products_hidden["COUNT(*)"]; ?></h3>
                        <h5 class="mb-0 font-weight-medium text-primary"><?php __("hidden_products"); ?></h5>
                      </div>
                    </div>
                  </div>

                  <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                    <div class="d-flex">
                      <div class="wrapper">
                        <a href="#newProduct" id="getAjaxPage" class="btn btn-success">
                          <h3 class="mb-0 font-weight-semibold"><?php __("new_product"); ?></h3>
                        </a>
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

                    <form class="form-inline mb-5 p-1 pl-3 pr-3" style="background:#f9f9f9;direction:<?php __('dir'); ?>;border-radius:10px;">
                      <label class="my-1 mr-2" for="inlineFormCustomSelectPref"><?php __("category"); ?></label>
                      <select class="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                        <option selected><?php __("all"); ?></option>
                        <option value="1">Category 1</option>
                        <option value="2">Category 2</option>
                        <option value="3">Category 3</option>
                      </select>

                      <label class="my-1 mr-2" for="inlineFormCustomSelectPref"><?php __("status"); ?></label>
                      <select class="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                        <option selected><?php __("all"); ?></option>
                        <option value="1"><?php __("active"); ?></option>
                        <option value="1"><?php __("hidden"); ?></option>
                      </select>

                      <button type="submit" class="btn btn-primary mr-3 ml-3"><?php __("search"); ?></button>
                    </form>


                    <div class="table-responsive">
                      <table class="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th><?php __("product_name"); ?></th>
                            <th><?php __("category"); ?></th>
                            <th> <a href="#"><?php __("registration_date"); ?> <i class="fas fa-sort"></i></a> </th>
                            <th><?php __("options"); ?></th>
                          </tr>
                        </thead>
                        <tbody>
                        <?php
                        $lang_suffix = __("lang_suffix", true);

                        if ( $products_q->num_rows > 0 )
                        {
                          while ( $product = $products_q->fetch_assoc() ) {
                            $status = ($product["status"] == 1) ? "active" : "disabled";
                            $data_json = [ 'id' => $product["id"] ];
                            $data_json = json_encode($data_json);
                        ?>
                          <tr class="deletable <?php echo $product['id']; ?>">
                            <td> <i class="circle <?php echo $status; ?>"></i> <a> <?php echo $product["name_en"]; ?> </a> </td>
                            <td><?php echo get_category($product["category"], "name_en") ?></td>
                            <td><?php __("since"); echo " ".date_difference($product["time"]); ?></td>
                            <td>
                              <a href="#" class="btn btn-danger deleteItem" id="deleteProduct" data-id="<?php echo $product["id"]; ?>"> <i class="fas fa-trash-alt"></i> </a>
                              <a href="#editProduct" id="getAjaxPage" data-json='<?php echo $data_json; ?>' class="btn btn-primary"> <i class="fas fa-pen"></i> </a>
                              <?php echo ($product["status"] == 1) ? '<a href="#" id="'.$product["id"].'" class="btn btn-outline-secondary toggleProductStatus" data-toggle="tooltip" data-placement="bottom" title="'.__("hide_product", true).'"><i class="fas fa-eye-slash"></i></a>' : '<a href="#" id="'.$product["id"].'" data-toggle="tooltip" data-placement="bottom" title="'.__("activate_product", true).'" class="btn btn-success toggleProductStatus"><i class="fas fa-eye"></i></a>';  ?>
                            </td>
                          </tr>
                        <?php }}else{ ?>
                          <tr>
                            <td colspan="4"><?php __("no_products"); ?></td>
                          </tr>
                        <?php } ?>
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
