// model.js

const API_BASE_URL = `https://${HOST}${END_POINT_CUSTOMER}`;
console.log(API_BASE_URL);
// Hàm lấy dữ liệu từ API
async function fetchData() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Có lỗi xảy ra: " + error);
  }
}

// Hàm thêm dữ liệu mới qua API
async function addData(newRow) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRow),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Có lỗi xảy ra: " + error);
  }
}

// Hàm cập nhật dữ liệu qua API
async function updateData(id, updatedRow) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRow),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Có lỗi xảy ra: " + error);
  }
}

// Hàm xóa dữ liệu qua API
async function deleteData(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("Có lỗi xảy ra: " + error);
  }
}
