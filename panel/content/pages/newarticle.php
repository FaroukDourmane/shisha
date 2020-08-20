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

<!-- include libraries(jQuery, bootstrap) -->
<link href="https://cdn.jsdelivr.net/npm/summernote@0.8.16/dist/summernote.min.css" rel="stylesheet">

<div class="content-wrapper">
  <div class="row">


    <!-- FORM -->
    <div class="col-12 ">
      <div class="row">

        <!-- Email change -->
        <div class="col-12">

          <div class="card">
            <div class="col-12 pt-2">
              <a href="#articles" id="getAjaxPage" class="btn btn-secondary"> <?php __("back"); ?> </a>
            </div>

            <div class="card-body">
              <h4 class="card-title"><?php __("new_article"); ?> (<?php __("arabic"); ?>)</h4>
              <form class="forms-sample">
                <!-- Title -->
                <div class="form-group row">
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("title"); ?> (<?php __("arabic"); ?>)</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control articleTitle" id="exampleInputEmail2" placeholder="<?php __("enter_title"); ?>">
                  </div>
                </div>

                <!-- Cover picture -->
                <div class="form-group row">
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("cover_picture"); ?> (<?php __("arabic"); ?>)</label>
                  &nbsp;&nbsp;&nbsp;
                  <div class="custom-file col-sm-4">
                    <input type="file" class="custom-file-input" name="coverFile" id="inputGroupFile01">
                    <label class="custom-file-label" for="inputGroupFile01"><?php __("choose_file"); ?></label>
                  </div>
                </div>

                <!-- Content -->
                <div class="form-group row">
                  <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("content"); ?></label>
                  <div class="col-sm-9">
                    <textarea name="name" class="form-control summernote ar" rows="8" cols="80"></textarea>
                  </div>
                </div>

                <div class="form-group row">
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("keywords"); ?></label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control articleKeywords" id="exampleInputEmail2" placeholder="sport,medical,fun...">
                  </div>
                </div>

                <hr />

                <!-- English Translation -->
                <h4 class="card-title"><?php __("translation"); ?> (<?php __("english"); ?>)</h4>
                <div class="form-group row">
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("title"); ?> (<?php __("english"); ?>)</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control articleTitleEN" id="exampleInputEmail2" placeholder="<?php __("enter_title"); ?>">
                  </div>
                </div>
                <!-- Content -->
                <div class="form-group row">
                  <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("content"); ?> (<?php __("english"); ?>)</label>
                  <div class="col-sm-9">
                    <textarea name="name" class="form-control summernote en" rows="8" cols="80"></textarea>
                  </div>
                </div>
                <!-- END English Translation -->

                <hr />

                <!-- Turkish Translation -->
                <h4 class="card-title"><?php __("translation"); ?> (<?php __("turkish"); ?>)</h4>
                <div class="form-group row">
                  <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("title"); ?> (<?php __("turkish"); ?>)</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control articleTitleTR" id="exampleInputEmail2" placeholder="<?php __("enter_title"); ?>">
                  </div>
                </div>
                <!-- Content -->
                <div class="form-group row">
                  <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("content"); ?> (<?php __("turkish"); ?>)</label>
                  <div class="col-sm-9">
                    <textarea name="name" class="form-control summernote tr" rows="8" cols="80"></textarea>
                  </div>
                </div>
                <!-- END Turkish Translation -->

                <button type="submit" class="btn btn-success insertArticle mr-2"><?php __("add_article"); ?></button>
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
