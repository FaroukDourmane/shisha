$(document).ready(function(){
  var hash = location.hash;

  var pages = {
    "#dashboard": "pages/dashboard.php",
    "#login": "pages/login.php",
    "#contact": "pages/contact.php",
    "#social": "pages/social.php",
    "#about": "pages/about.php",
    "#articles": "pages/articles.php",
    "#newarticle": "pages/newarticle.php",
    "#editArticle": "pages/editArticle.php",
    "#categories": "pages/categories.php",
    "#products": "pages/products.php",
    "#addCategory": "pages/addCateogry.php",
    "#addsocial": "pages/addsocial.php",
    "#editCategory": "pages/editCategory.php",
    "#products": "pages/products.php",

    "#newProduct": "pages/newProduct.php",
  };

  // AJAX Page Changer
  $(document).on("click","#getAjaxPage",function(e){
    var url = $(this).attr("href");
    var exists = page_exists(url,pages);
    var button = $(this);

    var data = "";

    if ( typeof $(this).attr("data-json") !== typeof undefined && $(this).attr("data-json") !== false )
    {
      data = $(this).attr("data-json");
      data = $.parseJSON(data);
    }

    if ( exists )
    {
      $(".ajaxContainer").html("");

      $(".loadingContainer").addClass('active');
      $(".ajaxContainer").load(pages[url], data,function(){
        $(".loadingContainer").removeClass('active');

        $("a#getAjaxPage").removeClass("active");
        $(button).addClass("active");
      });
    }else{
      pushNotification("Page was not found !","error");
    }

  });

  // Initialize Page
  initialize_page(pages);
});

// Push notification to the page
function pushNotification(text,css_class="") {
  $("<div class='notification "+css_class+"'>"+text+"</div>")
        .appendTo('.push-notifications-container')
        .delay(4000)
        .queue(function() {
            $(this).remove();
        });
  // Scroll to bottom of notifications box
  $('.push-notifications-container').scrollTop($('.push-notifications-container')[0].scrollHeight);
}

function initialize_page(pages) {
  var hash = location.hash;
  var default_hash = "#dashboard";

  // Initialize Page Content
  if ( $.trim(hash).length > 0  && page_exists(hash,pages))
    {
      var load_page = hash;
    }
  else
    {
      location.hash = default_hash;
      hash = location.hash;
    }

    $(".loadingContainer").addClass('active');
    $(".ajaxContainer").load(pages[hash],function(){
    $(".loadingContainer").removeClass('active');
    });

  var button = $("a[href='"+hash+"']");
  $(button).addClass("active");
  $(button).parent().parent().parent().addClass("show");
  $(button).parent().parent().parent().parent().find("a.nav-link").addClass("collapsed").attr("aria-expanded","true");
}

function page_exists(page,array) {
  var exists = 0;
  if ( page in array )
  {
    exists = 1;
  }
  return exists;
}
