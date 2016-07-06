jQuery(document).ready(function() {
  //fix width height full screen
  var windowWidth = $('body').width();
  var windowHeight = $(window).height();

  if(windowWidth > 800) {
    $('.section-bigbanner').height(windowHeight);
    $('.section-container-full').height(windowHeight);
  }

  $( window ).resize(function() {
    if(windowWidth > 800) {
      $('.section-bigbanner').height(windowHeight);
      $('.section-container-full').height(windowHeight);
    }
  });

  // add class when srcolling
  $(window).scroll(function(){
    var fromTopPx = 200; // distance to trigger
    var scrolledFromtop = jQuery(window).scrollTop();
    if(scrolledFromtop > fromTopPx){
      $('.header-container').addClass('header-fxbg');
      $('.nav-aside').addClass('nav-bgbl');
    }else{
      $('.header-container').removeClass('header-fxbg');
      $('.nav-aside').removeClass('nav-bgbl');
    }
  });

  //type writter banner
  TypeWritter.start({
    containerId: 'typePad',
    extractClass: 'sentence',
    cursorClass: 'cursor'
  });

  // drop header menu right
  $('.dropdown-group-nav .dropdown-menu-bt').click(function() {
    $(this).toggleClass("open");
    $('.header-container .menu-mb-list').toggleClass("show");
  });

}); //ready
