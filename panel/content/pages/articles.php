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

$query = $Q->query("SELECT * FROM `articles` ");

if ( isset($_SESSION["article_id"]) )
{
  unset($_SESSION["article_id"]);
}
?>
        <div class="content-wrapper">
          <div class="row">

              <!-- FORM -->
              <div class="col-10 d-flex align-items-stretch grid-margin">
                <div class="row flex-grow">

                  <div class="col-12 mb-5">
                    <?php showMessage(); ?>
                    <a href="#newarticle" id="getAjaxPage" class="btn btn-success"> <?php __("new_article"); ?> </a>
                  </div>

                  <!-- Email change -->
                  <div class="col-12 stretch-card flex-wrap">

                    <?php if ( $query->num_rows > 0 ) { ?>
                      <?php
                        while ( $fetch = $query->fetch_assoc() ) {
                        $content = $fetch["content"];

                        $data_json = [ 'id' => $fetch["id"] ];
                        $data_json = json_encode($data_json);
                      ?>
                        <div class="card-group col-6 mb-5 deletable <?php echo $fetch["id"]; ?>">
                          <div class="card">
                            <img class="card-img-top" src="../../<?php echo $fetch["cover"]; ?>" alt="" />
                            <div class="card-body">
                              <h5 class="card-title"><?php echo $fetch["title"]; ?></h5>
                              <p class="card-text"><?php echo trim_text($content); ?></p>
                              <p class="card-text"><small class="text-muted"><?php echo date("d/m/Y h:i", intval($fetch["date"])); ?></small></p>
                            </div>

                            <div class="card-footer">
                              <a class="btn btn-secondary" id="getAjaxPage" data-json='<?php echo $data_json; ?>' role="button" href="#editArticle"><?php __("edit"); ?></a>
                              <a class="btn btn-danger deleteItem" id="deleteArticle" data-id="<?php echo $fetch["id"]; ?>" role="button" href="#"><?php __("delete"); ?></a>
                            </div>
                          </div>
                        </div>
                      <?php } ?>
                    <?php }else{ ?>
                      <p class="text-muted"> No articles </p>
                    <?php } ?>

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
