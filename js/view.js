// view.js

// Hiển thị hoặc ẩn modal
function showModal(modal) {
  modal.style.display = "block";
}

function hideModal(modal) {
  modal.style.display = "none";
}

// Tạo hàng mới trong bảng
function createRow(row) {
  const tr = document.createElement("tr");

  tr.id = row.id;

  const userTd = document.createElement("td");
  userTd.textContent = row.user;
  tr.appendChild(userTd);

  const emailTd = document.createElement("td");
  emailTd.textContent = row.email;
  tr.appendChild(emailTd);

  const passwordTd = document.createElement("td");
  passwordTd.textContent = row.password;
  tr.appendChild(passwordTd);

  const dateTd = document.createElement("td");
  dateTd.textContent = row.date;
  tr.appendChild(dateTd);

  const statusTd = document.createElement("td");
  const statusSpan = document.createElement("span");
  statusSpan.textContent = "Active";
  statusSpan.classList.add("status", "active");
  statusTd.appendChild(statusSpan);
  tr.appendChild(statusTd);

  const editTd = document.createElement("td");
  const editSpan = document.createElement("span");
  editSpan.classList.add("edit-u", "form-e-d");
  editSpan.innerHTML = '<ion-icon name="create-outline"></ion-icon>';

  const deleteSpan = document.createElement("span");
  deleteSpan.classList.add("del-u", "form-e-d");
  deleteSpan.innerHTML = '<ion-icon name="remove-circle-outline"></ion-icon>';

  editTd.appendChild(editSpan);
  editTd.appendChild(deleteSpan);
  tr.appendChild(editTd);

  return tr;
}

// Cập nhật nội dung bảng
function updateTable(data) {
  const tableBody = $("#user-table tbody");
  tableBody.empty();

  data.forEach((row) => {
    const tr = createRow(row);
    tableBody.append(tr);
  });
}
