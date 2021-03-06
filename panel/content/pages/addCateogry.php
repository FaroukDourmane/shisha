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
                            <a href="#categories" id="getAjaxPage" class="btn btn-secondary"> <?php __("back"); ?> <i class="mdi mdi-arrow-left"></i> </a>
                          </div>
                        </div>

                        <h4 class="mt-4 mb-4"><?php __("new_category"); ?></h4>
                        <form>

                          <div class="form-group row">
                            <label for="1" class="col-sm-3 col-form-label"><?php __("status"); ?></label>
                            <div class="col-sm-9">
                              <select class="custom-select categoryStatus" name="status">
                                <option value="1" selected> <?php __("active") ?> </option>
                                <option value="0"> <?php __("hidden") ?> </option>
                              </select>
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="1" class="col-sm-3 col-form-label"><?php __("image"); ?></label>
                            <div class="col-sm-9">
                              <div class="input-group mb-3">
                                <div class="custom-file">
                                  <input type="file" class="custom-file-input" name="categoryPhoto" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01">
                                  <label class="custom-file-label" for="inputGroupFile01"><?php __("choose_file"); ?></label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Title -->
                          <div class="form-group row">
                            <label for="1" class="col-sm-3 col-form-label"><?php __("title"); ?> (English)</label>
                            <div class="col-sm-9">
                              <input dir="ltr" type="text" class="form-control emptyInput name_en" id="1" placeholder="<?php __("enter_title"); ?>" required />
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="12" class="col-sm-3 col-form-label"><?php __("title"); ?> (العربية)</label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control emptyInput name_ar" id="12" placeholder="<?php __("enter_title"); ?>">
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="1234" class="col-sm-3 col-form-label"><?php __("title"); ?> (Türkçe)</label>
                            <div class="col-sm-9">
                              <input dir="ltr" type="text" class="form-control emptyInput name_tr" id="1234" placeholder="<?php __("enter_title"); ?>">
                            </div>
                          </div>

                          <button type="submit" id="addCategory" class="btn btn-success mr-2 addCategory"><?php __("add_category"); ?></button>
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
