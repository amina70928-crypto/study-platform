import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// جعل كل نافذة تبويب مستقلة بذاتها في جلسة تسجيل الدخول لمنع أي تداخل بين الحسابات
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("خطأ في إعداد الجلسة:", error);
});

// البريد الإلكتروني الحصري للأستاذة
const TEACHER_EMAIL = "amina26928@gmail.com";

const logoutBtn = document.getElementById("logout-btn");
const teacherUploadSection = document.getElementById("teacher-upload-section");
const studentViewMsg = document.getElementById("student-view-msg");
const uploadBtn = document.getElementById("upload-btn");
const fileUploader = document.getElementById("file-uploader");
const fileList = document.getElementById("file-list");
const uploadStatus = document.getElementById("upload-status");

// دالة جلب وعرض الملفات
function loadFiles(isTeacher) {
  fileList.innerHTML = "";
  const savedFiles = JSON.parse(localStorage.getItem("platform_files")) || [];

  if (savedFiles.length === 0) {
    fileList.innerHTML = "<p style='color: #666; text-align: center;'>لا توجد ملفات مرفوعة حالياً من طرف الأستاذة.</p>";
    return;
  }

  savedFiles.forEach((fileObj, index) => {
    const li = document.createElement("li");
    li.className = "file-item";
    
    let actionsHTML = `<a href="${fileObj.url}" target="_blank" download="${fileObj.name}" class="download-link">تحميل / عرض 📥</a>`;
    
    // زر الحذف يظهر للأستاذة وحدها
    if (isTeacher) {
      actionsHTML += `<button class="delete-btn" data-index="${index}" style="margin-right: 8px;">حذف 🗑️</button>`;
    }

    li.innerHTML = `
      <span>📄 <strong>${fileObj.name}</strong></span>
      <div class="file-actions">${actionsHTML}</div>
    `;

    if (isTeacher) {
      const deleteBtn = li.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", () => {
        if (confirm(`هل أنت متأكد من حذف الملف: ${fileObj.name}؟`)) {
          let files = JSON.parse(localStorage.getItem("platform_files")) || [];
          files.splice(index, 1);
          localStorage.setItem("platform_files", JSON.stringify(files));
          loadFiles(true);
        }
      });
    }

    fileList.appendChild(li);
  });
}

// مراقبة حالة المستخدم في هذه النافذة فقط
onAuthStateChanged(auth, (user) => {
  if (user) {
    const isTeacher = (user.email === TEACHER_EMAIL);

    if (isTeacher) {
      teacherUploadSection.style.display = "block";
      studentViewMsg.style.display = "none";
    } else {
      teacherUploadSection.style.display = "none";
      studentViewMsg.style.display = "block";
    }

    loadFiles(isTeacher);
  } else {
    window.location.href = "index.html";
  }
});

// تسجيل الخروج
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });
}

// زر الرفع المحمي
if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.email !== TEACHER_EMAIL) {
      alert("عذراً، هذا الحساب لا يملك صلاحية الرفع!");
      return;
    }

    const file = fileUploader.files[0];
    if (!file) {
      alert("يرجى اختيار ملف أولاً!");
      return;
    }

    uploadStatus.textContent = "جاري الحفظ... ⏳";
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      const fileData = {
        name: file.name,
        url: reader.result
      };

      let files = JSON.parse(localStorage.getItem("platform_files")) || [];
      files.push(fileData);
      localStorage.setItem("platform_files", JSON.stringify(files));

      uploadStatus.textContent = "تم الحفظ بنجاح! ✅";
      fileUploader.value = "";
      loadFiles(true);

      setTimeout(() => {
        uploadStatus.textContent = "";
      }, 3000);
    };

    reader.onerror = function () {
      uploadStatus.textContent = "فشل الحفظ! ❌";
    };
  });
}