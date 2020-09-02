$(document).ready(function(){

  // When submitting a form
  $(document).on("click","button[type='submit']",function(e){

    e.preventDefault();

    var actions = {
      "changeEmail": "ajax/login.php",
      "changePasswrod": "ajax/login.php",
      "changeContact": "ajax/contact.php",
      "generalAbout": "ajax/about.php",
      "uploadCatalog": "ajax/uploadCatalog.php",
      "addProduct": "ajax/addProduct.php",
      "editProduct": "ajax/editProduct.php",
      "addMedia": "ajax/addMedia.php",
      "addAdmin": "ajax/addAdmin.php",
      "editAdmin": "ajax/editAdmin.php",
      "ediSocial": "ajax/ediSocial.php",
    };

    var action = $(this).attr("id");
    var key = $("input[name='hiddenKey']").val();
    data = { action: action, key: key };

    if ( action in actions )
    {

      // Add admin
      if ( data.action == "addAdmin" || data.action == "editAdmin" )
      {
        var email = $(".adminEmail").val();
        var password = $(".adminPassword").val();

        var articles = $("input[name='articles']").prop("checked");
        var customer_profiles = $("input[name='customer_profiles']").prop("checked");
        var videos = $("input[name='videos']").prop("checked");
        var photos = $("input[name='photos']").prop("checked");
        var see_requests = $("input[name='see_requests']").prop("checked");
        var edit_requests = $("input[name='edit_requests']").prop("checked");
        var remove_requests = $("input[name='remove_requests']").prop("checked");

        data.email = email;
        data.password = password;

        data.articles = articles;
        data.customer_profiles = customer_profiles;
        data.videos = videos;
        data.photos = photos;
        data.see_requests = see_requests;
        data.edit_requests = edit_requests;
        data.remove_requests = remove_requests;
      }

      // CHANGE EMAIL
      if ( data.action == "changeEmail" )
      {
        var panel_email = $(".panel_email").val();
        var panel_password = $(".panel_password").val();
        data.panel_email = panel_email;
        data.panel_password = panel_password;
      }

      // Edit social media
      if ( data.action == "ediSocial" ) {
        var facebook = $(".socialFacebook").val();
        var twitter = $(".socialTwitter").val();
        var instagram = $(".socialInstagram").val();
        var snapchat = $(".socialSnapchat").val();

        data.facebook = facebook;
        data.twitter = twitter;
        data.instagram = instagram;
        data.snapchat = snapchat;
      }

      // EDIT CATEGORY
      if ( data.action == "addMedia" )
      {
        var source = $(".source").val();
        data.source = source;
      }

      // CHANGE PASSWORD
      if ( data.action == "changePasswrod" )
      {
        var old_pass = $(".oldPass").val();
        var new_pass = $(".newPass").val();
        var confirm_pass = $(".confirmPass").val();

        data.old_pass = old_pass;
        data.new_pass = new_pass;
        data.confirm_pass = confirm_pass;
      }

      if ( data.action == "changeContact")
      {
        var email = $('.contactEmail').val();
        var phone = $('.contactPhone').val();
        var cellphone = $('.contactCellphone').val();
        var address = $('.contactAddress').val();

        var whatsapp = $('.contactWhatsapp').val();
        var map = $('.mapCode').val();

        data.email = email;
        data.phone = phone;
        data.cellphone = cellphone;
        data.address = address;

        data.whatsapp = whatsapp;
        data.map = map;
      }

      if ( data.action == "generalAbout" )
      {

        var about = $('.summernote').summernote('code');
        var media_type = $(".media_type :selected").val();
        var youtubeId = $(".youtubeId").val();
        var photo = $('input[name="photoFile"]').prop('files')[0];

        data.about = about;
        data.media_type = media_type;
        data.youtubeId = youtubeId;
        data.photo = photo;
      }

      $(".ajaxContainer").addClass("loading");
      $(".loadingContainer").addClass("active");

      $.post(actions[action],data)
      .done(function(response){

        response = $.parseJSON(response);
        $(".ajaxContainer").removeClass("loading");
        $(".loadingContainer").removeClass("active");
        pushNotification(response.text,response.type);

        if (response.type == "success") {
          $(".emptyInput").val("");
        }
      });
    }
  });


  // When Deleting Item
  $(document).on("click",".deleteItem",function(){

    var actions = {
      "deleteArticle": "ajax/delete.php",
      "deleteCategory": "ajax/delete.php",
      "deleteProduct": "ajax/delete.php",
      "deleteMedia": "ajax/delete.php",
      "deleteAdmin": "ajax/deleteAdmin.php",
    };

    var action = $(this).attr("id");
    var key = $("input[name='hiddenKey']").val();
    data = { action: action, key: key };

    if ( action in actions )
    {
      // DELETE SOCIAL MEDIA
      //if ( data.action == "deleteSocial" ) {  }

      var id = $(this).attr("data-id");
      data.id = id;

      $(".ajaxContainer").addClass("loading");
      $(".loadingContainer").addClass("active");

      $.post(actions[action],data)
      .done(function(response){
        response = $.parseJSON(response);
        $(".ajaxContainer").removeClass("loading");
        $(".loadingContainer").removeClass("active");
        pushNotification(response.text,response.type);

        if (response.type == "success") {
          $(".deletable."+id).remove();
        }
      });
    }
  });


// Add a category
$(document).on("click",".addCategory",function(e){
  e.preventDefault();
    var photo = $('input[name="categoryPhoto"]').prop('files')[0];
    var status = $(".categoryStatus :selected").val();

    var name_en = $(".name_en").val();
    var name_ar = $(".name_ar").val();
    var name_tr = $(".name_tr").val();
    //var name_fr = $(".name_fr").val();

    var form_data = new FormData();

    form_data.append('photo', photo);
    form_data.append('status', status);

    form_data.append('name_en', name_en);
    form_data.append('name_ar', name_ar);
    form_data.append('name_tr', name_tr);

    form_data.append('action', "addCategory");

    $.ajax({
        url: 'ajax/addCategory.php',
        dataType: 'text',  // what to expect back from the PHP script, if anything
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function(response){
          response = $.parseJSON(response);

          pushNotification(response.text,response.type);

          if ( response.type == "success" ) {
            location.hash = "#categories";
            var pages = {
              "#categories": "pages/categories.php",
            }
            initialize_page(pages);

          }

          $(".ajaxContainer").removeClass("loading");
          $(".loadingContainer").removeClass("active");

        }
     });
});
// END Adding a category

// Edit a category
$(document).on("click",".editCategory",function(e){
  e.preventDefault();
    var photo = $('input[name="categoryPhoto"]').prop('files')[0];
    var status = $(".categoryStatus :selected").val();

    var name_en = $(".name_en").val();
    var name_ar = $(".name_ar").val();
    var name_tr = $(".name_tr").val();
    //var name_fr = $(".name_fr").val();

    var form_data = new FormData();

    form_data.append('photo', photo);
    form_data.append('status', status);

    form_data.append('name_en', name_en);
    form_data.append('name_ar', name_ar);
    form_data.append('name_tr', name_tr);

    form_data.append('action', "editCategory");

    $.ajax({
        url: 'ajax/editCategory.php',
        dataType: 'text',  // what to expect back from the PHP script, if anything
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function(response){
          response = $.parseJSON(response);

          pushNotification(response.text,response.type);

          if ( response.type == "success" ) {
            location.hash = "#categories";
            var pages = {
              "#categories": "pages/categories.php",
            }
            initialize_page(pages);

          }

          $(".ajaxContainer").removeClass("loading");
          $(".loadingContainer").removeClass("active");

        }
     });
});
// END editing a category


// Product gallery uploads
$(document).on("change","input[name='photo_gallery[]']",function(e){
  var form = $(this).parents("form");

  var numFiles = $(this)[0].files.length;
  if (numFiles > 0){
    $(".upload-wrapper").addClass("loading");

    var data = new FormData($(form)[0]);
    console.log(data);

    $.ajax({
        url: 'ajax/uploadProductGallery.php',
        dataType: 'text',  // what to expect back from the PHP script, if anything
        cache: false,
        contentType: false,
        processData: false,
        data: data,
        type: 'post',
        success: function(result){
          result = $.parseJSON(result);
          if (result.type == "success")
          {
            $.each(result.text, function(k,i){
              $(".gallery-container").prepend('<div class="item" id="'+k+'" style="background-image:url(../../assets/temp/'+result.reference+'/'+i+');"><a class="delete">X</a></div>');
            });
          }else{
            alert(result.text);
          }

          $(".upload-wrapper").removeClass("loading");
        }
     });

  }
});

// DELETE Gallery photo
$(document).on("click",".gallery-container .item .delete",function(e){
  e.preventDefault();
  var id = $(this).parent(".item").attr("id");
  var item = $(this).parent(".item");

  $.post("ajax/deletePhoto.php", {action: "deletePhoto", id: id})
  .done(function(data){
    data = $.parseJSON(data);

    if ( data.type == "success" )
    {
      $(item).remove();
    }else{
      alert(data.text);
    }
  });
})

// ADD NEW PRODUCT
  $(document).on("click",".insertProduct",function(e){

    e.preventDefault();
    $(".ajaxContainer").addClass("loading");
    $(".loadingContainer").addClass("active");

    var category = $(".category :selected").val();
    var status = $(".productStatus :selected").val();

    var name_en = $(".name_en").val();
    var name_ar = $(".name_ar").val();
    var name_tr = $(".name_tr").val();

    var price_tl = $(".price_tl").val();
    var price_usd = $(".price_usd").val();
    var price_eur = $(".price_eur").val();

    var description = $(".product_description").val();
    var keywords = $(".keywords").val();

    var cover_file = $('input[name="coverFile"]').prop('files')[0];

    var form_data = new FormData();

    form_data.append('category', category);
    form_data.append('status', status);

    form_data.append('name_en', name_en);
    form_data.append('name_ar', name_ar);
    form_data.append('name_tr', name_tr);

    form_data.append('price_tl', price_tl);
    form_data.append('price_usd', price_usd);
    form_data.append('price_eur', price_eur);
    
    form_data.append('description', description);
    form_data.append('keywords', keywords);

    form_data.append('cover', cover_file);
    form_data.append('action', "insertArticle");

    $.ajax({
        url: 'ajax/addProduct.php',
        dataType: 'text',  // what to expect back from the PHP script, if anything
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function(response){
          response = $.parseJSON(response);

          if ( response.type == "success" )
          {

            if ( gallery_files_count > 0 )
            {

              for (var i = 0; i < gallery_files_count; i++) {
                gallery_file = $('input[name="galleryFiles[]"]').prop('files')[i];
                var data = new FormData();
                data.append('gallery', gallery_file);
                data.append('action', "upload_gallery");
                data.append('id', response.id);

                $.ajax({
                    url: 'ajax/addProduct.php',
                    dataType: 'text',  // what to expect back from the PHP script, if anything
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: data,
                    type: 'post',
                    success: function(result){}
                 });

              }
            }
          }

          pushNotification(response.text,response.type);

          if ( response.type == "success" ) {
            location.hash = "#products";
            var pages = {
              "#products": "pages/products.php",
            }
            initialize_page(pages);

          }

          $(".ajaxContainer").removeClass("loading");
          $(".loadingContainer").removeClass("active");

        }
     });

  });


  // ADD PICTURES TO HEADER SLIDESHOW
  $(document).on("click",".addSlideshow",function(e){

    e.preventDefault();
    $(".ajaxContainer").addClass("loading");
    $(".loadingContainer").addClass("active");

    var gallery_files = $('input[name="galleryFiles[]"]').prop('files')[0];
    var gallery_files_count = $('input[name="galleryFiles[]"]').prop('files').length;

    var gallery_array = [];

    if ( gallery_files_count > 0 )
    {

      for (var i = 0; i < gallery_files_count; i++) {
        gallery_file = $('input[name="galleryFiles[]"]').prop('files')[i];
        var data = new FormData();
        data.append('gallery', gallery_file);
        data.append('action', "upload_slideshow");

        $.ajax({
            url: 'ajax/addSlideshow.php',
            dataType: 'text',  // what to expect back from the PHP script, if anything
            cache: false,
            contentType: false,
            processData: false,
            data: data,
            type: 'post',
            success: function(result){
              result = $.parseJSON(result);

              if (result.type == "success")
              {
                $("body .img-flex").append('<div class="img-preview '+result.id+'" style="display:inline-block;padding:20px 0px;"><a href="#" id="'+result.id+'" class="deleteGallery"> <i class="mdi mdi-delete"></i> </a><img style="width:100px;" src="../../'+result.text+'" /></div>');
              }else{
                pushNotification(result.text,result.type);
              }
            }
         });

      }
    }

    $(".ajaxContainer").removeClass("loading");
    $(".loadingContainer").removeClass("active");
  });

  // DELETE PRODUCT IMAGE
  $(document).on("click",".deleteGallery",function(e){
      e.preventDefault();
      $(".ajaxContainer").addClass("loading");
      $(".loadingContainer").addClass("active");
      var id = $(this).attr("id");

      $.post("ajax/deleteGallery.php",{action: "deleteGallery", id: id})
      .done(function(response){

        response = $.parseJSON(response);
        $(".ajaxContainer").removeClass("loading");
        $(".loadingContainer").removeClass("active");

        if ( response.type == "success" )
        {
          $(".img-preview."+id).remove();
        }

        pushNotification(response.text,response.type);
      });
    });

  // EDIT PRODUCT
  $(document).on("click",".editProduct",function(e){

    e.preventDefault();
    $(".ajaxContainer").addClass("loading");
    $(".loadingContainer").addClass("active");

    var category = $(".selectCategory :selected").val();
    var name = $(".productName").val();
    var description = $(".productDescription").val();

    var price_tl = $(".price_tl").val();
    var price_usd = $(".price_usd").val();
    var productWeight = $(".productWeight").val();

    var cover_file = $('input[name="coverFile"]').prop('files')[0];
    var gallery_files = $('input[name="galleryFiles[]"]').prop('files')[0];
    var gallery_files_count = $('input[name="galleryFiles[]"]').prop('files').length;

    var gallery_array = [];

    var form_data = new FormData();

    form_data.append('category', category);
    form_data.append('name', name);
    form_data.append('description', description);
    form_data.append('price_tl', price_tl);
    form_data.append('price_usd', price_usd);
    form_data.append('productWeight', productWeight);
    form_data.append('cover', cover_file);
    form_data.append('action', "editProduct");

    $.ajax({
        url: 'ajax/editProduct.php',
        dataType: 'text',  // what to expect back from the PHP script, if anything
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function(response){
          response = $.parseJSON(response);

          if ( response.type == "success" )
          {

            if ( gallery_files_count > 0 )
            {

              for (var i = 0; i < gallery_files_count; i++) {
                gallery_file = $('input[name="galleryFiles[]"]').prop('files')[i];
                var data = new FormData();
                data.append('gallery', gallery_file);
                data.append('action', "upload_gallery");
                data.append('id', response.id);

                $.ajax({
                    url: 'ajax/editProduct.php',
                    dataType: 'text',  // what to expect back from the PHP script, if anything
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: data,
                    type: 'post',
                    success: function(result){
                      result = $.parseJSON(result);

                      if (result.type == "success")
                      {
                        $("body .img-flex").append('<div class="img-preview '+result.id+'" style="display:inline-block;padding:20px 0px;"><a href="#" id="'+result.id+'" class="deleteImage"> <i class="mdi mdi-delete"></i> </a><img style="width:100px;" src="../../'+result.text+'" /></div>');
                      }else{
                        pushNotification(result.text,result.type);
                      }
                    }
                 });

              }
            }
          }

          pushNotification(response.text,response.type);

          if ( response.type == "success" ) {
            location.hash = "#editProduct";
            var pages = {
              "#editProduct": "pages/editProduct.php",
            }
            initialize_page(pages);

            $(".ajaxContainer").removeClass("loading");
            $(".loadingContainer").removeClass("active");
          }else{
            $(".ajaxContainer").removeClass("loading");
            $(".loadingContainer").removeClass("active");
          }
        }
     });

  });

  // DELETE PRODUCT IMAGE
  $(document).on("click",".deleteImage",function(e){
    e.preventDefault();
    $(".ajaxContainer").addClass("loading");
    $(".loadingContainer").addClass("active");
    var id = $(this).attr("id");

    $.post("ajax/deleteImage.php",{action: "deleteImage", id: id})
    .done(function(response){

      response = $.parseJSON(response);
      $(".ajaxContainer").removeClass("loading");
      $(".loadingContainer").removeClass("active");

      if ( response.type == "success" )
      {
        $(".img-preview."+id).remove();
      }

      pushNotification(response.text,response.type);
    });
  });

  // UPLOAD CATALOG
  $(document).on("click",".uploadCatalog",function(e){

    e.preventDefault();

    var file_data = $('input[name="catalog"]').prop('files')[0];
    var form_data = new FormData();
    form_data.append('file', file_data);

    $.ajax({
        url: 'ajax/uploadCatalog.php',
        dataType: 'text',  // what to expect back from the PHP script, if anything
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function(response){
          response = $.parseJSON(response);
          $(".ajaxContainer").removeClass("loading");
          $(".loadingContainer").removeClass("active");
          pushNotification(response.text,response.type);
        }
     });
  });


  // INSERT NEW ARTICLE
  $(document).on("click",".insertArticle",function(e){

    e.preventDefault();

    var title = $(".articleTitle").val();
    var title_en = $(".articleTitleEN").val();
    var title_tr = $(".articleTitleTR").val();

    var keywords = $(".articleKeywords").val();
    var file_data = $('input[name="coverFile"]').prop('files')[0];

    var content = $('.summernote.ar').summernote('code');
    var contentEN = $('.summernote.en').summernote('code');
    var contentTR = $('.summernote.tr').summernote('code');

    var category = $('.categorySelect :selected').val();

    var form_data = new FormData();
    form_data.append('file', file_data);

    form_data.append('title', title);
    form_data.append('title_en', title_en);
    form_data.append('title_tr', title_tr);

    form_data.append('content', content);
    form_data.append('contentEN', contentEN);
    form_data.append('contentTR', contentTR);

    form_data.append('keywords', keywords);
    form_data.append('action', "insertArticle");

    $.ajax({
        url: 'ajax/newArticle.php',
        dataType: 'text',  // what to expect back from the PHP script, if anything
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function(response){
          response = $.parseJSON(response);

          pushNotification(response.text,response.type);

          if ( response.type == "success" )
          {
            location.hash = "#articles";
            var pages = {
              "#articles": "pages/articles.php",
            }
            initialize_page(pages);

          }else{
            $(".ajaxContainer").removeClass("loading");
            $(".loadingContainer").removeClass("active");
          }


        }
     });
  });


  // EDIT ARTICLE
  $(document).on("click",".editArticle",function(e){

    e.preventDefault();

    var title = $(".articleTitle").val();
    var title_en = $(".articleTitleEN").val();
    var title_tr = $(".articleTitleTR").val();

    var keywords = $(".articleKeywords").val();
    var file_data = $('input[name="coverFile"]').prop('files')[0];

    var content = $('.summernote.ar').summernote('code');
    var contentEN = $('.summernote.en').summernote('code');
    var contentTR = $('.summernote.tr').summernote('code');

    var category = $('.categorySelect :selected').val();

    var form_data = new FormData();
    form_data.append('file', file_data);

    form_data.append('title', title);
    form_data.append('title_en', title_en);
    form_data.append('title_tr', title_tr);

    form_data.append('content', content);
    form_data.append('contentEN', contentEN);
    form_data.append('contentTR', contentTR);

    form_data.append('keywords', keywords);
    form_data.append('action', "editArticle");


    $.ajax({
        url: 'ajax/editArticle.php',
        dataType: 'text',  // what to expect back from the PHP script, if anything
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function(response){
          response = $.parseJSON(response);

          if ( response.type == "success" )
          {
            location.hash = "#articles";
            var pages = {
              "#articles": "pages/articles.php",
            }
            initialize_page(pages);

          }else{
            $(".ajaxContainer").removeClass("loading");
            $(".loadingContainer").removeClass("active");
          }

          pushNotification(response.text,response.type);
        }
     });
  });
});
