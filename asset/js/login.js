import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAtOEfRZNereDDI5o5ivTkI9Ht_RAHex0U",
  authDomain: "test-web-f5a0a.firebaseapp.com",
  projectId: "test-web-f5a0a",
  storageBucket: "test-web-f5a0a.firebasestorage.app",
  messagingSenderId: "230169455517",
  appId: "1:230169455517:web:a21536928823eb1d105d74",
  measurementId: "G-892G3PZS52",
};

// Khởi tạo Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

// Lấy tham chiếu đến các phần tử DOM
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const forgotForm = document.getElementById("forgot-form");
const loginBtn = document.querySelector(".btn-login");
const signupBtn = document.querySelector(".btn-signup");
const forgotBtn = document.querySelector(".btn-forgot");

// Hiển thị form mặc định và ẩn các form khác
document.querySelector(".login.form").style.display = "block";
document.querySelector(".registration.form").style.display = "none";
document.querySelector(".forgot.form").style.display = "none";

// Chuyển đổi giữa các form
document.querySelectorAll("a[id$='Label']").forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const id = anchor.id;
    document.querySelector(".registration.form").style.display =
      id === "signupLabel" ? "block" : "none";
    document.querySelector(".login.form").style.display =
      id === "loginLabel" ? "block" : "none";
    document.querySelector(".forgot.form").style.display =
      id === "forgotLabel" ? "block" : "none";
  });
});

// Hiển thị thông báo với CSS animation
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  if (!notification) return;
  notification.textContent = message;
  notification.className = `slide-notification ${type}`;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3100); // Thời gian khớp với CSS animation
}

// Xử lý đăng ký
async function handleSignup() {
  try {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name) {
      showNotification("Vui lòng nhập họ và tên", "error");
      return;
    }
    if (!email) {
      showNotification("Vui lòng nhập email", "error");
      return;
    }
    if (!password) {
      showNotification("Vui lòng nhập mật khẩu", "error");
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(firestore, "users", user.uid), {
      name,
      email,
      role: "user",
      createdAt: serverTimestamp(),
    });

    localStorage.setItem(
      "userData",
      JSON.stringify({ name, email, role: "user" })
    );
    showNotification("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
    setTimeout(() => {
      document.querySelector(".registration.form").style.display = "none";
      document.querySelector(".login.form").style.display = "block";
      document.querySelector(".forgot.form").style.display = "none";
    }, 2000);
  } catch (error) {
    showNotification(`Lỗi trong quá trình đăng ký: ${error.message}`, "error");
  }
}

// Xử lý đăng nhập
async function handleLogin() {
  try {
    const input = document.getElementById("inUsr").value.trim();
    const password = document.getElementById("inPass").value;

    if (!input) {
      showNotification("Vui lòng nhập email", "error");
      return;
    }
    if (!password) {
      showNotification("Vui lòng nhập mật khẩu", "error");
      return;
    }

    const email = input;

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const idToken = await user.getIdToken(true);

    localStorage.setItem("userToken", idToken);
    localStorage.setItem("userId", user.uid);

    // Lấy thông tin người dùng
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem(
        "userData",
        JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          managedFamilyId: userData.managedFamilyId || null,
          managedFamilyName: userData.managedFamilyName || null,
        })
      );
      localStorage.setItem("userRole", userData.role);
    }

    showNotification("Đăng nhập thành công!");
    window.location.href = "home.html";
  } catch (error) {
    showNotification(`Lỗi đăng nhập: ${error.message}`, "error");
  }
}

// Xử lý quên mật khẩu
async function handleForgotPassword() {
  try {
    const email = document.getElementById("forgotinp").value.trim();
    if (!email) {
      showNotification("Vui lòng nhập email để lấy lại mật khẩu.", "error");
      return;
    }

    await sendPasswordResetEmail(auth, email);
    showNotification(
      "Link đặt lại mật khẩu đã được gửi về email. Vui lòng kiểm tra email.",
      "success"
    );
    setTimeout(() => {
      document.querySelector(".registration.form").style.display = "none";
      document.querySelector(".login.form").style.display = "block";
      document.querySelector(".forgot.form").style.display = "none";
    }, 2000);
  } catch (error) {
    showNotification(`Lỗi: ${error.message}`, "error");
  }
}

// Gắn sự kiện submit cho các form
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleLogin();
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleSignup();
  });
}

if (forgotForm) {
  forgotForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleForgotPassword();
  });
}

// Kiểm tra trạng thái đăng nhập
function checkAuth() {
  return !!localStorage.getItem("userToken");
}

// Đăng xuất
async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    showNotification("Đăng xuất thành công!", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    showNotification(`Lỗi đăng xuất: ${error.message}`, "error");
  }
}

// Kiểm tra quyền quản lý dòng họ
function checkFamilyManagePermission(familyId) {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  return userData.managedFamilyId === familyId;
}

// Đặt các function vào global scope để sử dụng ở nơi khác
window.checkAuth = checkAuth;
window.logout = logout;
window.checkFamilyManagePermission = checkFamilyManagePermission;
window.goToProfile = function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = `profile.html?uid=${user.uid}`;
    } else {
      showNotification("Vui lòng đăng nhập để xem hồ sơ!", "error");
    }
  });
};
