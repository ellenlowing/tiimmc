var mode = 1; // 1: normal, 0: screensaver (idle)
var idleTimeout;
var idleInterval = 90000; //90000
var mobileMode = false;
var touchInit = false; // mobile only
var touchTimeout;
var progressId;
var player = videojs('trailer');
var playerReady = false;

$(document).ready(() => {
	if(isMobile()) mobileMode = true;
	init();
	playerReady = player.ready( () => {return true});
  $(window).mousemove(mouseMove);
  $(window).scroll(mouseMove);
});

function init () {
  idleTimeout = setTimeout(idle, idleInterval); //screensaver timer

	if(mobileMode) {
		// showing play / pause button
		$('#vidbutton').show();

		// rotating the video to landscape mode
		$('#trailer').css({
			'transform': 'rotate(-90deg) translateX(+50vw) translateX(-50vh) translateY(-50vh) translateY(50vw)',
			'-webkit-transform': 'rotate(-90deg) translateX(+50vw) translateX(-50vh) translateY(-50vh) translateY(50vw)',
			'width': '100vh',
			'height': '100vw'
		});
		$('#vidbar-out').css({
			'height': '91vh',
			'width': '4px',
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
		$('#vidbar-sensitive').css({
			'height': 'inherit',
			'width': '40px',
			'position': 'absolute',
			'top': '0',
			'left': '-15px'
		});

		document.getElementById('rsvp-link').addEventListener('touchstart', () => {
			$('.oval').css('background', '#A55DFF');
			$('#rsvp-link').css('color', '#fff');
		}, false);

		document.getElementById('rsvp-link').addEventListener('touchend', () => {
			$('.oval').css('background', 'unset');
			$('#rsvp-link').css('color', '#A55DFF');
		}, false);

		// tap listener
		// once: to show pause button and vid progress bar
		// twice: set vid time if press in vidbar, otherwise pause video
		var playbtn = document.getElementById('vidbutton');
		playbtn.addEventListener('touchstart', (e) => {
			if(!$('#mukbang').hasClass('initialized')) {
				$('#mukbang').toggleClass('initialized', true);
				$('#vidbutton').html('Pause');
				$('#vidbar-out').show();
				touchInit = true;
				touchTimeout = setTimeout(() => {touchInit = false; $('#vidbutton').html(''); $('#vidbar-out').hide();}, 3000);
			}
		});
		var mukbang = document.getElementById('mukbang');
		mukbang.addEventListener('touchstart', (e) => {
			if($('#mukbang').hasClass('initialized')) {
				if(player.paused()) {
					var touch = e.targetTouches[0];
					if(touch.pageX > (window.innerWidth-100)) {
						// set vid time with clientY
						var progress = 1.0 - Math.abs(touch.pageY - 0.045 * window.innerHeight) / (0.91 * window.innerHeight);
						player.currentTime(progress * player.duration());
						player.pause();
						render();
					} else {
						player.play();
						progressId = requestAnimationFrame(render);
						$('#vidbutton').html('Pause');
						$('#vidbar-out').show();
						touchInit = true;
						touchTimeout = setTimeout(() => {touchInit = false; $('#vidbutton').html(''); $('#vidbar-out').hide();}, 3000);
					}
				} else {
					if(!touchInit) {
						touchInit = true;
						$('#vidbutton').html('Pause');
						$('#vidbar-out').show();
						touchTimeout = setTimeout(() => {
							touchInit = false;
							$('#vidbutton').html('');
							$('#vidbar-out').hide();
						}, 3000);
					} else {
						clearTimeout(touchTimeout);
						touchInit = false;
						var touch = e.targetTouches[0];
						if(touch.pageX > (window.innerWidth-100)) {
							// set vid time with clientY
							var progress = 1.0 - Math.abs(touch.pageY - 0.045 * window.innerHeight) / (0.91 * window.innerHeight);
							player.currentTime(progress * player.duration());
							player.play();
							touchTimeout = setTimeout(() => {$('#vidbutton').html(''); $('#vidbar-out').hide();}, 3000);
							render();
						} else {
							player.pause();
							cancelAnimationFrame(progressId);
							$('#vidbutton').html('Play');
							$('#vidbar-out').show();
						}
					}
				}
			}
		}, false);
	} else {
		// DESKTOP
		// switching play/pause states
		$('#mukbang').click( function() {
			if(player.paused()) {
				player.play();
				progressId = requestAnimationFrame(render);
				$('#playcursor').hide();
				$('#pausecursor').show();
				touchTimeout = setTimeout(() => {$('#vidbar-out').hide();}, 1000);
				if(!$('#mukbang').hasClass('initialized')) {
					$('#mukbang').toggleClass('initialized', true);
					$('#vidbar-out').show();
					touchTimeout = setTimeout(() => {$('#vidbar-out').hide();}, 1000);
				}
			} else {
				player.pause();
				cancelAnimationFrame(progressId);
				$('#pausecursor').hide();
				$('#playcursor').show();
				$('#vidbar-out').show();
			}
		});

		// showing and hiding vid progress bar on mouse move
		$('#mukbang').mouseenter( function() {
			$('#vidcursor').show();
		}).mousemove( function(e) {
			clearTimeout(touchTimeout);
			$('#vidcursor').css('left', e.pageX + 'px');
			$('#vidcursor').css('top', e.pageY + 'px');
			if($('#mukbang').hasClass('initialized')) {
				$('#vidbar-out').show();
				if(!player.paused() && e.pageY < 550) touchTimeout = setTimeout(() => {$('#vidbar-out').hide();}, 1000);
			}
		}).mouseleave( function() {
			$('#vidcursor').hide();
		});

		// functionality to click on progress bar to set vid time
		$('#vidbar-sensitive').click( function(e) {
			var progress = (e.pageX - 0.045 * window.innerWidth) / (0.91 * window.innerWidth);
			player.currentTime(progress * player.duration());
			$('#mukbang').click();
			render();
		}).mouseenter( function() {
			$('#vidcursor').hide();
		}).mouseover( function() {
			$('#vidcursor').hide();
		}).mouseleave( function() {
			$('#vidcursor').show();
		});
	}

	// reset video and display cover image
	player.on('ended', function() {
		player.currentTime(0);
		touchInit = false;
		clearTimeout(touchTimeout);
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
  var date = new Date("May 11, 2019 19:00:00").getTime();
  var timer = setInterval(function() {
    var now = new Date().getTime();
    var dist = date - now;
    var days = Math.floor(dist / (1000 * 60 * 60 * 24));
    var hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((dist % (1000 * 60)) / 1000);
    $('#days').html(days<0?'0':days<10?'0'+days:days);
		$('#hours').html(hours<0?'00':hours<10?'0'+hours:hours);
		$('#minutes').html(minutes<0?'00':minutes<10?'0'+minutes:minutes);
		$('#seconds').html(seconds<0?'00':seconds<10?'0'+seconds:seconds);
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
