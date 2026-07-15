// =======================================
// HEAL MOVEMENT VOLUNTEER PORTAL
// APP.JS - PART 3A
// =======================================

// ---------- FIREBASE CONFIG ----------
// Replace these with your Firebase project values

const firebaseConfig = {
  apiKey: "AIzaSyCnBduxuS_ykLrk1BKBKVBD1XrlshNMxQ0",
  authDomain: "heal-movement.firebaseapp.com",
  projectId: "heal-movement",
  storageBucket: "heal-movement.firebasestorage.app",
  messagingSenderId: "645966753334",
  appId: "1:645966753334:web:23cbeca89093c787263297"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// =======================================
// SETTINGS
// =======================================

const TARGET = 500;
const START_COUNT = 21;

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

const profileName = document.getElementById("profileName");
if (profileName) {
    profileName.innerHTML = currentVolunteer.name;
}

const profileAdmission = document.getElementById("profileAdmission");
if (profileAdmission) {
    profileAdmission.innerHTML = currentVolunteer.admission;
}

const joinedDate = document.getElementById("joinedDate");
if (joinedDate) {
    joinedDate.innerHTML = currentVolunteer.joined;
}

listenStatistics();
listenPoll();
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

if (!list) {
    return;
}

list.innerHTML = "";

snapshot.forEach((doc)=>{

const li=document.createElement("li");

li.innerHTML=doc.data().name;

list.appendChild(li);

});

});

}
// =======================================
// PLEDGE SYSTEM
// =======================================

async function checkPledge(){

if(!currentVolunteer) return;

const snapshot = await db.collection("pledges")
.where("volunteerId","==",currentVolunteer.id)
.get();

if(!snapshot.empty){

pledged = true;

pledgeBtn.innerHTML="✔ Thank You For Standing With HEAL";

pledgeBtn.disabled=true;

pledgeBtn.style.background="#43A047";

pledgeBtn.style.color="white";

}

}

// =======================================
// SUBMIT PLEDGE
// =======================================

pledgeBtn.addEventListener("click",async()=>{

if(pledged) return;

await db.collection("pledges").add({

volunteerId:currentVolunteer.id,

name:currentVolunteer.name,

admission:currentVolunteer.admission,

date:new Date().toLocaleString()

});

await db.collection("statistics")
.doc("main")
.update({

pledges:
firebase.firestore.FieldValue.increment(1)

});

pledged=true;

pledgeBtn.innerHTML="✔ Thank You For Standing With HEAL";

pledgeBtn.disabled=true;

pledgeBtn.style.background="#43A047";

pledgeBtn.style.color="white";

alert("Thank you for supporting HEAL Movement 💙");

});

// =======================================
// AUTO LOGIN
// =======================================

window.onload=function(){

  };

// =======================================
// WELCOME ANIMATION
// =======================================

setInterval(()=>{

const counter=document.getElementById("volunteerCounter");

if(counter){

counter.style.transform="scale(1.05)";

setTimeout(()=>{

counter.style.transform="scale(1)";

},250);

}

},5000);

// =======================================
// MOTIVATIONAL QUOTES
// =======================================

const quotes=[

"Leadership begins with one decision.",

"Together we are stronger.",

"Every volunteer matters.",

"Change starts with you.",

"Your voice builds tomorrow.",

"Together We Lead.",

"Together We Inspire.",

"Together We Transform."

];

function showRandomQuote(){

const subtitle=document.querySelector(".subtitle");

if(!subtitle) return;

subtitle.innerHTML=quotes[
Math.floor(Math.random()*quotes.length)
];

}

showRandomQuote();
// =====================================
// LIVE OPINION POLL
// =====================================

function listenPoll(){

    db.collection("poll")
    .doc("main")
    .onSnapshot((doc)=>{

        if(!doc.exists) return;

        const data = doc.data();

        const heal = data.healvotes || 0;
        const sauti = data.sautivotes || 0;

        const total = heal + sauti;

        const healPercent =
            total > 0 ? Math.round((heal / total) * 100) : 0;

        const sautiPercent =
            total > 0 ? 100 - healPercent : 0;

        document.getElementById("healPercent").innerHTML =
            "💙 HEAL MOVEMENT " + healPercent + "%";

        document.getElementById("sautiPercent").innerHTML =
            "❤️ SAUTI YA COMRADE " + sautiPercent + "%";

        document.getElementById("totalVotes").innerHTML = total;

        document.getElementById("healBar").style.width =
            healPercent + "%";

        document.getElementById("sautiBar").style.width =
            sautiPercent + "%";

    });

}
// =======================================
// END OF APP.JS
// =======================================
