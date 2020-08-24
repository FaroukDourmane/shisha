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


if ( !isset($_REQUEST["id"]) && !isset($_SESSION["category_id"]) )
{
  $text = __("category_not_found",true);
  $type = "error";

  throwMessage($text, $type);
  redirect("../content/#categories");
  exit;
}

$id = ( isset($_REQUEST["id"]) ) ? intval($_REQUEST["id"]) : intval($_SESSION["category_id"]);
$query = $Q->query("SELECT * FROM `categories` WHERE `id`='$id' ");

if ( $query->num_rows <= 0 ) {
  $text = __("no_category",true);
  $type = "error";

  throwMessage($text, $type);
  redirect("../content/#categories");
  exit;
}

$_SESSION["category_id"] = $id;
$fetch = $query->fetch_assoc();
?>

<div class="content-wrapper">
  <div class="row">

    <!-- FORM -->
    <div class="col-12 d-flex align-items-stretch grid-margin">
      <div class="row flex-grow">
        <!-- Email change -->
        <div class="col-12 stretch-card">

          <div class="card">
            <div class="card-body">

              <div class="row mb-5">
                <div class="col-12">
                  <a href="#categories" id="getAjaxPage" class="btn btn-secondary"> <?php __("back"); ?> <i class="mdi mdi-arrow-left"></i> </a>
                </div>
              </div>

              <form>

                <div class="form-group row">
                  <label for="1" class="col-sm-3 col-form-label"><?php __("status"); ?></label>
                  <div class="col-sm-9">
                    <select class="custom-select categoryStatus" name="status">
                      <option value="1" <?php echo ($fetch["status"] == 1) ? "selected" : ""; ?>> <?php __("active") ?> </option>
                      <option value="0" <?php echo ($fetch["status"] == 0) ? "selected" : ""; ?>> <?php __("hidden") ?> </option>
                    </select>
                  </div>
                </div>

                <div class="form-group row">
                  <label for="1" class="col-sm-3 col-form-label"><?php __("image"); ?></label>

                  <div class="col-sm-7">
                    <div class="input-group mb-3">
                      <div class="custom-file">
                        <input type="file" class="custom-file-input" name="categoryPhoto" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01">
                        <label class="custom-file-label" for="inputGroupFile01"><?php __("choose_file"); ?></label>
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-2">
                    <img src="../../<?php echo $fetch["image_path"]; ?>" width="100px" />
                  </div>
                </div>

                <!-- Title -->
                <div class="form-group row">
                  <label for="1" class="col-sm-3 col-form-label"><?php __("title"); ?> (English)</label>
                  <div class="col-sm-9">
                    <input dir="ltr" type="text" class="form-control emptyInput name_en" value="<?php echo $fetch["name_en"]; ?>" id="1" placeholder="<?php __("enter_title"); ?>" required />
                  </div>
                </div>

                <div class="form-group row">
                  <label for="12" class="col-sm-3 col-form-label"><?php __("title"); ?> (العربية)</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control emptyInput name_ar" value="<?php echo $fetch["name_ar"]; ?>" id="12" placeholder="<?php __("enter_title"); ?>">
                  </div>
                </div>

                <div class="form-group row">
                  <label for="1234" class="col-sm-3 col-form-label"><?php __("title"); ?> (Türkçe)</label>
                  <div class="col-sm-9">
                    <input dir="ltr" type="text" class="form-control emptyInput name_tr" value="<?php echo $fetch["name_tr"]; ?>" id="1234" placeholder="<?php __("enter_title"); ?>">
                  </div>
                </div>

                <button type="submit" id="editCategory" class="btn btn-success mr-2 editCategory"><?php __("edit"); ?></button>
              </form>
            </div>
          </div>
        </div>
        <!-- END Email change -->
      </div>
    </div>
    <!-- END FORM -->
  </div>
</div>
<!-- content-wrapper ends -->
<!-- partial:../../partials/_footer.html -->

<input type="hidden" name="hiddenKey" value="<?php echo $_SESSION["_TOKEN"]; ?>" />
