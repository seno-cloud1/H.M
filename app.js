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
// =======================================
// LOGIN
// =======================================

loginBtn.addEventListener("click", async () => {

const admission = prompt("Enter Admission Number");

if(!admission) return;

const password = prompt("Enter Password");

if(!password) return;

const snapshot = await db.collection("volunteers")
.where("admission","==",admission)
.where("password","==",password)
.get();

if(snapshot.empty){

alert("Invalid Admission Number or Password");

return;

}

const doc = snapshot.docs[0];

currentVolunteer = {

id:doc.id,

...doc.data()

};

saveSession();

showDashboard();

});

// =======================================
// LIVE STATISTICS
// =======================================

function listenStatistics(){

db.collection("statistics")

.doc("main")

.onSnapshot((doc)=>{

if(!doc.exists){

db.collection("statistics")

.doc("main")

.set({

volunteers:START_COUNT,

pledges:0,

goal:TARGET

});

return;

}

const data = doc.data();

const volunteers = data.volunteers;

const pledges = data.pledges;

const percent = ((volunteers/TARGET)*100).toFixed(1);

document.getElementById("volunteerCounter").innerHTML = volunteers;

document.getElementById("statVolunteers").innerHTML = volunteers;

document.getElementById("statPledges").innerHTML = pledges;

document.getElementById("statPercent").innerHTML = percent+"%";

document.getElementById("percentage").innerHTML = percent+"%";

document.getElementById("progressFill").style.width = percent+"%";

});

}

// =======================================
// INCREASE COUNTER
// =======================================

async function increaseVolunteerCounter(){

const ref = db.collection("statistics").doc("main");

const doc = await ref.get();

if(!doc.exists){

await ref.set({

volunteers:START_COUNT+1,

pledges:0,

goal:TARGET

});

return;

}

await ref.update({

volunteers:
firebase.firestore.FieldValue.increment(1)

});

}

// =======================================
// NEWEST VOLUNTEERS
// =======================================

function listenNewest(){

db.collection("volunteers")

.orderBy("joined","desc")

.limit(5)

.onSnapshot((snapshot)=>{

const list = document.getElementById("latestVolunteers");

list.innerHTML="";

snapshot.forEach((doc)=>{

const li=document.createElement("li");

li.innerHTML=doc.data().name;

list.appendChild(li);

});

});

}
