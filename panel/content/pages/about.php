<?php
require_once(__DIR__."/../../../config/config.php");
require_once(__DIR__."/../../config/sessions.php");
require_once(__DIR__."/../../config/".panel_lang_file());

//$query = $Q->query("SELECT * FROM `about` ");
//$fetch = $query->fetch_assoc();

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
    <!-- include libraries(jQuery, bootstrap) -->
    <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.16/dist/summernote.min.css" rel="stylesheet">

          <div class="content-wrapper">
            <div class="row">

              <!-- FORM -->
              <div class="col-10 d-flex align-items-stretch grid-margin">
                <div class="row flex-grow">
                  <!-- Who we are -->
                  <div class="col-12 stretch-card">
                    <div class="card">
                      <div class="card-body" style="direction:<?php __('dir'); ?>;text-align:<?php __('align'); ?>;">

                        <!-- Who we are -->
                        <h4 class="card-title"><?php __("who_we_are"); ?></h4>
                        <form class="forms-sample">

                          <div class="form-group row">
                            <div class="col-sm-9">
                              <textarea type="text" class="summernote form-control generalAbout"> <?php //echo $fetch["about"]; ?> </textarea>
                            </div>
                          </div>

                          <h4 class="card-title"><?php __("media"); ?></h4>
                          <p><?php __("media_how"); ?></p>

                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("media_type"); ?></label>
                            <div class="col-sm-9">
                              <select class="custom-select" name="">
                                <option value=""><?php __("without_media"); ?></option>
                                <option value=""><?php __("youtube_video"); ?></option>
                                <option value=""><?php __("photo"); ?></option>
                              </select>
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("video_id"); ?></label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control panel_password emptyInput" id="exampleInputPassword2" placeholder="">
                              <img src="../../assets/img/youtube_id.png" />
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("photo"); ?></label>
                            <div class="col-sm-9">
                              <div class="custom-file" style="text-align:left;">
                                <input type="file" class="custom-file-input" id="customFile">
                                <label class="custom-file-label" for="customFile"><?php __("choose_file"); ?></label>
                              </div>
                            </div>
                          </div>

                          <button type="submit" id="generalAbout" class="btn btn-success mr-2"><?php __("update_informations"); ?></button>
                          <input type="reset" class="btn btn-light" value="<?php __("reset"); ?>" />
                        </form>
                      </div>
                    </div>
                  </div>
                  <!-- END Who we are -->
                </div>
              </div>
              <!-- END FORM -->
            </div>
          </div>
          <!-- content-wrapper ends -->
          <!-- partial:../../partials/_footer.html -->

          <script type="text/javascript">
            $(function() {
              $('.summernote').summernote({
                height: 400,
              });

              /* $('form').on('submit', function (e) {
                e.preventDefault();
                alert($('.summernote').summernote('code'));
              }); */
            });
          </script>

<input type="hidden" name="hiddenKey" value="<?php echo $_SESSION["_TOKEN"]; ?>" />
