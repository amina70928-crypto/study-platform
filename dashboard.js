import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("خطأ في الجلسة:", error);
});

const TEACHER_EMAIL = "amina26928@gmail.com";
const DEFAULT_MEET_URL = "https://meet.google.com/rhi-fgdj-yrq";

const logoutBtn = document.getElementById("logout-btn");
const teacherUploadSection = document.getElementById("teacher-upload-section");
const studentViewMsg = document.getElementById("student-view-msg");
const uploadBtn = document.getElementById("upload-btn");
const anyFileUploader = document.getElementById("any-file-uploader");
const fileCategorySelect = document.getElementById("file-category-select");
const uploadStatus = document.getElementById("upload-status");

// عناصر الحصص المباشرة
const teacherLiveControl = document.getElementById("teacher-live-control");
const liveTitleInput = document.getElementById("live-title-input");
const meetUrlInput = document.getElementById("meet-url-input");
const startLiveBtn = document.getElementById("start-live-btn");
const stopLiveBtn = document.getElementById("stop-live-btn");
const liveStatusMsg = document.getElementById("live-status-msg");
const noLiveMsg = document.getElementById("no-live-msg");
const activeLiveBox = document.getElementById("active-live-box");
const currentLiveTitle = document.getElementById("current-live-title");
const joinLiveBtn = document.getElementById("join-live-btn");

// مراقبة حالة البث المباشر
function listenToLiveStatus() {
  onSnapshot(doc(db, "live_stream", "current_session"), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (meetUrlInput) meetUrlInput.value = data.url || DEFAULT_MEET_URL;

      if (data.isLive) {
        if (noLiveMsg) noLiveMsg.style.display = "none";
        if (activeLiveBox) activeLiveBox.style.display = "block";
        if (currentLiveTitle) currentLiveTitle.textContent = `🔴 حصة Google Meet: ${data.title || 'حصة مباشرة مع الأستاذة'}`;
        if (joinLiveBtn) joinLiveBtn.href = data.url || DEFAULT_MEET_URL;

        if (startLiveBtn && stopLiveBtn) {
          startLiveBtn.style.display = "none";
          stopLiveBtn.style.display = "inline-block";
        }
      } else {
        if (noLiveMsg) noLiveMsg.style.display = "block";
        if (activeLiveBox) activeLiveBox.style.display = "none";

        if (startLiveBtn && stopLiveBtn) {
          startLiveBtn.style.display = "inline-block";
          stopLiveBtn.style.display = "none";
        }
      }
    } else {
      if (noLiveMsg) noLiveMsg.style.display = "block";
      if (activeLiveBox) activeLiveBox.style.display = "none";
    }
  });
}

// بدء الحصة
if (startLiveBtn) {
  startLiveBtn.addEventListener("click", async () => {
    const title = (liveTitleInput && liveTitleInput.value.trim()) ? liveTitleInput.value.trim() : "حصة مباشرة مع الأستاذة";
    const meetUrl = (meetUrlInput && meetUrlInput.value.trim()) ? meetUrlInput.value.trim() : DEFAULT_MEET_URL;

    try {
      await setDoc(doc(db, "live_stream", "current_session"), {
        isLive: true,
        title: title,
        url: meetUrl,
        startedAt: new Date()
      });
      if (liveStatusMsg) {
        liveStatusMsg.style.color = "green";
        liveStatusMsg.textContent = "تم إطلاق الحصة المباشرة بنجاح! 🔴";
      }
    } catch (err) {
      console.error("خطأ في بدء الحصة:", err);
    }
  });
}

// إنهاء الحصة
if (stopLiveBtn) {
  stopLiveBtn.addEventListener("click", async () => {
    try {
      const currentTitle = (liveTitleInput && liveTitleInput.value.trim()) ? liveTitleInput.value.trim() : "حصة مباشرة مع الأستاذة";
      const currentUrl = (meetUrlInput && meetUrlInput.value.trim()) ? meetUrlInput.value.trim() : DEFAULT_MEET_URL;

      await setDoc(doc(db, "live_stream", "current_session"), {
        isLive: false,
        title: currentTitle,
        url: currentUrl
      });
      if (liveStatusMsg) {
        liveStatusMsg.style.color = "orange";
        liveStatusMsg.textContent = "تم إنهاء الحصة المباشرة. ⬛";
      }
    } catch (err) {
      console.error("خطأ في إنهاء الحصة:", err);
    }
  });
}

// جلب وعرض الملفات
async function loadFiles(isTeacher) {
  const categories = ["lessons", "term1", "term2", "term3", "exams", "tests"];
  
  categories.forEach(cat => {
    const listEl = document.getElementById(`list-${cat}`);
    if (listEl) listEl.innerHTML = "<p style='color: #888; font-size:13px; margin:5px 0;'>جاري التحميل...</p>";
  });

  try {
    const querySnapshot = await getDocs(collection(db, "all_files"));
    
    categories.forEach(cat => {
      const listEl = document.getElementById(`list-${cat}`);
      if (listEl) listEl.innerHTML = "";
    });

    querySnapshot.forEach((docSnap) => {
      const fileData = docSnap.data();
      const docId = docSnap.id;
      const category = fileData.category || "lessons";

      const listEl = document.getElementById(`list-${category}`);
      if (!listEl) return;

      const li = document.createElement("li");
      li.className = "file-item";
      
      let actionsHTML = `
        <a href="${fileData.url}" target="_blank" style="background:#008CBA; color:white; text-decoration:none; padding:5px 10px; border-radius:4px; font-size:13px;">عرض 👁️</a>
        <a href="${fileData.url}" download="${fileData.name}" style="background:#4CAF50; color:white; text-decoration:none; padding:5px 10px; border-radius:4px; font-size:13px;">تحميل 📥</a>
      `;
      
      if (isTeacher) {
        actionsHTML += `
          <div class="delete-container" style="display:inline-block; position:relative;">
            <button class="delete-btn" style="background:#f44336; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:13px;">حذف 🗑️</button>
            <div class="confirm-box" style="display:none; position:absolute; left:0; bottom:110%; background:white; border:1px solid #ddd; padding:6px 10px; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:100; white-space:nowrap;">
              <span style="font-size:12px; margin-left:5px; color:#333; font-weight:bold;">متأكد؟</span>
              <button class="yes-btn" style="background:#f44336; color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:12px;">نعم</button>
              <button class="no-btn" style="background:#ccc; color:black; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:12px; margin-right:3px;">لا</button>
            </div>
          </div>
        `;
      }

      li.innerHTML = `
        <span style="font-size: 14px;">📁 <strong>${fileData.name}</strong></span>
        <div class="file-actions">${actionsHTML}</div>
      `;

      if (isTeacher) {
        const deleteContainer = li.querySelector(".delete-container");
        const deleteBtn = deleteContainer.querySelector(".delete-btn");
        const confirmBox = deleteContainer.querySelector(".confirm-box");
        const yesBtn = deleteContainer.querySelector(".yes-btn");
        const noBtn = deleteContainer.querySelector(".no-btn");

        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          document.querySelectorAll('.confirm-box').forEach(box => box.style.display = 'none');
          confirmBox.style.display = confirmBox.style.display === "block" ? "none" : "block";
        });

        noBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          confirmBox.style.display = "none";
        });

        yesBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          try {
            await deleteDoc(doc(db, "all_files", docId));
            li.remove();
          } catch (err) {
            console.error("خطأ في الحذف:", err);
          }
        });
      }

      listEl.appendChild(li);
    });

    categories.forEach(cat => {
      const listEl = document.getElementById(`list-${cat}`);
      if (listEl && listEl.children.length === 0) {
        listEl.innerHTML = "<p style='color: #888; font-size: 13px; margin: 5px 0;'>لا توجد ملفات في هذا القسم حالياً.</p>";
      }
    });

  } catch (error) {
    console.error("خطأ في جلب الملفات:", error);
  }
}

// مراقبة المصادقة
onAuthStateChanged(auth, (user) => {
  if (user) {
    const isTeacher = (user.email === TEACHER_EMAIL);

    if (teacherUploadSection && studentViewMsg) {
      if (isTeacher) {
        teacherUploadSection.style.display = "block";
        studentViewMsg.style.display = "none";
        if (teacherLiveControl) teacherLiveControl.style.display = "block";
      } else {
        teacherUploadSection.style.display = "none";
        studentViewMsg.style.display = "block";
        if (teacherLiveControl) teacherLiveControl.style.display = "none";
      }
    }

    listenToLiveStatus();
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

// رفع الملفات
if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.email !== TEACHER_EMAIL) {
      if (uploadStatus) {
        uploadStatus.style.color = "red";
        uploadStatus.textContent = "عذراً، لا تملك صلاحية الرفع! ❌";
      }
      return;
    }

    const file = anyFileUploader.files[0];
    const category = fileCategorySelect.value;

    if (!file) {
      if (uploadStatus) {
        uploadStatus.style.color = "red";
        uploadStatus.textContent = "يرجى اختيار ملف أولاً! ⚠️";
      }
      return;
    }

    if (uploadStatus) {
      uploadStatus.style.color = "#008CBA";
      uploadStatus.textContent = "جاري رفع الملف... ⏳";
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
      try {
        await addDoc(collection(db, "all_files"), {
          name: file.name,
          category: category,
          url: reader.result,
          createdAt: new Date()
        });

        if (uploadStatus) {
          uploadStatus.style.color = "green";
          uploadStatus.textContent = "تم الرفع بنجاح! ✅";
        }
        anyFileUploader.value = "";
        loadFiles(true);

        setTimeout(() => {
          if (uploadStatus) uploadStatus.textContent = "";
        }, 3000);

      } catch (error) {
        console.error("خطأ في الحفظ:", error);
        if (uploadStatus) {
          uploadStatus.style.color = "red";
          uploadStatus.textContent = "فشل الحفظ في القاعدة! ❌";
        }
      }
    };
  });
}