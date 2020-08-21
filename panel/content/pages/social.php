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

$query = $Q->query("SELECT * FROM `general` ");
$fetch = $query->fetch_assoc();
?>
<!--===============================================================================================-->
<link rel="stylesheet" type="text/css" href="../../assets/fonts/font-awesome-4.7.0/css/font-awesome.min.css">

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
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("facebook"); ?></label>
                  <div class="col-sm-9">
                    <input type="url" class="form-control socialFacebook" value="<?php echo $fetch["facebook"]; ?>" placeholder="https://facebook.com/YourAccount">
                  </div>
                </div>

                <div class="form-group row">
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("twitter"); ?></label>
                  <div class="col-sm-9">
                    <input type="url" class="form-control socialTwitter" value="<?php echo $fetch["twitter"]; ?>" placeholder="https://twitter.com/YourAccount">
                  </div>
                </div>

                <div class="form-group row">
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("instagram"); ?></label>
                  <div class="col-sm-9">
                    <input type="url" class="form-control socialInstagram" value="<?php echo $fetch["instagram"]; ?>" placeholder="https://instagram.com/YourAccount">
                  </div>
                </div>

                <div class="form-group row">
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("snapchat"); ?></label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control socialSnapchat" value="<?php echo $fetch["snapchat"]; ?>" placeholder="<?php __("username"); ?>">
                  </div>
                </div>

                <button type="submit" id="ediSocial" class="btn btn-success mr-2"><?php __("update_informations"); ?></button>
                <input type="reset" class="btn btn-light" value="<?php __("reset"); ?>" />
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

<input type="hidden" name="hiddenKey" value="<?php echo $_SESSION["_TOKEN"]; ?>" />
