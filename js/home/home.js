import { db, collection, getDocs } from "../firebase/firebase-config.js";

// Đếm user
async function countUsers() {
  const snap = await getDocs(collection(db, "users"));
  document.getElementById("userCount").textContent = snap.size;
}

// Đếm dòng họ
async function countFamilies() {
  const snap = await getDocs(collection(db, "trees"));
  document.getElementById("familyCount").textContent = snap.size;
}

// Đếm online (ví dụ: trường users.online === true)
async function countOnline() {
  const snap = await getDocs(collection(db, "users"));
  let online = 0;
  snap.forEach((doc) => {
    if (doc.data().online) online++;
  });
  document.getElementById("onlineCount").textContent = online;
}

countUsers();
countFamilies();
countOnline();
