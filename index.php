<?php
$v = 26;
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Bezik Puan Tablosu</title>
  <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi, minimal-ui">
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <link rel="stylesheet" href="css/reset.css" type="text/css" />
  <link rel="stylesheet" href="css/default.css?v=<?php echo $v; ?>" type="text/css" />
  <script src="js/jquery.js"></script>
  <script src="js/default.js?v=<?php echo $v; ?>"></script>
  <script src='https://www.googletagmanager.com/gtag/js?id=UA-93921-1' async></script>
  <script>
    window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-93921-1', {"anonymize_ip":true} );
  </script>
</head>
<body>
  <audio id="audio-ping">
    <source src="data:video/ogg;base64,<?php echo base64_encode(file_get_contents('audio/ping.ogg')); ?>" type="audio/ogg">
    <source src="data:audio/mpeg;base64,<?php echo base64_encode(file_get_contents('audio/ping.mp3')); ?>" type="audio/mpeg">
  </audio>
  <div class="grid-container">
    <input type="text" value="0" class="total" inputmode="numeric" pattern="[0-9]*">
    <button class="undo"><i class="bi-undo"></i></button>
    <button class="last"><span></span><em></em><strong>0</strong></button>
    <button class="point">20</button>
    <button class="point">40</button>
    <button class="point">50</button>
    <button class="point">60</button>
    <button class="point">80</button>
    <button class="point">100</button>
    <button class="point">150</button>
    <button class="point">200</button>
    <button class="point">250</button>
    <button class="point">300</button>
    <button class="point">400</button>
    <button class="point">500</button>
    <button class="point">600</button>
    <button class="point">800</button>
    <button class="point">1.000</button>
    <button class="point">1.500</button>
    <input type="text" value="" class="brisk" min="0" max="32" inputmode="numeric" pattern="[0-9]*" placeholder="Brisk">
    <button class="add"><i class="bi-add"></i></button>
    <button class="reset"><i class="bi-reset"></i></button>
  </div>
</body>
</html>
