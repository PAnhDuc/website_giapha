//MenuToggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
    navigation.classList.toggle("active");
    main.classList.toggle("active");
};

//add hovered class in selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
    list.forEach((item) => {
        item.classList.remove("");
    });
    this.classList.add("hovered");
}

list.forEach((item) => {
    item.addEventListener("mouseover", activeLink);
});


// Hiển thị slide
function showSlide(type) {
    const slide = document.getElementById(`${type}-slide`);
    const overlay = document.getElementById('overlay');
    if (slide && overlay) {
        slide.classList.add('active');
        overlay.classList.add('active');
    }
}

// Ẩn slide
function hideSlide(type) {
    const slide = document.getElementById(`${type}-slide`);
    const overlay = document.getElementById('overlay');
    if (slide && overlay) {
        slide.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Ẩn tất cả slide khi nhấn ra ngoài
function hideAllSlides() {
    const slides = document.querySelectorAll('.slide');
    const overlay = document.getElementById('overlay');
    slides.forEach(slide => slide.classList.remove('active'));
    if (overlay) overlay.classList.remove('active');
}

// Ngăn chặn sự kiện click trên slide để không đóng overlay
document.querySelectorAll('.slide').forEach(slide => {
    slide.addEventListener('click', function (e) {
        e.stopPropagation();
    });
});