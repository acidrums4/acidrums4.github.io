jQuery(document).ready(function(event){

  var docElem = window.document.documentElement,
  newLocation = '';
  isAnimating = false,
  support = { animations : Modernizr.cssanimations },
  container = $('div.main-container');
  pathHeight = $('svg.ip-inner').get(0).getAttribute('viewBox').split(/\s+|,/).slice(-1),
  transEndEventNames = {
    'WebkitTransition' : 'webkitTransitionEnd',
    'MozTransition'    : 'transitionend',
    'transition'       : 'transitionend'
  },
  transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ],
  animEndEventNames = {
    'WebkitAnimation' : 'webkitAnimationEnd',
    'OAnimation' : 'oAnimationEnd',
    'msAnimation' : 'MSAnimationEnd',
    'animation' : 'animationend'
  },
  animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ];

  // Activar el cambio de página
  $('body').on('click', '[data-item-type^="item-"]', function(event){
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
      .filter(function (){
          // Devolver los que tienen igual 'data-item-type' que el filtro
          return $("a", this).data('item-type') == $filter; 
          })
      .fadeIn(500); 

      $('body').removeClass('item-all item-web item-fto item-ils item-otr item-hdv').addClass($filter);
      $('body,html').animate({'scrollTop':0}, 200);
    } // if
  }); // on

  $(window).scroll(function(){
    ($(this).scrollTop() > 99) ? $('body').addClass("scrolled").removeClass("noscroll") : $('body').addClass("noscroll").removeClass("scrolled");
  });

  $('a.home-link').on('click', function(event){
    event.preventDefault();
    changePage('index.html', true);
  });

  $('button.goback-bn').on('click', function(){
    if ($('body').hasClass('item-page') || $('body').hasClass('biop-page')){
      changePage('../../index.html', true);
    } else {
      changePage('index.html', true);
    }
  });

  function fixClipPaths(svg, restore) {
    Array.prototype.forEach.call(svg.querySelectorAll('*[clip-path]'), function (el) {
      var clipUrl = el.getAttribute('clip-path');

      if(!el.getAttribute('data-original-clip-path')) {
        el.setAttribute('data-original-clip-path', clipUrl);
      }

      el.setAttribute('clip-path', 'url('+ (!restore ? document.location.href : '') + el.getAttribute('data-original-clip-path').substr(4));
    });
  }

  function init(){
    fixClipPaths(document.getElementsByTagName('svg')[0]);
    window.addEventListener( 'scroll', noscroll );
    container.addClass('loading');
    isAnimating = true;

    if( support.animations ) {

      $('div.intro-container h1').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
        alert("animEventName");

        if ($('body').hasClass('item-page')) doExpandableGallery($('article'));
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

    fixClipPaths(document.getElementsByTagName('svg')[0]);
    $('rect.clip').attr('height',0);

    function progressComplete(){
      percentage = 100;
      $('svg.ip-inner').removeClass('loading');
      container.removeClass('unload loading').addClass('loaded');

      container.one('animationend', function(){
        $('body').addClass('layout-switch');
        window.removeEventListener( 'scroll', noscroll );
        isAnimating = false;
      });
    }

    function countImages(){
      if ((imageCount > 0) && imageArray[imageIndex].complete){
        percentage = percentage + imagePperc;

        $('svg.ip-inner').removeClass('loading');
        imageIndex++;
        imagesLoad++;
        pathHeightValue = ((percentage * pathHeight) / 100);

        $('rect.clip').attr('height',pathHeightValue);
        if (imagesLoad == imageCount) progressComplete();

      } else if (!(imageArray[imageIndex].complete) && !($('svg.ip-inner').hasClass('loading'))){
        $('svg.ip-inner').addClass('loading');
      }
    }

    function loop(){
      var rand = Math.round(Math.random() * (100));
      setTimeout(function(){
        if (imagesLoad < imageCount){
          countImages();
          loop();  
        }
        else if (imageCount == 0){
          $('rect.clip').animate({ height:pathHeight },
          {
            duration: 100,
            step: function(now){ $(this).attr("height",now); }
          });

          progressComplete();
        }
      }, rand);
    }

    if (imagesLoad < imageCount || imagesLoad == 0 ){
      $('svg.ip-inner').addClass('loading');
    } else {
      $('svg.ip-inner').removeClass('loading');
    }

    loop();
  }

  function noscroll(){
    window.scrollTo(0,0);
  }

  /*** Cambio de página ***/

  function setNewPageType(url){
    if (url == 'index.html' || url == '/' || (url.split('/').slice(-1) == 'index.html')){
      $('body').removeClass('item-web item-fto item-ils item-otr item-hdv').addClass('item-all');
    } else if (url == '404.html' || (url.split('/').slice(-1) == 'index.html')){
      $('body').removeClass('item-web item-fto item-ils item-otr item-all').addClass('item-hdv');
    } else {
      $('body').removeClass('item-web item-fto item-ils item-otr item-hdv').addClass('item-' + url.split('/').slice(-2,-1));
    }
  }

  $(window).on('popstate', function(){
    history.navigationMode = 'compatible';

    if( !isAnimating  &&  newLocation != location.pathName ){
      setNewPageType(location.pathname);
      //changePage(location.pathname.split('/'.slice(-1)), false);
      changePage(location.pathname, false);
    }
  });

  function changePage(url, bool) {
    fixClipPaths(document.getElementsByTagName('svg')[0]);
    $('body,html').animate({'scrollTop':0},200);
    if (bool) setNewPageType(url);
    window.addEventListener('scroll',noscroll);
    $('body').removeClass('nav-opened');
    container.removeClass('loaded').addClass('unload');

    container.one('animationend', function(){
      $('body').removeClass('layout-switch');
      loadNewContent(url, bool);
      newLocation = url;
    });
  }

  function loadNewContent(url, bool) {
    //url = ('' == url) ? 'index.html' : url;
    if (url.split('/').slice(-1) == 'index.html' || url == '/'){
      $('body').removeClass('biop-page sysp-page item-page').addClass('home-page');
      $('ul.filter-menu a').removeClass('nav-filter-active');
      $('ul.filter-menu a').first().addClass('nav-filter-active');
    } else if (url.split('/').slice(-1) == '404.html'){
      $('body').removeClass('biop-page home-page item-page').addClass('sysp-page');
    } else if (url.split('/').slice(-2,-1) == 'hdv'){
      $('body').removeClass('home-page item-page').addClass('biop-page');
    } else $('body').removeClass('home-page biop-page sysp-page').addClass('item-page');

    var section = $('div.cd-main-content');

    section.load(url + ' .cd-main-content > *', function(event){
        if(url!=window.location && bool){
        window.history.pushState({path: url},null,url);
        //window.history.pushState(null,null,url);
        }

        $('main').html(section);
        if ($('body').hasClass('item-page')) doExpandableGallery($('article'));
        setProgress();
        });
  }

  function doExpandableGallery(itemInfoWrapper){
    itemInfoWrapper.each(function(){
        var container = $(this),
        // create slider pagination
        sliderPagination = createSliderPagination(container);

        //update slider navigation visibility
        updateNavigation(container, container.find('.slider li').eq(0));

        container.find('.slider').on('click', function(event){
            //enlarge slider images 
            if( !container.hasClass('slider-active') && $(event.target).is('.slider')) {
            itemInfoWrapper.removeClass('slider-active');
            container.addClass('slider-active').one('transitionend', function(){
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
        container.find('a.slide-next').on('click', function(event){
            event.preventDefault();
            nextSlide(container, sliderPagination);
            });

        container.find('a.slide-prev').on('click', function(event){
            event.preventDefault();
            prevSlide(container, sliderPagination);
            });

        container.find('.slider').on('swipeleft', function(){
            var wrapper = $(this),
            bool = enableSwipe(container);
            if(!wrapper.find('.selected').is(':last-child') && bool) {nextSlide(container, sliderPagination);}
            });

        container.find('.slider').on('swiperight', function(){
            var wrapper = $(this),
            bool = enableSwipe(container);
            if(!wrapper.find('.selected').is(':first-child') && bool) {prevSlide(container, sliderPagination);}
            });

        sliderPagination.on('click', function(event){
            event.preventDefault();
            var selectedDot = $(this);
            if(!selectedDot.hasClass('selected')) {
            var selectedPosition = selectedDot.index(),
            activePosition = container.find('.slider .selected').index();
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
        if(event.which=='37' && $('.slider-active').length > 0 && !$('.slider-active .slider .selected').is(':first-child')) {
        prevSlide($('.slider-active'), $('.slider-active').find('ul.slider-pagination li'));
        } else if( event.which=='39' && $('.slider-active').length && !$('.slider-active .slider .selected').is(':last-child')) {
        nextSlide($('.slider-active'), $('.slider-active').find('ul.slider-pagination li'));
        } else if(event.which=='27') {
        itemInfoWrapper.removeClass('slider-active');
        }
        });

    function createSliderPagination($container){
      var wrapper = $('<ul class="slider-pagination"></ul>').insertAfter($container.find('ul.slider-navigation'));
      $container.find('ul.slider li').each(function(index){
        if ($container.find('ul.slider li').length > 1){
          var dotWrapper = (index == 0) ? $('<li class="selected"></li>') : $('<li></li>'),
          dot = $('<a href="#"></a>').appendTo(dotWrapper);
          dotWrapper.appendTo(wrapper);
          dot.text(index+1);
        }
        altText = $(this).find('img').attr('alt'),
        altWrapper = $('<span></span>').appendTo($(this)),
        altWrapper.text(altText);
      });
      return wrapper.children('li');
    }

    function nextSlide($container, $pagination, $n){
      var visibleSlide = $container.find('.slider .selected'),
          navigationDot = $container.find('ul.slider-pagination .selected');
      if(typeof $n === 'undefined') $n = visibleSlide.index() + 1;
      visibleSlide.removeClass('selected');
      $container.find('.slider li').eq($n).addClass('selected').prevAll().addClass('move-left');
      navigationDot.removeClass('selected')
        $pagination.eq($n).addClass('selected');
      updateNavigation($container, $container.find('.slider li').eq($n));
    }

    function prevSlide($container, $pagination, $n){
      var visibleSlide = $container.find('.slider .selected'),
          navigationDot = $container.find('ul.slider-pagination .selected');
      if(typeof $n === 'undefined') $n = visibleSlide.index() - 1;
      visibleSlide.removeClass('selected')
        $container.find('.slider li').eq($n).addClass('selected').removeClass('move-left').nextAll().removeClass('move-left');
      navigationDot.removeClass('selected');
      $pagination.eq($n).addClass('selected');
      updateNavigation($container, $container.find('.slider li').eq($n));
    }

    function updateNavigation($container, $active) {
      $container.find('a.slide-prev').toggleClass('inactive', $active.is(':first-child'));
      $container.find('a.slide-next').toggleClass('inactive', $active.is(':last-child'));
    }

    function enableSwipe($container) {
      var mq = window.getComputedStyle(document.querySelector('.slider'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
      return ( mq=='mobile' || $container.hasClass('slider-active'));
    }
  }

  init();

});
