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


if ( !isset($_REQUEST["id"]) && !isset($_SESSION["product_id"]) )
{
  $text = __("product_not_found",true);
  $type = "error";

  throwMessage($text, $type);
  redirect("../content/#products");
  exit;
}

$id = ( isset($_REQUEST["id"]) ) ? intval($_REQUEST["id"]) : intval($_SESSION["product_id"]);
$query = $Q->query("SELECT * FROM `products` WHERE `id`='$id' ");

if ( $query->num_rows <= 0 ) {
  $text = __("product_not_found",true);
  $type = "error";

  throwMessage($text, $type);
  redirect("../content/#products");
  exit;
}

$_SESSION["product_id"] = $id;
$fetch = $query->fetch_assoc();

$gallery_q = $Q->query("SELECT * FROM `product_gallery` WHERE `product_id`='$id' ");
$categories_q = $Q->query("SELECT * FROM `categories` ORDER BY `id` DESC ");
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

              <div class="row">
                <div class="col-12">
                  <a href="#products" id="getAjaxPage" class="btn btn-secondary"> <?php __("back"); ?> <i class="mdi mdi-arrow-left"></i> </a>
                </div>
              </div>

              <h4 class="mt-4 mb-4"><?php //__("new_product"); ?></h4>
                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("category"); ?></label>
                  <div class="col-sm-9">
                    <select class="custom-select category" name="category">
                      <?php if ( $categories_q->num_rows > 0 ) { ?>
                        <?php while ( $category = $categories_q->fetch_assoc() ) { ?>
                          <option value="<?php echo $category["id"]; ?>" <?php echo ($fetch["category"] == $category["id"]) ? "selected" : ""; ?>><?php echo $category["name_en"]; ?></option>
                        <?php } ?>
                      <?php } ?>
                    </select>
                  </div>
                </div>

                <hr />

                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("status"); ?></label>
                  <div class="col-sm-9">
                    <select class="custom-select productStatus" name="status">
                      <option value="1" <?php echo ($fetch["status"] == 1) ? "selected" : ""; ?>> <?php __("active") ?> </option>
                      <option value="0" <?php echo ($fetch["status"] == 0) ? "selected" : ""; ?>> <?php __("hidden") ?> </option>
                    </select>
                  </div>
                </div>

                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("cover_picture"); ?></label>
                  <div class="col-sm-9">
                    <div class="input-group mb-3">
                      <div class="custom-file">
                        <input type="file" class="custom-file-input" name="coverFile" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01">
                        <label class="custom-file-label" for="inputGroupFile01"><?php __("choose_file"); ?></label>
                      </div>
                      <img width="150px" class="ml-2 mr-2" src="../../<?php echo $fetch["cover"]; ?>" alt="">
                    </div>
                  </div>
                </div>

                <hr />

                <!-- Title -->
                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("product_name"); ?> (English)</label>
                  <div class="col-sm-9">
                    <input dir="ltr" type="text" class="form-control emptyInput name_en" id="100" value="<?php echo $fetch["name_en"]; ?>" placeholder="<?php __("enter_title"); ?>" required />
                  </div>
                </div>

                <div class="form-group row">
                  <label for="12" class="col-sm-3 col-form-label"><?php __("product_name"); ?> (العربية)</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control emptyInput name_ar" value="<?php echo $fetch["name_ar"]; ?>" id="12" placeholder="<?php __("enter_title"); ?>">
                  </div>
                </div>

                <div class="form-group row">
                  <label for="1234" class="col-sm-3 col-form-label"><?php __("product_name"); ?> (Türkçe)</label>
                  <div class="col-sm-9">
                    <input dir="ltr" type="text" class="form-control emptyInput name_tr" value="<?php echo $fetch["name_tr"]; ?>" id="1234" placeholder="<?php __("enter_title"); ?>">
                  </div>
                </div>

                <hr />

                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("price"); ?> (USD)</label>
                  <div class="col-sm-9">
                    <input dir="ltr" type="number" class="form-control emptyInput price_usd" value="<?php echo $fetch["price_usd"]; ?>" id="1" required />
                  </div>
                </div>

                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("price"); ?> (EURO)</label>
                  <div class="col-sm-9">
                    <input dir="ltr" type="number" class="form-control emptyInput price_eur" value="<?php echo $fetch["price_eur"]; ?>" id="1" required />
                  </div>
                </div>

                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("price"); ?> (TL)</label>
                  <div class="col-sm-9">
                    <input dir="ltr" type="number" class="form-control emptyInput price_tl" value="<?php echo $fetch["price_tl"]; ?>" id="1" required />
                  </div>
                </div>

                <hr />

                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("product_description"); ?></label>
                  <div class="col-sm-9">
                    <div class="input-group mb-3">
                      <textarea name="product_description" class="form-control product_description" rows="8" cols="80"><?php echo $fetch["description"]; ?></textarea>
                    </div>
                  </div>
                </div>

                <hr />

                <div class="form-group row">
                  <label  class="col-sm-3 col-form-label"><?php __("keywords"); ?></label>
                  <div class="col-sm-9">
                    <div class="input-group mb-3">
                      <input dir="ltr" type="text" class="form-control emptyInput keywords" value="<?php echo $fetch["keywords"]; ?>" id="1" required />
                    </div>
                  </div>
                </div>

                <hr />

                <div class="form-group row">
                  <div class="col-sm-12 upload-wrapper">
                    <div class="loadingContainer"></div>
                    <form action="" method="post">
                      <label class="upload-container">
                        <input type="file" name="photo_gallery_edit[]" multiple style="display:none;" />
                        <div style="line-height: normal;display:inline-block;">
                          <a> <?php __("add_to_gallery"); ?> </a>
                          <!-- <p style="color:#555;">dsdsd</p> -->
                        </div>
                      </label>
                      <input type="hidden" name="action" value="upload_gallery" />
                    </form>
                  </div>
                </div>

                <div class="gallery-container">
                  <?php if ( $gallery_q->num_rows > 0 ) { ?>
                    <?php while ( $gallery = $gallery_q->fetch_assoc() ) { ?>
                      <div class="item" id="<?php echo $gallery["id"]; ?>" style="background-image:url('../../<?php echo $gallery['image_path']; ?>');">
                        <a class="delete sql">X</a>
                      </div>
                    <?php } ?>
                  <?php } ?>
                </div>

                <a href="#" id="editProduct" class="btn btn-success mr-2 editProduct"><?php __("edit"); ?></a>
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
