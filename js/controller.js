// controller.js

// Khai báo biến modal
const modal = document.getElementById("modal");
const modalChange = document.getElementById("modal-change");

// Khai báo nút mở modal
const btn = document.querySelector(".btn");

// Khai báo nút đóng modal
const closeButtons = document.querySelectorAll(".j-close");

// Khai báo form
const registerForm = document.querySelector("#add-form");
const updateForm = document.querySelector("#change-form");

let currentEditingId = null; // Biến lưu trữ ID của hàng đang chỉnh sửa

// Xử lý sự kiện mở modal
btn.onclick = () => showModal(modal);

// Xử lý sự kiện đóng modal
closeButtons.forEach((span) => {
  span.onclick = () => {
    if (span.closest("#modal")) {
      hideModal(modal);
    } else if (span.closest("#modal-change")) {
      hideModal(modalChange);
    }
  };
});

// Xử lý sự kiện gửi form tạo mới
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const newRow = {
    user: document.querySelector("#username").value,
    email: document.querySelector("#email").value,
    password: document.querySelector("#password").value,
    date: new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };

  try {
    const data = await addData(newRow);
    const tr = createRow(data);
    $("#user-table tbody").append(tr);
    registerForm.reset();
    hideModal(modal);
  } catch (error) {
    console.error("Có lỗi xảy ra: " + error);
  }
});

// Xử lý sự kiện gửi form cập nhật
updateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const updatedRow = {
    user: document.querySelector("#change-form #username").value,
    email: document.querySelector("#change-form #email").value,
    password: document.querySelector("#change-form #password").value,
  };

  try {
    const data = await updateData(currentEditingId, updatedRow);
    const rowElement = document.getElementById(currentEditingId);
    rowElement.children[0].textContent = data.user;
    rowElement.children[1].textContent = data.email;
    rowElement.children[2].textContent = data.password;

    hideModal(modalChange);
    updateForm.reset();
    currentEditingId = null;
  } catch (error) {
    console.error("Có lỗi xảy ra: " + error);
  }
});

// Xử lý sự kiện xóa dữ liệu
$(document).on("click", ".del-u", async function () {
  const rowElement = $(this).closest("tr");
  const userId = rowElement.attr("id");

  try {
    await deleteData(userId);
    rowElement.remove();
  } catch (error) {
    console.error("Có lỗi xảy ra: " + error);
  }
});

// Xử lý sự kiện chỉnh sửa dữ liệu
$(document).on("click", ".edit-u", function () {
  const rowElement = $(this).closest("tr");
  const userId = rowElement.attr("id");

  // Lấy dữ liệu hiện tại từ hàng
  const user = rowElement.children().eq(0).text();
  const email = rowElement.children().eq(1).text();
  const password = rowElement.children().eq(2).text();

  // Điền dữ liệu vào form chỉnh sửa
  document.querySelector("#change-form #username").value = user;
  document.querySelector("#change-form #email").value = email;
  document.querySelector("#change-form #password").value = password;
  currentEditingId = userId;

  // Hiển thị modal chỉnh sửa
  showModal(modalChange);
});

// Tải dữ liệu khi trang được tải
$(document).ready(async () => {
  try {
    const data = await fetchData();
    updateTable(data);
  } catch (error) {
    console.error("Có lỗi xảy ra: " + error);
  }
});
