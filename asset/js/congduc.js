import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB104q071Bx258JfMzCT1ZCCljy-gaAshQ",
    authDomain: "website-gia-pha.firebaseapp.com",
    projectId: "website-gia-pha",
    storageBucket: "website-gia-pha.appspot.com",
    messagingSenderId: "782484716560",
    appId: "1:782484716560:web:508a379f1f46868a9b1e95",
    measurementId: "G-YXCD70XLZZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let editingEventId = null;
let deleteEventId = null;

async function saveEvent() {
    console.log("Bắt đầu lưu sự kiện");
    const title = document.getElementById("eventTitle").value.trim();
    const description = document.getElementById("eventDesc").value.trim();
    const date = document.getElementById("eventDate").value;

    if (!title || !description || !date) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    try {
        if (editingEventId) {
            await updateDoc(doc(db, "events", editingEventId), { title, description, date });
            openSuccessPopup("Cập nhật thành công sự kiện");
            editingEventId = null;
        } else {
            await addDoc(collection(db, "events"), { title, description, date });
            openSuccessPopup("Thêm thành công sự kiện");
        }

        resetForm();
        loadEvents();
    } catch (error) {
        console.error("Lỗi khi lưu sự kiện:", error);
        alert("Đã xảy ra lỗi khi lưu sự kiện!");
    }
}

async function openDeletePopup(eventId) {
    console.log("Mở popup xác nhận xóa với id:", eventId);
    deleteEventId = eventId;

    try {
        const docRef = doc(db, "events", eventId);
        const docSnap = await getDoc(docRef);
        let title = "Không có tên";
        if (docSnap.exists()) {
            const data = docSnap.data();
            title = data.title || "Không có tên";
        }

        const deleteInfo = document.getElementById("deleteInfo");
        if (deleteInfo) {
            deleteInfo.textContent = `Thông tin xóa: ${title}`;
        }

        const deletePopup = document.getElementById("deletePopupOverlay");
        if (deletePopup) {
            deletePopup.style.display = "flex";
        } else {
            console.error("Không tìm thấy deletePopupOverlay");
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu để hiển thị trong popup xóa:", error);
        alert("Đã xảy ra lỗi khi lấy thông tin!");
    }
}

function closeDeletePopup() {
    console.log("Đóng popup xác nhận xóa");
    const deletePopup = document.getElementById("deletePopupOverlay");
    if (deletePopup) {
        deletePopup.style.display = "none";
    }
    deleteEventId = null;
}

async function confirmDelete() {
    if (!deleteEventId) {
        console.error("Không có id để xóa");
        return;
    }

    try {
        await deleteDoc(doc(db, "events", deleteEventId));
        closeDeletePopup();
        openSuccessPopup("Xóa thành công sự kiện");
        loadEvents();
    } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        alert("Đã xảy ra lỗi khi xóa");
    }
}

function editEvent(eventId, title, description, date) {
    document.getElementById("eventTitle").value = title;
    document.getElementById("eventDesc").value = description;
    document.getElementById("eventDate").value = date;
    editingEventId = eventId;
    showPopup();
}

async function loadEvents() {
    const eventTable = document.getElementById("eventTableBody");
    eventTable.innerHTML = "";

    // Lấy tổng tiền từ localStorage
    const totalTongTien = localStorage.getItem("totalTongTien") || 0;
    const formattedTongTien = Number(totalTongTien).toLocaleString('en-US') + " đ"; // Sử dụng dấu phẩy làm phân cách hàng nghìn

    try {
        const querySnapshot = await getDocs(collection(db, "events"));
        let stt = 1;
        querySnapshot.forEach((docSnap) => {
            const event = docSnap.data();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${stt++}</td>
                <td>${event.title.replace(/'/g, "'").replace(/"/g, "\"")}</td>
                <td>${event.description.replace(/'/g, "'").replace(/"/g, "\"")}</td>
                <td>${event.date}</td>
                <td>${formattedTongTien}</td> <!-- Hiển thị tổng tiền với dấu phẩy -->
                <td><a href="xemds.html">Xem danh sách</a></td>
                <td>
                    <button class="btn_update" onclick="editEvent('${docSnap.id}', '${event.title.replace(/'/g, "\\'")}', '${event.description.replace(/'/g, "\\'")}', '${event.date}')">Sửa</button>
                    <button class="btn_delete" onclick="openDeletePopup('${docSnap.id}')">Xóa</button>
                </td>
            `;
            eventTable.appendChild(row);
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách sự kiện:", error);
    }
}

function showPopup() {
    console.log("Mở popup thêm/sửa sự kiện");
    const popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "flex";
    } else {
        console.error("Không tìm thấy popup với id 'popup'");
    }
}

function closePopup() {
    console.log("Đóng popup thêm/sửa sự kiện");
    const popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "none";
    }
}

function resetForm() {
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDesc").value = "";
    document.getElementById("eventDate").value = "";
    editingEventId = null;
    closePopup();
}

function openSuccessPopup(message) {
    console.log("Mở popup thông báo thành công với thông điệp:", message);
    const successPopup = document.getElementById("successPopupOverlay");
    const successMessage = document.getElementById("successMessage");
    if (successMessage) {
        successMessage.textContent = message;
    } else {
        console.error("Không tìm thấy phần tử successMessage");
    }
    if (successPopup) {
        successPopup.style.display = "flex";
    } else {
        console.error("Không tìm thấy successPopupOverlay");
    }
}

function closeSuccessPopup() {
    console.log("Đóng popup thông báo thành công");
    const successPopup = document.getElementById("successPopupOverlay");
    if (successPopup) {
        successPopup.style.display = "none";
    } else {
        console.error("Không tìm thấy successPopupOverlay");
    }
}

window.onload = loadEvents;
window.saveEvent = saveEvent;
window.openDeletePopup = openDeletePopup;
window.closeDeletePopup = closeDeletePopup;
window.confirmDelete = confirmDelete;
window.editEvent = editEvent;
window.showPopup = showPopup;
window.closePopup = closePopup;
window.openSuccessPopup = openSuccessPopup;
window.closeSuccessPopup = closeSuccessPopup;
