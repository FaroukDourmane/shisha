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
<script src="https://kit.fontawesome.com/98e695973b.js" crossorigin="anonymous"></script>

        <div class="content-wrapper">

          <!-- BLOG -->
          <div class="row page-title-header">
            <!-- <div class="col-md-12">
              <div class="page-header-toolbar">
                <div class="sort-wrapper">
                  <button type="button" class="btn btn-primary toolbar-item">New</button>
                </div>
              </div>
            </div> -->

            <div class="col-12">
              <h1 style="text-align: <?php __('align'); ?>"> <?php __("blog"); ?> </h1>
            </div>
          </div>

          <div class="row">
            <div class="col-md-3 grid-margin">
              <div class="card">
                <div class="card-body">
                  <div class="row">
                    <div class="col">
                      <div class="d-flex">
                        <div class="wrapper">
                          <h3 class="mb-0 font-weight-semibold">0</h3>
                          <h5 class="mb-0 font-weight-medium text-primary"><?php __("total"); ?></h5>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-9 grid-margin">
              <div class="card">
                <div class="card-body">
                  <div class="row">
                    <div class="col-lg-4 col-md-6">
                      <div class="d-flex">
                        <div class="wrapper">
                          <h3 class="mb-0 font-weight-semibold">0</h3>
                          <h5 class="mb-0 font-weight-medium text-primary"><?php __("active_articles"); ?></h5>
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                      <div class="d-flex">
                        <div class="wrapper">
                          <h3 class="mb-0 font-weight-semibold">0</h3>
                          <h5 class="mb-0 font-weight-medium text-primary"><?php __("hidden_articles"); ?></h5>
                        </div>
                      </div>
                    </div>

                    <div class="col-lg-4 col-md-6 mt-md-0 mt-4">
                      <div class="d-flex">
                        <div class="wrapper">
                          <a href="#newarticle" id="getAjaxPage" class="btn btn-success">
                            <h3 class="mb-0 font-weight-semibold"><?php __("new_article"); ?></h3>
                          </a>

                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-8">
              <div class="row">

                <div class="col-md-12 grid-margin">
                  <div class="card">
                    <div class="card-body">

                      <form class="form-inline mb-5 p-1 pl-3 pr-3" style="background:#f9f9f9;direction:<?php __('dir'); ?>;border-radius:10px;">
                        <label class="my-1 mr-2" for="inlineFormCustomSelectPref"><?php __("category"); ?></label>
                        <select class="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                          <option selected><?php __("all"); ?></option>
                          <option value="1">Category 1</option>
                          <option value="2">Category 2</option>
                          <option value="3">Category 3</option>
                        </select>

                        <label class="my-1 mr-2" for="inlineFormCustomSelectPref"><?php __("status"); ?></label>
                        <select class="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                          <option selected><?php __("all"); ?></option>
                          <option value="1"><?php __("active"); ?></option>
                          <option value="1"><?php __("hidden"); ?></option>
                        </select>

                        <button type="submit" class="btn btn-primary mr-3 ml-3"><?php __("search"); ?></button>
                      </form>


                      <div class="table-responsive">
                        <table class="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th><?php __("title"); ?></th>
                              <th><?php __("registration_date"); ?></th>
                              <th><?php __("options"); ?></th>
                            </tr>
                          </thead>
                          <tbody>
                            <?php if ( $query->num_rows > 0 ) { ?>
                              <?php
                                while ( $fetch = $query->fetch_assoc() ) {
                                $content = $fetch["content"];

                                $data_json = [ 'id' => $fetch["id"] ];
                                $data_json = json_encode($data_json);
                              ?>
                            <tr class="deletable <?php echo $fetch["id"]; ?>">
                              <td> <a target="_blank" href="#"> <?php echo trim_text($fetch["title"]); ?> </a> </td>
                              <td><?php __("since"); echo " ".date_difference($fetch["time"]); ?></td>
                              <td>
                                <a class="btn btn-primary" id="getAjaxPage" data-json='<?php echo $data_json; ?>' role="button" href="#editArticle"><i class="fas fa-pen"></i></a>
                                <a class="btn btn-danger deleteItem" id="deleteArticle" data-id="<?php echo $fetch["id"]; ?>" role="button" href="#"><i class="fas fa-trash-alt"></i></a>
                              </td>
                            </tr>
                          <?php } ?>
                        <?php }else{ ?>
                          <p class="text-muted"> No articles </p>
                        <?php } ?>

                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>
          <!-- content-wrapper ends -->
          <!-- partial:../../partials/_footer.html -->

<input type="hidden" name="hiddenKey" value="<?php echo $_SESSION["_TOKEN"]; ?>" />
