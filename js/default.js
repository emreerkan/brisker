function number_format(number, decimals, decPoint, thousandsSep) {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number;
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
  var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep;
  var dec = (typeof decPoint === 'undefined') ? '.' : decPoint;
  var s = '';

  var toFixedFix = function (n, prec) {
    if (('' + n).indexOf('e') === -1) {
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec);
    } else {
      var arr = ('' + n).split('e');
      var sig = '';
      if (+arr[1] + prec > 0) {
        sig = '+';
      }
      return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec);
    }
  }

  s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }

  return s.join(dec);
}

var ping_sound, data = [];

jQuery(function($) {
  var $d = $(document);
  ping_sound = document.getElementById('audio-ping');
  $d
  .on('click', '.point', function(e) {
  	notify();
    var $this = $(this), $total = $('.total'), total = parseInt( $total.val().replace(/\./g, ''), 10 ), points = parseInt( $this.text().replace(/\./g, ''), 10), last = total + points;
    data.push(points);
    $total.val(number_format(last, 0, '.','.'));
    updateLast();
  })
  .on('click', '.undo', function(e) {
    if ( data.length === 0) return;
    notify();
    var $total = $('.total'), total = parseInt( $total.val().replace(/\./g, ''), 10 ), last = total - data.pop();
    $total.val(number_format(last, 0, '.','.'));
    updateLast();
    
  })
  .on('click', '.add', function(e) {
    var $this = $(this), $total = $('.total'), total = parseInt( $total.val().replace(/\./g, ''), 10 ), $brisk = $('.brisk'), points = parseInt( $brisk.val(), 10) * 20, last = total + points;
    if (points > 0) {
      notify();
      data.push(points);
      $total.val(number_format(last, 0, '.','.'));
      $brisk.val('');
      updateLast();
    }
  })
  .on('click', '.reset', function(e) {
    if ( confirm('Tabela sıfırlansın mı?') ){
      $('.total').val(0);
      data = [];
      $('.last').find('span').text('').end().find('em').text('').end().find('strong').text(0);
      $('.brisk').val('');
    }
  })
  .on('focus', 'input', function(e) {
    $(this).select();
  })
  .on('blur', 'input', function(e) {
    var $this = $(this), val =  parseInt( $this.val().replace(/\./g, ''), 10 );
    if ( val > 0 ) {
      $this.val(number_format(val, 0, '.','.'));
    }
  });

  fixHeight();
  $(window).on('resize orientationchange', fixHeight);
});

function updateLast() {
  var $last = $('.last');
  $last.find('span').text(data.length > 2 ? number_format(data[data.length - 3], 0, '.','.') : '');
  $last.find('em').text(data.length > 1 ? number_format(data[data.length - 2], 0, '.','.') : '');
  $last.find('strong').text(number_format(data[data.length - 1], 0, '.','.'));
}

function notify() {
  ping_sound.currentTime = 0;
  ping_sound.play();
}

function fixHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}