const firebaseConfig = {
    apiKey: "AIzaSyAtOEfRZNereDDI5o5ivTkI9Ht_RAHex0U",
    authDomain: "test-web-f5a0a.firebaseapp.com",
    projectId: "test-web-f5a0a",
    storageBucket: "test-web-f5a0a.firebasestorage.app",
    messagingSenderId: "230169455517",
    appId: "1:230169455517:web:a21536928823eb1d105d74",
    measurementId: "G-892G3PZS52"
  };
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const firestore = firebase.firestore();
  
  const signupForm = document.querySelector('.registration.form');
  const loginForm = document.querySelector('.login.form');
  const forgotForm = document.querySelector('.forgot.form');
  const container = document.querySelector('.container');
  const signupBtn = document.querySelector('.btn-signup');
  const anchors = document.querySelectorAll('a');
  
  anchors.forEach(anchor => {
    anchor.addEventListener('click', () => {
      const id = anchor.id;
      switch (id) {
        case 'loginLabel':
          signupForm.style.display = 'none';
          loginForm.style.display = 'block';
          forgotForm.style.display = 'none';
          break;
        case 'signupLabel':
          signupForm.style.display = 'block';
          loginForm.style.display = 'none';
          forgotForm.style.display = 'none';
          break;
        case 'forgotLabel':
          signupForm.style.display = 'none';
          loginForm.style.display = 'none';
          forgotForm.style.display = 'block';
          break;
      }
    });
  });
  
  function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'slide-notification'; // Reset class
    if (type === 'error') {
      notification.classList.add('error');
    }
    notification.style.display = 'block';
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 600);
    }, 2500);
  }
  
  signupBtn.addEventListener('click', () => {
    const name = document.querySelector('#name').value;
    const username = document.querySelector('#username').value;
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;

        firestore.collection('users').doc(uid).set({
          name: name,
          username: username,
          email: email,
          role: 'user',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Không cần xác thực email nữa, chuyển luôn về form đăng nhập
        showNotification('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        setTimeout(() => {
          signupForm.style.display = 'none';
          loginForm.style.display = 'block';
          forgotForm.style.display = 'none';
        }, 2000);

        // Nếu muốn tự động đăng nhập sau khi đăng ký, có thể chuyển hướng ở đây
        // window.location.href = "home.html";
      })
      .catch((error) => {
        showNotification('Lỗi trong quá trình đăng ký: ' + error.message);
      });
  });
  
  const loginBtn = document.querySelector('.btn-login');
  loginBtn.addEventListener('click', () => {
    const input = document.querySelector('#inUsr').value.trim();
    const password = document.querySelector('#inPass').value;

    // Kiểm tra nếu input là email
    const isEmail = input.includes('@');

    if (isEmail) {
      // Đăng nhập bằng email
      auth.signInWithEmailAndPassword(input, password)
        .then(handleLoginSuccess)
        .catch((error) => {
          showNotification('Lỗi trong quá trình đăng nhập: ' + error.message);
        });
    } else {
      // Đăng nhập bằng username: tìm email tương ứng
      firestore.collection('users').where('username', '==', input).limit(1).get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const email = userData.email;
            auth.signInWithEmailAndPassword(email, password)
              .then(handleLoginSuccess)
              .catch((error) => {
                showNotification('Lỗi trong quá trình đăng nhập: ' + error.message);
              });
          } else {
            showNotification('Không tìm thấy tài khoản với username này');
          }
        })
        .catch((error) => {
          showNotification('Lỗi khi tìm username: ' + error.message);
        });
    }
  });

  // Hàm xử lý đăng nhập thành công
  function handleLoginSuccess(userCredential) {
    const user = userCredential.user;
    // Không cần xác thực email nữa, bỏ kiểm tra user.emailVerified
    user.getIdToken(true)
      .then((idToken) => {
        localStorage.setItem('userToken', idToken);
        localStorage.setItem('userId', user.uid);

        // Lấy thông tin user từ firestore
        firestore.collection('users').doc(user.uid).get()
          .then((doc) => {
            if (doc.exists) {
              const userData = doc.data();
              localStorage.setItem('userRole', userData.role);
              localStorage.setItem('userData', JSON.stringify({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                managedFamilyId: userData.managedFamilyId || null,
                managedFamilyName: userData.managedFamilyName || null
              }));

              showNotification('Bạn đã đăng nhập thành công');
              setTimeout(() => {
                window.location.href = "home.html";
              }, 2000);
            }
          })
          .catch((error) => {
            console.error("Lỗi khi lấy thông tin user:", error);
            showNotification('Có lỗi xảy ra khi lấy thông tin người dùng');
          });
      });
  }
  
  const forgotBtn = document.querySelector('.btn-forgot');
  forgotBtn.addEventListener('click', () => {
    const emailForReset = document.querySelector('#forgotinp').value.trim();
    if (emailForReset.length > 0) {
      auth.sendPasswordResetEmail(emailForReset)
        .then(() => {
          showNotification('Mật khẩu đã được gửi về email. Vui lòng kiểm tra email để lấy lại mật khẩu.', 'success');
          signupForm.style.display = 'none';
          loginForm.style.display = 'block';
          forgotForm.style.display = 'none';
        })
        .catch((error) => {
          showNotification('Lỗi khi gửi email lấy lại mật khẩu: ' + error.message, 'error');
        });
    } else {
      showNotification('Vui lòng nhập email để lấy lại mật khẩu.', 'error');
    }
  });
  
  // Hàm chuyển hướng sang profile.html với UID của người dùng hiện tại
  function goToProfile() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const uid = user.uid;
        window.location.href = `profile.html?uid=${uid}`; // Truyền UID qua URL
      } else {
        showNotification("Vui lòng đăng nhập để xem hồ sơ!", 'error');
      }
    });
  }
  
  // Thêm hàm đăng xuất
  function logout() {
    auth.signOut().then(() => {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      showNotification('Đăng xuất thành công!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }).catch((error) => {
      showNotification('Lỗi đăng xuất: ' + error.message, 'error');
    });
  }
  
  // Thêm hàm kiểm tra quyền quản lý dòng họ
  function checkFamilyManagePermission(familyId) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData.managedFamilyId === familyId;
  }
  
  // Export các hàm để sử dụng ở các file khác
  window.checkAuth = checkAuth;
  window.logout = logout;
  window.checkFamilyManagePermission = checkFamilyManagePermission;

  // Xử lý Enter cho form đăng nhập
  document.querySelectorAll('.login.form input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.btn-login').click();
      }
    });
  });

  // Xử lý Enter cho form đăng ký
  document.querySelectorAll('.registration.form input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.btn-signup').click();
      }
    });
  });

  // Xử lý Enter cho form quên mật khẩu
  document.querySelectorAll('.forgot.form input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.btn-forgot').click();
      }
    });
  });