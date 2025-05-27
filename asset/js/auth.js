function checkAuth() {
  const token = localStorage.getItem("userToken");
  // Kiểm tra xem token có tồn tại và không rỗng
  if (!token || token.trim() === "") {
    return false;
  }
  // Có thể thêm logic kiểm tra token hợp lệ (ví dụ: gọi API hoặc kiểm tra thời hạn)
  return true;
}