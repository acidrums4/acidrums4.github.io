jQuery(document).ready(function(event){
  var isAnimating = false,
    newLocation = '';
    firstLoad = false;
  
  //trigger smooth transition from the actual page to the new one 
  $('main').on('click', '[data-type="page-transition"]', function(event){
    event.preventDefault();
    //detect which page has been selected
    var newPage = $(this).attr('href');
    //if the page is not already being animated - trigger animation
    if( !isAnimating ) changePage(newPage, true);
    firstLoad = true;
  });

  //detect the 'popstate' event - e.g. user clicking the back button
  $(window).on('popstate', function() {
  	if( firstLoad ) {
      /*
      Safari emits a popstate event on page load - check if firstLoad is true before animating
      if it's false - the page has just been loaded 
      */
      var newPageArray = location.pathname.split('/'),
        //this is the url of the page to be loaded 
        newPage = newPageArray[newPageArray.length - 1];

      if( !isAnimating  &&  newLocation != newPage ) changePage(newPage, false);
    }
    firstLoad = true;
	});

	function changePage(url, bool) {
    isAnimating = true;
    // trigger page animation
    $('body').addClass('page-is-changing');
    $('.cd-loading-bar').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
    	loadNewContent(url, bool);
      newLocation = url;
      $('.cd-loading-bar').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
    });
    //if browser doesn't support CSS transitions
    if( !transitionsSupported() ) {
      loadNewContent(url, bool);
      newLocation = url;
    }
	}

	function loadNewContent(url, bool) {
		url = ('' == url) ? 'index.html' : url;
  	var newSection = 'cd-'+url.replace('.html', '');
  	var section = $('<div class="cd-main-content '+newSection+'"></div>');
  		
  	section.load(url+' .cd-main-content > *', function(event){
      // load new content and replace <main> content with the new one
      $('main').html(section);
      //if browser doesn't support CSS transitions - dont wait for the end of transitions
      var delay = ( transitionsSupported() ) ? 1200 : 0;
      setTimeout(function(){
        //wait for the end of the transition on the loading bar before revealing the new content
        ( section.hasClass('cd-about') ) ? $('body').addClass('cd-about') : $('body').removeClass('cd-about');
        $('body').removeClass('page-is-changing');
        $('.cd-loading-bar').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          isAnimating = false;
          $('.cd-loading-bar').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
        });

        if( !transitionsSupported() ) isAnimating = false;
      }, delay);
      
      if(url!=window.location && bool){
        window.history.pushState({path: url},'',url);
      }
		});
  }

  function transitionsSupported() {
    return $('html').hasClass('csstransitions');
  }
});

;( function( window ) {
	
	'use strict';
	
	var docElem = window.document.documentElement,
		support = { animations : Modernizr.cssanimations },
		animEndEventNames = {
			'WebkitAnimation' : 'webkitAnimationEnd',
			'OAnimation' : 'oAnimationEnd',
			'msAnimation' : 'MSAnimationEnd',
			'animation' : 'animationend'
		},
		// animation end event name
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ];

	function getViewportH() {
		var client = docElem['clientHeight'],
			inner = window['innerHeight'];
		
		if( client < inner )
			return inner;
		else
			return client;
	}

	function scrollY() {
		return window.pageYOffset || docElem.scrollTop;
	}

	// http://stackoverflow.com/a/5598797/989439
	function getOffset( el ) {
		var offsetTop = 0, offsetLeft = 0;
		do {
			if ( !isNaN( el.offsetTop ) ) {
				offsetTop += el.offsetTop;
			}
			if ( !isNaN( el.offsetLeft ) ) {
				offsetLeft += el.offsetLeft;
			}
		} while( el = el.offsetParent )

		return {
			top : offsetTop,
			left : offsetLeft
		}
	}

	function inViewport( el, h ) {
		var elH = el.offsetHeight,
			scrolled = scrollY(),
			viewed = scrolled + getViewportH(),
			elTop = getOffset(el).top,
			elBottom = elTop + elH,
			// if 0, the element is considered in the viewport as soon as it enters.
			// if 1, the element is considered in the viewport only when it's fully inside
			// value in percentage (1 >= h >= 0)
			h = h || 0;

		return (elTop + elH * h) <= viewed && (elBottom - elH * h) >= scrolled;
	}

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function GridItem( el ) {
		this.el = el;
		this.anchor = el.querySelector( 'a' ) 
		this.image = el.querySelector( 'img' );
		this.desc = el.querySelector( 'h3' );
	}

	GridItem.prototype.addCurtain = function() {
		if( !this.image ) return;
		this.curtain = document.createElement( 'div' );
		this.curtain.className = 'curtain';
		this.anchor.appendChild( this.curtain );
	}

	GridItem.prototype.changeAnimationDelay = function( time ) {
		if( this.curtain ) {
			this.curtain.style.WebkitAnimationDelay = time + 'ms';
			this.curtain.style.animationDelay = time + 'ms';
		}
		if( this.image ) {
			this.image.style.WebkitAnimationDelay = time + 'ms';
			this.image.style.animationDelay = time + 'ms';
		}
		if( this.desc ) {
			this.desc.style.WebkitAnimationDelay = time + 'ms';
			this.desc.style.animationDelay = time + 'ms';
		}
	}

	function GridScrollFx( el, options ) {	
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this._init();
	}

	GridScrollFx.prototype.options = {
		// Minimum and maximum delay of the animation (random value is chosen)
		minDelay : 0,
		maxDelay : 500,
		// The viewportFactor defines how much of the appearing item has to be visible in order for the animation to start
		// if we'd use a value of 0, this would mean that it would add the animation class as soon as the item is in the viewport. 
		// If we were to use the value of 1, the animation would only be triggered when we see all of the item in the viewport (100% of it)
		viewportFactor : 0
	}

	GridScrollFx.prototype._init = function() {
		var self = this, items = [];

		[].slice.call( this.el.children ).forEach( function( el, i ) {
			var item = new GridItem( el );
			items.push( item );
		} );

		this.items = items;
		this.itemsCount = this.items.length;
		this.itemsRenderedCount = 0;
		this.didScroll = false;

		imagesLoaded( this.el, function() {
			// show grid
			classie.add( self.el, 'loaded' );

			// initialize masonry
			new Masonry( self.el, {
				itemSelector : 'li',
				isFitWidth : true,
				transitionDuration : 0
			} );
			
			// the items already shown...
			self.items.forEach( function( item ) {
				if( inViewport( item.el ) ) {
					++self.itemsRenderedCount;
					classie.add( item.el, 'shown' );
				}
				else {
					item.addCurtain();
					// add random delay
					item.changeAnimationDelay( Math.random() * ( self.options.maxDelay - self.options.minDelay ) + self.options.minDelay );
				}
			} );

			var onScrollFn = function() {
				if( !self.didScroll ) {
					self.didScroll = true;
					setTimeout( function() { self._scrollPage(); }, 200 );
				}
				
				if( self.itemsRenderedCount === self.itemsCount ) {
					window.removeEventListener( 'scroll', onScrollFn, false );
				}
			}

			// animate the items inside the viewport (on scroll)
			window.addEventListener( 'scroll', onScrollFn, false );
			// check if new items are in the viewport after a resize
			window.addEventListener( 'resize', function() { self._resizeHandler(); }, false );
		});
	}

	GridScrollFx.prototype._scrollPage = function() {
		var self = this;
		this.items.forEach( function( item ) {
			if( !classie.has( item.el, 'shown' ) && !classie.has( item.el, 'animate' ) && inViewport( item.el, self.options.viewportFactor ) ) {
				++self.itemsRenderedCount;

				if( !item.curtain ) {
					classie.add( item.el, 'shown' );
					return;
				};

				classie.add( item.el, 'animate' );
				
				// after animation ends add class shown
				var onEndAnimationFn = function( ev ) {
					if( support.animations ) {
						this.removeEventListener( animEndEventName, onEndAnimationFn );
					}
					classie.remove( item.el, 'animate' );
					classie.add( item.el, 'shown' );
				};

				if( support.animations ) {
					item.curtain.addEventListener( animEndEventName, onEndAnimationFn );
				}
				else {
					onEndAnimationFn();
				}
			}
		});
		this.didScroll = false;
	}

	GridScrollFx.prototype._resizeHandler = function() {
		var self = this;
		function delayed() {
			self._scrollPage();
			self.resizeTimeout = null;
		}
		if ( this.resizeTimeout ) {
			clearTimeout( this.resizeTimeout );
		}
		this.resizeTimeout = setTimeout( delayed, 1000 );
	}

	// add to global namespace
	window.GridScrollFx = GridScrollFx;

} )( window );

