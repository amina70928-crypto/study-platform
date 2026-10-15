import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyChvpemEIy07EXxQ-khRfYbCqOCzW8J9Mc",
  authDomain: "study-platform-ef870.firebaseapp.com",
  projectId: "study-platform-ef870",
  storageBucket: "study-platform-ef870.firebasestorage.app",
  messagingSenderId: "198837754474",
  appId: "1:198837754474:web:202029479626d8f2dd0813"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function showError(message) {
  const errorElement = document.getElementById("error-message");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

// تسجيل حساب جديد
const signupBtn = document.getElementById("signup-btn");
if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          showError("هذا البريد الإلكتروني مستخدم بالفعل!");
        } else if (error.code === "auth/weak-password") {
          showError("كلمة المرور ضعيفة! يجب أن تكون 6 أرقام أو حروف على الأقل.");
        } else {
          showError("حدث خطأ أثناء إنشاء الحساب: " + error.message);
        }
      });
  });
}

// تسجيل الدخول
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        showError("البريد الإلكتروني أو كلمة المرور غير صحيحة!");
      });
  });
}