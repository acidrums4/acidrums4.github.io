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

jQuery(document).ready(function(event){
  var isAnimating = false,
    newLocation = '';
    firstLoad = false;

  function toggleMenu(){
    $('button').toggleClass('active');
    $('body').toggleClass('nav-opened');
  }

  $('button').on('click', function () {
    toggleMenu();
  });

  // Filtrar por categorías
  $('ul.filter-menu a').on('click', function () {
    var $this = $(this);
    // No hacer nada si uno hace click en el activo
    if ( !$this.hasClass('nav-filter-active') ) {
      $('ul.filter-menu a').removeClass('nav-filter-active');
      $this.addClass('nav-filter-active');
      // Obtener que se va a filtrar de 'data-filter'
      var $filter = $this.data('filter'); 
      // Si uno selecciona 'Todos', pues mostrar todos
      $filter == 'item-all' ? 
        $('ul.grid>li')
        .not(':visible')
        .fadeIn(function(){
          toggleMenu();
          window.scrollTo(0,10);
      }) 
      : // Y si no, pues ocúltelos mano
        $('ul.grid>li')
        .fadeOut(0,function(){
          toggleMenu();
          window.scrollTo(0,10);
        })
        .filter(function () {
          // Devolver los que tienen igual 'data-item-type' que el filtro
          return $(this).data('item-type') == $filter; 
        })
        .fadeIn(500); 
    } // if
  }); // on

  $(window).scroll(function() {
    if ($(this).scrollTop() > 1){  
      $('header').addClass("sticky");
    }
    else{
      $('header').removeClass("sticky");
    }
  });
  
  function doExpandableGallery(itemInfoWrapper){
    itemInfoWrapper.each(function(){
      var container = $(this),
        // create slider pagination
        sliderPagination = createSliderPagination(container);
      
      //update slider navigation visibility
      updateNavigation(container, container.find('.cd-slider li').eq(0));

      container.find('.cd-slider').on('click', function(event){
        //enlarge slider images 
        if( !container.hasClass('cd-slider-active') && $(event.target).is('.cd-slider')) {
          itemInfoWrapper.removeClass('cd-slider-active');
          container.addClass('cd-slider-active').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
            $('body,html').animate({'scrollTop':container.offset().top}, 200);
          });
        }
      });

      container.find('a.item-close').on('click', function(){
        //shrink slider images 
        container.removeClass('cd-slider-active');
      });

      //update visible slide
      container.find('.cd-next').on('click', function(){
        nextSlide(container, sliderPagination);
      });

      container.find('.cd-prev').on('click', function(){
        prevSlide(container, sliderPagination);
      });

      container.find('.cd-slider').on('swipeleft', function(){
        var wrapper = $(this),
          bool = enableSwipe(container);
        if(!wrapper.find('.selected').is(':last-child') && bool) {nextSlide(container, sliderPagination);}
      });

      container.find('.cd-slider').on('swiperight', function(){
        var wrapper = $(this),
          bool = enableSwipe(container);
        if(!wrapper.find('.selected').is(':first-child') && bool) {prevSlide(container, sliderPagination);}
      });

      sliderPagination.on('click', function(){
        var selectedDot = $(this);
        if(!selectedDot.hasClass('selected')) {
          var selectedPosition = selectedDot.index(),
            activePosition = container.find('.cd-slider .selected').index();
          if( activePosition < selectedPosition) {
            nextSlide(container, sliderPagination, selectedPosition);
          } else {
            prevSlide(container, sliderPagination, selectedPosition);
          }
        }
      });
    });	
      
    //keyboard slider navigation
    $(document).keyup(function(event){
      if(event.which=='37' && $('.cd-slider-active').length > 0 && !$('.cd-slider-active .cd-slider .selected').is(':first-child')) {
        prevSlide($('.cd-slider-active'), $('.cd-slider-active').find('.cd-slider-pagination li'));
      } else if( event.which=='39' && $('.cd-slider-active').length && !$('.cd-slider-active .cd-slider .selected').is(':last-child')) {
        nextSlide($('.cd-slider-active'), $('.cd-slider-active').find('.cd-slider-pagination li'));
      } else if(event.which=='27') {
        itemInfoWrapper.removeClass('cd-slider-active');
      }
    });

    function createSliderPagination($container){
      var wrapper = $('<ul class="cd-slider-pagination"></ul>').insertAfter($container.find('.cd-slider-navigation'));
      $container.find('.cd-slider li').each(function(index){
        var dotWrapper = (index == 0) ? $('<li class="selected"></li>') : $('<li></li>'),
          dot = $('<a href="#0"></a>').appendTo(dotWrapper);
        dotWrapper.appendTo(wrapper);
        dot.text(index+1);
      });
      return wrapper.children('li');
    }

    function nextSlide($container, $pagination, $n){
      var visibleSlide = $container.find('.cd-slider .selected'),
        navigationDot = $container.find('.cd-slider-pagination .selected');
      if(typeof $n === 'undefined') $n = visibleSlide.index() + 1;
      visibleSlide.removeClass('selected');
      $container.find('.cd-slider li').eq($n).addClass('selected').prevAll().addClass('move-left');
      navigationDot.removeClass('selected')
      $pagination.eq($n).addClass('selected');
      updateNavigation($container, $container.find('.cd-slider li').eq($n));
    }

    function prevSlide($container, $pagination, $n){
      var visibleSlide = $container.find('.cd-slider .selected'),
        navigationDot = $container.find('.cd-slider-pagination .selected');
      if(typeof $n === 'undefined') $n = visibleSlide.index() - 1;
      visibleSlide.removeClass('selected')
      $container.find('.cd-slider li').eq($n).addClass('selected').removeClass('move-left').nextAll().removeClass('move-left');
      navigationDot.removeClass('selected');
      $pagination.eq($n).addClass('selected');
      updateNavigation($container, $container.find('.cd-slider li').eq($n));
    }

    function updateNavigation($container, $active) {
      $container.find('.cd-prev').toggleClass('inactive', $active.is(':first-child'));
      $container.find('.cd-next').toggleClass('inactive', $active.is(':last-child'));
    }

    function enableSwipe($container) {
      var mq = window.getComputedStyle(document.querySelector('.cd-slider'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
      return ( mq=='mobile' || $container.hasClass('cd-slider-active'));
    }
  }
});

