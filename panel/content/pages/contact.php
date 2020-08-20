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

//$query = $Q->query("SELECT * FROM `contact` ");
//$fetch = $qery->fetch_assoc();
?>
          <div class="content-wrapper">
            <div class="row">

              <!-- FORM -->
              <div class="col-10 d-flex align-items-stretch grid-margin">
                <div class="row flex-grow">
                  <!-- Email change -->
                  <div class="col-12 stretch-card">
                    <div class="card">
                      <div class="card-body">
                        <h4 class="card-title"><?php __("contact_informations"); ?></h4>
                        <form class="forms-sample">
                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("contact_email"); ?></label>
                            <div class="col-sm-9">
                              <input type="email" class="form-control contactEmail" id="exampleInputEmail2" value="<?php //echo $fetch["email"]; ?>" placeholder="<?php __("enter_email"); ?>">
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("whatsapp"); ?></label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control contactPhone" id="exampleInputPassword2" value="<?php //echo $fetch["phone"]; ?>" placeholder="Ex:+900000000000">
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("phone"); ?></label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control contactPhone" id="exampleInputPassword2" value="<?php //echo $fetch["phone"]; ?>" placeholder="Ex:+900000000000">
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("cellphone"); ?></label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control contactCellphone" id="exampleInputPassword2" value="<?php //echo $fetch["cellphone"]; ?>" placeholder="Ex:+900000000000">
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("address"); ?></label>
                            <div class="col-sm-9">
                              <textarea class="form-control contactAddress" id="exampleInputPassword2"> <?php //echo $fetch["address"]; ?> </textarea>
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("map_code"); ?></label>
                            <div class="col-sm-9">
                              <textarea class="form-control contactAddress" id="exampleInputPassword2"> <?php //echo $fetch["address"]; ?> </textarea>
                              <a href="https://support.google.com/maps/answer/144361?co=GENIE.Platform%3DDesktop&hl=<?php __("lang_suffix"); ?>" target="_blank"><?php __("how_to_google_map"); ?></a>
                            </div>
                          </div>
                          <button type="submit" id="changeContact" class="btn btn-success mr-2"><?php __("update_informations"); ?></button>
                          <input type="reset" value="<?php __("reset"); ?>" class="btn btn-light" />
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
