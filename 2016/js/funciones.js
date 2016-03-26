jQuery(document).ready(function(event){

	var docElem = window.document.documentElement,
    newLocation = '';
    isAnimating = false,
    support = { animations : Modernizr.cssanimations },
    container = $('div.main-container');
    loaderCirc = $('path.ip-loader-circle').get(0),
    header = $('header'),

  // Activar el cambio de página
  $('body').on('click', '[data-item-type^="item-"]', function(event){
  //$('ul.grid a').on('click', function(event){
    event.preventDefault();

    var filter = $(this).data('itemType'); 
    var newPage = $(this).attr('href');
    if( !isAnimating ){
      $('body').removeClass('item-all item-web item-fto item-ils item-otr item-hdv').addClass(filter);
      changePage(newPage, true);
    }
  });

  // Filtrar por categorías
  $('ul.filter-menu a').on('click', function(event){
    event.preventDefault();
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
        .fadeIn() 
      : // Y si no, pues ocúltelos mano
        $('ul.grid>li')
        .fadeOut(0)
        .filter(function () {
          // Devolver los que tienen igual 'data-item-type' que el filtro
          return $("a", this).data('item-type') == $filter; 
        })
        .fadeIn(500); 

      $('body').removeClass('item-all item-web item-fto item-ils item-otr item-hdv').addClass($filter);
      toggleMenu();
      $('body,html').animate({'scrollTop':0}, 200);
    } // if
  }); // on

  $(window).scroll(function() {
    if ($(this).scrollTop() > 1){  
      $('main').addClass("scrolled").removeClass("noscroll");
    }
    else{
      $('main').addClass("noscroll").removeClass("scrolled");
    }
  });

  $('button.main-menu').on('click', function(){toggleMenu()});
  $('button.goback-bn').on('click', function(){changePage('../../index.html', true)});

	function init() {
		window.addEventListener( 'scroll', noscroll );
    loaderCirc.style.strokeDashoffset = loaderCirc.getTotalLength();
    container.addClass('loading');
    isAnimating = true;

		if( support.animations ) {
      container.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
        setProgress();
      });
		}
	}

  function setProgress()
  {
    var imageCount = document.getElementsByTagName("img").length;
    var imageArray = document.getElementsByTagName("img");
    var imagePperc = (100 / imageCount);
    
    var imagesLoad = 0;
    var percentage = 0;
    var imageIndex = 0;

    loaderCirc.style.strokeDasharray = loaderCirc.strokeDashoffset = loaderCirc.getTotalLength();

    function progressComplete(){
      percentage = 100;
      container.removeClass('unload loading').addClass('loaded');

      container.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
        $('body').addClass('layout-switch');
        window.removeEventListener( 'scroll', noscroll );
        isAnimating = false;
      });
    }
    
    function countImages(){
      if ((imageCount > 0) && imageArray[imageIndex].complete){
        percentage = percentage + imagePperc;
        imageIndex++;
        imagesLoad++;

        loaderCirc.style.strokeDashoffset = loaderCirc.getTotalLength() * ( 1 - (percentage / 100) );

        if (imagesLoad == imageCount) progressComplete();
      }
    }

    function loop() {
      var rand = Math.round(Math.random() * (100));
      setTimeout(function() {
        if (imagesLoad < imageCount){
          countImages();
          loop();  
        }

        else if (imageCount == 0) progressComplete();

      }, rand);
    }

    loop();
    
    /*if (imagesLoad < imageCount || imagesLoad == 0 ){
      setTimeout('progress_bar();', 200);
    }*/
  }

	function noscroll() {
		window.scrollTo(0,0);
	}

  /*** Cambio de página ***/

  //detect the 'popstate' event - e.g. user clicking the back button
  $(window).on('popstate', function() {
    history.navigationMode = 'compatible';
    var newPageArray = location.pathname.split('/'),
      //this is the url of the page to be loaded 
      newPage = newPageArray[newPageArray.length - 1];

    if( !isAnimating  &&  newLocation != newPage ){
      //url = ('' == newPage) ? $('body').removeClass('item-web item-fto item-ils item-otr item-hdv').addClass('item-all') : $('body').removeClass('item-web item-fto item-ils item-otr item-hdv');
      url = 'index.html' ? $('body').removeClass('item-web item-fto item-ils item-otr item-hdv').addClass('item-all') : $('body').removeClass('item-web item-fto item-ils item-otr item-hdv');
      changePage(newPage, false);
    }
	});

	function changePage(url, bool) {
    $('body,html').animate({'scrollTop':0}, 200);
    (url.split('/').slice(-1) == 'index.html') ? $('body').removeClass('item-web item-fto item-ils item-otr item-hdv').addClass('item-all') : $('body').removeClass('item-all');
    window.addEventListener( 'scroll', noscroll );
    $('body').removeClass('nav-opened');
    loaderCirc.style.strokeDashoffset = loaderCirc.getTotalLength();
    container.removeClass('loaded').addClass('unload');

    container.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
      $('body').removeClass('layout-switch');
      loadNewContent(url, bool);
      newLocation = url;
    });
	}

	function loadNewContent(url, bool) {
    //console.log("URL: " + url.split('/').slice(-2,-1));
		url = ('' == url) ? 'index.html' : url;
    //(url.split('/').slice(-1) == 'index.html') ? $('body').removeClass('item-biop item-page').addClass('home-page') : $('body').removeClass('home-page').addClass('item-page');
    if (url.split('/').slice(-1) == 'index.html'){
      $('body').removeClass('biop-page item-page').addClass('home-page');
    } else if (url.split('/').slice(-2,-1) == 'hdv'){
      $('body').removeClass('home-page item-page').addClass('biop-page');
    } else $('body').removeClass('home-page biop-page').addClass('item-page');

  	var section = $('div.cd-main-content');
  		
  	section.load(url + ' .cd-main-content > *', function(event){
      if(url!=window.location && bool){
        window.history.pushState({path: url},'',url);
      }

      $('main').html(section);
      if ($('body').hasClass('item-page')) doExpandableGallery($('article'));
      setProgress();
		});
  }

  function toggleMenu(){
    $('body').toggleClass('nav-opened');
  }

  function doExpandableGallery(itemInfoWrapper){
    itemInfoWrapper.each(function(){
      var container = $(this),
        // create slider pagination
        sliderPagination = createSliderPagination(container);
      
      //update slider navigation visibility
      updateNavigation(container, container.find('.cd-slider li').eq(0));

      container.find('.cd-slider').on('click', function(event){
        //enlarge slider images 
        if( !container.hasClass('slider-active') && $(event.target).is('.cd-slider')) {
          itemInfoWrapper.removeClass('slider-active');
          container.addClass('slider-active').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
            $('body,html').animate({'scrollTop':container.offset().top}, 200);
          });
        }
      });

      container.find('a.item-close').on('click', function(event){
        //shrink slider images 
        event.preventDefault();
        container.removeClass('slider-active');
      });

      //update visible slide
      container.find('a.cd-next').on('click', function(event){
        event.preventDefault();
        nextSlide(container, sliderPagination);
      });

      container.find('.cd-prev').on('click', function(event){
        event.preventDefault();
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

      sliderPagination.on('click', function(event){
        event.preventDefault();
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
      if(event.which=='37' && $('.slider-active').length > 0 && !$('.slider-active .cd-slider .selected').is(':first-child')) {
        prevSlide($('.slider-active'), $('.slider-active').find('ul.slider-pagination li'));
      } else if( event.which=='39' && $('.slider-active').length && !$('.slider-active .cd-slider .selected').is(':last-child')) {
        nextSlide($('.slider-active'), $('.slider-active').find('ul.slider-pagination li'));
      } else if(event.which=='27') {
        itemInfoWrapper.removeClass('slider-active');
      }
    });

    function createSliderPagination($container){
      var wrapper = $('<ul class="slider-pagination"></ul>').insertAfter($container.find('ul.slider-navigation'));
      $container.find('.cd-slider li').each(function(index){
        var dotWrapper = (index == 0) ? $('<li class="selected"></li>') : $('<li></li>'),
          dot = $('<a href="#"></a>').appendTo(dotWrapper);
        dotWrapper.appendTo(wrapper);
        dot.text(index+1);
      });
      return wrapper.children('li');
    }

    function nextSlide($container, $pagination, $n){
      var visibleSlide = $container.find('.cd-slider .selected'),
        navigationDot = $container.find('ul.slider-pagination .selected');
      if(typeof $n === 'undefined') $n = visibleSlide.index() + 1;
      visibleSlide.removeClass('selected');
      $container.find('.cd-slider li').eq($n).addClass('selected').prevAll().addClass('move-left');
      navigationDot.removeClass('selected')
      $pagination.eq($n).addClass('selected');
      updateNavigation($container, $container.find('.cd-slider li').eq($n));
    }

    function prevSlide($container, $pagination, $n){
      var visibleSlide = $container.find('.cd-slider .selected'),
        navigationDot = $container.find('ul.slider-pagination .selected');
      if(typeof $n === 'undefined') $n = visibleSlide.index() - 1;
      visibleSlide.removeClass('selected')
      $container.find('.cd-slider li').eq($n).addClass('selected').removeClass('move-left').nextAll().removeClass('move-left');
      navigationDot.removeClass('selected');
      $pagination.eq($n).addClass('selected');
      updateNavigation($container, $container.find('.cd-slider li').eq($n));
    }

    function updateNavigation($container, $active) {
      $container.find('a.cd-prev').toggleClass('inactive', $active.is(':first-child'));
      $container.find('a.cd-next').toggleClass('inactive', $active.is(':last-child'));
    }

    function enableSwipe($container) {
      var mq = window.getComputedStyle(document.querySelector('.cd-slider'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
      return ( mq=='mobile' || $container.hasClass('slider-active'));
    }
  }

	init();

});
