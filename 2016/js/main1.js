jQuery(document).ready(function(){

	var docElem = window.document.documentElement,
    newLocation = '';
    firstLoad = false;
    isAnimating = false,
    support = { animations : Modernizr.cssanimations },
    container = $('div.main-container');
    loaderCirc = $('path.ip-loader-circle').get(0),
    header = $('header');

	function init() {
		window.addEventListener( 'scroll', noscroll );
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

    function countImages(){
      if (imageArray[imageIndex].complete){
        percentage = percentage + imagePperc;
        imageIndex++;
        imagesLoad++;

        loaderCirc.style.strokeDashoffset = loaderCirc.getTotalLength() * ( 1 - (percentage / 100) );

        if (imagesLoad == imageCount){
          percentage = 100;
          $('body').addClass('layout-switch');
          window.removeEventListener( 'scroll', noscroll );
          container.removeClass('unload loading').addClass('loaded');

          container.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
            isAnimating = false;
          });
        }
      }
    }

    function loop() {
      var rand = Math.round(Math.random() * (100));
      setTimeout(function() {
        if (imagesLoad < imageCount){
          countImages();
          loop();  
        }
      }, rand);
    }

    loop();
    
    /*if (imagesLoad < imageCount || imagesLoad == 0 ){
      setTimeout('progress_bar();', 200);
    }*/
  }

	function noscroll() {
		window.scrollTo( 0, 0 );
	}

  /*** Cambio de página ***/

  //trigger smooth transition from the actual page to the new one 
  $('a').on('click', function(event){
    event.preventDefault();

    //detect which page has been selected
    var newPage = $(this).attr('href');
    //if the page is not already being animated - trigger animation
    //if( !isAnimating ) changePage(newPage, true);
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
    $('body').removeClass('layout-switch');
    window.addEventListener( 'scroll', noscroll );
    loaderCirc.style.strokeDashoffset = loaderCirc.getTotalLength();
    container.removeClass('loaded').addClass('unload');

    container.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
      //container.removeClass('unload').addClass('loading');
      loadNewContent(url, bool);
      newLocation = url;
    });
	}

	function loadNewContent(url, bool) {
		url = ('' == url) ? 'index.html' : url;
  	//var newSection = 'cd-'+url.replace('.html', '');
  	var section = $('div.cd-main-content');
  		
  	section.load(url+' .cd-main-content > *', function(event){
      // load new content and replace <main> content with the new one
      $('main').html(section);

      setProgress();
      
      if(url!=window.location && bool){
        //add the new page to the window.history
        //if the new page was triggered by a 'popstate' event, don't add it
        window.history.pushState({path: url},'',url);
      }
		});
  }

	init();

});
