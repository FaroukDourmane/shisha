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
                      <td class="py-1"> <?php echo $fetch["name"]; ?> </td>
                      <td class="py-1"> <?php echo $fetch["name_ar"]; ?> </td>
                      <td class="py-1"> <?php echo $fetch["name_tr"]; ?> </td>
                      <td> <?php echo $products->num_rows; ?> </td>
                      <td>
                        <a href="#editCategory" id="getAjaxPage" data-json='<?php echo $data_json; ?>' class="btn btn-secondary"> <?php __("edit"); ?> </a>
                        <a href="#" id="deleteCategory" data-id="<?php echo $fetch["id"]; ?>" class="btn btn-danger deleteItem"> <?php __("delete"); ?> </a>
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
