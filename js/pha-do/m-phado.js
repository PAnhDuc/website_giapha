import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "../firebase/firebase-config.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Hiển thị form tạo cây và danh sách cây ngay khi load
document.getElementById("createTreeForm").style.display = "block";
document.getElementById("treeList").style.display = "block";
loadTrees();

// Modal logic
const openBtn = document.getElementById("openCreateTreeModal");
const modal = document.getElementById("createTreeModal");
const closeBtn = document.getElementById("closeCreateTreeModal");

openBtn.onclick = () => {
  modal.style.display = "flex";
};
closeBtn.onclick = () => {
  modal.style.display = "none";
};
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// Hàm hiện popup cảnh báo
function showErrorPopup(message) {
  // Xóa popup cũ nếu có
  let old = document.getElementById("errorPopup");
  if (old) old.remove();
  const popup = document.createElement("div");
  popup.id = "errorPopup";
  popup.innerHTML = `
    <div class="error-popup-content">
      <span class="error-popup-close" id="closeErrorPopup">&times;</span>
      <div class="error-popup-msg">${message}</div>
    </div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.remove();
  }, 2000);
  document.getElementById("closeErrorPopup").onclick = () => popup.remove();
}

// Hàm hiện popup thông báo
function showNotifyPopup(message, type = "success") {
  // type: "success" | "error"
  let popup = document.getElementById("notifyPopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "notifyPopup";
    document.body.appendChild(popup);
  }
  popup.innerHTML = `
    <div class="notify-popup-content ${type}">
      <span>${message}</span>
      <span class="notify-popup-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
    </div>
  `;
  setTimeout(() => {
    if (popup.parentNode) popup.remove();
  }, 2500);
}

// Sửa lại submit form
document.getElementById("createTreeForm").onsubmit = async function (e) {
  e.preventDefault();
  const name = document.getElementById("name_tree").value.trim();
  const descrip = document.getElementById("descrip_tree").value.trim();
  const status = document.getElementById("bool_tree").checked
    ? "private"
    : "public";
  // Giả sử bạn lấy userId từ đâu đó, ví dụ localStorage hoặc biến toàn cục
  const userId = window.currentUserId || localStorage.getItem("userId") || "";

  if (!name) {
    alert("Vui lòng nhập tên dòng họ!");
    return;
  }

  // Gửi dữ liệu lên Firestore hoặc server, kèm userId
  await addTree({
    name,
    descrip,
    status,
    userId, // gửi kèm userId
  });

  this.reset();
  document.getElementById("createTreeModal").style.display = "none";
};

async function createTree({ name, description, isPublic }) {
  try {
    const treesRef = collection(db, "trees");
    const treeDocRef = doc(treesRef); // random id
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(treeDocRef, {
      name,
      description,
      isPublic,
      accessCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    alert("Tạo cây thành công! ID: " + treeDocRef.id);
    return treeDocRef.id;
  } catch (error) {
    alert("Lỗi tạo cây phả hệ: " + error.message);
    return null;
  }
}

// Hiển thị danh sách các tree đã tạo (dạng bảng, có icon)
async function loadTrees() {
  const treeList = document.getElementById("treeList");
  // Nếu chưa có bảng thì tạo khung bảng
  if (!document.getElementById("treesTable")) {
    treeList.innerHTML = `
      <h3>Danh sách cây đã tạo</h3>
      <table class="tree-table" id="treesTable">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên cây</th>
            <th>ID</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Quản lý</th>
          </tr>
        </thead>
        <tbody id="treesTableBody"></tbody>
      </table>
    `;
  }
  const tbody = document.getElementById("treesTableBody");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Đang tải...</td></tr>`;
  try {
    const treesRef = collection(db, "trees");
    const snapshot = await getDocs(treesRef);
    let i = 1;
    let html = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      html += `
        <tr>
          <td>${i++}</td>
          <td>${data.name || ""}</td>
          <td>${docSnap.id}</td>
          <td>${data.description || ""}</td>
          <td>${data.status === "private" ? "Private" : "Public"}</td>
          <td>
            <div class="tree-actions">
              <button title="Thêm member" data-action="add-member" data-id="${
                docSnap.id
              }">
                <i class="fa fa-user-plus"></i>
              </button>
              <button title="Thêm event" data-action="add-event" data-id="${
                docSnap.id
              }">
                <i class="fa fa-calendar-plus"></i>
              </button>
              <button title="Thêm permission" data-action="add-permission" data-id="${
                docSnap.id
              }">
                <i class="fa fa-key"></i>
              </button>
              <button title="Xem members" data-action="show-members" data-id="${
                docSnap.id
              }">
                <i class="fa fa-users"></i>
              </button>
                    <button title="Xoá" data-action="del-members" data-id="${
                      docSnap.id
                    }">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML =
      html ||
      `<tr><td colspan="6" style="text-align:center;">Chưa có cây nào</td></tr>`;

    // Gán sự kiện cho các nút icon
    tbody.querySelectorAll("button[data-action]").forEach((btn) => {
      const action = btn.getAttribute("data-action");
      const treeId = btn.getAttribute("data-id");
      if (action === "add-member") {
        btn.onclick = () => addMember(treeId);
      } else if (action === "add-event") {
        btn.onclick = () => addEvent(treeId);
      } else if (action === "add-permission") {
        btn.onclick = () => addPermission(treeId);
      } else if (action === "show-members") {
        btn.onclick = () => showMembers(treeId);
      } else if (action === "del-members") {
        // Thêm xử lý xoá cây
        btn.onclick = async () => {
          if (confirm("Bạn có chắc muốn xoá cây này?")) {
            await deleteTree(treeId);
          }
        };
      }
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Lỗi tải cây: ${error.message}</td></tr>`;
  }
}

// Thêm member bằng modal
async function addMember(treeId) {
  openCustomModal({
    title: "Thêm thành viên",
    fields: [
      { name: "fullname", label: "Tên thành viên", required: true },
      { name: "gender", label: "Giới tính (male/female)", required: true },
      { name: "dateOfBirth", label: "Ngày sinh", required: false },
      {
        name: "dateOfDeath",
        label: "Ngày mất (bỏ trống nếu còn sống)",
        required: false,
      },
      {
        name: "photoUrl",
        label: "Ảnh thành viên",
        type: "file",
        required: false,
      },
    ],
    onSubmit: async (values) => {
      try {
        const memberId = crypto.randomUUID();
        // Không upload lại ảnh, chỉ lấy URL đã có
        const memberData = {
          fullname: values.fullname,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth || "",
          dateOfDeath: values.dateOfDeath || "",
          photoUrl: values.photoUrl || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const memberRef = doc(
          collection(db, `trees/${treeId}/members`),
          memberId
        );
        await setDoc(memberRef, memberData);
        showNotifyPopup("Đã thêm member cho tree!", "success");
        await showMembers(treeId);
      } catch (err) {
        console.error("Lỗi thêm member:", err);
        showErrorPopup("Lỗi thêm member: " + err.message);
      }
    },
  });
}

// Thêm event bằng modal
async function addEvent(treeId) {
  openCustomModal({
    title: "Thêm sự kiện",
    fields: [
      { name: "name", label: "Tên sự kiện", required: true },
      { name: "date", label: "Ngày diễn ra", required: false },
      { name: "location", label: "Địa điểm", required: false },
      { name: "notification", label: "Thông báo", required: false },
      { name: "description", label: "Mô tả", required: false },
    ],
    onSubmit: async (values) => {
      const eventId = crypto.randomUUID();
      const eventData = { ...values };
      const eventRef = doc(collection(db, `trees/${treeId}/events`), eventId);
      await setDoc(eventRef, eventData);
      showErrorPopup("Đã thêm event cho tree!");
    },
  });
}

// Thêm permission bằng modal
async function addPermission(treeId) {
  openCustomModal({
    title: "Thêm quyền truy cập",
    fields: [
      { name: "userId", label: "UserId cần cấp quyền", required: true },
      {
        name: "permission",
        label: "Quyền (owner/editor/viewer)",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      const permissionRef = doc(
        collection(db, `trees/${treeId}/permissions`),
        values.userId
      );
      await setDoc(permissionRef, { permission: values.permission });
      showErrorPopup("Đã thêm permission cho tree!");
    },
  });
}

// Hiển thị danh sách members cho tree
async function showMembers(treeId) {
  // Xóa popup cũ nếu có
  let oldPopup = document.getElementById("membersPopup");
  if (oldPopup) oldPopup.remove();
  const popup = document.createElement("div");
  popup.id = "membersPopup";
  popup.style.position = "fixed";
  popup.style.top = "10%";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "20px";
  popup.style.zIndex = 1000;
  popup.innerHTML = `<h4>Danh sách members</h4><ul id='membersUl'></ul><button id='closeMembersPopup'>Đóng</button>`;
  document.body.appendChild(popup);
  document.getElementById("closeMembersPopup").onclick = () => popup.remove();
  const membersUl = popup.querySelector("#membersUl");
  membersUl.innerHTML = "Đang tải...";
  try {
    const membersRef = collection(db, `trees/${treeId}/members`);
    const snapshot = await getDocs(membersRef);
    membersUl.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const li = document.createElement("li");
      li.textContent = `${docSnap.data().fullname} (ID: ${docSnap.id})`;
      // Nút tạo quan hệ
      const btnRel = document.createElement("button");
      btnRel.textContent = "Tạo quan hệ";
      btnRel.onclick = () =>
        showRelationshipForm(treeId, docSnap.id, docSnap.data().fullname);
      li.appendChild(btnRel);
      membersUl.appendChild(li);
    });
  } catch (error) {
    membersUl.innerHTML = "Lỗi tải members: " + error.message;
  }
}

// Hiển thị form tạo quan hệ cho member
async function showRelationshipForm(treeId, memberId, memberName) {
  // Xóa popup cũ nếu có
  let oldPopup = document.getElementById("relationshipPopup");
  if (oldPopup) oldPopup.remove();
  const popup = document.createElement("div");
  popup.id = "relationshipPopup";
  popup.style.position = "fixed";
  popup.style.top = "20%";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "20px";
  popup.style.zIndex = 1001;
  popup.innerHTML = `
  <form id='relForm'>
  <span class="close-rel-popup" id="closeRelPopup" title="Đóng">&times;</span>
  <h4 style="margin-top:0;">Tạo quan hệ cho ${memberName}</h4>
    <label>Loại quan hệ</label>
    <select id='relationNameSelect'></select><br>
    <label>Chọn thành viên liên quan</label>
    <select id='relativeIdSelect'></select><br>
    <div id='marriageFields' style='display:none'>
        <label>Ngày kết hôn</label><input id='marriageDate' type='text'><br>
        <label>Tình trạng hôn nhân</label><input id='marriageStatus' type='text'><br>
    </div>
    <button type='submit'>Tạo quan hệ</button>
  </form>
`;
  document.body.appendChild(popup);
  document.getElementById("closeRelPopup").onclick = () => popup.remove();
  // Lấy các quan hệ đã có
  const relRef = collection(
    db,
    `trees/${treeId}/members/${memberId}/relationships`
  );
  const relSnap = await getDocs(relRef);
  const usedRelations = [];
  relSnap.forEach((doc) => {
    if (doc.data().relationName) usedRelations.push(doc.data().relationName);
  });
  // Các option quan hệ
  const allRelations = ["cha", "mẹ", "vợ", "chồng"];
  const availableRelations = allRelations.filter(
    (r) => !usedRelations.includes(r)
  );
  const relationSelect = document.getElementById("relationNameSelect");
  relationSelect.innerHTML = availableRelations
    .map((r) => `<option value='${r}'>${r}</option>`)
    .join("");
  // Lấy danh sách member khác
  const membersRef = collection(db, `trees/${treeId}/members`);
  const membersSnap = await getDocs(membersRef);
  const relativeSelect = document.getElementById("relativeIdSelect");
  relativeSelect.innerHTML = "";
  membersSnap.forEach((doc) => {
    if (doc.id !== memberId) {
      relativeSelect.innerHTML += `<option value='${doc.id}'>${
        doc.data().fullname
      } (ID: ${doc.id})</option>`;
    }
  });
  // Hiện/ẩn trường kết hôn
  function updateMarriageFields() {
    const val = relationSelect.value;
    document.getElementById("marriageFields").style.display =
      val === "vợ" || val === "chồng" ? "block" : "none";
  }
  relationSelect.onchange = updateMarriageFields;
  updateMarriageFields();
  // Submit form
  document.getElementById("relForm").onsubmit = async function (e) {
    e.preventDefault();
    const relationName = relationSelect.value;
    const relativeId = relativeSelect.value;
    let marriageDate = null,
      marriageStatus = null;
    if (relationName === "vợ" || relationName === "chồng") {
      marriageDate = document.getElementById("marriageDate").value;
      marriageStatus = document.getElementById("marriageStatus").value;
    }
    await addRelationship(treeId, memberId, {
      relativeId,
      relationName,
      marriageDate,
      marriageStatus,
    });
    alert("Đã tạo quan hệ!");
    popup.remove();
  };
}

// Sửa lại addRelationship để nhận data
async function addRelationship(treeId, memberId, data) {
  const relationshipId = crypto.randomUUID();
  const relationshipData = {
    relativeId: data.relativeId,
    relationName: data.relationName,
    marriageDate: data.marriageDate || null,
    marriageStatus: data.marriageStatus || null,
  };
  const relRef = doc(
    collection(db, `trees/${treeId}/members/${memberId}/relationships`),
    relationshipId
  );
  await setDoc(relRef, relationshipData);
}

// Hàm mở modal tùy chỉnh
function renderCustomModalForm(title, fields) {
  return `
    <span class="close-modal" id="closeCustomModal">&times;</span>
    <h3 class="modal-title">${title}</h3>
    <div class="modal-grid">
      ${fields
        .map((f) =>
          f.name === "photoUrl"
            ? `<div class="form-group form-group-full">
                <label>${f.label}</label>
                <input type="file" id="modal_photoUrl" accept="image/*" />
                <img id="imgPreview" class="img-preview" style="display:none;" />
            </div>`
            : f.type === "checkbox"
            ? `<div class="form-group form-group-full checkbox-group">
                <label for="modal_${f.name}">${f.label}</label>
                <input type="checkbox" id="modal_${f.name}" />
            </div>`
            : `<div class="form-group">
                <label>${f.label}</label>
                <input type="text" id="modal_${f.name}" ${
                f.required ? "required" : ""
              } />
            </div>`
        )
        .join("")}
    </div>
    <button type="submit" style="margin-top:18px;width:100%;">Lưu</button>
  `;
}

function openCustomModal({ title, fields, onSubmit }) {
  const modal = document.getElementById("customModal");
  const form = document.getElementById("customModalForm");
  form.innerHTML = renderCustomModalForm(title, fields);

  modal.style.display = "flex";

  // Xóa mọi sự kiện click trước đó để tránh chồng lặp
  const newModal = modal.cloneNode(true);
  modal.parentNode.replaceChild(newModal, modal);

  // LẤY LẠI modal và form mới sau khi replace
  const modalNow = document.getElementById("customModal");
  const newForm = modalNow.querySelector("#customModalForm");

  // Đảm bảo chỉ có 1 sự kiện window.onclick cho modal này
  function handleWindowClick(e) {
    if (e.target === modalNow) {
      modalNow.style.display = "none";
      window.removeEventListener("click", handleWindowClick);
    }
  }
  window.addEventListener("click", handleWindowClick);

  // Sự kiện nút đóng
  const closeBtn = modalNow.querySelector("#closeCustomModal");
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    modalNow.style.display = "none";
    window.removeEventListener("click", handleWindowClick);
  };

  // Xem trước ảnh
  const fileInput = modalNow.querySelector("#modal_photoUrl");
  if (fileInput) {
    fileInput.onchange = function () {
      const file = fileInput.files[0];
      const img = modalNow.querySelector("#imgPreview");
      if (file) {
        img.src = URL.createObjectURL(file);
        img.style.display = "block";
      } else {
        img.src = "";
        img.style.display = "none";
      }
    };
  }

  // SỰ KIỆN SUBMIT FORM PHẢI GÁN LẠI CHO newForm
  newForm.onsubmit = async function (e) {
    e.preventDefault();
    const values = {};
    for (const f of fields) {
      if (f.name === "photoUrl") {
        const file = modalNow.querySelector("#modal_photoUrl").files[0];
        values.photoUrl = file ? await uploadImageToFirebase(file) : "";
      } else if (f.type === "checkbox") {
        values[f.name] = modalNow.querySelector("#modal_" + f.name).checked
          ? "private"
          : "public";
      } else {
        values[f.name] = modalNow.querySelector("#modal_" + f.name).value.trim();
      }
      if (f.required && !values[f.name]) {
        showErrorPopup(`Vui lòng nhập ${f.label.toLowerCase()}!`);
        return;
      }
    }
    await onSubmit(values);
    newForm.reset();
    modalNow.style.display = "none";
    window.removeEventListener("click", handleWindowClick);
  };
}

// Thêm cây mới
async function addTree(data) {
  // data gồm: name, descrip, status, userId
  const treeRef = doc(collection(db, "trees"));
  await setDoc(treeRef, {
    name: data.name,
    descrip: data.descrip,
    status: data.status,
    userId: data.userId, // lưu userId vào cây
    createdAt: new Date(),
  });
}

// Thêm hàm xoá cây
async function deleteTree(treeId) {
  try {
    await deleteDoc(doc(db, "trees", treeId)); // Xoá document đúng chuẩn v9
    showErrorPopup("Đã xoá cây thành công!");
    loadTrees(); // Reload lại danh sách cây sau khi xoá
  } catch (error) {
    showErrorPopup("Lỗi xoá cây: " + error.message);
  }
}

// Hàm upload ảnh lên Firebase Storage và trả về URL
async function uploadImageToFirebase(file) {
  const storage = getStorage();
  const storageRef = ref(
    storage,
    "member_photos/" + Date.now() + "_" + file.name
  );
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
