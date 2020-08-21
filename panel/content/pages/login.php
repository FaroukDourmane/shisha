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

$query = $Q->query("SELECT * FROM `panel` ");
$fetch = $query->fetch_assoc();
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
                        <h4 class="card-title"><?php __("change_email"); ?></h4>
                        <form class="forms-sample">
                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("email"); ?></label>
                            <div class="col-sm-9">
                              <input type="email" class="form-control panel_email" dir="ltr" value="<?php echo $fetch["email"]; ?>" placeholder="<?php __("enter_email"); ?>">
                            </div>
                          </div>
                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("password"); ?></label>
                            <div class="col-sm-9">
                              <input type="password" class="form-control panel_password emptyInput" id="exampleInputPassword2" placeholder="<?php __("password"); ?>">
                            </div>
                          </div>

                          <button type="submit" id="changeEmail" class="btn btn-success mr-2"><?php __("update_email"); ?></button>
                          <input type="reset" class="btn btn-light" value="<?php __("reset"); ?>" />
                        </form>
                      </div>
                    </div>
                  </div>
                  <!-- END Email change -->

                  <!-- Password change -->
                  <div class="col-12 stretch-card">
                    <div class="card">
                      <div class="card-body">
                        <h4 class="card-title"><?php __("change_passwrod"); ?></h4>
                        <form class="forms-sample">
                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("current_passwrod"); ?></label>
                            <div class="col-sm-9">
                              <input type="password" class="form-control emptyInput oldPass" id="exampleInputEmail2" placeholder="******">
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("new_passwrod"); ?></label>
                            <div class="col-sm-9">
                              <input type="password" class="form-control emptyInput newPass" id="exampleInputEmail2" placeholder="******">
                            </div>
                          </div>
                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("new_passwrod_confirmation"); ?></label>
                            <div class="col-sm-9">
                              <input type="password" class="form-control emptyInput confirmPass" id="exampleInputPassword2" placeholder="<?php __("re_type_new_password"); ?>">
                            </div>
                          </div>
                          <button type="submit" id="changePasswrod" class="btn btn-success mr-2"><?php __("update_password"); ?></button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <!-- END Password change -->
                </div>
              </div>
              <!-- END FORM -->
            </div>
          </div>
          <!-- content-wrapper ends -->
          <!-- partial:../../partials/_footer.html -->

<input type="hidden" name="hiddenKey" value="<?php echo $_SESSION["_TOKEN"]; ?>" />
