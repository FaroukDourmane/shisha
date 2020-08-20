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

$query = $Q->query("SELECT * FROM `social` ");
?>
<!--===============================================================================================-->
<link rel="stylesheet" type="text/css" href="../../assets/fonts/font-awesome-4.7.0/css/font-awesome.min.css">

<div class="content-wrapper">
  <div class="row">

      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">

            <div class="col-12">
              <a href="#addsocial" id="getAjaxPage" class="btn btn-success">
                <i class="mdi mdi-plus"></i>
                <?php __("add"); ?> </a>
            </div>

            <!-- Table -->
            <table class="table table-striped table-responsive">
              <thead>
                <tr>
                  <th> <?php __("name"); ?> </th>
                  <th> <?php __("icon"); ?> </th>
                  <th> <?php __("link"); ?> </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>

                <?php while ( $fetch = $query->fetch_assoc() ) { ?>
                  <!-- Message -->
                  <tr class="deletable <?php echo $fetch["id"]; ?>">
                    <td class="py-1"> <?php echo $fetch["name"]; ?> </td>
                    <td> <?php echo $fetch["icon"]; ?> </td>
                    <td> <?php echo $fetch["url"]; ?> </td>
                    <td>
                      <a href="#" class="btn btn-success"> <?php __("edit"); ?> </a>
                      <?php if ( $fetch["deletable"] ): ?>
                        <a href="#" class="btn btn-danger deleteItem" id="deleteSocial" data-id="<?php echo $fetch["id"]; ?>"> <?php __("delete"); ?> </a>
                      <?php endif; ?>
                    </td>
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
