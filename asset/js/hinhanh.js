import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

    async function loadImages() {
        const imagesCollection = collection(db, "images");
        const querySnapshot = await getDocs(imagesCollection);
        const gallery = document.getElementById("gallery");
        gallery.innerHTML = "";

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const imgElement = document.createElement("img");
            imgElement.src = data.base64;
            imgElement.alt = "Ảnh tải lên";
            imgElement.style.width = "150px";
            imgElement.style.margin = "10px";
            imgElement.style.borderRadius = "8px";

            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Xóa ảnh";
            deleteButton.classList.add("delete-btn");
            deleteButton.addEventListener("click", async () => {
                if (confirm("Bạn có chắc chắn muốn xóa ảnh này?")) {
                    await deleteDoc(doc(db, "images", docSnapshot.id));
                    loadImages();
                }
            });

            const galleryItem = document.createElement("div");
            galleryItem.classList.add("gallery-item");
            galleryItem.appendChild(imgElement);
            galleryItem.appendChild(deleteButton);

            gallery.appendChild(galleryItem);
        });
    }

    // Hàm mở popup xác nhận xóa
    function openDeletePopup() {
        console.log("Mở popup xác nhận xóa album");
        const deletePopup = document.getElementById("deletePopupOverlay");
        if (deletePopup) {
            deletePopup.style.display = "flex";
            console.log("Popup xác nhận xóa đã được mở, display:", deletePopup.style.display);
        } else {
            console.error("Không tìm thấy deletePopupOverlay trong DOM. Kiểm tra HTML!");
        }
    }

    // Hàm đóng popup xác nhận xóa
    function closeDeletePopup() {
        console.log("Đóng popup xác nhận xóa album");
        const deletePopup = document.getElementById("deletePopupOverlay");
        if (deletePopup) {
            deletePopup.style.display = "none";
            console.log("Popup xác nhận xóa đã được đóng, display:", deletePopup.style.display);
        } else {
            console.error("Không tìm thấy deletePopupOverlay trong DOM. Kiểm tra HTML!");
        }
    }

    // Hàm xác nhận xóa album
    async function confirmDelete() {
        try {
            const imagesCollection = collection(db, "images");
            const querySnapshot = await getDocs(imagesCollection);
            for (const docSnapshot of querySnapshot.docs) {
                await deleteDoc(doc(db, "images", docSnapshot.id));
            }
            closeDeletePopup(); // Đóng popup xác nhận xóa trước
            openSuccessPopup("Xóa thành công album"); // Mở popup thông báo thành công
            loadImages();
        } catch (error) {
            console.error("Lỗi khi xóa album:", error);
            alert("Đã xảy ra lỗi khi xóa album");
        }
    }

    // Hiển thị popup thông báo thành công
    function openSuccessPopup(message) {
        console.log("Mở popup thông báo thành công với thông điệp:", message);
        const successPopup = document.getElementById("successPopupOverlay");
        const successMessage = document.getElementById("successMessage");
        if (successMessage) {
            successMessage.textContent = message;
        }
        if (successPopup) {
            successPopup.style.display = "flex";
            console.log("Popup thông báo thành công đã được mở, display:", successPopup.style.display);
        } else {
            console.error("Không tìm thấy successPopupOverlay trong DOM. Kiểm tra HTML!");
        }
    }

    // Ẩn popup thông báo thành công
    function closeSuccessPopup() {
        console.log("Đóng popup thông báo thành công");
        const successPopup = document.getElementById("successPopupOverlay");
        if (successPopup) {
            successPopup.style.display = "none";
            console.log("Popup thông báo thành công đã được đóng, display:", successPopup.style.display);
        } else {
            console.error("Không tìm thấy successPopupOverlay trong DOM. Kiểm tra HTML!");
        }
    }

    // Gắn sự kiện click cho nút "Xóa album"
    document.getElementById("deleteAlbum").addEventListener("click", () => {
        openDeletePopup();
    });

    loadImages();

    // Gắn các hàm vào window để HTML có thể gọi
    window.openDeletePopup = openDeletePopup;
    window.closeDeletePopup = closeDeletePopup;
    window.confirmDelete = confirmDelete;
    window.openSuccessPopup = openSuccessPopup;
    window.closeSuccessPopup = closeSuccessPopup;
   