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

const logoutBtn = document.getElementById("logout-btn");
const teacherUploadSection = document.getElementById("teacher-upload-section");
const studentViewMsg = document.getElementById("student-view-msg");
const uploadBtn = document.getElementById("upload-btn");
const anyFileUploader = document.getElementById("any-file-uploader");
const fileList = document.getElementById("file-list");
const uploadStatus = document.getElementById("upload-status");

// عناصر الحصص المباشرة
const teacherLiveControl = document.getElementById("teacher-live-control");
const liveTitleInput = document.getElementById("live-title-input");
const startLiveBtn = document.getElementById("start-live-btn");
const stopLiveBtn = document.getElementById("stop-live-btn");
const liveStatusMsg = document.getElementById("live-status-msg");
const noLiveMsg = document.getElementById("no-live-msg");
const activeLiveBox = document.getElementById("active-live-box");
const currentLiveTitle = document.getElementById("current-live-title");
const joinLiveBtn = document.getElementById("join-live-btn");

// مراقبة حالة البث المباشر لحظياً في السحابة
function listenToLiveStatus() {
  onSnapshot(doc(db, "live_stream", "current_session"), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.isLive) {
        noLiveMsg.style.display = "none";
        activeLiveBox.style.display = "block";
        currentLiveTitle.textContent = `🔴 بث مباشر حالياً: ${data.title}`;
        joinLiveBtn.href = data.url;

        if (startLiveBtn && stopLiveBtn) {
          startLiveBtn.style.display = "none";
          stopLiveBtn.style.display = "inline-block";
        }
      } else {
        noLiveMsg.style.display = "block";
        activeLiveBox.style.display = "none";

        if (startLiveBtn && stopLiveBtn) {
          startLiveBtn.style.display = "inline-block";
          stopLiveBtn.style.display = "none";
        }
      }
    } else {
      noLiveMsg.style.display = "block";
      activeLiveBox.style.display = "none";
    }
  });
}

// بدء الحصة المباشرة
if (startLiveBtn) {
  startLiveBtn.addEventListener("click", async () => {
    const title = liveTitleInput.value.trim() || "حصة مباشرة مع الأستاذة";
    const roomName = "StudyPlatformRoom_" + Date.now();
    const liveUrl = `https://meet.jit.si/${roomName}`;

    try {
      await setDoc(doc(db, "live_stream", "current_session"), {
        isLive: true,
        title: title,
        url: liveUrl,
        startedAt: new Date()
      });

      if (liveStatusMsg) {
        liveStatusMsg.style.color = "green";
        liveStatusMsg.textContent = "تم إطلاق الحصة المباشرة بنجاح! 🔴";
      }
      liveTitleInput.value = "";
      window.open(liveUrl, "_blank");

    } catch (err) {
      console.error("خطأ في بدء الحصة:", err);
      if (liveStatusMsg) {
        liveStatusMsg.style.color = "red";
        liveStatusMsg.textContent = "فشل بدء الحصة المباشرة!";
      }
    }
  });
}

// إنهاء الحصة المباشرة
if (stopLiveBtn) {
  stopLiveBtn.addEventListener("click", async () => {
    try {
      await setDoc(doc(db, "live_stream", "current_session"), {
        isLive: false,
        title: "",
        url: ""
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

// جلب وعرض كل الملفات من قاعدة البيانات
async function loadFiles(isTeacher) {
  if (!fileList) return;
  fileList.innerHTML = "<p style='color: #666; text-align: center;'>جاري تحميل الملفات من السحابة...</p>";
  
  try {
    const querySnapshot = await getDocs(collection(db, "all_files"));
    fileList.innerHTML = "";
    
    if (querySnapshot.empty) {
      fileList.innerHTML = "<p style='color: #666; text-align: center;'>لا توجد ملفات مرفوعة حالياً.</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const fileData = docSnap.data();
      const docId = docSnap.id;

      const li = document.createElement("li");
      li.className = "file-item";
      
      let actionsHTML = `
        <a href="${fileData.url}" target="_blank" class="view-link" style="background:#008CBA; color:white; text-decoration:none; padding:6px 12px; border-radius:4px; font-size:14px; margin-left:5px;">عرض 👁️</a>
        <a href="${fileData.url}" download="${fileData.name}" class="download-link" style="background:#4CAF50; color:white; text-decoration:none; padding:6px 12px; border-radius:4px; font-size:14px;">تحميل 📥</a>
      `;
      
      if (isTeacher) {
        actionsHTML += `
          <div class="delete-container" style="display:inline-block; position:relative; margin-right: 8px;">
            <button class="delete-btn" style="background:#f44336; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:14px;">حذف 🗑️</button>
            <div class="confirm-box" style="display:none; position:absolute; right:0; top:110%; background:white; border:1px solid #ddd; padding:8px; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.2); z-index:10; white-space:nowrap;">
              <span style="font-size:12px; margin-left:5px; color:#333;">متأكد؟</span>
              <button class="yes-btn" style="background:#f44336; color:white; border:none; padding:3px 8px; border-radius:3px; cursor:pointer; font-size:12px;">نعم</button>
              <button class="no-btn" style="background:#ccc; color:black; border:none; padding:3px 8px; border-radius:3px; cursor:pointer; font-size:12px; margin-right:3px;">لا</button>
            </div>
          </div>
        `;
      }

      li.innerHTML = `
        <span>📁 <strong>${fileData.name}</strong></span>
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

      fileList.appendChild(li);
    });
  } catch (error) {
    console.error("تفاصيل خطأ جلب الملفات:", error);
    fileList.innerHTML = `<p style='color: red; text-align: center;'>خطأ في الاتصال بقاعدة البيانات السحابية.</p>`;
  }
}

// مراقبة حساب المستخدم والصلاحيات
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

    reader.onerror = function () {
      if (uploadStatus) {
        uploadStatus.style.color = "red";
        uploadStatus.textContent = "حدث خطأ أثناء قراءة الملف! ❌";
      }
    };
  });
}