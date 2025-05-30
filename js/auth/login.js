import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
} from "../firebase/firebase-config.js";

const $ = (s) => document.querySelector(s);
const loginForm = $("#login-form"),
  signupForm = $("#signup-form"),
  forgotForm = $("#forgot-form");

$(".login.form").style.display = "block";
$(".registration.form").style.display = "none";
$(".forgot.form").style.display = "none";

document.querySelectorAll("a[id$='Label']").forEach(
  (a) =>
    (a.onclick = (e) => {
      e.preventDefault();
      $(".registration.form").style.display =
        a.id === "signupLabel" ? "block" : "none";
      $(".login.form").style.display = a.id === "loginLabel" ? "block" : "none";
      $(".forgot.form").style.display =
        a.id === "forgotLabel" ? "block" : "none";
    })
);

function showNotification(msg, type = "success") {
  const n = $("#notification");
  if (!n) return;
  n.textContent = msg;
  n.className = `slide-notification ${type}`;
  n.style.display = "block";
  setTimeout(() => (n.style.display = "none"), 3100);
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (pass) => pass.length >= 6;

async function handleSignup() {
  const name = $("#name").value.trim(),
    email = $("#email").value.trim(),
    password = $("#password").value;
  if (!name) return showNotification("Vui lòng nhập họ và tên", "error");
  if (!email) return showNotification("Vui lòng nhập email", "error");
  if (!isValidEmail(email))
    return showNotification("Email của bạn không hợp lệ", "error");
  if (!password) return showNotification("Vui lòng nhập mật khẩu", "error");
  if (!isValidPassword(password))
    return showNotification("Mật khẩu phải có ít nhất 6 ký tự", "error");
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role_id: 1,
      createdAt: serverTimestamp(),
    });
    localStorage.setItem(
      "userData",
      JSON.stringify({ name, email, role_id: 1 })
    );
    showNotification("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
    setTimeout(() => {
      $(".registration.form").style.display = "none";
      $(".login.form").style.display = "block";
      $(".forgot.form").style.display = "none";
    }, 2000);
  } catch (e) {
    let msg = "Lỗi trong quá trình đăng ký";
    if (e.code === "auth/email-already-in-use")
      msg = "Email này đã được sử dụng";
    else if (e.code === "auth/invalid-email") msg = "Email không hợp lệ";
    else if (e.code === "auth/weak-password") msg = "Mật khẩu quá yếu";
    showNotification(`${msg}`, "error");
  }
}

async function handleLogin() {
  const email = $("#inUsr").value.trim(),
    password = $("#inPass").value;
  if (!email) return showNotification("Vui lòng nhập email", "error");
  if (!isValidEmail(email))
    return showNotification("Email của bạn không hợp lệ", "error");
  if (!password) return showNotification("Vui lòng nhập mật khẩu", "error");
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await user.getIdToken(true);
    localStorage.setItem("userToken", idToken);
    localStorage.setItem("userId", user.uid);
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const d = userDoc.data();
      localStorage.setItem(
        "userData",
        JSON.stringify({
          name: d.name,
          email: d.email,
          role: d.role,
          managedFamilyId: d.managedFamilyId || null,
          managedFamilyName: d.managedFamilyName || null,
        })
      );
      localStorage.setItem("userRole", d.role);
    }
    showNotification("Đăng nhập thành công!");
    window.location.href = "home.html";
  } catch (e) {
    let msg = "Lỗi đăng nhập";
    if (e.code === "auth/user-not-found") msg = "Không tìm thấy tài khoản";
    else if (e.code === "auth/wrong-password") msg = "Mật khẩu không đúng";
    else if (e.code === "auth/invalid-email") msg = "Email không hợp lệ";
    showNotification(`${msg}: ${e.message}`, "error");
  }
}

async function handleForgotPassword() {
  const email = $("#forgotinp").value.trim();
  if (!email)
    return showNotification(
      "Vui lòng nhập email để lấy lại mật khẩu.",
      "error"
    );
  if (!isValidEmail(email))
    return showNotification("Email không hợp lệ", "error");
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", email),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty)
      return showNotification(
        "Email này chưa được đăng ký trong hệ thống.",
        "error"
      );
    await sendPasswordResetEmail(auth, email);
    showNotification(
      "Link đặt lại mật khẩu đã được gửi về email. Vui lòng kiểm tra email.",
      "success"
    );
    setTimeout(() => {
      $(".registration.form").style.display = "none";
      $(".login.form").style.display = "block";
      $(".forgot.form").style.display = "none";
    }, 2000);
  } catch (e) {
    let msg = "Lỗi khi gửi email đặt lại mật khẩu";
    if (e.code === "auth/invalid-email") msg = "Email không hợp lệ";
    else if (e.code === "auth/user-not-found")
      msg = "Email này chưa được đăng ký trong hệ thống";
    showNotification(`${msg}: ${e.message}`, "error");
  }
}

loginForm &&
  loginForm.addEventListener(
    "submit",
    (e) => (e.preventDefault(), handleLogin())
  );
signupForm &&
  signupForm.addEventListener(
    "submit",
    (e) => (e.preventDefault(), handleSignup())
  );
forgotForm &&
  forgotForm.addEventListener(
    "submit",
    (e) => (e.preventDefault(), handleForgotPassword())
  );

function checkAuth() {
  return !!localStorage.getItem("userToken");
}
async function logout() {
  try {
    await signOut(auth);
    ["userToken", "userId", "userRole", "userData"].forEach((k) =>
      localStorage.removeItem(k)
    );
    showNotification("Đăng xuất thành công!", "success");
    setTimeout(() => (window.location.href = "index.html"), 1000);
  } catch (e) {
    showNotification(`Lỗi đăng xuất: ${e.message}`, "error");
  }
}
function checkFamilyManagePermission(familyId) {
  const d = JSON.parse(localStorage.getItem("userData") || "{}");
  return d.managedFamilyId === familyId;
}
window.checkAuth = checkAuth;
window.logout = logout;
window.checkFamilyManagePermission = checkFamilyManagePermission;
window.goToProfile = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = `profile.html?uid=${user.uid}`;
    else showNotification("Vui lòng đăng nhập để xem hồ sơ!", "error");
  });
};

// Ẩn/hiện mật khẩu cho tất cả các input có icon toggle-password
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.onclick = function () {
      const input = this.previousElementSibling;
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      this.classList.toggle("fa-eye", !show);
      this.classList.toggle("fa-eye-slash", show);
    };
  });
});
