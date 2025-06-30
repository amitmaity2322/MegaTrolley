
$('.banner_slider').slick({
    dots: false,
infinite: true,
speed: 500,
slidesToShow: 1,
slidesToScroll: 1,
autoplay: true,
autoplaySpeed: 2000,
arrows: true,
responsive: [
 
  {
    breakpoint: 767,
    settings: {
      slidesToShow: 1,
slidesToScroll: 1,
      dots: true,
      arrows:false,
    },
  },
  
],
});

$('.testimonials_slider').slick({
dots: true,
infinite: true,
speed: 600,
arrows: false, // <-- corrected
slidesToShow: 3,
slidesToScroll: 1,
autoplay: true,
autoplaySpeed: 2000,

responsive: [
{
  breakpoint: 1120,
  settings: {
    slidesToShow: 2,
    dots: true,
    arrows: false, // <-- corrected
  },
},
{
  breakpoint: 768,
  settings: {
    slidesToShow: 1,
    dots: true,
    arrows: false, // <-- corrected
  },
},
{
  breakpoint: 640,
  settings: {
    slidesToShow: 1,
    dots: true,
    arrows: false, // <-- corrected
  },
},
],
});

$('.category_slider').slick({
dots: false,
infinite: true,
speed: 600,
arrows: true, // <-- corrected
slidesToShow: 6,
slidesToScroll: 1,
autoplay: true,
autoplaySpeed: 2000,
responsive: [
{
  breakpoint: 1120,
  settings: {
    slidesToShow: 6,
    dots: true,
    arrows: false, // <-- corrected
  },
},
{
  breakpoint: 768,
  settings: {
    slidesToShow: 4,
    dots: true,
    arrows: false, // <-- corrected
  },
},
{
  breakpoint: 640,
  settings: {
    slidesToShow: 2,
    dots: true,
    arrows: false, // <-- corrected
  },
},
],

});

const filterToggleMainDiv = document.querySelectorAll(".filterMain");

filterToggleMainDiv.forEach(div => {
  const filterToggle = div.querySelector(".filter-toggle");
  const listPrice = div.querySelector(".list-price");
  const iconF = filterToggle.querySelector("i")

filterToggle.addEventListener("click", () => {
  listPrice.classList.toggle("active");
  
  if(iconF.classList.contains("fa-angle-down")){
    iconF.classList.remove("fa-angle-down");
    iconF.classList.add("fa-angle-up");
  }else{
    iconF.classList.remove("fa-angle-up");
    iconF.classList.add("fa-angle-down");
  }


});
});

document.addEventListener("DOMContentLoaded", function () {
  const trigger = document.querySelector(".video-trigger");
  const modal = document.getElementById("videoModal");
  const iframe = document.getElementById("videoFrame");
  const closeBtn = document.querySelector(".video-close");

  trigger.addEventListener("click", () => {
    const videoUrl = trigger.getAttribute("data-video");
    iframe.src = videoUrl;
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    iframe.src = ""; // Stop video
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      iframe.src = "";
      modal.style.display = "none";
    }
  });
});



document.addEventListener("DOMContentLoaded", () => {
  const query = sessionStorage.getItem("searchQuery");

  getProductData().then(data => {
    const allProducts = [...data.products, ...data.featured_products];

    let finalProducts = allProducts;
    if (query) {
      finalProducts = allProducts.filter(p =>
        p.product_name.toLowerCase().includes(query.toLowerCase())
      );
      sessionStorage.removeItem("searchQuery");
    }

    renderPaginatedProducts(finalProducts);
    renderPaginationButtons(finalProducts.length);
  });
});




