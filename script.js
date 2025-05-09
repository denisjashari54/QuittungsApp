
const form = document.getElementById("quittungForm");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const liste = document.getElementById("liste");
const startCameraBtn = document.getElementById("startCamera");
const takePhotoBtn = document.getElementById("takePhoto");
const sortSelect = document.getElementById("sort");

let currentPhoto = null;
let cameraStream = null;
let cameraActive = false;

window.addEventListener("load", () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    alert("Hinweis: Wenn du diese Seite auf dem Smartphone nutzt, musst du sie über HTTPS oder localhost aufrufen, damit die Kamera funktioniert.");
  }
});

startCameraBtn.onclick = async () => {
  if (!cameraActive) {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = cameraStream;
      cameraActive = true;
      startCameraBtn.textContent = "Kamera beenden";
    } catch (err) {
      alert("Kamera konnte nicht gestartet werden. Bitte Browserrechte prüfen.");
    }
  } else {
    const tracks = cameraStream?.getTracks();
    tracks?.forEach(track => track.stop());
    video.srcObject = null;
    cameraActive = false;
    startCameraBtn.textContent = "Kamera starten";
  }
};

takePhotoBtn.onclick = () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  currentPhoto = canvas.toDataURL("image/png");
  alert("Foto aufgenommen!");
};

function ladeQuittungen() {
  const quittungen = JSON.parse(localStorage.getItem("quittungen") || "[]");
  const sorted = quittungen.sort((a, b) => {
    const sort = sortSelect.value;
    return sort === "asc"
      ? new Date(a.datum) - new Date(b.datum)
      : new Date(b.datum) - new Date(a.datum);
  });
  liste.innerHTML = "";
  sorted.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "quittung";
    let content = `
      <strong>${q.titel}</strong><br>
      Betrag: CHF ${q.betrag.toFixed(2)}<br>
      <small>${new Date(q.datum).toLocaleString()}</small><br>
    `;
    if (q.foto && q.foto.startsWith("data:image")) {
      content += `<img src="${q.foto}" class="thumbnail" />`;
    }
    content += `<button class="delete-btn" onclick="loescheQuittung(${index})">Löschen</button>`;
    div.innerHTML = content;
    liste.appendChild(div);
  });
}

function loescheQuittung(index) {
  const quittungen = JSON.parse(localStorage.getItem("quittungen") || "[]");
  quittungen.splice(index, 1);
  localStorage.setItem("quittungen", JSON.stringify(quittungen));
  ladeQuittungen();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const titel = document.getElementById("titel").value;
  const betrag = parseFloat(document.getElementById("betrag").value);
  const quittungen = JSON.parse(localStorage.getItem("quittungen") || "[]");
  quittungen.push({ titel, betrag, datum: new Date().toISOString(), foto: currentPhoto });
  localStorage.setItem("quittungen", JSON.stringify(quittungen));
  currentPhoto = null;
  form.reset();
  ladeQuittungen();
});

sortSelect.addEventListener("change", ladeQuittungen);
ladeQuittungen();
