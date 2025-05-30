export function renderUserAvatar(containerSelector = ".user") {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const avatar = userData.avatar || "default-avatar.png"; // Đường dẫn ảnh mặc định nếu chưa có
  const name = userData.name || "User";

  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `
    <img
      src="${avatar.startsWith("data:") ? avatar : "./asset/img/" + avatar}"
      alt="${name}"
      title="${name}"
      style="cursor:pointer"
      id="userAvatarImg"
    />
  `;

  // Gắn sự kiện chuyển trang profile
  const img = container.querySelector("#userAvatarImg");
  if (img) {
    img.onclick = function () {
      if (typeof checkAuth === "function" ? checkAuth() : true) {
        window.location.href = "profile.html";
      }
    };
  }
}