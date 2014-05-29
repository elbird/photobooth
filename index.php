<?php
require 'lib/defaults.php';

header("Access-Control-Allow-Origin: http://featherfiles.aviary.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

$currentPage = "";
$base_path_length = count(explode("/", BASE_URL));
$path = explode("/", $_SERVER['REQUEST_URI']);

$path = !empty($path[$base_path_length +1]) ? $path[$base_path_length + 1] : '';

$base = "";

$requestUri = rtrim($_SERVER['REQUEST_URI'], '/');

switch ($requestUri) {
  case BASE_URL:
  case BASE_URL . "/":
  case BASE_URL . "/" . URL_NEW:
    $currentPage = URL_NEW;
    break;
  case BASE_URL . "/" . URL_GALLERY:
    $currentPage = URL_GALLERY;
    break;
  case BASE_URL . "/" . URL_TRASH:
    $currentPage = URL_TRASH;
    break;
  case BASE_URL . "/" . URL_SHOW:
    $currentPage = URL_SHOW;
    break;
  default:
    header("HTTP/1.1 301 Moved Permanently");
    $url = !empty($_SERVER['HTTPS']) ? 'https' : 'http';
    $url .= '://' . $_SERVER['SERVER_NAME']  . BASE_URL . '/';
    header("Location: " . $url);
    break;
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sandra &amp; Sebastian's Photobooth</title>

    <!-- Bootstrap -->
    <link href="<?php echo BASE_URL ?>/fonts/stylesheet.css" rel="stylesheet">
    <link href="<?php echo BASE_URL ?>/bower_components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
       <link href="<?php echo BASE_URL ?>/bower_components/bootstrap/dist/css/bootstrap-theme.min.css" rel="stylesheet">
<link rel="stylesheet" href="<?php echo BASE_URL ?>/bower_components/blueimp-gallery/css/blueimp-gallery.min.css">
<link rel="stylesheet" href="<?php echo BASE_URL ?>/bower_components/blueimp-bootstrap-image-gallery/css/bootstrap-image-gallery.min.css">
<link rel="stylesheet" type="text/css" href="<?php echo BASE_URL ?>/css/theme.css">

    
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body role="document" data-url-type="<?php echo $currentPage ?>" data-base-url="<?php echo BASE_URL ?>">

  <div id="injection_site"></div>

  <div id="myModal" class="modal fade">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title">Bild wird aufbereitet</h4>
      </div>
      <div class="modal-body">
        <p>Bitte warten, das Bild wird für die Bildergalerie aufbereitet   &hellip;</p>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


  <!-- The Bootstrap Image Gallery lightbox, should be a child element of the document body -->
<div id="blueimp-gallery" class="blueimp-gallery">
    <!-- The container for the modal slides -->
    <div class="slides"></div>
    <!-- Controls for the borderless lightbox -->
    <!--<h3 class="title"></h3>-->
    <a class="prev">‹</a>
    <a class="next">›</a>
    <a class="close">×</a>
    <a class="play-pause"></a>
    <ol class="indicator"></ol>
    <p class="description">
    <?php if ($currentPage == URL_NEW): ?>
      <a class="btn btn-primary edit" href="#">Bearbeiten</a>
      <a class="btn btn-success save" href="#">Sichern</a>
    <?php elseif ($currentPage == URL_TRASH): ?>
      <a class="btn btn-info restore" href="#">Wiederherstellen</a>
    <?php endif; ?>
    <?php if ($currentPage == URL_NEW || $currentPage == URL_GALLERY): ?>
      <a class="btn btn-danger delete" href="#">Löschen</a>
    <?php endif; ?>
    </p>
    <!-- The modal dialog, which will be used to wrap the lightbox content -->
    <div class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true">&times;</button>
                    <h4 class="modal-title"></h4>
                </div>
                <div class="modal-body next"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default pull-left prev">
                        <i class="glyphicon glyphicon-chevron-left"></i>
                        Previous
                    </button>
                    <button type="button" class="btn btn-primary next">
                        Next
                        <i class="glyphicon glyphicon-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

  <!-- Fixed navbar -->
    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <?php if($currentPage != URL_SHOW): ?>
          <a class="navbar-brand" href="<?php echo BASE_URL ?>/new/">Photobooth</a>
          <?php endif; ?>
        </div>
        <div class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <?php if($currentPage == URL_SHOW): ?>
            <li ><a class="startSlideShow" href="">Start SlideShow</a></li>
            <?php else: ?>
            <li<?php echo $currentPage == URL_NEW ? ' class="active"' : ""; ?>><a href="<?php echo BASE_URL ?>/new/">Neue</a></li>
            <li<?php echo $currentPage == URL_GALLERY ? ' class="active"' : ""; ?>><a href="<?php echo BASE_URL ?>/gallery/">Galerie</a></li>
            <li<?php echo $currentPage == URL_TRASH ? ' class="active"' : ""; ?>><a href="<?php echo BASE_URL ?>/trash/">Papierkorb</a></li>
            <?php endif; ?>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </div>


 <div class="container" role="main">
  <div id="alerts"></div> 
       <div class="heading-container">
        <div class="heading-left pull-left"></div>
        <div class="heading pull-left">
         <?php if($currentPage == URL_NEW): ?>
            <h1 class="cover-heading">Sandra &amp; Sebastians Photobooth</h1>
          <?php elseif($currentPage === URL_GALLERY): ?>
            <h1 class="cover-heading">Bildergalerie</h1>
          <?php elseif($currentPage === URL_TRASH): ?>
            <h1 class="cover-heading">Papierkorb</h1>
       <?php endif; ?>
       </div>
       <div class="heading-right pull-left"></div>
       <div class="clearfix"></div>
       </div>

      <?php if($currentPage == URL_NEW): ?>
            <p>
              Hier könnt ihr die aufgenommen Bilder abspeichern oder bearbeiten:
              <ul>
              <li>Gespeicherte Bilder kommen in die Galerie und werden am Beamer angezeigt.</li>
              <li>Bilder die euch nicht gefallen könnt ihr löschen,</li>
              <li>gelöschte Bilder werden in den <a href="<?php echo BASE_URL ?>/trash/">Papierkorb</a>  verschoben.</li>
              </ul>
              <p><b>Klick auf ein Bild öffnet die Bearbeitungsansicht!</b>
            </p>
          <?php elseif($currentPage === URL_GALLERY): ?>
            <p>Alle Bilder die ihr hier seht werden auch am Beamer angezeigt</p>
          <?php elseif($currentPage === URL_TRASH): ?>
            <p>Das ist der Papierkorb, ihr könnt versehentlich gelöschte Bilder wiederherstellen. <br /> 
            Wiederhergestellte Bilder werden bei den <a href="<?php echo BASE_URL ?>/new/">neuen Bildern</a> angezeigt <br/>
            Beim Speichern eines Bildes wird das Original auch im Papierkorb abgelegt
            </p>
       <?php endif; ?>

<div id="links">

</div>



    </div>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="<?php echo BASE_URL ?>/bower_components/jquery/dist/jquery.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="<?php echo BASE_URL ?>/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
    <!--<script src="js/docs.min.js"></script> -->


<script src="<?php echo BASE_URL ?>/bower_components/blueimp-gallery/js/jquery.blueimp-gallery.min.js"></script>
<script src="<?php echo BASE_URL ?>/bower_components/blueimp-bootstrap-image-gallery/js/bootstrap-image-gallery.js"></script>

<!-- Instantiate the widget -->
<script type="text/javascript" src='<?php echo BASE_URL ?>/js/lib.js'></script> 
<script type="text/javascript">
    /* global $, photobooth */
    $(function () {
      'use strict';
      photobooth.init();
    });
</script>                        
<?php if($currentPage != URL_SHOW): ?>
<!--<script type="text/javascript" src="http://feather.aviary.com/js/feather.js">-->
<script type="text/javascript">
/* global $ */
    $(function () {
      'use strict';
      $.getScript('http://feather.aviary.com/js/feather.js');
    });
</script>

<?php endif; ?>


  </body>
</html>
