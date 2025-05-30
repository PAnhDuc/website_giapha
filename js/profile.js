import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAtOEfRZNereDDI5o5ivTkI9Ht_RAHex0U",
  authDomain: "test-web-f5a0a.firebaseapp.com",
  projectId: "test-web-f5a0a",
  storageBucket: "test-web-f5a0a.appspot.com",
  messagingSenderId: "230169455517",
  appId: "1:230169455517:web:a21536928823eb1d105d74",
  measurementId: "G-892G3PZS52"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      document.getElementById("profile-content").style.display = "block";
      // Lấy thông tin user từ Firestore (giả sử lưu ở collection 'users' với id là uid)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        document.getElementById("fullname").value = data.fullname || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("phone").value = data.phone || "";
        if (data.avatarUrl) {
          document.getElementById("avatarPreview").src = data.avatarUrl;
        }
      }
    } else {
      // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
      window.location.href = "login.html";
    }
  });
});