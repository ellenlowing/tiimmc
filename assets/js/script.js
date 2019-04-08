var mode = 1; // 1: normal, 0: screensaver (idle)
var idleTimeout;
var idleInterval = 90000; //90000


$(document).ready(() => {
	init();
	render();
  $(window).mousemove(mouseMove);
  $(window).scroll(mouseMove);
});

function init () {
  idleTimeout = setTimeout(idle, idleInterval);
	$('#mukbang').click( function() {
		if($('#trailer').get(0).paused) {
			$('#trailer').get(0).play();
			$('#mukbang').toggleClass('playing', true);
			if(!$('#mukbang').hasClass('initialized')) {
				$('#mukbang').toggleClass('initialized', true);
				// $('#trailer').css('visibility', 'visible');
			}
		} else {
			$('#trailer').get(0).pause();
			$('#mukbang').toggleClass('playing', false);
		}
	});

	$('#trailer').on('ended', function() {
		$('#mukbang').toggleClass('initialized', false);
		$('#mukbang').toggleClass('playing', false);
	});
}

function render () {
  requestAnimationFrame(render);
}

function mouseMove () {
  mode = 1;
  $('.screensaver').hide();
  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(idle, idleInterval);
}

function idle () {
  mode = 0;
  $('.screensaver').show();
  var date = new Date("May 18, 2019 19:00:00").getTime();
  var timer = setInterval(function() {
    var now = new Date().getTime();
    var dist = date - now;
    var days = Math.floor(dist / (1000 * 60 * 60 * 24));
    var hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((dist % (1000 * 60)) / 1000);
    $('#days').html(days<10?'0'+days+':':days+':');
		$('#hours').html(hours<10?'0'+hours+':':hours+':');
		$('#minutes').html(minutes<10?'0'+minutes+':':minutes+':');
		$('#seconds').html(seconds<10?'0'+seconds:seconds);
  });
}
