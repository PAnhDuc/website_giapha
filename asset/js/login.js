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
  
  signupBtn.addEventListener('click', () => {
    const name = document.querySelector('#name').value;
    const username = document.querySelector('#username').value;
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;
    
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;
        user.sendEmailVerification()
          .then(() => {
            alert('Bạn vui lòng kiểm tra email để xác nhận tài khoản');
          })
          .catch((error) => {
            alert('Gửi Email không thành công: ' + error.message);
          });
        firestore.collection('users').doc(uid).set({
          name: name,
          username: username,
          email: email,
        });
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        forgotForm.style.display = 'none';
      })
      .catch((error) => {
        alert('Lỗi trong quá trình đăng ký: ' + error.message);
      });
  });
  
  const loginBtn = document.querySelector('.btn-login');
  loginBtn.addEventListener('click', () => {
    const email = document.querySelector('#inUsr').value.trim();
    const password = document.querySelector('#inPass').value;
    
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
          window.location.href = "home.html";
        } else {
          alert('Bạn hãy xác thực email trước khi đăng nhập');
        }
      })
      .catch((error) => {
        alert('Lỗi trong quá trình đăng nhập: ' + error.message);
      });
  });
  
  const forgotBtn = document.querySelector('.btn-forgot');
  forgotBtn.addEventListener('click', () => {
    const emailForReset = document.querySelector('#forgotinp').value.trim();
    if (emailForReset.length > 0) {
      auth.sendPasswordResetEmail(emailForReset)
        .then(() => {
          alert('Mật khẩu đã được gửi về gmail. Vui lòng check gmail để lấy lại mật khẩu');
          signupForm.style.display = 'none';
          loginForm.style.display = 'block';
          forgotForm.style.display = 'none';
        })
        .catch((error) => {
          alert('Lỗi khi gửi gmail lấy lại mật khẩu: ' + error.message);
        });
    }
  });
  
  // Hàm chuyển hướng sang profile.html với UID của người dùng hiện tại
  function goToProfile() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const uid = user.uid;
        window.location.href = `profile.html?uid=${uid}`; // Truyền UID qua URL
      } else {
        alert("Vui lòng đăng nhập để xem hồ sơ!");
      }
    });
  }