
const API = "http://127.0.0.1:8000";

/* =========================
Toggle admin key for login
========================= */

function toggleAdminKeyLogin(){

let role = document.getElementById("login_role").value;
let box = document.getElementById("admin_key_login_box");

box.style.display = (role === "hr") ? "block" : "none";

}


/* =========================
SIGNUP
========================= */

async function signup(){

let email = document.getElementById("signup_email").value.trim();
let password = document.getElementById("signup_password").value.trim();
let role = document.getElementById("signup_role").value;

if(!email || !password){
alert("Please fill all fields");
return;
}

let form = new FormData();
form.append("email",email);
form.append("password",password);

let url = role === "hr" ? "/signup-hr/" : "/signup-user/";

try{

let res = await fetch(API + url,{
method:"POST",
body:form
});

let data = await res.json();

if(res.ok && data.message){

let modal = document.getElementById("successModal");
if(modal){
modal.style.display="flex";
}

}else{

alert(data.error || data.detail || "Signup failed");

}

}catch(error){

console.error(error);
alert("Server error");

}

}


/* =========================
GO TO LOGIN
========================= */

function goToLogin(){

window.location.href="/static/login.html";

}


/* =========================
LOGIN
========================= */

async function login(){

let email = document.getElementById("login_email").value.trim();
let password = document.getElementById("login_password").value.trim();
let role = document.getElementById("login_role").value;

let adminKeyInput = document.getElementById("login_admin_key");

if(!email || !password){
alert("Enter email and password");
return;
}

let form = new FormData();
form.append("email",email);
form.append("password",password);

if(role === "hr"){

let adminKey = adminKeyInput ? adminKeyInput.value.trim() : "";

if(!adminKey){
alert("Please enter admin key");
return;
}

form.append("admin_key",adminKey);

}

let url = role === "hr" ? "/login-hr/" : "/login-user/";

try{

let res = await fetch(API + url,{
method:"POST",
body:form
});

let data = await res.json();

if(res.ok && data.role === "user"){
window.location.href="/static/dashboard_user.html";
}
else if(res.ok && data.role === "hr"){
window.location.href="/static/dashboard_hr.html";
}
else{
alert(data.error || data.detail || "Login failed");
}

}catch(error){

console.error(error);
alert("Server error");

}

}


/* =========================
PREDICT JOB ROLE
========================= */

async function predictRole(){

try{

let res = await fetch(API + "/predict-role/");
let data = await res.json();

if(res.ok && !data.error){

let output = "";

output += "Name: " + (data.name || "Unknown") + "\n";
output += "Email: " + (data.email || "Unknown") + "\n\n";

output += "Best Predicted Role: " + data.best_role + "\n\n";

output += "Top Roles:\n";

data.predicted_roles.forEach(role=>{
output += role.role + " - " + role.score + "%\n";
});

output += "\nMissing Skills:\n";
output += data.missing_skills.join(", ");

document.getElementById("result").innerText = output;

}else{

document.getElementById("result").innerText = data.error || "Prediction failed";

}

}catch(error){

console.error(error);
alert("Server error");

}

}


/* =========================
ATS SCORE ANALYSIS
========================= */

async function atsScore(){

try{

let res = await fetch(API + "/ats-score/");
let data = await res.json();

if(!res.ok){
document.getElementById("result").innerText = data.error;
return;
}

let text = data.result;


/* Extract ATS score */

let scoreMatch = text.match(/ATS_SCORE:\s*(\d+)/i);
let score = scoreMatch ? parseInt(scoreMatch[1]) : 0;


/* Extract sections */

function extractSection(title){

let regex = new RegExp(title + "([\\s\\S]*?)(?=\\n[A-Z_]+:|$)", "i");
let match = text.match(regex);

return match ? match[1].trim() : "Not detected";

}

let skills = extractSection("IMPORTANT_SKILLS_DETECTED:");
let missing = extractSection("MISSING_INDUSTRY_SKILLS:");
let strengths = extractSection("STRENGTHS:");
let weaknesses = extractSection("WEAKNESSES:");
let formatting = extractSection("FORMATTING_FEEDBACK:");
let suggestions = extractSection("RESUME_IMPROVEMENT_SUGGESTIONS:");
let rewrite = extractSection("REWRITTEN_BULLET_POINTS");


/* Format list */

function formatList(text){

let items = text.split("\n").filter(x=>x.trim()!="");
return items.map(i=>`<li>${i.replace(/^[-•]/,"")}</li>`).join("");

}


/* Score color */

let scoreClass = "low-score";

if(score >= 75) scoreClass = "high-score";
else if(score >= 50) scoreClass = "mid-score";


/* Render UI */

document.getElementById("result").innerHTML = `

<div class="ats-container">

<h2>ATS Resume Analysis</h2>

<div class="ats-meter">
<div class="ats-fill ${scoreClass}" style="width:${score}%"></div>
</div>

<div class="ats-score-text">
${score}% ATS Match
</div>

<div class="ats-grid">

<div class="ats-card">
<h3>Skills Detected</h3>
<ul>${formatList(skills)}</ul>
</div>

<div class="ats-card">
<h3>Missing Skills</h3>
<ul>${formatList(missing)}</ul>
</div>

<div class="ats-card">
<h3>Strengths</h3>
<ul>${formatList(strengths)}</ul>
</div>

<div class="ats-card">
<h3>Weaknesses</h3>
<ul>${formatList(weaknesses)}</ul>
</div>

<div class="ats-card">
<h3>Formatting Feedback</h3>
<ul>${formatList(formatting)}</ul>
</div>

<div class="ats-card">
<h3>Improvement Suggestions</h3>
<ul>${formatList(suggestions)}</ul>
</div>

<div class="ats-card">
<h3>Rewritten Resume Bullet Points</h3>
<ul>${formatList(rewrite)}</ul>
</div>

</div>

</div>

`;

}catch(error){

console.error(error);
alert("Server error");

}

}


/* =========================
UPLOAD RESUME
========================= */

async function uploadResume(){

let fileInput = document.getElementById("resume");
let file = fileInput.files[0];

if(!file){
alert("Please select a resume file");
return;
}

let formData = new FormData();
formData.append("file", file);

try{

let res = await fetch(API + "/upload-resume/",{
method:"POST",
body:formData
});

let data = await res.json();

if(res.ok){

document.getElementById("result").innerHTML =
`<p style="color:lightgreen;font-weight:bold;">${data.message}</p>`;

}
else{

document.getElementById("result").innerText =
data.error || "Upload failed";

}

}catch(error){

console.error(error);
alert("Server error while uploading resume");

}

}

/* =========================
HR MATCH JOB DESCRIPTION
========================= */

async function matchJD(){

let jd = document.getElementById("jd").value.trim();

if(!jd){
alert("Please enter job description");
return;
}

let formData = new FormData();
formData.append("jd", jd);

try{

let res = await fetch(API + "/jd-match/",{
method:"POST",
body:formData
});

let data = await res.json();

let container = document.getElementById("result");
container.innerHTML = "";

/* Error handling */

if(!res.ok){
container.innerText = data.error || "Matching failed";
return;
}

/* If candidates exist */

if(data.candidates && data.candidates.length > 0){

let total = data.candidates.length;
let sum = 0;
let top = 0;

/* Render cards */

data.candidates.forEach((c, index)=>{

sum += c.score;
if(c.score > top) top = c.score;

/* Score color */

let colorClass = "low-score";
if(c.score >= 75) colorClass = "high-score";
else if(c.score >= 50) colorClass = "mid-score";

/* Render */

container.innerHTML += `
<div class="candidate-card">

<h3>#${index + 1} ${c.name}</h3>

<p><b>Email:</b> ${c.email}</p>

<div class="score-bar">
<div class="score-fill ${colorClass}" style="width:${c.score}%"></div>
</div>

<p><b>Match Score:</b> ${c.score}%</p>

</div>
`;

});

/* ===== UPDATE DASHBOARD STATS ===== */

let avg = (sum / total).toFixed(1);

document.getElementById("totalCount").innerText = total;
document.getElementById("avgScore").innerText = avg + "%";
document.getElementById("topScore").innerText = top + "%";

}else{

container.innerText = "No matching candidates found";

/* Reset stats */

document.getElementById("totalCount").innerText = 0;
document.getElementById("avgScore").innerText = "0%";
document.getElementById("topScore").innerText = "0%";

}

}catch(error){

console.error(error);
alert("Server error while matching resumes");

}
}