up.network.config.autoCache = () => false
up.compiler('.mySwiper', function(element) {
  new Swiper(".mySwiper", {
    slidesPerView: 2,
    loop: true,
    spaceBetween: 20,
    centeredSlides: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
})
