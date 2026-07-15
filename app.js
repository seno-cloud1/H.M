// =======================================
// HEAL MOVEMENT VOLUNTEER PORTAL
// APP.JS - PART 3A
// =======================================

// ---------- FIREBASE CONFIG ----------
// Replace these with your Firebase project values

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "XXXXXXXXXXXX",
    appId: "XXXXXXXXXXXXXXXXXXXX"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// =======================================
// SETTINGS
// =======================================

const TARGET = 500;
const START_COUNT = 10;

let currentVolunteer = null;
let pledged = false;

// =======================================
// ELEMENTS
// =======================================

const registerForm = document.getElementById("registerForm");

const joinBtn = document.getElementById("joinBtn");

const loginBtn = document.getElementById("loginBtn");

const logoutBtn = document.getElementById("logoutBtn");

const pledgeBtn = document.getElementById("pledgeBtn");

const loginPage = document.getElementById("loginPage");

const dashboard = document.getElementById("dashboard");

// =======================================
// SAVE LOGIN
// =======================================

function saveSession(){

localStorage.setItem(
"healVolunteer",
JSON.stringify(currentVolunteer)
);

}

// =======================================
// LOAD LOGIN
// =======================================

function loadSession(){

const saved =
localStorage.getItem("healVolunteer");

if(saved){

currentVolunteer =
JSON.parse(saved);

showDashboard();

}

}

// =======================================
// LOGOUT
// =======================================

function logout(){

localStorage.removeItem("healVolunteer");

currentVolunteer=null;

location.reload();

}

logoutBtn.addEventListener("click",logout);

// =======================================
// SHOW DASHBOARD
// =======================================

function showDashboard(){

loginPage.style.display="none";

dashboard.style.display="block";

document.getElementById("welcomeName").innerHTML=
"Welcome, "+currentVolunteer.name;

document.getElementById("profileName").innerHTML=
currentVolunteer.name;

document.getElementById("profileAdmission").innerHTML=
currentVolunteer.admission;

document.getElementById("joinedDate").innerHTML=
currentVolunteer.joined;

listenStatistics();

listenNewest();

checkPledge();

}

// =======================================
// REGISTER
// =======================================

registerForm.addEventListener(
"submit",
async function(e){

e.preventDefault();

joinBtn.disabled=true;

joinBtn.innerHTML="Joining...";

const name=
document.getElementById("fullname").value.trim();

const admission=
document.getElementById("admission").value.trim();

const password=
document.getElementById("password").value;

if(name==""||admission==""||password==""){

alert("Fill every field.");

joinBtn.disabled=false;

joinBtn.innerHTML="Join The HEAL Team";

return;

}

const existing=
await db.collection("volunteers")
.where("admission","==",admission)
.get();

if(!existing.empty){

alert("Admission Number already registered.");

joinBtn.disabled=false;

joinBtn.innerHTML="Join The HEAL Team";

return;

}

const volunteer={

name:name,

admission:admission,

password:password,

joined:new Date().toLocaleDateString(),

pledged:false

};

const doc=
await db.collection("volunteers").add(volunteer);

currentVolunteer={

id:doc.id,

...volunteer

};

saveSession();

await increaseVolunteerCounter();

showDashboard();

});
