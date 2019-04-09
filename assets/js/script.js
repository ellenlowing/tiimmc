var mode = 1; // 1: normal, 0: screensaver (idle)
var idleTimeout;
var idleInterval = 90000; //90000
var mobileMode = false;
var progressId;
var player = videojs('trailer');
var playerReady = false;

$(document).ready(() => {
	init();
	playerReady = player.ready( () => {return true});
  $(window).mousemove(mouseMove);
  $(window).scroll(mouseMove);
});

function init () {
  idleTimeout = setTimeout(idle, idleInterval);
	if(isMobile()) {
		mobileMode = true;
		$('#vidbutton').show();
		$('#trailer').css({
			'transform': 'rotate(-90deg) translateX(+50vw) translateX(-50vh) translateY(-50vh) translateY(50vw)',
			'-webkit-transform': 'rotate(-90deg) translateX(+50vw) translateX(-50vh) translateY(-50vh) translateY(50vw)',
			'width': '100vh',
			'height': '100vw'
		});
		$('#vidbar-out').css({
			'height': '91vh',
			'width': '10px',
			'top': '50%',
			'margin-top': '-45.5vh',
			'left': 'unset',
			'margin-left': 'unset',
			'right': '26px',
			'transform': 'scaleY(-1)'
		});
		$('#vidbar-in').css({
			'width': 'inherit',
			'height': '0',
			'transform': 'scaleY(-1)'
		});
	}

	$('#mukbang').click( function() {
		if(player.paused()) {
			player.play();
			progressId = requestAnimationFrame(render);
			if(mobileMode) {
				$('#vidbutton').html('Pause');
			} else {
				$('#playcursor').hide();
				$('#pausecursor').show();
			}
			if(!$('#mukbang').hasClass('initialized')) {
				$('#mukbang').toggleClass('initialized', true);
				$('#vidbar-out').show();
			}
		} else {
			player.pause();
			cancelAnimationFrame(progressId);
			if(mobileMode) {
				$('#vidbutton').html('Play');
			} else {
				$('#pausecursor').hide();
				$('#playcursor').show();
			}
		}
	});

	player.on('ended', function() {
		player.currentTime(0);
		$('#mukbang').toggleClass('initialized', false);
		cancelAnimationFrame(progressId);
		$('#vidbar-out').hide();
		if(mobileMode) {
			$('#vidbutton').html('Play');
		} else {
			$('#pausecursor').hide();
			$('#playcursor').show();
		}
	});

	if(!mobileMode) {
		$('#mukbang').mouseenter( function() {
			$('#vidcursor').show();
		}).mousemove( function(e) {
			$('#vidcursor').css('left', e.pageX + 'px');
			$('#vidcursor').css('top', e.pageY + 'px');
		}).mouseleave( function() {
			$('#vidcursor').hide();
		});
	}

	$('#vidbar-out').click( function(e) {
		var progress = 0;
		if(mobileMode) {
			progress = 1.0 - Math.abs(e.pageY - 0.045 * window.innerHeight) / (0.91 * window.innerHeight);
		} else {
			progress = (e.pageX - 0.045 * window.innerWidth) / (0.91 * window.innerWidth);
		}
		player.currentTime(progress * player.duration());
		$('#mukbang').click();
		render();
	}).mouseenter( function() {
		if(!mobileMode) $('#vidcursor').hide();
	}).mouseleave( function() {
		if(!mobileMode) $('#vidcursor').show();
	});
}

function render () {
	var progress = player.currentTime() / player.duration();
	if(mobileMode) {
		var outerheight = parseFloat($('#vidbar-out').css('height'));
		$('#vidbar-in').css('height', (outerheight * progress) + 'px');
	} else {
		var outerwidth = parseFloat($('#vidbar-out').css('width'));
		$('#vidbar-in').css('width', (outerwidth * progress) + 'px');
	}
  progressId = requestAnimationFrame(render);
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

function isMobile() {
  var md = new MobileDetect(window.navigator.userAgent);
  if(md.mobile()){
    return true;
  } else {
    return false;
  }
}
