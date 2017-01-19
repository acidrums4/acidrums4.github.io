jQuery(document).ready(function(event){

  var newLocation = '';
  isAnimating = false,
  support = { animations : Modernizr.cssanimations },
  container = $('div.body-wrapper'),
  loader = $('svg.logo');

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
  $('body').on('click', '[data-filter^="item-"]', function(event){
    event.preventDefault();
    console.log("Filtrando...");
    var $this = $(this);
    // No hacer nada si uno hace click en el activo
    if ( !$this.hasClass('nav-filter-active') ) {
      $('ul.filter-menu a').removeClass('nav-filter-active');
      $this.addClass('nav-filter-active');
      // Obtener que se va a filtrar de 'data-filter'
      var $filter = $this.data('filter'); 
      // Si uno selecciona 'Todos', pues mostrar todos
      $filter == 'item-all' ? 
      $('div.grid>a')
      .not(':visible')
      .fadeIn() 
      : // Y si no, pues ocúltelos mano
      $('div.grid>a')
      .fadeOut(0)
      .filter(function (){
          // Devolver los que tienen igual 'data-item-type' que el filtro
          return $(this).data('item-type') == $filter; 
          })
      .fadeIn(500); 

      $('body').removeClass('item-all item-web item-fto item-ils item-otr item-hdv').addClass($filter);
      $('body,html').animate({'scrollTop':0}, 200);
    } // if
  }); // on

  $(window).scroll(function(){
    ($(this).scrollTop() > 99) ? $('body').addClass("scrolled").removeClass("noscroll") : $('body').addClass("noscroll").removeClass("scrolled");
  });

  $('button.goback-bn').on('click', function(){
    if ($('body').hasClass('item-page') || $('body').hasClass('biop-page')){
      changePage('../../index.html', true);
    } else {
      changePage('index.html', true);
    }
  });

  function init(){
    window.addEventListener( 'scroll', noscroll );
    container.addClass('loading');
    isAnimating = true;

    if( support.animations ) {
      container.one('animationend transitionend', function(e){
        if ($('body').hasClass('item-page')) doExpandableGallery($('article'));
        if ($('body').hasClass('biop-page') || $('body').hasClass('sysp-page')) animateAvatar();
        setProgress();
				$(this).off(e);
      });
    }
  }

  function setProgress()
  {
    var imageCount = document.getElementsByTagName("img").length;
    var imageArray = document.getElementsByTagName("img");
    var imagePperc = (100 / imageCount);
		var loadingCrc = document.getElementById('circle-fg');

    var imagesLoad = 0;
    var percentage = 0;
    var imageIndex = 0;

		loadingCrc.style.strokeDasharray = loadingCrc.style.strokeDashoffset = loadingCrc.getTotalLength();

    function progressComplete(){
      percentage = 100;
			loadingCrc.style.strokeDashoffset = 0;
      loader.attr('class', 'logo');
      loader.one('animationend transitionend', function(e){
        container.removeClass('unload loading').addClass('loaded');
				$(this).off(e);
      });

      container.one('animationend transitionend', function(e){
        loadingCrc.style.strokeDasharray = loadingCrc.style.strokeDashoffset = loadingCrc.getTotalLength();
        window.removeEventListener( 'scroll', noscroll );
        isAnimating = false;
				$(this).off(e);
      });
    }

    function countImages(){
      if ((imageCount > 0) && imageArray[imageIndex].complete){
        percentage = percentage + imagePperc;

        loader.attr('class', 'logo loading');
        imageIndex++;
        imagesLoad++;

        if ((imagesLoad == imageCount) || (percentage >= 100) ) progressComplete();

				else {
					loadingCrcValue = loadingCrc.getTotalLength() * ( 1 - ( percentage / 100 ) );
					loadingCrc.style.strokeDashoffset = loadingCrcValue;
				}
      } else if (!(imageArray[imageIndex].complete) && !(loader.hasClass('waiting'))){
        loader.attr('class', 'logo loading waiting');
      }
    }

    function loop(){
      var rand = Math.round(Math.random() * (40));
      setTimeout(function(){
        if (imagesLoad < imageCount){
          countImages();
          loop();  
        }
        else if (imageCount == 0){
          $('path.circle-fg').animate({ 'stroke-dashoffset':0 },
          {
            duration: 500,
            step: function(now){ $(this).attr('stroke-dashoffset',now); }
          });

          progressComplete();
        }
      }, rand);
    }

    if (imagesLoad < imageCount || imagesLoad == 0 ){
      loader.attr('class', 'logo loading waiting');
    } else {
      loader.attr('class', 'logo loading');
    }

    loader.attr('class', 'logo loading');
    loader.one('animationend transitionend', function(e){
      loop();
      $(this).off(e);
    });
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
    $('body,html').animate({'scrollTop':0},200);
    if (bool) setNewPageType(url);
    window.addEventListener('scroll',noscroll);
    $('body').removeClass('nav-opened');
    container.removeClass('loaded').addClass('unload');

    container.one('animationend transitionend', function(e){
      loadNewContent(url, bool);
      newLocation = url;
			$(this).off(e);
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

    var section = $('div.main-wrapper');

    section.load(url + ' .main-wrapper > *', function(result){
      if(url!=window.location && bool){
        window.history.pushState({path: url},null,url);
        document.title = $(result).filter('title').text();
      }

      console.log("Cambiando página...");
      $('main').html(section);
      if ($('body').hasClass('item-page')) doExpandableGallery($('article'));
      if ($('body').hasClass('biop-page') || $('body').hasClass('sysp-page')) animateAvatar();
      setProgress();
    });
  }

  function doExpandableGallery(itemInfoWrapper){
    itemInfoWrapper.each(function(){
      var container = $(this),
      // create slider pagination
      sliderPagination = createSliderPagination(container);

      //update slider navigation visibility
      updateNavigation(container, container.find('ul.slider li').eq(0));

      container.find('ul.slider').on('click', function(event){
        //enlarge slider images 
        if( !container.hasClass('slider-active') && $(event.target).is('ul.slider')){
          itemInfoWrapper.removeClass('slider-active');
          container.addClass('slider-active').one('animationend transitionend', function(e){
            $('body,html').animate({'scrollTop':container.offset().top}, 200);
            $(this).off(e);
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

      container.find('ul.slider').on('swipeleft', function(){
        var wrapper = $(this),
        bool = enableSwipe(container);
        if(!wrapper.find('li.selected').is(':last-of-type') && bool) {nextSlide(container, sliderPagination);}
      });

      container.find('ul.slider').on('swiperight', function(){
        var wrapper = $(this),
        bool = enableSwipe(container);
        if(!wrapper.find('li.selected').is(':first-of-type') && bool) {prevSlide(container, sliderPagination);}
      });

      sliderPagination.on('click', function(event){
        event.preventDefault();
        var selectedDot = $(this);
        if(!selectedDot.hasClass('selected')) {
          var selectedPosition = selectedDot.index(),
          activePosition = container.find('ul.slider li.selected').index();
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
      if(event.which=='37' && $('.slider-active').length > 0 && !$('.slider-active .slider .selected').is(':first-of-type')) {
      prevSlide($('.slider-active'), $('.slider-active').find('ul.slider-pagination li'));
      } else if( event.which=='39' && $('.slider-active').length && !$('.slider-active .slider .selected').is(':last-of-type')) {
      nextSlide($('.slider-active'), $('.slider-active').find('ul.slider-pagination li'));
      } else if(event.which=='27') {
      itemInfoWrapper.removeClass('slider-active');
      }
    });

    function createSliderPagination($container){
      var wrapper = $('<ul class="slider-pagination"></ul>').insertAfter($container.find('ul.slider'));
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
      var visibleSlide = $container.find('ul.slider li.selected'),
          navigationDot = $container.find('ul.slider-pagination .selected');
      if(typeof $n === 'undefined') $n = visibleSlide.index('ul.slider li') + 1;
      visibleSlide.removeClass('selected');
      $container.find('ul.slider li').eq($n).addClass('selected').prevAll('li').addClass('move-left');
      navigationDot.removeClass('selected')
      $pagination.eq($n).addClass('selected');
      updateNavigation($container, $container.find('ul.slider li').eq($n));
    }

    function prevSlide($container, $pagination, $n){
      var visibleSlide = $container.find('ul.slider li.selected'),
          navigationDot = $container.find('ul.slider-pagination .selected');
      if(typeof $n === 'undefined') $n = visibleSlide.index('ul.slider li') - 1;
      visibleSlide.removeClass('selected')
        $container.find('ul.slider li').eq($n).addClass('selected').removeClass('move-left').nextAll('li').removeClass('move-left');
      navigationDot.removeClass('selected');
      $pagination.eq($n).addClass('selected');
      updateNavigation($container, $container.find('ul.slider li').eq($n));
    }

    function updateNavigation($container, $active) {
      $container.find('a.slide-prev').toggleClass('inactive', $active.is(':first-of-type'));
      $container.find('a.slide-next').toggleClass('inactive', $active.is(':last-of-type'));
    }

    function enableSwipe($container) {
      var mq = window.getComputedStyle(document.querySelector('.slider'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
      return ( mq=='mobile' || $container.hasClass('slider-active'));
    }
  }

  function animateAvatar(){
    eyeL = document.getElementById('eye-l');
    eyeR = document.getElementById('eye-r');
		var animateL = document.createElementNS("http://www.w3.org/2000/svg","animate");
		var animateR = document.createElementNS("http://www.w3.org/2000/svg","animate");
    animateL.setAttribute('attributeName','d');
    animateR.setAttribute('attributeName','d');
    animateL.setAttribute('repeatCount','indefinite');
    animateR.setAttribute('repeatCount','indefinite');

    if ($('body').hasClass('biop-page')){
      animateL.setAttribute('dur','3s');
      animateR.setAttribute('dur','3s');
      animateL.setAttribute('keyTimes','0;0.02;0.04;1');
      animateR.setAttribute('keyTimes','0;0.02;0.04;1');
      animateL.setAttribute('values','M179 168l-36.75-19l36.75,0l38,0z;M179 168l-36.75-19l36.75,10l38,-10z;M179 168l-36.75-19l36.75,0l38,0z;M179 168l-36.75-19l36.75,0l38,0z');
      animateR.setAttribute('values','M291 168l36.75-19l-36.75,0l-38,0z;M291 168l36.75-19l-36.75,10l-38,-10z;M291 168l36.75-19l-36.75,0l-38,0z;M291 168l36.75-19l-36.75,0l-38,0z');
    }
    else if ($('body').hasClass('sysp-page')){
      animateL.setAttribute('dur','3s');
      animateR.setAttribute('dur','3s');
      animateL.setAttribute('keyTimes','0;0.48;0.5;0.98;1');
      animateR.setAttribute('keyTimes','0;0.48;0.5;0.98;1');
      animateL.setAttribute('values','M159 168l-16.75-19l36.75,0l38,0z;M159 168l-16.75-19l36.75,0l38,0z;M199 168l-56.75-19l36.75,0l38,0z;M199 168l-56.75-19l36.75,0l38,0z;M159 168l-16.75-19l36.75,0l38,0z');
      animateR.setAttribute('values','M271 168l56.75-19l-36.75,0l-38,0z;M271 168l56.75-19l-36.75,0l-38,0z;M311 168l16.75-19l-36.75,0l-38,0z;M311 168l16.75-19l-36.75,0l-38,0z;M271 168l56.75-19l-36.75,0l-38,0z');
    }

		eyeL.appendChild(animateL);
		eyeR.appendChild(animateR);
		animateL.beginElement();
		animateR.beginElement();
  }

  init();

});
