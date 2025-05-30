import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

          const firebaseConfig = {
            apiKey: "AIzaSyB104q071Bx258JfMzCT1ZCCljy-gaAshQ",
            authDomain: "website-gia-pha.firebaseapp.com",
            projectId: "website-gia-pha",
            storageBucket: "website-gia-pha.appspot.com",
            messagingSenderId: "782484716560",
            appId: "1:782484716560:web:508a379f1f46868a9b1e95",
            measurementId: "G-YXCD70XLZZ"
          };

          // Khởi tạo Firebase
          const app = initializeApp(firebaseConfig);
          const db = getFirestore(app);

          // ⚡ Hàm hiển thị ảnh từ Firestore
          async function loadImages() {
            const imagesCollection = collection(db, "images");
            const querySnapshot = await getDocs(imagesCollection);

            document.getElementById("gallery").innerHTML = ""; // Xóa ảnh cũ

            querySnapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              const imgElement = document.createElement("img");
              imgElement.src = data.base64;
              imgElement.style.width = "100px";
              imgElement.style.margin = "5px";

              const albumInfo = document.createElement("p");
              albumInfo.innerText = `Album: ${data.album || "Chưa đặt tên"}`;
              albumInfo.style.fontSize = "12px";
              albumInfo.style.color = "#555";

              const container = document.createElement("div");
              container.style.display = "inline-block";
              container.style.textAlign = "center";
              container.style.margin = "10px";
              container.appendChild(imgElement);
              container.appendChild(albumInfo);

              document.getElementById("gallery").appendChild(container);
            });
          }

          loadImages(); // Gọi khi tải trang

          // 📌 Hàm xử lý tải ảnh lên Firestore
          document.getElementById("uploadBtn").addEventListener("click", async () => {
            const files = document.getElementById("fileInput").files;
            const albumName = document.getElementById("albumName").value || "default_album";

            if (files.length === 0) {
              alert("Chọn ít nhất một ảnh!");
              return;
            }

            document.getElementById("status").innerText = "Đang tải ảnh lên...";

            const uploadPromises = []; // Mảng chứa tất cả các promises tải ảnh

            for (let file of files) {
              const reader = new FileReader();

              // Promise để chờ FileReader đọc xong dữ liệu ảnh
              const filePromise = new Promise((resolve, reject) => {
                reader.onload = async function () {
                  try {
                    await addDoc(collection(db, "images"), {
                      album: albumName,
                      filename: file.name,
                      base64: reader.result,
                      timestamp: serverTimestamp(),
                    });
                    resolve(); // Xác nhận ảnh đã được tải lên thành công
                  } catch (error) {
                    reject(error);
                  }
                };
              });

              reader.readAsDataURL(file);
              uploadPromises.push(filePromise); // Đẩy promise vào danh sách
            }

            // Chờ tất cả ảnh tải xong trước khi chuyển trang
            try {
              await Promise.all(uploadPromises);
              document.getElementById("status").innerText = "Tải ảnh lên thành công!";

              //  Đợi 1 giây để người dùng thấy thông báo trước khi chuyển trang
              setTimeout(() => {
                window.location.href = "hinhanh.html";
              }, 1000);

            } catch (error) {
              document.getElementById("status").innerText = "Lỗi khi tải ảnh lên!";
              console.error("Lỗi lưu ảnh vào Firestore:", error);
            }
          });

          //  Cập nhật tên file khi chọn ảnh
          document.getElementById("fileInput").addEventListener("change", function () {
            const fileSpan = document.getElementById("fileName");
            if (this.files.length > 0) {
              fileSpan.innerText = Array.from(this.files).map(file => file.name).join(", ");
            } else {
              fileSpan.innerText = "No file chosen";
            }
          });