$(jQuery).ready( function() {

	if ( window.location.origin == "http://localhost:3000") {
		var dzDomain = "http://localhost:3000";
	} else {
		var dzDomain = window.location.origin;
	}
	
	$('.carousel').carousel('cycle');
	
	$('a.ajax-link').click(function(){
		event.preventDefault();
		var href_param = $(this).attr('href');
		//var all_vars = getParameterByName( href_param ); //href_param.split("?");
		var all_vars = getParams( href_param );
		var hi = "hello world";
		console.log( all_vars );
		
		$.ajax({
			url: dzDomain + "/wp-admin/admin-ajax.php",
			type: 'POST',
			data: 'action=dzw_ajax_call&' + all_vars,
			success: function ( data ) {
				$('.page-feed').hide();
				$('.page-feed').html(data);
				$('.page-feed').fadeIn('slow');
			}
		});
	});
	
	$('.hover-slider').hover( function() {
		$(this).find('.slide-up').slideDown();
	}, function() {
		$(this).find('.slide-up').slideUp();
	});
	
	dzwpLightboxSetup();
	
	
	//$('body').html( window.location.hash );
	
	$('.dz-lightbox-trigger').click(function() {
		//setupLightbox();
	});
	
	function dzwpLightboxSetup() {
		$('.dzwplb-filmstrip').prepend( '<span class="dzwplb-filmstrip-open">more<span class="dzwplb-mini-icon dzwplb-more-icon"></span></span>' );
		$('.dzwplb-filmstrip-open').click(function(){
			$('.dzwplb-filmstrip-wrapper').slideToggle();
		});
		if( window.location.hash == '#lightbox' ) {
			dzwplbGetScrum();
		}
		dzwplbFilmstrip();
	}
	
	function dzwplbFilmstrip() {
		$('.dzwplb-filmstrip-item').off("click");
		$('.dzwplb-filmstrip-item').click(function(){
			stripid = $(this).data('stripid');
			$('.dzwplb-active').fadeOut( "fast", function(){
				$(this).removeClass("dzwplb-active").addClass("dzwplb-inactive");
				$('.dzwplb-wrapper').find( '[data-imageid="' + stripid + '"]' ).fadeIn( "slow", function(){
					$(this).removeClass("dzwplb-inactive").addClass("dzwplb-active");
					dzwplbFilmstrip();
				});
			});
			$('.dzwplb-caption-active').fadeOut( "fast", function() {
				$(this).removeClass("dzwplb-caption-active").addClass("dzwplb-caption-inactive");
				$('.dzwplb-captions').find( '[data-captionid="' + stripid + '"]' ).fadeIn( "slow", function(){
					$(this).removeClass("dzwplb-caption-inactive").addClass("dzwplb-caption-active");
					dzwplbFilmstrip();
				});
			});
		});
		dzwplbFullScreen();
	}
	
	function dzwplbFullScreen() {
		$('.dzwplb-active').off("click");
		$('.dzwplb-active').click(function(){
			dzwplbGetScrum();
		});
	}
	
	function dzwplbGetScrum() {
		$('body').append('<div class="dz-lightbox-scrum"><div class="dzwplb-accessories"><div class="dzwplb-scrum-thumbs"></div></div></div>');
		location.hash = 'lightbox';
		$(".dzwplb-filmstrip-item").each(function(){
			img_src = $(this).attr('src');
			img_id = $(this).data('stripid');
			$('.dzwplb-scrum-thumbs').append('<img src="' + img_src + '" class="dzwplb-scrum-thumb" data-imageid="' + img_id + '" />');
		});
		$(".dz-lightbox-scrum").append('<span class="dzwplb-fsimage-holder"><span class="dzwplb-fsimage"></span></span>');
		image_id = $('.dzwplb-active').data('imageid');
		dzwplbGetImage(image_id);
		
		
		
		$(document).keyup(function(e) {
			if (e.keyCode == 27) {
				dzwplbDestroyLightbox();
			}   // esc
		});
		dzwplbGetButtons();
	}
	
	function dzwplbGetImage( img_id ) {
		$.ajax({
			url: dzDomain + "/wp-admin/admin-ajax.php",
			type: "POST",
			data: "action=dzw_ajax_call&get_fsimage=" + img_id,
			success: function (data) {
				$(".dzwplb-fsimage").html(data);
				$(".dzwplb-fsimage").fadeIn("slow");
				$('.dzwplb-scrum-thumb').click(function(){
					thmb_id = $(this).data('imageid');
					$(".dzwplb-fsimage").fadeOut("slow", function() {
						dzwplbGetImage( thmb_id );
					});
				});
				$(window).off('resize');
				$(window).resize( function() {
					setLightboxImageSize();
				});
				setLightboxImageSize();
				
				$('.dz-lightbox-scrum').fadeIn();
			}
		});
	}
	
	function dzwplbDestroyLightbox() {
		$('.dz-lightbox-scrum').fadeOut('slow', function() {
			$('.dz-lightbox-scrum').remove();
			location.hash = '';
		});
	}
	
	function dzwplbGetButtons() {
		if ( $('.dzwplb-scrum-thumbs img').length > 0 ) {
			$('.dzwplb-accessories').append('<span class="dzwplb-thumbs-toggle dzwplb-secondary-btn">more<span class="dzwplb-more-icon"></span></span>');
			$('.dzwplb-thumbs-toggle').click( function() {
				$('.dzwplb-scrum-thumbs').slideToggle();
			});
			$('.dzwplb-scrum-thumbs').slideUp();
		}
		
		var nextLink = $('.pagination-next').attr('href');
		if ( typeof nextLink !== 'undefined' && nextLink !== false ) {
			$('.dz-lightbox-scrum').append('<span class="dzwplb-next dzwplb-hotspot"><span class="dzwplb-button"><span class="dzwplb-next-icon"></span></span></span>');
			$('.dzwplb-next').click( function() {
				$('.dz-lightbox-scrum').off();
				event.preventDefault();
				$('body').append('<div class="dz-transition-scrum"></div>');
				$('.dz-transition-scrum').fadeIn('fast');
				$('.dz-lightbox-scrum').fadeOut('slow', function() {
					window.location = nextLink + '#lightbox';
				});
			})
		}
		
		var prevLink = $('.pagination-prev').attr('href');
		if ( typeof prevLink !== 'undefined' && prevLink !== false ) {
			$('.dz-lightbox-scrum').append('<span class="dzwplb-prev dzwplb-hotspot"><span class="dzwplb-button"><span class="dzwplb-prev-icon"></span></span></span>');
			$('.dzwplb-prev').click( function() {
				$('.dz-lightbox-scrum').off();
				event.preventDefault();
				$('body').append('<div class="dz-transition-scrum"></div>');
				$('.dz-transition-scrum').fadeIn('fast');
				$('.dz-lightbox-scrum').fadeOut('slow', function() {
					window.location = prevLink + '#lightbox';
				});
			})
		}
		
		$('.dzwplb-accessories').append('<span class="dzwplb-close dzwplb-secondary-btn">close<span class="dzwplb-close-icon"></span></span>');
		$('.dzwplb-close').click( function() {
			dzwplbDestroyLightbox();
		});
		
		$('.dz-lightbox-scrum').click( function() {
	        lightboxDisplayButtons();
		});
		//$('.dzwplb-accessories').delay(2000).fadeOut("slow");
		//$('.dzwplb-button').delay(2000).fadeOut("slow");
		lightboxDisplayButtons();
		$('.dz-lightbox-scrum').mousemove(function() {
	        lightboxDisplayButtons();
	    });
		
		
		
	}
	
	function lightboxDisplayButtons() {
		if ( $('.dzwplb-accessories').is(":hidden") ) {
	        $('.dzwplb-accessories').fadeIn();
	        $('.dzwplb-button').fadeIn();
        }
        if ( typeof stop_timeout !== 'undefined' ) {
        	clearTimeout(stop_timeout);
        }
		stop_timeout = setTimeout(function() {
			$('.dzwplb-accessories').fadeOut("slow");
			$('.dzwplb-button').fadeOut("slow");
		}, 5000);
	}
	
	function setLightboxImageSize() {
		var scrum_height = $('.dz-lightbox-scrum').height() - 40;
		var scrum_width = $('.dz-lightbox-scrum').width() - 40;
		$('.dzwplb-fsimage img').css({ 'maxWidth': scrum_width, 'maxHeight': scrum_height } );
	}
	
	
	
	
	
	
	
	
	function setupLightbox( image_id ) {
		$('body').append('<div class="dz-lightbox-scrum"></div>');
		location.hash = 'lightbox';
		if ( typeof image_id == 'undefined' ) {
			var image_id = $('.dz-lightbox-trigger').data('imageid');
		}
		var id = $('.dz-lightbox-trigger').data('id');
		var data_string = 'action=dzw_ajax_call&lightbox_image=' + image_id;
		if ( id != '' && typeof id != 'undefined' ) {
			data_string += '&lightbox_id=' + id;
		}
		//var artist = $('.dz-lightbox-trigger').data('artist');
		//var paged = $('.dz-lightbox-trigger').data('paged');
		$.ajax({
			url: dzDomain + "/wp-admin/admin-ajax.php",
			type: 'POST',
			data: data_string,
			success: function ( data ) {
				$('.dz-lightbox-scrum').html(data);
				$(window).resize( function() {
					setLightboxImageSize();
				});
				setLightboxImageSize();
				//var args
				//setNextLightboxImage( {artist:artist, image_id:image_id, paged:paged} );
				
				
				var nextLink = $('.pagination-next').attr('href');
				if ( typeof nextLink !== 'undefined' && nextLink !== false ) {
					$('.dz-lightbox-scrum').append('<span class="lightbox-next lightbox-hotspot"><span class="lightbox-button">&raquo;</span></span>');
					$('.lightbox-next').click( function() {
						event.preventDefault();
						$('body').append('<div class="dz-transition-scrum"></div>');
						$('.dz-transition-scrum').fadeIn('fast');
						$('.dz-lightbox-scrum').fadeOut('slow', function() {
							window.location = nextLink + '#lightbox';
						});
					})
				}
				
				var prevLink = $('.pagination-prev').attr('href');
				if ( typeof prevLink !== 'undefined' && prevLink !== false ) {
					$('.dz-lightbox-scrum').append('<span class="lightbox-prev lightbox-hotspot"><span class="lightbox-button">&laquo;</span></span>');
					$('.lightbox-prev').click( function() {
						event.preventDefault();
						$('body').append('<div class="dz-transition-scrum"></div>');
						$('.dz-transition-scrum').fadeIn('fast');
						$('.dz-lightbox-scrum').fadeOut('slow', function() {
							window.location = prevLink + '#lightbox';
						});
					})
				}
				
				$('.lightbox-hotspot').hover( function() {
					$(this).children('.lightbox-button').finish().fadeIn('fast');
				}, function() {
					$(this).children('.lightbox-button').finish().fadeOut('slow');
				});
				$('.dz-lightbox-scrum').children('.lightbox-close').click(function() {
					destroyLightbox();
				});
				$('.secondary-open').click(function() {
					$('.secondary-holder').slideToggle('slow');
				});
				$('.secondary-holder').slideUp('fast');
				$('.secondary-img').click(function() {
					secondary_id = $(this).data('imageid');
					//$('.img-wrap').fadeOut('fast');
					loadSecondaryImage( secondary_id );
				});
			} 
		});
		$('.dz-lightbox-scrum').fadeIn('slow', function(){
			$('.lightbox-hotspot').children('.lightbox-button').delay(1000).fadeOut('slow');
		});
		
		
		
		
		$('.dz-lightbox-scrum').click(function() {
			/*$('.dz-lightbox-scrum').fadeOut('slow', function() {
				$('.dz-lightbox-scrum').remove();
			});*/
		});
	}
	
	function loadSecondaryImage( secondary_id ) {
		var image_id = secondary_id;
		var id = $('.dz-lightbox-trigger').data('id');
		var data_string = 'action=dzw_ajax_call&simple_return=1&lightbox_image=' + image_id;
		if ( id != '' ) {
			data_string += '&lightbox_id=' + id;
		}
		$.ajax({
			url: dzDomain + "/wp-admin/admin-ajax.php",
			type: 'POST',
			data: data_string,
			success: function ( data ) {
				$('.img-wrap').fadeOut('fast', function() {
					$('.img-wrap').html( data );
					$('.img-wrap').fadeIn('fast');
				});
				
				$(window).resize( function() {
					setLightboxImageSize();
				});
				setLightboxImageSize();
				
				$('.secondary-img').click(function() {
					secondary_id = $(this).data('imageid');
					loadSecondaryImage( secondary_id );
				});
			}
		});
	}
	
	function destroyLightbox() {
		$('.dz-lightbox-scrum').fadeOut('slow', function() {
			$('.dz-lightbox-scrum').remove();
			location.hash = '';
		});
	}
	
	
	/*
	function setNextLightboxImage( arg ) {
		$('.lightbox-next').click(function(){
			var newPaged = $('.lightbox-img').data('paged') + 1;
			$.ajax({
				url: dzDomain + "/wp-admin/admin-ajax.php",
				type: 'POST',
				data: 'action=dzw_ajax_call&next=1&artist=' + arg.artist + '&paged=' + newPaged + '&lightbox_image=' + arg.image_id,
				success: function ( data ) {
					$('.dz-lightbox-scrum').html(data);
					$(window).resize( function() {
						setLightboxImageSize();
					});
					setLightboxImageSize();
					$('.lightbox-img' ).data('paged', newPaged );
					setNextLightboxImage( {artist:arg.artist, image_id:arg.image_id, paged:newPaged} );
				}
			});
		});
	}*/
	
	
	function getParams( url ) {
		var url_parts = url.split('?');
		var params_string = url_parts[1].split('#');
		//var params_parts = params_string[0].split('&');
		console.log(params_string[0]);
		
		return params_string[0];
	}
	
	$('.affixedHeader').affix({
		offset: 40
	});
	
	
	$(window).resize(function(){
		navbarReset();
	});
	function navbarReset() {
		header_height = $('.affixedHeader').height();
		console.log(header_height);
		$('.main-content').css('margin-top',header_height);

	}
	navbarReset();
	
	$('.go-back').click(function(e){
		e.preventDefault();
		window.history.back();
	});
	
	/*ToolTips*/
	$(function () {
	    $("[data-toggle='tooltip']").tooltip();
	});
		
});