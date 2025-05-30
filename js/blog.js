import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, deleteDoc, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAtOEfRZNereDDI5o5ivTkI9Ht_RAHex0U",
    authDomain: "test-web-f5a0a.firebaseapp.com",
    projectId: "test-web-f5a0a",
    storageBucket: "test-web-f5a0a.firebasestorage.app",
    messagingSenderId: "230169455517",
    appId: "1:230169455517:web:a21536928823eb1d105d74",
    measurementId: "G-892G3PZS52"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const currentUserRole = "admin";
let editingPostId = null;

function resetModal() {
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("postImage").value = "";
    editingPostId = null;
    // Đặt lại tiêu đề modal thành "Thêm Bài Viết"
    document.querySelector("#postModal .modal-content h2").textContent = "Thêm Bài Viết";
}

function addPost() {
    resetModal(); // Đảm bảo tiêu đề là "Thêm Bài Viết"
    document.getElementById("postModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("postModal").style.display = "none";
}

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function savePost() {
    try {
        const title = document.getElementById("postTitle").value;
        const content = document.getElementById("postContent").value;
        const imageFile = document.getElementById("postImage").files[0];

        // Thêm log để kiểm tra giá trị
        console.log('Title:', title);
        console.log('Content:', content);
        
        // Kiểm tra cả khoảng trắng và undefined/null
        if (!title || !content || title.trim() === "" || content.trim() === "") {
            alert("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
            return;
        }

        let imageBase64 = "";
        if (imageFile) {
            imageBase64 = await convertImageToBase64(imageFile);
        }

        if (editingPostId) {
            await updateDoc(doc(db, "posts", editingPostId), {
                title,
                content,
                imageBase64
            });
        } else {
            await addDoc(collection(db, "posts"), {
                title,
                content,
                imageBase64,
                timestamp: serverTimestamp()
            });
        }
        closeModal();
        loadPosts();
        alert("Lưu bài viết thành công!");
    } catch (error) {
        console.error("Chi tiết lỗi:", error);
        alert("Có lỗi xảy ra khi lưu bài viết!");
    }
}

async function loadPosts() {
    const postContainer = document.getElementById("blog");
    postContainer.innerHTML = "";

    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postElement = document.createElement("div");
        postElement.classList.add("blog-item");

        // Ảnh bài viết
        if (data.imageBase64) {
            const image = document.createElement("img");
            image.src = data.imageBase64;
            image.alt = "Bài viết";
            postElement.appendChild(image);
        }

        // Tiêu đề bài viết
        const titleLink = document.createElement("a");
        titleLink.href = "#";
        titleLink.textContent = data.title;
        postElement.appendChild(titleLink);

        // Nếu user là admin hoặc editor thì hiển thị nút Sửa và Xóa
        if (currentUserRole === "admin" || currentUserRole === "editor") {
            const editButton = document.createElement("button");
            editButton.textContent = "Sửa";
            editButton.onclick = () => editPost(doc.id, data.title, data.content, data.imageBase64);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Xoá";
            deleteButton.onclick = () => deletePost(doc.id);

            postElement.appendChild(editButton);
            postElement.appendChild(deleteButton);
        }

        postContainer.appendChild(postElement);
    });
}

async function deletePost(postId) {
    await deleteDoc(doc(db, "posts", postId));
    loadPosts();
}

function editPost(postId, title, content, imageBase64) {
    document.getElementById("postTitle").value = title;
    document.getElementById("postContent").value = content;
    editingPostId = postId;
    // Thay đổi tiêu đề modal thành "Sửa Bài Viết"
    document.querySelector("#postModal .modal-content h2").textContent = "Sửa Bài Viết";
    document.getElementById("postModal").style.display = "flex";
}

window.onload = loadPosts;
window.addPost = addPost;
window.closeModal = closeModal;
window.savePost = savePost;
window.deletePost = deletePost;
window.editPost = editPost;