const KEYS = { admin: "ADMIN123", staff: "STAFF123", controller: "CTRL123" };
let records = JSON.parse(localStorage.getItem("ipdRecords") || "[]");

function persist() { localStorage.setItem("ipdRecords", JSON.stringify(records)); }
function generateIPD() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const countToday = records.filter(r => r.ipd.startsWith("IPD" + dateStr)).length;
  return `IPD${dateStr}-${String(countToday + 1).padStart(4, "0")}`;
}
function renderRecords() {
  const tbody = document.getElementById("records-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  records.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.ipd}</td><td>${r.patientId}</td><td>${r.name}</td><td>${r.age}</td>
                    <td>${r.gender}</td><td>${r.ward}</td><td>${r.doctor}</td><td>${r.status}</td>`;
    tbody.appendChild(tr);
  });
}

function login() {
  const user = document.getElementById("username").value.trim().toLowerCase();
  const pass = document.getElementById("password").value.trim();
  if (KEYS[user] && KEYS[user] === pass) {
    sessionStorage.setItem("role", user);
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("role").innerText = user;
  } else {
    document.getElementById("login-msg").innerText = "Invalid credentials!";
  }
}
function logout() { sessionStorage.clear(); location.reload(); }
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => { if (sec.id !== "dashboard") sec.classList.add("hidden"); });
  document.getElementById(id).classList.remove("hidden");
}

function admitPatient(e) {
  e.preventDefault();
  const pid = document.getElementById("patientId").value.trim();
  if (records.some(r => r.patientId === pid && r.status === "Admitted")) {
    document.getElementById("admit-msg").innerText = "Patient already admitted!";
    return;
  }
  const rec = {
    ipd: generateIPD(),
    patientId: pid,
    name: document.getElementById("name").value.trim(),
    age: parseInt(document.getElementById("age").value || "0", 10),
    gender: document.getElementById("gender").value,
    ward: document.getElementById("ward").value.trim(),
    diagnosis: document.getElementById("diagnosis").value.trim(),
    doctor: document.getElementById("doctor").value.trim(),
    status: "Admitted",
    admitDate: new Date().toISOString()
  };
  records.push(rec); persist();
  document.getElementById("admit-msg").innerText = "Admitted with IPD: " + rec.ipd;
  e.target.reset();
  renderRecords();
}

function dischargePatient(e) {
  e.preventDefault();
  const pid = document.getElementById("dischargeId").value.trim();
  const bill = parseFloat(document.getElementById("billAmount").value || "0");
  const rec = records.find(r => r.patientId === pid && r.status === "Admitted");
  if (!rec) {
    document.getElementById("bill-output").innerHTML = "<p>No active admission found!</p>";
    return;
  }
  rec.status = "Discharged";
  rec.bill = bill;
  rec.dischargeDate = new Date().toISOString();
  persist();
  document.getElementById("bill-output").innerHTML = `
    <h4>Discharged</h4>
    <p>Patient: ${rec.name} (ID: ${rec.patientId})</p>
    <p>IPD No: ${rec.ipd}</p>
    <p>Doctor: ${rec.doctor}</p>
    <p>Bill Amount: ₹${bill.toFixed(2)}</p>
  `;
  e.target.reset();
  renderRecords();
}

document.addEventListener("DOMContentLoaded", renderRecords);
