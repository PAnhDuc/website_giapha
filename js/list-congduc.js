
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
window.db = db;

async function loadData() {
    const tbody = document.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    let stt = 1;
    let totalTongTien = 0; // Biến để tính tổng tiền

    try {
        const querySnapshot = await getDocs(collection(db, "congduc"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tienMat = parseInt(data.tienmat) || 0; // Đảm bảo giá trị là số
            const tongTien = parseInt(data.tongtien) || 0; // Đảm bảo giá trị là số
            totalTongTien += tongTien; // Cộng dồn tổng tiền
            tbody.innerHTML += `
                <tr>
                    <td>${stt++}</td>
                    <td>${data.hoten || 'Không có tên'}</td>
                    <td>${data.noio || 'Không rõ'}</td>
                    <td>${data.conchaucu || ''}</td>
                    <td>${tienMat.toLocaleString('en-US')} đ</td> <!-- Định dạng với dấu phẩy và thêm "đ" -->
                    <td>${tongTien.toLocaleString('en-US')} đ</td> <!-- Định dạng với dấu phẩy và thêm "đ" -->
                    <td>${data.ngay || 'Không có ngày'}</td>
                    <td>
                        <button class="btn_update" data-id="${doc.id}" onclick="editData('${doc.id}')">Sửa</button>
                        <button class="btn_delete" onclick="openDeletePopup('${doc.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
        // Lưu tổng tiền vào localStorage
        localStorage.setItem("totalTongTien", totalTongTien);
        console.log("Tổng tiền:", totalTongTien); // Kiểm tra giá trị tổng
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu: ", error);
    }
}

let deleteId = null;

async function openDeletePopup(id) {
    console.log("Mở popup xác nhận xóa với id:", id);
    deleteId = id;

    try {
        const docRef = doc(db, "congduc", id);
        const docSnap = await getDoc(docRef);
        let hoten = "Không có tên";
        if (docSnap.exists()) {
            const data = docSnap.data();
            hoten = data.hoten || "Không có tên";
        }

        const deleteInfo = document.getElementById("deleteInfo");
        if (deleteInfo) {
            deleteInfo.textContent = `Thông tin xóa: ${hoten}`;
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
    deleteId = null;
}

async function confirmDelete() {
    if (!deleteId) {
        console.error("Không có id để xóa");
        return;
    }

    try {
        await deleteDoc(doc(db, "congduc", deleteId));
        closeDeletePopup();
        openSuccessPopup("Xóa thành công người công đức");
        loadData(); // Tải lại dữ liệu để cập nhật tổng tiền
    } catch (error) {
        console.error("Lỗi khi xóa: ", error);
        alert("Đã xảy ra lỗi khi xóa");
    }
}

function openSuccessPopup(message) {
    console.log("Mở popup thông báo thành công với thông điệp:", message);
    const successPopup = document.getElementById("successPopupOverlay");
    const successMessage = document.getElementById("successMessage");
    if (successMessage) {
        successMessage.textContent = message;
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
    }
}

function openPopup() {
    console.log("Mở popup");
    const popupOverlay = document.getElementById("popupOverlay");
    if (popupOverlay) {
        popupOverlay.style.display = "flex";
    } else {
        console.error("Không tìm thấy popupOverlay");
    }
}

function closePopup() {
    console.log("Đóng popup");
    const popupOverlay = document.getElementById("popupOverlay");
    if (popupOverlay) {
        popupOverlay.style.display = "none";
    }
    editingId = null;
}

let editingId = null;

async function editData(id) {
    console.log("editData called with id:", id);
    editingId = id;

    try {
        const docRef = doc(db, "congduc", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Dữ liệu từ Firestore:", data);

            document.getElementById("hoten").value = data.hoten || '';
            document.getElementById("noio").value = data.noio || '';
            document.getElementById("conchaucu").value = data.conchaucu || '';
            document.getElementById("tienmat").value = data.tienmat || 0;
            document.getElementById("tongtien").value = data.tongtien || 0;
            if (data.ngay) {
                try {
                    const date = new Date(data.ngay);
                    if (!isNaN(date.getTime())) {
                        document.getElementById("ngay").value = date.toISOString().split('T')[0];
                    } else {
                        document.getElementById("ngay").value = '';
                    }
                } catch (error) {
                    console.error("Lỗi định dạng ngày:", error);
                    document.getElementById("ngay").value = '';
                }
            } else {
                document.getElementById("ngay").value = '';
            }

            openPopup();
        } else {
            console.error("Không tìm thấy tài liệu với id:", id);
            alert("Không tìm thấy dữ liệu để chỉnh sửa!");
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu để chỉnh sửa:", error);
        alert("Đã xảy ra lỗi khi lấy dữ liệu!");
    }
}
async function addPerson() {
    const hoten = document.getElementById("hoten").value.trim();
    const noio = document.getElementById("noio").value.trim();
    const conchaucu = document.getElementById("conchaucu").value.trim();
    const tienmat = document.getElementById("tienmat").value.trim();
    const tongtien = document.getElementById("tongtien").value.trim();
    const ngay = document.getElementById("ngay").value.trim();

    if (!hoten || !noio || !conchaucu || !tienmat || !tongtien || !ngay) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    try {
        if (editingId) {
            await updateDoc(doc(db, "congduc", editingId), {
                hoten,
                noio,
                conchaucu,
                tienmat: parseInt(tienmat) || 0,
                tongtien: parseInt(tongtien) || 0,
                ngay
            });
            openSuccessPopup("Sửa thành công người đức");
        } else {
            await addDoc(collection(db, "congduc"), {
                hoten,
                noio,
                conchaucu,
                tienmat: parseInt(tienmat) || 0,
                tongtien: parseInt(tongtien) || 0,
                ngay
            });
            openSuccessPopup("Thêm thành công sự kiện");
        }
        closePopup();
        loadData(); // Tải lại dữ liệu để cập nhật tổng tiền
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu: ", error);
        alert("Đã xảy ra lỗi, vui lòng thử lại!");
    }
}
window.addPerson = addPerson;
window.editData = editData;
window.openDeletePopup = openDeletePopup;
window.closeDeletePopup = closeDeletePopup;
window.confirmDelete = confirmDelete;
window.openSuccessPopup = openSuccessPopup;
window.closeSuccessPopup = closeSuccessPopup;
window.openPopup = openPopup;
window.closePopup = closePopup;
window.onload = loadData;