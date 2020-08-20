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


if ( !isset($_REQUEST["id"]) && !isset($_SESSION["article_id"]) )
{
  $text = __("article_not_found",true);
  $type = "error";

  throwMessage($text, $type);
  redirect("../content/#articles");
  exit;
}

$id = ( isset($_REQUEST["id"]) ) ? intval($_REQUEST["id"]) : intval($_SESSION["article_id"]);
$query = $Q->query("SELECT * FROM `articles` WHERE `id`='$id' ");

if ( $query->num_rows <= 0 ) {
  $text = __("article_not_found",true);
  $type = "error";

  throwMessage($text, $type);
  redirect("../content/#articles");
  exit;
}

$_SESSION["article_id"] = $id;
$fetch = $query->fetch_assoc();
?>

          <!-- include libraries(jQuery, bootstrap) -->
          <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.16/dist/summernote.min.css" rel="stylesheet">

          <div class="content-wrapper">
            <div class="row">

              <div class="col-12 mb-5">
                <a href="#articles" id="getAjaxPage" class="btn btn-secondary"> <?php __("back"); ?> </a>
              </div>

              <!-- FORM -->
              <div class="col-12 d-flex align-items-stretch grid-margin">
                <div class="row flex-grow">
                  <!-- Email change -->
                  <div class="col-12 stretch-card">
                    <div class="card">
                      <div class="card-body">
                        <h4 class="card-title"><?php __("edit_article"); ?></h4>
                        <form class="forms-sample">
                          <!-- Title -->
                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("title"); ?></label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control articleTitle" value="<?php echo $fetch["title"]; ?>" placeholder="<?php __("enter_title"); ?>">
                            </div>
                          </div>

                          <!-- Cover picture -->
                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("cover_picture"); ?></label>
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
                              <textarea name="name" class="form-control summernote ar" rows="8" cols="80">
                                <?php echo $fetch["content"]; ?>
                              </textarea>
                            </div>
                          </div>

                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("keywords"); ?></label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control articleKeywords" id="exampleInputEmail2" value="<?php echo $fetch["keywords"]; ?>" placeholder="sport,medical,fun...">
                            </div>
                          </div>

                          <hr />

                          <!-- English Translation -->
                          <h4 class="card-title"><?php __("translation"); ?> (<?php __("english"); ?>)</h4>
                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("title"); ?> (<?php __("english"); ?>)</label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control articleTitleEN" id="exampleInputEmail2" value="<?php echo $fetch["title_en"]; ?>" placeholder="<?php __("enter_title"); ?>">
                            </div>
                          </div>
                          <!-- Content -->
                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("content"); ?> (<?php __("english"); ?>)</label>
                            <div class="col-sm-9">
                              <textarea name="name" class="form-control summernote en" rows="8" cols="80"><?php echo $fetch["content_en"]; ?></textarea>
                            </div>
                          </div>
                          <!-- END English Translation -->

                          <hr />

                          <!-- Turkish Translation -->
                          <h4 class="card-title"><?php __("translation"); ?> (<?php __("turkish"); ?>)</h4>
                          <div class="form-group row">
                            <label for="exampleInputEmail2" class="col-sm-3 col-form-label"><?php __("title"); ?> (<?php __("turkish"); ?>)</label>
                            <div class="col-sm-9">
                              <input type="text" class="form-control articleTitleTR" id="exampleInputEmail2" value="<?php echo $fetch["title_tr"]; ?>" placeholder="<?php __("enter_title"); ?>">
                            </div>
                          </div>
                          <!-- Content -->
                          <div class="form-group row">
                            <label for="exampleInputPassword2" class="col-sm-3 col-form-label"><?php __("content"); ?> (<?php __("turkish"); ?>)</label>
                            <div class="col-sm-9">
                              <textarea name="name" class="form-control summernote tr" rows="8" cols="80"><?php echo $fetch["content_tr"]; ?></textarea>
                            </div>
                          </div>
                          <!-- END Turkish Translation -->
                          <button type="submit" class="btn btn-success editArticle mr-2"><?php __("add_article"); ?></button>
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
