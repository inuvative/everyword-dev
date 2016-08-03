/*global javascripture bible */
;( function ( $ ) {
	"use strict";
	var listenForKeyboardShortcuts = true,
	    waitingForAnotherNumber = false,
	    waitingForNumberTimer,
	    functionPressed = false;
	$(document).on('keydown', function (event) {
		console.log( event.keyCode );
		if ( event.keyCode === 91 || event.keyCode === 17 || event.keyCode === 18 || event.keyCode === 224 ) {
			functionPressed = true;
		}
		if ( $( 'input:focus' ).length !== 0 ) {
			console.log( $( 'input:focus' ) );
		}
		console.log( functionPressed );
		if ( $( 'input:focus' ).length === 0 && ! functionPressed ) { //don't capture inside form fields or when function is held down
			//esc
			if ( 27 === event.keyCode ) {
				$( '.popup' ).popup( 'close' );
			}

			//jump to chapter
			if ( event.which > 47 && event.which < 58 ) {
				var chapter = event.which - 48,
				    currentReference = javascripture.modules.reference.getReferenceFromHash();

				if ( waitingForAnotherNumber ) {
					chapter = '' + currentReference.chapter + chapter;
				}

				waitingForAnotherNumber = true;
				clearTimeout( waitingForNumberTimer );

				var bookId = bible.getBookId( currentReference.book );
				if ( bible.Data.verses[bookId - 1][ chapter - 1] ) {
					var newReference = currentReference;
					newReference.chapter = chapter;
					window.location.hash = javascripture.modules.reference.createReferenceLink( currentReference );
				}
				waitingForNumberTimer = setTimeout( function () {
					if ( waitingForAnotherNumber === true ) {
						waitingForAnotherNumber = false;
					}
				}, 800);

			}

			//next / prev buttons in search
			if ( event.keyCode === 187 || event.keyCode === 61 ) {
				if($('#currentRef').next().length>0){
					markReference($('#currentRef').next());
				}
			}
			if ( event.keyCode === 189 || event.keyCode === 173 ) {
				if( $('#currentRef').prev().length > 0 ) {
					markReference($('#currentRef').prev());
				}
			}

			//if ( event.keyCode === 18 ) {
				//listenForKeyboardShortcuts = true;
			//} else {
				if ( listenForKeyboardShortcuts ) {
					var target = $('#keyCode' + event.keyCode);
					if ( target.length > 0) {
						event.preventDefault();
						$('#keyCode' + event.keyCode).click();
					}

					if (event.keyCode === 14 || event.keyCode === 16 || event.keyCode === 45 || event.keyCode === 61) {
						if ($('#results .collapsible-wrapper').length) { //there should be a better way to see if the widget has been initialized
							var currentLink = $('#results').find('.ui-btn-active'),
								newLink;
							if (event.keyCode === 61 || event.keyCode === 14) {
								newLink = currentLink.closest('li').next().find('a');
							}
							if (event.keyCode === 45 || event.keyCode === 16) {
								newLink = currentLink.closest('li').prev().find('a');
							}
							newLink.click();
							//not sure why this is needed
							window.location = newLink.attr('href');
							newLink.closest('ol').scrollTo(newLink);
						}
					}
				}
				//listenForKeyboardShortcuts = false;
			//}

			if ( event.keyCode > 64 && event.keyCode < 91 ) {
				$( '.dock' ).css( 'top', 0 );
				$( '#goToReference' ).val( '' ).focus();
			}
		}
	});
	$(document).on('keyup', function (event) {
		if ( event.keyCode === 91 || event.keyCode === 17 || event.keyCode === 18 || event.keyCode === 224 ) {
			functionPressed = false;
			console.log(functionPressed);
		}
	} );
} )( jQuery );