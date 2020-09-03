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

$categories_q = $Q->query("SELECT * FROM `categories` ORDER BY `id` DESC ");

  if ( $categories_q->num_rows <= 0 )
    {
      $text = __("no_category",true);
      $type = "error";

      throwMessage($text, $type);
      redirect("#products");
      exit;
    }

  if ( !isset($_SESSION["reference"]) )
  {
    $_SESSION["reference"] = generateReference();
  }

  $reference = $_SESSION["reference"];

  if ( !isset($_SESSION["temp_gallery"]) )
  {
     $_SESSION["temp_gallery"][$reference] = array();
  }

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

                        <h4 class="mt-4 mb-4"><?php __("new_product"); ?></h4>
                          <div class="form-group row">
                            <label  class="col-sm-3 col-form-label"><?php __("category"); ?></label>
                            <div class="col-sm-9">
                              <select class="custom-select category" name="category">
                                <?php if ( $categories_q->num_rows > 0 ) { ?>
                                  <?php while ( $category = $categories_q->fetch_assoc() ) { ?>
                                    <option value="<?php echo $category["id"]; ?>"><?php echo $category["name_en"]; ?></option>
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
                                <option value="1" selected> <?php __("active") ?> </option>
                                <option value="0"> <?php __("hidden") ?> </option>
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
                              </div>
                            </div>
                          </div>

                          <hr />

                          <!-- Title -->
                          <div class="form-group row">
                            <label  class="col-sm-3 col-form-label"><?php __("product_name"); ?> (English)</label>
                            <div class="col-sm-9">
                              <input dir="ltr" type="text" class="form-control emptyInput name_en" id="100" placeholder="<?php __("enter_title"); ?>" required />
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="12" class="col-sm-3 col-form-label"><?php __("product_name"); ?> (العربية)</label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control emptyInput name_ar" id="12" placeholder="<?php __("enter_title"); ?>">
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="1234" class="col-sm-3 col-form-label"><?php __("product_name"); ?> (Türkçe)</label>
                            <div class="col-sm-9">
                              <input dir="ltr" type="text" class="form-control emptyInput name_tr" id="1234" placeholder="<?php __("enter_title"); ?>">
                            </div>
                          </div>

                          <hr />

                          <div class="form-group row">
                            <label  class="col-sm-3 col-form-label"><?php __("price"); ?> (USD)</label>
                            <div class="col-sm-9">
                              <input dir="ltr" type="number" class="form-control emptyInput price_usd" id="1" required />
                            </div>
                          </div>

                          <div class="form-group row">
                            <label  class="col-sm-3 col-form-label"><?php __("price"); ?> (EURO)</label>
                            <div class="col-sm-9">
                              <input dir="ltr" type="number" class="form-control emptyInput price_eur" id="1" required />
                            </div>
                          </div>

                          <div class="form-group row">
                            <label  class="col-sm-3 col-form-label"><?php __("price"); ?> (TL)</label>
                            <div class="col-sm-9">
                              <input dir="ltr" type="number" class="form-control emptyInput price_tl" id="1" required />
                            </div>
                          </div>

                          <hr />

                          <div class="form-group row">
                            <label  class="col-sm-3 col-form-label"><?php __("product_description"); ?></label>
                            <div class="col-sm-9">
                              <div class="input-group mb-3">
                                <textarea name="product_description" class="form-control product_description" rows="8" cols="80"></textarea>
                              </div>
                            </div>
                          </div>

                          <hr />

                          <div class="form-group row">
                            <label  class="col-sm-3 col-form-label"><?php __("keywords"); ?></label>
                            <div class="col-sm-9">
                              <div class="input-group mb-3">
                                <input dir="ltr" type="text" class="form-control emptyInput keywords" id="1" required />
                              </div>
                            </div>
                          </div>

                          <hr />

                          <div class="form-group row">
                            <div class="col-sm-12 upload-wrapper">
                              <div class="loadingContainer"></div>
                              <form action="" method="post">
                                <label class="upload-container">
                                  <input type="file" name="photo_gallery[]" multiple style="display:none;" />
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
                            <?php if (isset($_SESSION["temp_gallery"][$reference])) { ?>
                              <?php foreach ($_SESSION["temp_gallery"][$reference] as $key => $value) { ?>
                                <div class="item" id="<?php echo $key; ?>" style="background-image:url('../../assets/temp/<?php echo $reference; ?>/<?php echo $value; ?>');">
                                  <a class="delete">X</a>
                                </div>
                              <?php } ?>
                            <?php } ?>
                          </div>

                          <a href="#" id="addProduct" class="btn btn-success mr-2 insertProduct"><?php __("add"); ?></a>
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
