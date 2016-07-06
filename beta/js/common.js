/**
 * common.js
**/

/* global jQuery $ WOW doc TypeWritter */

jQuery(document).ready(() => {

  var $typePad = doc.get('typePad');
  if ($typePad) {
    TypeWritter.start({
      containerId: 'typePad',
      extractClass: 'sentence',
      cursorClass: 'cursor'
    });
  }

  // add class when srcolling
  $(window).scroll(() => {
    let fromTopPx = 200; // distance to trigger
    let scrolledFromtop = jQuery(window).scrollTop();
    if (scrolledFromtop > fromTopPx) {
      $('.header-container').addClass('header-fxbg');
      $('.nav-aside').addClass('nav-bgbl');
    } else {
      $('.header-container').removeClass('header-fxbg');
      $('.nav-aside').removeClass('nav-bgbl');
    }
  });

  // fix width height full screen
  var windowWidth = $('body').width();
  var windowHeight = $(window).height();

  if (windowWidth > 800) {
    $('.section-bigbanner').height(windowHeight);
    $('.section-container-full').height(windowHeight);
  }

  $(window).resize(() => {
    if (windowWidth > 800) {
      $('.section-bigbanner').height(windowHeight);
      $('.section-container-full').height(windowHeight);
    }
  });

  $('.dropdown-group-nav .dropdown-menu-bt').click(() => {
    $(this).toggleClass('open'); // eslint-disable-line no-invalid-this
    $('.header-container .menu-mb-list').toggleClass('show');
  });

  var wow = new WOW({
    animateClass: 'animated',
    offset: 100,
    callback: (box) => {
      console.log(`WOW: animating <${box.tagName.toLowerCase()}>`);
    }
  });
  wow.init();
});
