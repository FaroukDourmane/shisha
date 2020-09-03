<?php
deny_self(basename(__FILE__));

#################################
# Deny Acces to a file
#################################
  function deny_self ($filename)
  {
    $URL = $_SERVER["PHP_SELF"];
    $explode = explode("/",$URL);

    //$redirect = __DIR__."/../index.php";
    if ( in_array($filename,$explode) )
    {
      redirect("/index.php");
      exit;
    }
  }
######## END FUNCTION ###########


# Generate REFERENCE for temporary upload files
function generateReference(){
  GLOBAL $_SESSION;
  $found = false;

  while( $found !== true ){
    $generated_reference = strtoupper(substr(uniqid(), 6, 6));

    if ( !isset($_SESSION["temp_gallery"][$generated_reference]) )
    {
      $found = true;
    }

  }
  return $generated_reference;
}


######## RETURN LANGUAGE FILE SOURCE FOR CONTROL PANEL
function panel_lang_file(){
  GLOBAL $av_panel_lang;

  if( in_array($_SESSION["CURRENT_PANEL_LANG"], $av_panel_lang) )
  {
    return "lang/".$_SESSION["CURRENT_PANEL_LANG"].".php";
  } else {
    return "lang/".$_SESSION["CURRENT_PANEL_LANG"].".php";
  }
}
######## END FUNCTION ###########


#################################
# Lang preview
#################################
 function lang_preview()
 {
   GLOBAL $_SESSION;

   //$arrow = file_get_contents("assets/svg/arrow-head.svg");

   switch ( $_SESSION["CURRENT_LANG"] ) {
     case 'AR':
       $preview = '<img src="'.assets.'/svg/ar.svg" /> AR ';
       break;

     case 'EN':
       $preview = '<img src="'.assets.'/svg/en.svg" /> EN ';
       break;

     case 'TR':
       $preview = '<img src="'.assets.'/svg/tr.svg" /> TR ';
       break;

     default:
       $preview = '<img src="'.assets.'/svg/en.svg" /> EN ';
       break;
   }

   return $preview;
 }
######## END FUNCTION ###########


#################################
# Lang preview
#################################
 function lang_links()
 {
   GLOBAL $_SESSION;

   switch ( $_SESSION["CURRENT_LANG"] ) {
     case 'AR':
       $links = '
       <li> <a href="?lang=en"> <img src="assets/svg/en.svg" /> EN </a> </li>
       <li> <a href="?lang=tr"> <img src="assets/svg/tr.svg" /> TR </a> </li>';
       break;

     case 'EN':
      $links = '
      <li> <a href="?lang=ar"> <img src="assets/svg/ar.svg" /> AR </a> </li>
      <li> <a href="?lang=tr"> <img src="assets/svg/tr.svg" /> TR </a> </li>';
       break;

     case 'TR':
       $links = '
       <li> <a href="?lang=ar"> <img src="assets/svg/ar.svg" /> AR </a> </li>
       <li> <a href="?lang=en"> <img src="assets/svg/en.svg" /> EN </a> </li>';
       break;

     default:
       $links = '
       <li> <a href="?lang=ar"> <img src="assets/svg/ar.svg" /> AR </a> </li>
       <li> <a href="?lang=tr"> <img src="assets/svg/tr.svg" /> TR </a> </li>';
       break;
   }

   return $links;
 }
######## END FUNCTION ###########


#################################
# REDIRECT
#################################
  function redirect($url){
    echo'<meta http-equiv="refresh" content="0; url='.$url.'" />';
    return;
  }
######## END REDIRECT ###########


// RETURN LANGUAGE FILE SOURCE
function lang_file(){
  GLOBAL $av_lang;

  if(in_array($_SESSION["CURRENT_LANG"], $av_lang)){
    return "lang/".$_SESSION["CURRENT_LANG"].".php";
  } else {
    return "lang/".DEFAULT_LANG.".php";
  }
}

// Language function
function __($option,$return=false){
  global $LANG;
  if($return){
    return $LANG[$option];
  }
  echo $LANG[$option];
}

// GENERATE RANDOM TOKEN
function generateToken(){
  GLOBAL $Q;
  $token = password_hash(uniqid(), PASSWORD_DEFAULT).uniqid().time();
  return $token;
}


#################################
# CHECK IF ADMIN IS LOGGED IN
#################################
  function admin_logged()
  {
    GLOBAL $_SESSION,$Q;

    if ( isset($_SESSION["panel_email"]) && isset($_SESSION["_TOKEN"]) )
    {
      $panel_email = mysqli_real_escape_string($Q,$_SESSION["panel_email"]);
      $token = mysqli_real_escape_string($Q, $_SESSION["_TOKEN"]);
      $session_id = mysqli_real_escape_string($Q, session_id());

      $check = $Q->query("SELECT * FROM session INNER JOIN panel WHERE session.email='$panel_email' AND session.token='$token' AND session.id='$session_id' AND panel.email=session.email ");

      if ( $check->num_rows > 0 )
      {
        return TRUE;
      }
    }

    return FALSE;
  }
######## END FUNCTION ###########


####################################################################
####################################################################
#########            TEMPORARY MESSAGES SYSTEM
####################################################################
####################################################################

  # Create a temporary message with unique reference using SESSIONS
  # returns a $_SESSION["messages"]["reference"]
  function throwMessage($text, $type)
  {
    GLOBAL $_SESSION;

    $message = [
      "content" => "$text",
      "type" => "$type",
      "reference" => generateMessageReference(),
      "seen" => 0,
      ];

    $reference = $message["reference"];
    $_SESSION["messages"][$reference] = $message;
    return true;
  }

  # Generate REFERENCE for temporary messages
  function generateMessageReference(){
    GLOBAL $_SESSION;
    $found = false;

    while( $found !== true ){
      $generated_reference = strtoupper(substr(uniqid(), 6, 6));

      if ( !isset($_SESSION["messages"][$generated_reference]) )
      {
        $found = true;
      }

    }
    return $generated_reference;
  }



  # show temporary messages
  # returns array of messages
  function showMessage($classes="")
  {
    GLOBAL $_SESSION;

    if ( isset($_SESSION["messages"]) )
    {
      foreach ($_SESSION["messages"] as $key => $value) {

        if ($_SESSION["messages"][$key]["seen"] == 0)
        {
          $_SESSION["messages"][$key]["seen"] = 1;

          if ($classes == "")
          {
            if ($value["type"] == "success")
            {
              $classes = "message success";
            }else if ($value["type"] == "error")
            {
              $classes = "message error";
            }
          }
          echo "<div class='$classes'>".$value["content"]." </div>";
        }

      }

      destroyMessages();
    }
  }

  # Delete temporary messages after being seen
  function destroyMessages()
  {
    GLOBAL $_SESSION;

    if ( isset($_SESSION["messages"]) )
    {
      foreach ($_SESSION["messages"] as $key => $value) {
        if ( $_SESSION["messages"][$key]["seen"] == 1 )
        {
          unset($_SESSION["messages"][$key]);
        }
      }
    }
  }
####################################################################
####################################################################
###              END OF TEMPORARY MESSAGES SYSTEM
####################################################################
####################################################################

#################################
# FILE UPLOAD
# Returns file name if uploaded
#################################
function upload($input,$path,$allowed_extensions=NULL){
  GLOBAL $Q,$_SESSION,$_FILES;

  if ( isset($_FILES[$input]) && !empty(trim($_FILES[$input]["tmp_name"])) )
  {
    $upload = 0;
    $error = 0;
    $allowed = 1;

    if ( !file_exists($path) )
    {
      mkdir($path,0777);
    }

    $tmp = $_FILES[$input]["tmp_name"];
    $img = $_FILES[$input]["name"];

    // get uploaded file's extension
    $ext = strtolower(pathinfo($img, PATHINFO_EXTENSION));

    if( $allowed_extensions !== NULL )
    {
      if ( is_array($allowed_extensions) )
      {
        if ( !in_array($ext,$allowed_extensions) )
        {
          $allowed = 0;
          return FALSE;
        }
      }else{
        if ( $allowed_extensions == "images"  ){
          $formats = array("png","jpg","jpeg","svg");
          if ( !in_array($ext,$formats) )
          {
            $allowed = 0;
            return FALSE;
          }

        }else if ( $allowed_extensions == "videos"  ){
          $formats = array("mp4","flv","3gp","mpg","mpeg","avi","wmv");
          if ( !in_array($ext,$formats) )
          {
            $allowed = 0;
            return FALSE;
          }

        }else{
          if ( $ext !== $allowed_extensions )
          {
            $allowed = 0;
            return FALSE;
          }
        }
      }
    }

    $found = 0;
    while ($found == 0) {
      $final_image = rand(1000,1000000).$img;
      if ( !file_exists($path.$final_image) )
      {
        $found = 1;
      }
    }

    if( $allowed === 1 ){

      $final_path = $path.$final_image;

      if( !move_uploaded_file($tmp,$final_path) ){
        // FILE UPLOADED
        return FALSE;
      }
      return $final_image;
    }
  }else{
    return FALSE;
  }
}
######## END FUNCTION ###########

#################################
# DELETE FILE IF EXISTS
#################################
function delete_file($path){
  if (file_exists($path) && !is_dir($path) )
  {
    if (unlink($path)){
      return TRUE;
    }
  }
  return FALSE;
}
######## END FUNCTION ###########


######## APPROVE LOGIN AND SAVE SESSION ###########
function approveLogin($email){
  GLOBAL $_SESSION,$Q;

  $_SESSION["userEmail"] = $email;
  $_SESSION["userToken"] = generateToken();

  $session_token = $_SESSION["userToken"].ipFiltered();
  $session_id = session_id();
  $date = time();

  if( isset($_SESSION["userEmail"]) && isset($_SESSION["userToken"]) ){

    $delete = $Q->query("DELETE FROM `session` WHERE `email`='".$_SESSION["userEmail"]."' ");

    $insert = $Q->query("INSERT INTO `session`
              (`id`,`token`,`email`,`time`)
                VALUES
              ('$session_id','$session_token','$email','$date') ");
    if ( $insert ) { return TRUE; }else{
      echo mysqli_error($Q);
    }
  }

  return FALSE;
}
######## END FUNCTION ###########


######## RETURNS TRUE IF USER IS LOGGED IN ###########
function isLogged() {
  GLOBAL $_SESSION,$Q;

  if ( isset($_SESSION["userEmail"]) && isset($_SESSION["userToken"]) ) {

    $session_id = session_id();
    $email = strtolower($_SESSION["userEmail"]);

    $check_q = $Q->query("SELECT * FROM `session` WHERE `email`='$email' AND `id`='$session_id' ");

    if ($check_q->num_rows > 0) {

      $result = $check_q->fetch_array();

      $_TOKEN = $_SESSION["userToken"].ipFiltered();

      if ( $result["token"] == $_TOKEN ) {

          return TRUE;

      }else{
        session_destroy();
        return FALSE;
      }

    }else{
      session_destroy();
      return FALSE;
    }
  }else{
    return FALSE;
  }
}
######## END FUNCTION ###########


######## GET USER INFOS IF LOGGED ###########
function getCompany(){
  GLOBAL $Q,$_SESSION;

  if ( isLogged() )
  {
    $email = strtolower(mysqli_real_escape_string($Q, $_SESSION["userEmail"]));
    $query = $Q->query("SELECT * FROM `company` WHERE `account_email`='$email' ");

    if ( $query->num_rows > 0 )
    {
      return $query->fetch_assoc();
    }else{
      return FALSE;
    }
  }

  return FALSE;
}
######## END FUNCTION ########### ##############


######## REMOVE DOTS FROM IP ADDRESS ###########
function ipFiltered(){
  $ip = getIp();
  $ip_first = explode(".",$ip);
  $ip_last = implode($ip_first);

  return $ip_last;
}
######## END FUNCTION ########### ##############


######## GET USER IP ###########
function getIp(){
  $http_client_ip = ( isset($_SERVER["HTTP_CLIENT_IP"]) ) ? $_SERVER["HTTP_CLIENT_IP"] : "";
  $x_forwarded = ( isset($_SERVER["HTPP_X_FORWARDED_FOR"]) ) ? $_SERVER["HTPP_X_FORWARDED_FOR"] : "";
  $remote_addr = ( isset($_SERVER["REMOTE_ADDR"]) ) ? $_SERVER["REMOTE_ADDR"] : "";

  if( !empty($http_client_ip) ){
    return $http_client_ip;
  }elseif( !empty($x_forwarded) ){
    return $x_forwarded;
  }else{
    return $remote_addr;
  }
}
######## END FUNCTION ###########

#################################
# USER LOGOUT
#################################
function userLogout(){
  GLOBAL $Q,$_SESSION;

  $ID = session_id();
  $delete = $Q->query("DELETE FROM `session` WHERE `id`='$ID'  ");

  if ( $delete )
  {
    session_destroy();
    return TRUE;
  }else{
    return FALSE;
  }
}
######## END FUNCTION ###########

#############################################
# UPDATE EXCHANGE RATES IF NOT UPDATED TODAY
#############################################
function update_rates(){
  GLOBAL $Q;

  $query = $Q->query("SELECT * FROM `exchange_rates` ");
  $update = 0;
  $insert = 0;

  if ( $query->num_rows > 0 )
  {
    $fetch = $query->fetch_assoc();

    if ( !is_today($fetch["last_update"]) )
    {
      $update = 1;
    }
  }else{
    $insert = 1;
  }

  if ( $update || $insert )
  {
    // JSON Request
    $rates = get_rates();

    if ($rates) {
      $TRY = $rates->TRY;
      $EUR = $rates->EUR;
      $GBP = $rates->GBP;
      $time = time();

      if ( $update )
      {
        $update_query = $Q->query("UPDATE `exchange_rates` SET `gbp`='$GBP',`eur`='$EUR',`try`='$TRY',`time`='$time' ");
      }else if ($insert)
      {
        $insert_query = $Q->query("INSERT INTO `exchange_rates`
           (`last_update`,`gbp`,`eur`,`try`)
           VALUES
           ('$time','$GBP','$EUR','$TRY')
           ");
      }
    }

  }
}
######## END FUNCTION ###########


#################################
# GET EXCHANGE RATES
#################################
function get_rates(){

  $json = file_get_contents('https://open.exchangerate-api.com/v6/latest');
  $obj = json_decode($json);

  if ( $obj->result == "success" )
  {
    return $obj->rates;
  }else{
    return FALSE;
  }

}
######## END FUNCTION ###########

#################################
# CHECK TIMESTAMP IF IS TODAY
#################################
function is_today($timestamp){
  $timestamp = intval($timestamp);

  // date from timestamp
  $year = date("Y",$timestamp);
  $month = date("m",$timestamp);
  $day = date("d",$timestamp);

  // today's date
  $this_year = date("Y",time());
  $this_month = date("m",time());
  $this_day = date("d",time());

  if ( $this_year == $year && $this_month == $month && $this_day == $day )
  {
    return TRUE;
  }

  return FALSE;
}
######## END FUNCTION ###########


#####################################
# GET EXCHANGE RATES FROM DATABASE
#####################################
function fetch_rates(){
  GLOBAL $Q;

  $query = $Q->query("SELECT * FROM `exchange_rates` ");

  if ( $query->num_rows > 0 )
  {
    $fetch = $query->fetch_assoc();
    return $fetch;
  }

  return FALSE;
}
######## END FUNCTION ###########

#####################################
# ROUND FLOAT NUMBER INTO MAXIMUM OF 2 DECIMALS
#####################################
function round_float($number){
  return number_format((float)$number, 2, '.', '');
}
######## END FUNCTION ###########


#####################################
# Generate Signup Token
#####################################
function generate_signup_token()
{
  GLOBAL $_SESSION;
  $new_token = generateToken();
  $_SESSION["signup_token"] = $new_token;
}
######## END FUNCTION ###########


#####################################
# Create signup session
#####################################
function create_signup_session()
{
    GLOBAL $_SESSION;
    generate_signup_token();

    if ( !isset($_SESSION['signup_step']) || $_SESSION['signup_step'] == 0 )
    {
      $_SESSION['signup_step'] = 1;
    }
}
######## END FUNCTION ##############


#####################################
# Create signup session
#####################################
function reset_signup_step()
{
    GLOBAL $_SESSION;
    $_SESSION['signup_step'] = 1;
}
######## END FUNCTION ##############


#####################################
# Save input
#####################################
function save_input($name, $value)
{
  GLOBAL $_SESSION;
  if ( !isset($_SESSION["inputs"]) ) { $_SESSION["inputs"] = array(); }

  $_SESSION["inputs"][$name] = $value;
  return TRUE;
}
######## END FUNCTION ##############

#####################################
# Save Gallery photo
#####################################
function save_gallery($array)
{
  GLOBAL $_SESSION;
  $result = false;

  if ( !isset($_SESSION["gallery"]) ) { $_SESSION["gallery"] = array(); }

  $photo_id = 1;

  foreach ($array as $key => $value) {
    while ( isset($_SESSION["gallery"][$photo_id]) )
    {
      $photo_id++;
    }

    $_SESSION["gallery"][$photo_id] = $value;
    $result[$photo_id] = $value;
  }

  return $result;
}
######## END FUNCTION ##############


#####################################
# Save Gallery photo
#####################################
function fill_gallery()
{
  GLOBAL $_SESSION;
  if ( !isset($_SESSION["gallery"]) ) { return FALSE; }
  return $_SESSION["gallery"];
}
######## END FUNCTION ##############


#####################################
# Destroy input
#####################################
function destroy_input($name)
{
  GLOBAL $_SESSION;
  if ( isset($_SESSION["inputs"][$name]) ) {
    $_SESSION["inputs"][$name] = "";
  }

  return TRUE;
}
######## END FUNCTION ##############


#####################################
# Reset all saved inputs
#####################################
function reset_inputs()
{
  GLOBAL $_SESSION;
  if ( isset($_SESSION["inputs"]) )
  {
    unset($_SESSION["inputs"]);
  }

  if ( isset($_SESSION["gallery"]) ) {
    unset($_SESSION["gallery"]);
  }

  if ( isset($_SESSION["signup_step"]) ) {
    unset($_SESSION["signup_step"]);
  }

  return TRUE;
}
######## END FUNCTION ##############


#####################################
# fill input
#####################################
function fill_input($name)
{
  GLOBAL $_SESSION;

  $result = "";
  if ( isset($_SESSION["inputs"][$name]) )
  {
    $result = $_SESSION["inputs"][$name];
  }

  return $result;
}
######## END FUNCTION ##############


#################################
# MULTIPLE FILE UPLOAD
# Returns array of file names When successful or FALSE when failing
#################################
function upload_files($input,$path,$allowed_extensions=NULL){
  GLOBAL $Q,$_SESSION,$_FILES;


if ( isset($_FILES[$input]["name"]) && is_array($_FILES[$input]["name"]) )
{
  // Count # of uploaded files in array
  $total = count($_FILES[$input]['name']);

  $upload = 0;
  $error = 0;
  $allowed = 1;

  $final_images = array();

  if ( !file_exists($path) )
  {
    mkdir($path,0777);
  }

  // Loop through each file
  for( $i=0 ; $i < $total ; $i++ ) {
    //Get the temp file path
    $tmp = $_FILES[$input]["tmp_name"][$i];
    $img = $_FILES[$input]["name"][$i];
    $img_id = 0;

    // get uploaded file's extension
    $ext = strtolower(pathinfo($img, PATHINFO_EXTENSION));

    if( $allowed_extensions !== NULL )
    {
      if ( is_array($allowed_extensions) )
      {
        if ( !in_array($ext,$allowed_extensions) )
        {
          $allowed = 0;
          return FALSE;
        }
      }else{
        if ( $allowed_extensions == "images"  ){
          $formats = array("png","jpg","jpeg","svg");
          if ( !in_array($ext,$formats) )
          {
            $allowed = 0;
            return FALSE;
          }

        }else if ( $allowed_extensions == "videos"  ){
          $formats = array("mp4","flv","3gp","mpg","mpeg","avi","wmv");
          if ( !in_array($ext,$formats) )
          {
            $allowed = 0;
            return FALSE;
          }

        }else{
          if ( $ext !== $allowed_extensions )
          {
            $allowed = 0;
            return FALSE;
          }
        }
      }
    }

    $found = 0;
    while ($found == 0) {
      $final_image = rand(1000,1000000).$img;
      if ( !file_exists($path.$final_image) )
      {
        $found = 1;
      }
    }

    if( $allowed === 1 ){

      $final_path = $path.$final_image;

      if( move_uploaded_file($tmp,$final_path) ){
        // FILE UPLOADED
        $final_images[] = $final_image;
      }else{
        return FALSE;
      }
    }else{
      return FALSE;
    }
  }

    return $final_images;
  }else{
    return FALSE;
  }
}
#################################
# END FUNCTION
#################################



#################################
# GET CATEGORY
#################################
function get_category($id=NULL, $val=NULL)
{
  GLOBAL $Q,$_SESSION;

  if ($id == NULL)
  {
    $query = $Q->query("SELECT * FROM `categories` ");
  }else{
    $id = intval($id);
    $query = $Q->query("SELECT * FROM `categories` WHERE `id`='$id' ");
  }

  if ( $query->num_rows > 0 )
  {
    $fetch = $query->fetch_assoc();

    if ( isset($fetch[$val]) )
    {
      return $fetch[$val];
    }

    return $fetch;
  }

  return FALSE;
}
#################################
# END FUNCTION
#################################



#################################
# CHECK GOOGLE MAPS IFRAME
#################################
function check_google_maps($input)
{
  if (!preg_match('/<iframe\s*src="https:\/\/www\.google\.com\/maps\/embed\?[^"]+"*\s*[^>]+>*<\/iframe>/', $input))
  {
    return FALSE;
  }
  return TRUE;
}
#################################
# END FUNCTION
#################################



##############################################################################
# INPUT timestamp(int) OUTPUS DIFFERENCE BETWEEN CURRENT TIME AND TIMESTAMP(STRING)
##############################################################################
function date_difference($timestamp)
{
  $timestamp = intval($timestamp);

  $current_year = date("Y", time());
  $current_month = date("m", time());
  $current_day = date("d", time());
  $current_hour = date("H", time());
  $current_minute = date("i", time());

  $year = date("Y", $timestamp);
  $month = date("m", $timestamp);
  $day = date("d", $timestamp);
  $hour = date("H", $timestamp);
  $minute = date("i", $timestamp);

  $years_dif = $current_year - $year;
  $month_dif = $current_month - $month;
  $days_dif = $current_day - $day;
  $hours_dif = $current_hour - $hour;
  $minutes_dif = $current_minute - $minute;

  if ( $years_dif == 0 )
  {
    if ( $month_dif == 0 )
    {
      if ( $days_dif == 0 )
      {
        if ( $hours_dif == 0 )
        {
          if ( $minutes_dif == 0 )
          {
            $result = __("now", true);
            return $result;
          }else{
            if ( $minutes_dif == 1 )
            {
              $result = __("one_minute", true);
              return $result;
            }else{
              $result = $minutes_dif." ".__("minutes",true);
              return $result;
            }
          }
        }else{
          if ( $hours_dif == 1 )
          {
            $result = __("one_hour", true);
            return $result;
          }else {
            $result = $hours_dif." ".__("hours",true);
            return $result;
          }
        }
      }else{
        if ( $days_dif == 1 )
        {
          $result = __("one_day", true);
          return $result;
        }else{
          $result = $days_dif." ".__("days",true);
          return $result;
        }
      }
    }else{
      if ( $month_dif == 1 )
      {
        $result = __("one_month", true);
        return $result;
      }else{
        $result = $month_dif." ".__("months",true);
        return $result;
      }
    }
  }else{
    if ( $years_dif == 1 )
    {
      $result = __("one_year", true);
      return $result;
    }else{
      $result = $years_dif." ".__("years",true);
      return $result;
    }
  }
}
#################################
# END FUNCTION
#################################


############################
# GET COMPANY VIEWS
############################
function getView($company_id) {
  GLOBAL $Q,$_SESSION,$_COMPANY;

  $views_q = $Q->query("SELECT * FROM `company_views` WHERE `company_id`='$company_id' ");
  return show_number($views_q->num_rows);
}
#################################
# END FUNCTION
#################################

############################
# ADD VIEW TO A COMPANY
############################
function addView($company_id){
  GLOBAL $Q,$_SESSION,$_COMPANY;

  $ip = ipFiltered();
  $account_id = 0;
  $time = time();
  $token = $_SESSION["_TOKEN"];

  if ( isLogged() )
  {
    $account_id = $_COMPANY["id"];
    $check_views = $Q->query("SELECT * FROM `company_views` WHERE `company_id`='$company_id' AND (`account_id`='$account_id' OR `ip`='$ip' OR `token`='$token') ");
  }else{
    $check_views = $Q->query("SELECT * FROM `company_views` WHERE `company_id`='$company_id' AND (`ip`='$ip' OR `token`='$token') ");
  }

  if ( $check_views->num_rows <= 0 )
  {
    $insert_view = $Q->query("INSERT INTO `company_views`
      (`ip`,`account_id`,`time`,`company_id`,`token`)
      VALUES
      ('$ip','$account_id','$time','$company_id','$token') ");

      if ( $insert_view )
      {
        return TRUE;
      }
  }

  return FALSE;
}
#################################
# END FUNCTION
#################################


############################
# SHOW NUMBERS IN A BETTER WAY
############################
function show_number($input) {
  $input = intval($input);

  if ( $input >= 1000000000  ){
    $input = ceil($input/1000000000);
    $result = $input."B";
  }else if ($input >= 1000000)
  {
    $input = ceil($input/1000000);
    $result = $input."M";
  }else if ($input >= 1000)
  {
    $input = ceil($input/1000);
    $result = $input."K";
  }else{
    $result = $input;
  }

  return $result;
}
#################################
# END FUNCTION
#################################

#################################
# Deny Acces to a file
#################################
  function trim_text($string)
  {
    $string = strip_tags($string);
      if (strlen($string) > 300) {

      // truncate string
      $stringCut = substr($string, 0, 300);
      $endPoint = strrpos($stringCut, ' ');

      //if the string doesn't contain any space then it will cut without word basis.
      $string = $endPoint? substr($stringCut, 0, $endPoint) : substr($stringCut, 0);
      $string .= '... <span style="color:#333;">'.__("read_more", true).'</span>';
    }

    return $string;
  }
######## END FUNCTION ###########
?>
