document.addEventListener('DOMContentLoaded', function() {
    // Cấu hình Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAtOEfRZNereDDI5o5ivTkI9Ht_RAHex0U",
        authDomain: "test-web-f5a0a.firebaseapp.com",
        projectId: "test-web-f5a0a",
        storageBucket: "test-web-f5a0a.appspot.com",
        messagingSenderId: "230169455517",
        appId: "1:230169455517:web:a21536928823eb1d105d74",
    };

    // Khởi tạo Firebase
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }

    // Khởi tạo Firestore
    const db = firebase.firestore();
    const membersCollection = db.collection('members'); // Tạo collection 'members' trong Firestore

    // Elements
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    const addBtn = document.querySelector('.btn.add');
    const tableBody = document.querySelector('tbody');
    let currentEditId = null;

    // Modal handling
    document.querySelector('#userModal .close').onclick = function() {
        modal.style.display = 'none';
        enableFormInputs();
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            enableFormInputs();
        }
    };

    // Gắn sự kiện cho nút "Thêm thành viên"
    addBtn.onclick = function() {
        modalTitle.textContent = 'Thêm thành viên';
        userForm.reset();
        currentEditId = null;
        modal.style.display = 'block';
        enableFormInputs();
    };

    // Hàm thêm hàng mới vào bảng
    function addRowToTable(id, member, index) {
        const dateText = `${member.deathDate}`;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${index}</td>
            <td>${member.generation}</td>
            <td>${member.name}</td>
            <td>0 - 0 - 0</td>
            <td>${dateText}</td>
            <td>${member.parent}</td>
            <td>
                <button class="btn update" data-id="${id}">Cập nhật</button>
                <button class="btn info" data-id="${id}">Thông tin</button>
                <button class="btn delete" data-id="${id}">Xóa</button>
            </td>
        `;
        tableBody.appendChild(newRow);
    }

    // Load members từ Firestore
    function loadMembers() {
        console.log("Loading members from Firestore...");
        membersCollection.onSnapshot((snapshot) => {
          console.log("Data received from Firestore:", snapshot.docs);
          tableBody.innerHTML = '';
          let index = 1;
          snapshot.forEach((doc) => {
            const member = doc.data();
            const id = doc.id;
            addRowToTable(id, member, index);
            index++;
          });

          // Cập nhật tổng số thành viên
          const totalMembers = snapshot.size;
          document.getElementById('memberCount').textContent = `Danh sách thành viên, tổng số: ${totalMembers}`;
        }, (error) => {
          console.error("Error loading members from Firestore:", error);
        });
      }

    // Form submit
    userForm.onsubmit = function(e) {
        e.preventDefault();
        console.log("Form submitted");
        const generation = document.getElementById('generation').value;
        const name = document.getElementById('name').value;
        const birthDate = document.getElementById('birthDate').value;
        const deathDate = document.getElementById('deathDate').value;
        const parent = document.getElementById('parent').value;

        const memberData = {
            generation,
            name,
            birthDate,
            deathDate,
            parent,
            createdAt: firebase.firestore.FieldValue.serverTimestamp() // Thêm timestamp để theo dõi thời gian tạo
        };

        console.log("Member data to save:", memberData);

        if (currentEditId) {
            // Cập nhật thành viên
            console.log("Updating member with ID:", currentEditId);
            membersCollection.doc(currentEditId).update(memberData)
                .then(() => {
                    console.log("Member updated successfully");
                    modal.style.display = 'none';
                })
                .catch((error) => {
                    console.error("Error updating member:", error);
                    alert("Có lỗi xảy ra khi cập nhật thành viên: " + error.message);
                });
        } else {
            // Thêm thành viên mới
            console.log("Adding new member");
            membersCollection.add(memberData)
                .then((docRef) => {
                    console.log("Member added successfully with ID:", docRef.id);
                    modal.style.display = 'none'; // Đóng modal
                    userForm.reset(); // Reset form
                })
                .catch((error) => {
                    console.error("Error adding member:", error);
                    alert("Có lỗi xảy ra khi thêm thành viên: " + error.message);
                });
        }
    };

    // Table button handling
    tableBody.addEventListener('click', function(e) {
        const button = e.target;
        const id = button.getAttribute('data-id');
        if (!id) return;

        if (button.classList.contains('update')) {
            console.log("Update button clicked for ID:", id);
            modalTitle.textContent = 'Cập nhật thông tin';
            currentEditId = id;
            membersCollection.doc(id).get().then((doc) => {
                if (doc.exists) {
                    const member = doc.data();
                    document.getElementById('generation').value = member.generation;
                    document.getElementById('name').value = member.name;
                    document.getElementById('birthDate').value = member.birthDate || '';
                    document.getElementById('deathDate').value = member.deathDate || '';
                    document.getElementById('parent').value = member.parent;
                }
            }).catch((error) => {
                console.error("Error fetching member data:", error);
            });
            modal.style.display = 'block';
            enableFormInputs();
        }

        if (button.classList.contains('info')) {
            console.log("Info button clicked for ID:", id);
            modalTitle.textContent = 'Thông tin thành viên';
            membersCollection.doc(id).get().then((doc) => {
                if (doc.exists) {
                    const member = doc.data();
                    document.getElementById('generation').value = member.generation;
                    document.getElementById('name').value = member.name;
                    document.getElementById('birthDate').value = member.birthDate || '';
                    document.getElementById('deathDate').value = member.deathDate || '';
                    document.getElementById('parent').value = member.parent;
                    const inputs = userForm.getElementsByTagName('input');
                    for (let input of inputs) {
                        input.disabled = true;
                    }
                    document.getElementById('submitBtn').style.display = 'none';
                }
            }).catch((error) => {
                console.error("Error fetching member data:", error);
            });
            modal.style.display = 'block';
        }

        if (button.classList.contains('delete')) {
            console.log("Delete button clicked for ID:", id);
            if (confirm('Bạn có chắc muốn xóa thành viên này?')) {
                membersCollection.doc(id).delete()
                    .then(() => {
                        console.log("Member deleted successfully");
                    })
                    .catch((error) => {
                        console.error("Error deleting member:", error);
                    });
            }
        }
    });

    // Helper function to enable form inputs
    function enableFormInputs() {
        const inputs = userForm.getElementsByTagName('input');
        for (let input of inputs) {
            input.disabled = false;
        }
        document.getElementById('submitBtn').style.display = 'block';
    }

    // Load data on page load
    loadMembers();
});