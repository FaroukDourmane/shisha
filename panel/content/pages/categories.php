<?php
require_once(__DIR__."/../../../config/config.php");
require_once(__DIR__."/../../config/sessions.php");
require_once(__DIR__."/../../config/".panel_lang_file());

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

if ( isset($_SESSION["category_id"]) ) {
  unset($_SESSION["category_id"]);
}

$query = $Q->query("SELECT * FROM `categories` ORDER BY `id` DESC ");
?>

<div class="content-wrapper">

  <script src="https://kit.fontawesome.com/98e695973b.js" crossorigin="anonymous"></script>

      <!-- Product's statistics -->
          <div class="row page-title-header">
            <div class="col-12">
              <h1 style="text-align: <?php __('align'); ?>"> <?php __("categories"); ?> </h1>
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
                          <h5 class="mb-0 font-weight-medium text-primary"><?php __("active_category"); ?></h5>
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                      <div class="d-flex">
                        <div class="wrapper">
                          <h3 class="mb-0 font-weight-semibold">0</h3>
                          <h5 class="mb-0 font-weight-medium text-primary"><?php __("hidden_category"); ?></h5>
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

      <div class="col-12 grid-margin stretch-card">
        <a href="#addCategory" id="getAjaxPage" class="btn btn-success">
          <i class="mdi mdi-plus"></i>
          <?php __("add_category"); ?>
        </a>
      </div>

      <div class="col-lg-12 grid-margin stretch-card">

        <div class="card">
          <div class="card-body">

            <!-- Table -->
            <table class="table table-striped table-responsive">
              <thead>
                <tr>
                  <th> <?php __("name"); ?> </th>
                  <th> <?php __("name"); ?> (Arabic) </th>
                  <th> <?php __("name"); ?> (Turkish) </th>
                  <th> <?php __("products"); ?> </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>

                <?php if ( $query->num_rows > 0 ) { ?>
                  <?php
                    while ( $fetch = $query->fetch_assoc() ) {

                      $data_json = [ 'id' => $fetch["id"] ];
                      $data_json = json_encode($data_json);

                      $id = $fetch["id"];

                      $products = $Q->query("SELECT * FROM `products` WHERE `category`='$id' ");
                  ?>

                    <!-- Category -->
                    <tr class="deletable <?php echo $fetch["id"]; ?>">
                      <td class="py-1"> <?php echo ($fetch["status"] == 1) ? '<i class="circle active"></i>' : '<i class="circle disabled"></i>';  ?> <?php echo $fetch["name"]; ?> </td>
                      <td class="py-1"> <?php echo $fetch["name_ar"]; ?> </td>
                      <td class="py-1"> <?php echo $fetch["name_tr"]; ?> </td>
                      <td> <?php echo $products->num_rows; ?> </td>
                      <td>
                        <a href="#editCategory" id="getAjaxPage" data-json='<?php echo $data_json; ?>' class="btn btn-secondary"> <i class="fas fa-pen"></i> </a>
                        <a href="#" id="deleteCategory" data-id="<?php echo $fetch["id"]; ?>" class="btn btn-danger deleteItem"> <i class="fas fa-trash-alt"></i> </a>
                        <?php echo ($fetch["status"] == 1) ? '<a href="#" class="btn btn-outline-secondary"><i class="fas fa-eye-slash"></i></a>' : '<a href="#" class="btn btn-success"><i class="fas fa-eye"></i></a>';  ?>
                      </td>
                    </tr>

                  <?php } ?>
                <?php }else{ ?>
                  <tr>
                    <th colspan="5" class="py-4"><?php __("no_category"); ?></th>
                  </tr>
                <?php } ?>

              </tbody>
            </table>
            <!-- END : Table -->
            </div>
          </div>

        </div>
  </div>
</div>

<input type="hidden" name="hiddenKey" value="<?php echo $_SESSION["_TOKEN"]; ?>" />
