const API = "http://127.0.0.1:8000";

/* =========================
Toggle admin key for login
========================= */

function toggleAdminKeyLogin(){

let role = document.getElementById("login_role").value;
let box = document.getElementById("admin_key_login_box");

if(role === "hr"){
box.style.display="block";
}else{
box.style.display="none";
}

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
container.innerHTML="";

if(res.ok && data.candidates){

data.candidates.forEach((c,index)=>{

container.innerHTML += `
<div class="candidate-card">
<h3>#${index+1} ${c.name}</h3>
<p><b>Email:</b> ${c.email}</p>

<div class="score-bar">
<div class="score-fill" style="width:${c.score}%"></div>
</div>

<p><b>Match Score:</b> ${c.score}%</p>

</div>
`;

});

}
else{

container.innerText = data.error || "No candidates found";

}

}catch(error){

console.error(error);
alert("Server error while matching resumes");

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
ATS SCORE
========================= */

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


/* ---------------------------
Extract ATS Score
--------------------------- */

let scoreMatch = text.match(/ATS_SCORE:\s*(\d+)/i);
let score = scoreMatch ? parseInt(scoreMatch[1]) : 0;


/* ---------------------------
Extract Sections
--------------------------- */

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
let rewrite = extractSection("REWRITTEN_BULLET_POINTS:");



/* ---------------------------
Format bullet lists
--------------------------- */

function formatList(text){

let items = text.split("\n").filter(x=>x.trim()!="");

return items.map(i=>`<li>${i.replace(/^[-•]/,"")}</li>`).join("");

}



/* ---------------------------
Score Color
--------------------------- */

let scoreClass = "low-score";

if(score >= 75){
scoreClass = "high-score";
}
else if(score >= 50){
scoreClass = "mid-score";
}



/* ---------------------------
Render UI
--------------------------- */

document.getElementById("result").innerHTML = `

<div class="ats-container">

<h2>ATS Resume Analysis</h2>

<div class="ats-meter">
<div class="ats-fill ${scoreClass}" style="width:${score}%">${score}%</div>
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
`<p style="color:green;font-weight:bold;">${data.message}</p>`;

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