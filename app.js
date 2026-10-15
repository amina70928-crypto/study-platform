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

// دالة لإظهار النص الأحمر
function showError(message) {
  const errorElement = document.getElementById("error-message");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

// تسجيل حساب جديد
document.getElementById("signup-btn").addEventListener("click", () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        showError("البريد الإلكتروني مستخدم بالفعل! يرجى تسجيل الدخول.");
      } else if (error.code === "auth/weak-password") {
        showError("كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل).");
      } else {
        showError("حدث خطأ في التسجيل، يرجى المحاولة لاحقاً.");
      }
    });
});

// تسجيل الدخول
document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        showError("يجب تسجيل الدخول أولاً / هذا البريد غير مسجل.");
      } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        showError("البريد الإلكتروني أو كلمة المرور غير صحيحة!");
      } else {
        showError("البريد الإلكتروني أو كلمة المرور غير صحيحة!");
      }
    });
});